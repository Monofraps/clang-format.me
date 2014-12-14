var yaml = require('js-yaml');
var fs = require('fs');

var configDefaults = {}
configDefaults["LLVM"] = yaml.safeLoad(fs.readFileSync('./defaults/LLVM.yml', 'utf8'));
configDefaults["Google"] = yaml.safeLoad(fs.readFileSync('./defaults/Google.yml', 'utf8'));
configDefaults["Chromium"] = yaml.safeLoad(fs.readFileSync('./defaults/Chromium.yml', 'utf8'));
configDefaults["Mozilla"] = yaml.safeLoad(fs.readFileSync('./defaults/Mozilla.yml', 'utf8'));
configDefaults["WebKit"] = yaml.safeLoad(fs.readFileSync('./defaults/WebKit.yml', 'utf8'));


var CFA_SELECT = "select";
var CFA_BOOL = "bool";
var CFA_INT = "int";
var CFA_UINT = "uint";
var CFA_STRING = "string";

var ClangFormatAttribute = function(name, description, type) {
  this.name = name;
  this.description = description
  this.type = type;

  this.options = [];
  this.defaults = {};

  this.LoadDefaults();
}

ClangFormatAttribute.prototype.AddSelectOption = function(option) {
  this.options.push(option);

  return this;
}

ClangFormatAttribute.prototype.SetDefaults = function(configName, value) {
  this.defaults[configName] = value;

  return this;
}

ClangFormatAttribute.prototype.LoadDefaults = function() {
  var self = this;

  Object.keys(configDefaults).forEach(function(defaultConfig) {
    self.SetDefaults(defaultConfig, configDefaults[defaultConfig][self.name]);
  });

  return this;
}

var basedOnStyleOption;

var clangFormatAttributes = [];
var AddGlobalAttribute = function(clangFormatAttribute) {
  clangFormatAttributes.push(clangFormatAttribute);
  return clangFormatAttribute;
}

var AddSelectAttribute = function(name, description) {
  return AddGlobalAttribute(new ClangFormatAttribute(name, description, CFA_SELECT));
}

var AddBasedOnStyleAttribute = function(name, description) {
  basedOnStyleOption = new ClangFormatAttribute(name, description, CFA_SELECT);
  return basedOnStyleOption;
}

var AddBoolAttribute = function(name, description) {
  return AddGlobalAttribute(new ClangFormatAttribute(name, description, CFA_BOOL));
}

var AddIntAttribute = function(name, description) {
  return AddGlobalAttribute(new ClangFormatAttribute(name, description, CFA_INT));
}

var AddUintAttribute = function(name, description) {
  return AddGlobalAttribute(new ClangFormatAttribute(name, description, CFA_UINT));
}

var AddStringAttribute = function(name, description) {
  return AddGlobalAttribute(new ClangFormatAttribute(name, description, CFA_STRING));
}

AddBasedOnStyleAttribute("BasedOnStyle")
  .AddSelectOption("LLVM")
  .AddSelectOption("Google")
  .AddSelectOption("Chromium")
  .AddSelectOption("Mozilla")
  .AddSelectOption("WebKit");

AddIntAttribute("AccessModifierOffset", "The extra indent or outdent of access modifiers, e.g. public:.");

AddBoolAttribute("AlignAfterOpenBracket");

AddBoolAttribute("AlignEscapedNewlinesLeft", "If true, aligns escaped newlines as far left as possible. Otherwise puts them into the right-most column.");
AddBoolAttribute("AlignOperands", "If true, horizontally align operands of binary and ternary expressions.")
AddBoolAttribute("AlignTrailingComments", "If true, aligns trailing comments.");
AddBoolAttribute("AllowAllParametersOfDeclarationOnNextLine", "Allow putting all parameters of a function declaration onto the next line even if BinPackParameters is false.");
AddBoolAttribute("AllowShortBlocksOnASingleLine", "Allows contracting simple braced statements to a single line.<br>E.g., this allows if (a) { return; } to be put on a single line.");
AddBoolAttribute("AllowShortCaseLabelsOnASingleLine", "If true, short case labels will be contracted to a single line.");

AddSelectAttribute("AllowShortFunctionsOnASingleLine")
  .AddSelectOption("None")
  .AddSelectOption("Inline")
  .AddSelectOption("Empty")
  .AddSelectOption("All");

AddBoolAttribute("AllowShortIfStatementsOnASingleLine", "If true, if (a) return; can be put on a single line.");
AddBoolAttribute("AllowShortLoopsOnASingleLine", "If true, while (true) continue; can be put on a single line.");
AddBoolAttribute("AlwaysBreakAfterDefinitionReturnType", "If true, always break after function definition return types.<br>More truthfully called ‘break before the identifier following the type in a function definition’. PenaltyReturnTypeOnItsOwnLine becomes irrelevant.");
AddBoolAttribute("AlwaysBreakBeforeMultilineStrings", "If true, always break before multiline string literals.");
AddBoolAttribute("AlwaysBreakTemplateDeclarations", "If true, always break after the template<...> of a template declaration.");
AddBoolAttribute("BinPackArguments", "If false, a function call’s arguments will either be all on the same line or will have one line each.");
AddBoolAttribute("BinPackParameters", "If false, a function declaration’s or function definition’s parameters will either all be on the same line or will have one line each.");

AddSelectAttribute("BreakBeforeBinaryOperators")
  .AddSelectOption("None")
  .AddSelectOption("NonAssignment")
  .AddSelectOption("All");

AddSelectAttribute("BreakBeforeBraces")
  .AddSelectOption("Attach")
  .AddSelectOption("Linux")
  .AddSelectOption("Stroustrup")
  .AddSelectOption("Allman")
  .AddSelectOption("GNU");

AddBoolAttribute("BreakBeforeTernaryOperators", "If true, ternary operators will be placed after line breaks.");
AddBoolAttribute("BreakConstructorInitializersBeforeComma", "Always break constructor initializers before commas and align the commas with the colon.");

AddUintAttribute("ColumnLimit");

AddStringAttribute("CommentPragmas", "A regular expression that describes comments with special meaning, which should not be split into lines or otherwise changed.");

AddBoolAttribute("ConstructorInitializerAllOnOneLineOrOnePerLine", "If the constructor initializers don’t fit on a line, put each initializer on its own line.");

AddUintAttribute("ConstructorInitializerIndentWidth", "The number of characters to use for indentation of constructor initializer lists.");
AddUintAttribute("ContinuationIndentWidth", "Indent width for line continuations.");

AddBoolAttribute("Cpp11BracedListStyle");
AddBoolAttribute("DerivePointerAlignment", "If true, analyze the formatted file for the most common alignment of & and *. PointerAlignment is then used only as fallback.");
AddBoolAttribute("DisableFormat", "Disables formatting at all.");
AddBoolAttribute("ExperimentalAutoDetectBinPacking");

// this.ForEachMacros = null; // vector<string>

AddBoolAttribute("IndentCaseLabels", "Indent case labels one level from the switch statement.<br>When false, use the same indentation level as for the switch statement. Switch statement body is always indented one level more than case labels.");

AddUintAttribute("IndentWidth", "The number of columns to use for indentation.");

AddBoolAttribute("IndentWrappedFunctionNames", "Indent if a function definition or declaration is wrapped after the type.");
AddBoolAttribute("KeepEmptyLinesAtTheStartOfBlocks", "If true, empty lines at the start of blocks are kept.");

AddSelectAttribute("Language")
  .AddSelectOption("None")
  .AddSelectOption("Cpp")
  .AddSelectOption("Java")
  .AddSelectOption("JavaScript")
  .AddSelectOption("Proto");

AddUintAttribute("MaxEmptyLinesToKeep", "The maximum number of consecutive empty lines to keep.");

AddSelectAttribute("NamespaceIndentation")
  .AddSelectOption("None")
  .AddSelectOption("Inner")
  .AddSelectOption("All");

AddUintAttribute("ObjCBlockIndentWidth", "The number of characters to use for indentation of ObjC blocks.");

AddBoolAttribute("ObjCSpaceAfterProperty", "Add a space after @property in Objective-C, i.e. use \@property (readonly) instead of \@property(readonly).");
AddBoolAttribute("ObjCSpaceBeforeProtocolList", "Add a space in front of an Objective-C protocol list, i.e. use Foo <Protocol> instead of Foo<Protocol>.");

AddUintAttribute("PenaltyBreakBeforeFirstCallParameter", "The penalty for breaking a function call after “call(”.");
AddUintAttribute("PenaltyBreakComment", "The penalty for each line break introduced inside a comment.");
AddUintAttribute("PenaltyBreakFirstLessLess", "The penalty for breaking before the first <<.");
AddUintAttribute("PenaltyBreakString", "The penalty for each line break introduced inside a string literal.");
AddUintAttribute("PenaltyExcessCharacter", "The penalty for each character outside of the column limit.");
AddUintAttribute("PenaltyReturnTypeOnItsOwnLine", "Penalty for putting the return type of a function onto its own line.");

AddSelectAttribute("PointerAlignment")
  .AddSelectOption("Left")
  .AddSelectOption("Right")
  .AddSelectOption("Middle");

AddBoolAttribute("SpaceAfterCStyleCast", "If true, a space may be inserted after C style casts.");
AddBoolAttribute("SpaceBeforeAssignmentOperators", "If false, spaces will be removed before assignment operators.");

AddSelectAttribute("SpaceBeforeParens")
  .AddSelectOption("Never")
  .AddSelectOption("ControlStatements")
  .AddSelectOption("Always");

AddBoolAttribute("SpaceInEmptyParentheses", "If true, spaces may be inserted into ‘()’.");

AddUintAttribute("SpacesBeforeTrailingComments", "The number of spaces before trailing line comments (// - comments).<br>This does not affect trailing block comments (/**/ - comments) as those commonly have different usage patterns and a number of special cases.");

AddBoolAttribute("SpacesInAngles", "If true, spaces will be inserted after ‘<’ and before ‘>’ in template argument lists");
AddBoolAttribute("SpacesInCStyleCastParentheses", "If true, spaces may be inserted into C style casts.");
AddBoolAttribute("SpacesInContainerLiterals", "If true, spaces are inserted inside container literals (e.g. ObjC and Javascript array and dict literals).");
AddBoolAttribute("SpacesInParentheses", "If true, spaces will be inserted after ‘(‘ and before ‘)’.");
AddBoolAttribute("SpacesInSquareBrackets", "If true, spaces will be inserted after ‘[‘ and before ‘]’.");

AddSelectAttribute("Standard")
  .AddSelectOption("Cpp03")
  .AddSelectOption("Cpp11")
  .AddSelectOption("Auto");

AddUintAttribute("TabWidth", "The number of columns used for tab stops.");

AddSelectAttribute("UseTab")
  .AddSelectOption("Never")
  .AddSelectOption("ForIndentation")
  .AddSelectOption("Always");

module.exports.ClangFormatAttribute = ClangFormatAttribute;
module.exports.clangFormatAttributes = clangFormatAttributes;
module.exports.basedOnStyleOption = basedOnStyleOption;
