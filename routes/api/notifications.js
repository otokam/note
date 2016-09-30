var Cloudant = require('cloudant');
var express = require('express');
var router = express.Router();
var https = require('https');
var request = require('request');

var VCAP_SERVICES = JSON.parse(process.env.VCAP_SERVICES);
//console.log(VCAP_SERVICES.cloudantNoSQLDB[0].credentials);
var cloudant = Cloudant(VCAP_SERVICES.cloudantNoSQLDB[0].credentials);
var notifications = cloudant.db.use('notifications');

router.post('/', function(req, res, next) {
  var options = {
    url: 'https://status.eu-gb.bluemix.net/api/notifications',
    method: 'GET',
    json: true                                                                                                                        
  }
  notifications.list(function(error, allDoc) {
    if (error) {
      return;
    }
    var allObj = {};
    allDoc.rows.forEach(function(doc) {
      allObj[doc.id] = doc;
    })   
    request(options, function (error, response, body) {
      body.forEach(function(notification) {
        var data = allObj[notification._id];
        if (typeof data === "undefined") {
          notifications.insert(notification, function(err, body, header) {
            if (err) {
              return console.error('[notifications.insert] ', err.message);
            }
          });
        }
      });
    })
  });
  res.render('index', { title: 'Express' });
});

module.exports = router;
