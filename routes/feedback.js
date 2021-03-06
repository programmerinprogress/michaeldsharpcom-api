var express = require('express');
var router = express.Router();
var GoogleSpreadsheet = require('google-spreadsheet');
var async = require('async');

/* POST likes/dislikes. */
router.post('/', function(req, res, next) {
  if(req.body.like === true){
      console.log('like registered');
  } else {
      console.log('dislike registered');
  }
 
  var doc = new GoogleSpreadsheet('1kS7juEJ9G4uxKSplOf5HnWsWC3f6F66moVzKMeTFqxI');
  var sheet;

  async.series([
  function setAuth(step) {
    // see notes below for authentication instructions!
     var creds_json = {
      client_email: process.env.GOOGLE_DRIVE_EMAIL,
      private_key: process.env.GOOGLE_DRIVE_PRIVATE_KEY.split('\\n').join('\n')
    };
    
    doc.useServiceAccountAuth(creds_json, step);
  },
  function getFeedbackSpreadsheet(step) {
    doc.getInfo(function(err, info) {
      sheet = info.worksheets[0];
      step();
    });
  },
  function updateSpreadsheet(step) {
    sheet.getCells({
      'min-row': 2,
      'max-row': 3,
      'min-col': 2,
      'max-col': 3,
      'return-empty': true
    }, function(err, cells) {

      var cellLike = cells[0];
      var lastLike = cells[1]; 
      var cellDislike = cells[2];
      var lastDislike = cells[3]; 

      if(req.body.like === true){
        cellLike.value = parseInt(cellLike.value) + 1; 
        lastLike.value = new Date(Date.now()).toString(); 
      } else {
        cellDislike.value = parseInt(cellDislike.value) + 1; 
        lastDislike.value = new Date(Date.now()).toString(); 
      }
      sheet.bulkUpdateCells(cells, function(){
           res.json('like/dislike posted successfully!');
      }); //async
    });
  }
]);
});

module.exports = router;
