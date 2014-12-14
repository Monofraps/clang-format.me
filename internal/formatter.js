var process = require('child_process');
var temp = require('temp');
var fs = require('fs');
var path = require('path');

temp.track();

var RunClangFormat = function(code, formatRules, callback) {
  var command = "clang-format";

  var tmpDir = temp.mkdirSync('cfmt');
  var tempFilePath = path.join(tmpDir, '.clang-format');
  var tempFile = fs.openSync(tempFilePath, 'w');
  fs.writeSync(tempFile, formatRules);
  fs.close(tempFile);

  var clangProcess = process.spawn(command, [],
  {
    cwd: tmpDir,
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
    fs.unlink(tempFilePath, function(err) {
      if(err) {
        console.log(err);
      }else {
        fs.rmdir(tmpDir, function(err) {
          if(err) {
            console.log(err);
          }
        });
      }
    });

    if(exitCode == 0) {
      callback(formattedSource, null);
      console.log(clangformatErrors);
    } else {
      callback(formattedSource, clangformatErrors);
    }
  });

  clangProcess.stdin.write(code);
  clangProcess.stdin.end();
};

module.exports = RunClangFormat;
