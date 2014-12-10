var cxxCodeEditor = null;
var clangformatCodeEditor = null;

var ignoreNextCxxEditorChange = false;
var ignoreNextClangformatEditorChange = false;

var reformatDelay = 600;
var reformatTimeoutId = -1;

var syncVisualEditorDelay = 500;
var syncVisualEditorTimeoutId = -1;

var enableAutoReformat = true;

var FormatRulesObject = function() {
  this.BasedOnStyle = "LLVM";
  this.AccessModifierOffset = null;         // int
  this.AlignAfterOpenBracket = null;        // bool
  this.AlignEscapedNewlinesLeft = null;     // bool
  this.AlignOperands = null;                // bool
  this.AlignTrailingComments = null;        // bool
  this.AllowAllParametersOfDeclarationOnNextLine = null;  // bool
  this.AllowShortBlocksOnASingleLine = null;        // bool
  this.AllowShortCaseLabelsOnASingleLine = null;    // bool
  this.AllowShortFunctionsOnASingleLine = null;     // None, Inline, Empty, All
  this.AllowShortIfStatementsOnASingleLine = null;  // bool
  this.AllowShortLoopsOnASingleLine = null;         // bool
  this.AlwaysBreakAfterDefinitionReturnType = null; // bool
  this.AlwaysBreakBeforeMultilineStrings = null;    // bool
  this.AlwaysBreakTemplateDeclarations = null;      // bool
  this.BinPackArguments = null;                     // bool
  this.BinPackParameters = null;                    // bool
  this.BreakBeforeBinaryOperators = null;           // None, NonAssignment, All
  this.BreakBeforeBraces = null;                    // Attach, Linux, Stroustrup, Allman, GNU
  this.BreakBeforeTernaryOperators = null;    // bool
  this.BreakConstructorInitializersBeforeComma = null;  // bool
  this.ColumnLimit = null;  // unsigned
  this.CommentPragmas = null; // string
  this.ConstructorInitializerAllOnOneLineOrOnePerLine = null; // bool
  this.ConstructorInitializerIndentWidth = null; // unsigned
  this.ContinuationIndentWidth = null; // unsigned
  this.Cpp11BracedListStyle = null; // bool
  this.DerivePointerAlignment = null; // bool
  this.DisableFormat = null; // bool
  this.ExperimentalAutoDetectBinPacking = null; // bool
  this.ForEachMacros = null; // vector<string>
  this.IndentCaseLabels = null; // bool
  this.IndentWidth = null; // unsigned
  this.IndentWrappedFunctionNames = null; // bool
  this.KeepEmptyLinesAtTheStartOfBlocks = null; // bool
  this.Language = null; // None, Cpp, Java, JavaScript, Proto
  this.MaxEmptyLinesToKeep = null; // None, Inner, All
  this.ObjCBlockIndentWidth = null; // unsigned
  this.ObjCSpaceAfterProperty = null; // bool
  this.ObjCSpaceBeforeProtocolList = null; // bool
  this.PenaltyBreakBeforeFirstCallParameter = null; // unsigned
  this.PenaltyBreakComment = null; // unsigned
  this.PenaltyBreakFirstLessLess = null; // unsigned
  this.PenaltyBreakString = null; // unsigned
  this.PenaltyExcessCharacter = null; // unsigned
  this.PenaltyReturnTypeOnItsOwnLine = null; // unsigned
  this.PointerAlignment = null; // Left, Right, Middle
  this.SpaceAfterCStyleCast = null; // bool
  this.SpaceBeforeAssignmentOperators = null; // bool
  this.SpaceBeforeParens = null; // Never, ControlStatements, Always
  this.SpaceInEmptyParentheses = null; // bool
  this.SpacesBeforeTrailingComments = null; // unsigned
  this.SpacesInAngles = null; // bool
  this.SpacesInCStyleCastParentheses = null; // bool
  this.SpacesInContainerLiterals = null; // bool
  this.SpacesInParentheses = null; // bool
  this.SpacesInSquareBrackets = null; // bool
  this.Standard = null; // Cpp03, Cpp11, Auto
  this.TabWidth = null; // unsigned
  this.UseTab = null; // Never, ForIndentation, Always
};

FormatRulesObject.prototype.ToText = function() {
  var formatRuleText = "";

  var configParams = Object.keys(this);
  for(var i = 0; i < configParams.length; ++i) {
    var key = configParams[i];

    if(this[key] != null) {
      formatRuleText += key + ": " + this[key] + "\n";
    }
  }

  return formatRuleText;
};

FormatRulesObject.prototype.ToList = function() {
  var formatRulesList = [];

  var configParams = Object.keys(this);
  for(var i = 0; i < configParams.length; ++i) {
    var key = configParams[i];
    if(this[key] != null) {
      formatRulesList.push({key: key, value: this[key]});
    }
  }

  return formatRulesList;
};

var formatRulesObject = new FormatRulesObject();

require(['/javascripts/codemirror.js', '/javascripts/clike.js', '/javascripts/yaml.js'], function(CodeMirror) {
    cxxCodeEditor = CodeMirror.fromTextArea(document.getElementById("c-code"), {mode: "text/x-c++src", viewportMargin: Infinity});
    clangformatCodeEditor = CodeMirror.fromTextArea(document.getElementById("clangformat"), {mode: "text/x-yaml"});

    $('#raw').on('toggled', function (event, tab) {
       clangformatCodeEditor.refresh();
    });

    cxxCodeEditor.on('changes', function(instance, changes) {
      if(ignoreNextCxxEditorChange) {
        ignoreNextCxxEditorChange = false;
        return;
      }

      if(reformatTimeoutId != -1) {
        clearTimeout(reformatTimeoutId);
      }

      reformatTimeoutId = setTimeout(TriggerAutoReformat, reformatDelay);
    });

    clangformatCodeEditor.on('changes', function(instance, changes) {
      if(ignoreNextClangformatEditorChange) {
          ignoreNextClangformatEditorChange = false;
          return;
      }

      if(syncVisualEditorTimeoutId != -1) {
        clearTimeout(syncVisualEditorTimeoutId);
      }

      syncVisualEditorTimeoutId = setTimeout(function() {
        ParseFormatRulesObject();
        SetClangFormatVisualEditor(formatRulesObject);
      }, syncVisualEditorDelay);
    });

    var reformatButton = $('#reformat-button');
    reformatButton.click(function() {
      reformatButton.addClass('disabled');
      Reformat(function() {
        reformatButton.removeClass('disabled');
      });
    });

    var autoreformatCheckbox = $('#enable-autoformat');
    autoreformatCheckbox.change(function() {
      enableAutoReformat = autoreformatCheckbox.prop("checked");
    });


    var basedOnStyleSelect = $('select[name="BasedOnStyle"]');
    basedOnStyleSelect.click(function() {
      formatRulesObject['BasedOnStyle'] = basedOnStyleSelect.val();
      SetClangFormatEditor(formatRulesObject);
    });

    LoadFormatRulesFromObject(formatRulesObject);
});

var LoadFormatRulesFromObject = function(fmo) {
  SetClangFormatVisualEditor(fmo);
  SetClangFormatEditor(fmo);
};

var SetClangFormatVisualEditor = function(fmo) {
  $('select[name="BasedOnStyle"]').val(fmo['BasedOnStyle']);
}

var SetClangFormatEditor = function(fmo) {
  ignoreNextClangformatEditorChange = true;
  clangformatCodeEditor.setValue(fmo.ToText());
}

var TriggerAutoReformat = function() {
  if(!enableAutoReformat) {
    return;
  }

  Reformat();
}

var ParseFormatRulesObject = function() {
  formatRulesObject = new FormatRulesObject();

  var formatRulesRaw = clangformatCodeEditor.getValue().split("\n");
  formatRulesRaw.forEach(function(rawRule) {
    var keyValuePair = rawRule.split(':');

    if(keyValuePair.length != 2) return;

    var formatKey = keyValuePair[0].trim();
    var formatValue = keyValuePair[1].trim();

    formatRulesObject[formatKey] = formatValue;
  });
}

var Reformat = function(callback) {
  if(typeof callback === 'undefined') {
    callback = function(){};
  }

  var formatRuleList = formatRulesObject.ToList();

  var sourceText = cxxCodeEditor.getValue();
  var requestObject = {sourceCode: sourceText, formatRules: formatRuleList};

  $.ajax({
    type: 'POST',
    url: '/format',
    contentType: 'application/json',
    data: JSON.stringify(requestObject),
    success: function(data, statusText) {
      if(data.error == null) {
        ignoreNextCxxEditorChange = true;
        cxxCodeEditor.setValue(data.formatted);
      } else {
        alert(data.error);
      }

      callback();
    }
  });
}
