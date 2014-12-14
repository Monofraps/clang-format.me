var express = require('express');
var router = express.Router();

var clangAttribs = require('../internal/ClangFormatAttribute');

router.get('/', function(req, res) {
  res.set('Content-Type', 'application/json');
  res.end(JSON.stringify({'rules': clangAttribs.clangFormatAttributes}));
});

module.exports = router;
