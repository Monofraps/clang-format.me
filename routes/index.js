var express = require('express');
var router = express.Router();
var cfa = require('../internal/ClangFormatAttribute');


/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { clangFormatAttributes: cfa.clangFormatAttributes, basedOnStyleOption:  cfa.basedOnStyleOption});
});

module.exports = router;
