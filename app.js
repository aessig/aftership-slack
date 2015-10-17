var express       = require('express');
var bodyParser    = require('body-parser');
var request       = require('request');
var dotenv        = require('dotenv');

dotenv.load();

var packpin = require('packpin')(process.env.PACKPIN_TOKEN);

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.get('/', function(req, res) {
  return res.send('Welcome little mother fucker ! - Version 0.0.2');
});

app.use('/store', function(req, res, next) {
  if (req.body.token !== process.env.SLACK_TOKEN) {
    return res.status(500).send('Cross site request forgerizzle!');
  }
  next();
});

app.post('/store', function(req, res) {

  var command = req.body.text.split(' ');
  if (!command[0]) {
    return res.send(" Try: '/track create' Slackship command are the following  create, add, get, getAll, track, update, delete, carriers. Try any of those command without parameter to see how you should request");
  }
  else {
    var data = "";
    switch (command[0]) {
      case "carriers":
        packpin.getCarriers(function(err, result) {
          if (err) {
            data += "Error: " + JSON.stringify(err);
          } else {
            data += 'Carriers: ' + JSON.stringify(result);
          }
          res.send(data);
        });
        break;

      case "create":
        if (!command[1] && !command[2]) {
          res.send(" Try: '/track create 058200005422993 Order from Digikey'. Slackship 'create' command structure  '/track create [tracking_number] [description]' ");
        }
        else {
          var _trackNumber = command[1];
          command.splice(2, command.length); // remove everything but the description
          var _description = command.join(" ");
          packpin.detectCarriers(_trackNumber, function(err, result) {
            //console.log('Carriers: ');
            //console.log(result);
            var _carriersCount = result.length;
            if (_carriersCount >= 1) {
              packpin.createTracking(_trackNumber, result[0].code, {description:  _description}, function(err, result) {
                if (err) {
                  res.send(err);
                  res.send(result.reason);
                } else {
                  res.send('Created the tracking: ');
                  res.send(result);
                }
              });
            }
            else {
              res.send("This tracking number is not from one of our supported carriers. Try using command /track create tracking_number carrier_code. Example: /track create 058200005422993 dpd");
            }
          });
        }
        break;

      case "add":
        if (!command[1] && !command[2] && !command[3]) {
          res.send(" Try: '/track add 058200005422993 ups Order from Digikey'. Slackship 'add' command structure  '/track add [tracking_number] [carrier] [description]' ");
        }
        else {
          var _trackNumber = command[1];
          var _carrier = command[2];
          command.splice(3, command.length); // remove everything but the description
          var _description = command.join(" ");
          packpin.createTracking(_trackNumber, _carrier, {description:  _description}, function(err, result) {
            if (err) {
              res.send(err);
              res.send(result.reason);
            } else {
              res.send('Created the tracking: ');
              res.send(result);
            }
          });
        }
        break;

      case "get": // Prenium
        if (!command[1]) {
          res.send(" Try: '/track get 058200005422993 '. Slackship 'get' command structure  '/track get [tracking_number] [carrier=optional]' ");
        }
        else {
          var _trackNumber = command[1];
          var _carrier = "";
          if (command[2]) {
            _carrier = command[2];
          }
          packpin.getTracking(_trackNumber, _carrier, function(err, result) {
            if (err) {
              res.send(err);
              res.send(result.reason);
            } else {
              res.send('Tracking: ');
              res.send(result);
            }
          });
        }
        break;

      case "getAll": // Prenium
        packpin.getTrackings(function(err, result) {
          if (err) {
            data += "Error: "+ JSON.stringify(err) + JSON.stringify(result.reason);
          } else {
            data += "*ALL TRACKINGS* (" + result.total + ") \n "
            for (var val of result.items) {
              data += "- *"+ val.code + "*: "+val.description+ "\n";
            }
          }
          res.send(data);
        });
        break;

      case "track": // Last position
        var _trackNumber = command[1];
        if (!command[1]) {
          res.send(" Try: '/track track 058200005422993 '. Slackship 'track' command structure  '/track track [tracking_number] [carrier=optional]' ");
        }
        else {
          var _trackNumber = command[1];
          var _carrier = "";
          if (command[2]) {
            _carrier = command[2];
          }
          packpin.getTracking(_trackNumber, _carrier, function(err, result) {
            if (err) {
              res.send(err);
              res.send(result.reason);
            } else {
              // Extract last postion
              res.send('Tracking: ');
              res.send(result.track_details[0]);
            }
          });
        }
        break;

      case "update":
        var _trackNumber = command[1];
        if (!command[1]) {
          res.send(" Try: '/track update 058200005422993 Order 2 from Farnell'. Slackship 'update' command structure  '/track update [tracking_number] [description]' ");
        }
        else {
          var _trackNumber = command[1];
          command.splice(2, command.length); // remove everything but the description
          var _description = command.join(" ");
          packpin.updateTracking(_trackNumber, _carrier, _description, function(err, result) {
            if (err) {
              res.send(err);
              res.send(result.reason);
            } else {
              // Extract last postion
              res.send('Tracking: ');
              res.send(result);
            }
          });
        }
        break;

      case "delete": // Non prenium
        var _trackNumber = command[1];
        if (!command[1]) {
          res.send(" Try: '/track delete 058200005422993 '. Slackship 'delete' command structure  '/track delete [tracking_number] [carrier=optional]' ");
        }
        else {
          var _trackNumber = command[1];
          var _carrier = "";
          if (command[2]) {
            _carrier = command[2];
          }
          packpin.deleteTracking(_trackNumber, _carrier, function(err, result) {
            if (err) {
              res.send(err);
              res.send(result.reason);
            } else {
              // Extract last postion
              res.send('Tracking: ');
              res.send(result);
            }
          });
        }
        break;

      default:
        res.send("Unknown command");
    }
  }
});

app.set('port', (process.env.PORT || 5000));
app.listen(app.get('port'));
