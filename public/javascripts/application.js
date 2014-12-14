var cxxCodeEditor = null;
var clangformatCodeEditor = null;

var ignoreNextCxxEditorChange = false;
var ignoreNextClangformatEditorChange = false;

var reformatDelay = 600;
var reformatTimeoutId = -1;

var syncVisualEditorDelay = 200;
var syncVisualEditorTimeoutId = -1;

var enableAutoReformat = true;

var basedOnStyle = "LLVM";
var formatRules = [];

var basedOnStyleSelect;

require(['/javascripts/clang-format-attributes.js'], function(module) {
  $.ajax({
    type: 'GET',
    url: '/cf-rules',
    success: function(data, statusText) {
      data.rules.forEach(function(rule) {
        formatRules.push(new module.ClangFormatAttribute(rule));
      });
    }
  });
});

require(['/javascripts/codemirror.js', '/javascripts/clike.js', '/javascripts/yaml.js'], function(CodeMirror) {
  cxxCodeEditor = CodeMirror.fromTextArea(document.getElementById("c-code"), {
    mode: "text/x-c++src",
    viewportMargin: Infinity
  });
  clangformatCodeEditor = CodeMirror.fromTextArea(document.getElementById("clangformat"), {
    mode: "text/x-yaml"
  });

  $('#raw').on('toggled', function(event, tab) {
    clangformatCodeEditor.refresh();
    ignoreNextClangformatEditorChange = true;
    SetClangFormatEditor();
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
    if (ignoreNextClangformatEditorChange) {
      ignoreNextClangformatEditorChange = false;
      return;
    }

    if (syncVisualEditorTimeoutId != -1) {
      clearTimeout(syncVisualEditorTimeoutId);
    }

    syncVisualEditorTimeoutId = setTimeout(function() {
      SetClangFormatVisualEditor();
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

  basedOnStyleSelect = $('select[name="BasedOnStyle"]');

  $('#apply-bos').click(function() {
    basedOnStyle = basedOnStyleSelect.val();
    LoadDefaults();
    SetClangFormatEditor();
  });

  basedOnStyleSelect.change(function() {
    basedOnStyle = basedOnStyleSelect.val();
    SetClangFormatEditor();
  });
});

var LoadDefaults = function() {
  formatRules.forEach(function(rule) {
    rule.LoadDefaults(basedOnStyle);
  });
}

var SetClangFormatVisualEditor = function() {
  var clangFormatYaml = jsyaml.load(clangformatCodeEditor.getValue());

  basedOnStyle = clangFormatYaml["BasedOnStyle"];
  basedOnStyleSelect.val(basedOnStyle);

  formatRules.forEach(function(rule) {
    rule.SetValue(clangFormatYaml[rule.name]);
  });
}

var SetClangFormatEditor = function(fmo) {
  ignoreNextClangformatEditorChange = true;

  var formatRuleText = "BasedOnStyle: " + basedOnStyle + "\n";

  formatRules.forEach(function(rule) {
    formatRuleText += rule.ToString() + "\n";
  });

  clangformatCodeEditor.setValue(formatRuleText);
}

var TriggerAutoReformat = function() {
  if (!enableAutoReformat) {
    return;
  }

  Reformat();
}

var Reformat = function(callback) {
  if (typeof callback === 'undefined') {
    callback = function() {};
  }

  var formatRuleList = [];
  var clangFormatYaml = jsyaml.load(clangformatCodeEditor.getValue());

  Object.keys(clangFormatYaml).forEach(function(formatRule) {
    formatRuleList.push({key: formatRule, value: clangFormatYaml[formatRule]});
  });


  var sourceText = cxxCodeEditor.getValue();
  var requestObject = {
    sourceCode: sourceText,
    formatRules: clangformatCodeEditor.getValue()
  };

  $.ajax({
    type: 'POST',
    url: '/format',
    contentType: 'application/json',
    data: JSON.stringify(requestObject),
    success: function(data, statusText) {
      if (data.error == null) {
        ignoreNextCxxEditorChange = true;
        cxxCodeEditor.setValue(data.formatted);
      } else {
        alert(data.error);
      }

      callback();
    }
  });
}
