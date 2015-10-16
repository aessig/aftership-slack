var express       = require('express');
var bodyParser    = require('body-parser');
var request       = require('request');
var dotenv        = require('dotenv');
var packpin       = require('packpin')(process.env.PACKPIN_TOKEN);

dotenv.load();

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.get('/', function(req, res) {
  return res.send('Welcome little mother fucker ! - Version 0.0.1');
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

      break;

    case "create":
      var _trackNumber = command[1];

      break;

    case "get": // Prenium

      break;

    case "track": // Internal server error
      var _trackNumber = command[1];

      break;

    case "update": // Prenium
      var _trackNumber = command[1];
      var _title = command[2]

      break;

    case "check": // Non prenium
      var _trackNumber = command[1];

      break;

    default:
      res.send("Unknown command");
  }
});

app.set('port', (process.env.PORT || 5000));
app.listen(app.get('port'));
