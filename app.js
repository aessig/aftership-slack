var express       = require('express');
var bodyParser    = require('body-parser');
var request       = require('request');
var dotenv        = require('dotenv');
var Aftership     = require('aftership')(process.env.AFTERSHIP_TOKEN);

dotenv.load();

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.get('/', function(req, res) {
  return res.send('Welcome little mother fucker !');
});

app.use('/store', function(req, res, next) {
  if (req.body.token !== process.env.SLACK_TOKEN) {
    return res.status(500).send('Cross site request forgerizzle!');
  }
  next();
});

app.post('/store', function(req, res) {

  var command = req.body.text.split(' ');
  switch (command[0]) {
    case "couriers":
      Aftership.getCouriers(function(err, result) {
        res.send('Support courier count: ' + result.total + 'Couriers: ' + result.couriers);
      });
      break;

    case "create":
      var _trackNumber = command[1];
      Aftership.createTracking(_trackNumber, {slug: 'ups'}, function(err, result) {
        if (err) {
          res.send(err);
        } else {
          res.send('Created the tracking: ' + result);
        }
      });
      break;

    case "get":
      Aftership.getTrackings({slug: 'ups'}, function(err, results) {
        if (err) {
          res.send(err);
        } else {
          res.send('Total Trackings in query: ' + results.count);
          res.send(results);
        }
      });
      break;

    case "track":
      var _trackNumber = command[1];
      Aftership.tracking('ups', _trackNumber, ['tracking_number','slug','checkpoints'], function(err, result) {
        if (err) {
          res.send(err);
        } else {
          res.send(result);
        }
      });
      break;

    case "update":
      var _trackNumber = command[1];
      var _title = command[2]
      Aftership.updateTracking('ups', _trackNumber, {title: _title }, function(err, result) {
        if (err) {
          res.send(err);
        } else {
          res.send(result);
        }
      });
      break;

    case "check":
      var _trackNumber = command[1];
      Aftership.last_checkpoint('ups', _trackNumber, ['tracking_number','slug','checkpoints'], function(err, result) {
        if (err) {
          res.send(err);
        } else {
          res.send(result);
        }
      });
      break;

    default:
      res.send("Unknown command");
  }
});

app.set('port', (process.env.PORT || 5000));
app.listen(app.get('port'));
