var CFA_SELECT = "select";
var CFA_BOOL = "bool";
var CFA_INT = "int";
var CFA_UINT = "uint";
var CFA_STRING = "string";

var ClangFormatAttribute = function(jsonObject) {
  this.name = jsonObject.name;
  this.type = jsonObject.type;

  this.options = jsonObject.options;

  this.defaults = jsonObject.defaults;
  this.input = null;

  this.GenerateBinding();
}

ClangFormatAttribute.prototype.GenerateBinding = function() {
  var self = this;

  if(this.type == CFA_SELECT) {
    this.input = $("select[data-atbind='" + this.name + "']");
    this.input.change(function() {
      self.value = self.input.val();
    });
  } else if(this.type == CFA_BOOL) {
    this.input = $("input[data-atbind='" + this.name + "']");
    this.input.change(function() {
      self.value = self.input.prop("checked");
    });
  } else {
    this.input = $("input[data-atbind='" + this.name + "']");
    this.input.change(function() {
      self.value = self.input.val();
    });
  }

  this.LoadDefaults("LLVM");
}

ClangFormatAttribute.prototype.LoadDefaults = function(defaultName) {
  this.SetValue(this.defaults[defaultName]);
}

ClangFormatAttribute.prototype.SetValue = function(value) {
  if(this.type == CFA_BOOL) {
    this.input.prop("checked", value ? true : false);
  } else {
    this.input.val(value);
  }

  this.value = value;
}

ClangFormatAttribute.prototype.ToString = function() {
  if(this.type == CFA_STRING) {
      return this.name + ": '" + this.value + "'";
  } else {
    return this.name + ": " + this.value;
  }
}

define({
  ClangFormatAttribute: ClangFormatAttribute
});
