var express = require('express');
var router = express.Router();

var formatter = require('../internal/formatter');

router.post('/', function(req, res) {
  console.log(req.body);

  formatter(req.body.sourceCode, req.body.formatRules, function(formattedCode, error) {
    res.set('Content-Type', 'application/json');
    res.end(JSON.stringify({'formatted': formattedCode, 'error': error}));
  });
});

module.exports = router;
