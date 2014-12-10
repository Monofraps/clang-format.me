var process = require('child_process');

var RunClangFormat = function(code, formatRules, callback) {
  var command = "clang-format";

  var styleArg = "";
  formatRules.forEach(function(formatRule) {
    if (styleArg.length > 0) {
      styleArg += ',';
    }
    styleArg += formatRule.key + ': ' + formatRule.value;
  });

  var args = ['-style={' + styleArg + '}'];

  var clangProcess = process.spawn(command, args,
  {
    detached: true
  });

  var formattedSource = "";
  clangProcess.stdout.on('data', function(data) {
    formattedSource += data;
  });

  var clangformatErrors = "";
  clangProcess.stderr.on('data', function(data) {
    clangformatErrors += data;
  });

  clangProcess.on('close', function(exitCode) {
    if(exitCode == 0) {
      callback(formattedSource, null);
    } else {
      callback(formattedSource, clangformatErrors);
    }
  });

  clangProcess.stdin.write(code);
  clangProcess.stdin.end();
}

module.exports = RunClangFormat;
