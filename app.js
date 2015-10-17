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
    return res.send(" Try: '/track create'. \n *Slackship* command are the following: create, add, get, getAll, track, update, delete, carriers. \n Try any of those command without parameter to see how you should request");
  }
  else {
    var data = "";
    switch (command[0]) {
      case "carriers":
        packpin.getCarriers(function(err, result) {
          if (err) {
            data += "Error: " + JSON.stringify(err);
          } else {
            data += "*ALL CARRIERS* (" + result.length + ") \n ";
            for (var elem of result) {
              data += "- "+elem.name;
            }
          }
          res.send(data);
        });
        break;

      case "create":
        if (!command[1] && !command[2]) {
          res.send(" Try: `/track create 058200005422993 Order from Digikey` \n *Slackship* 'create' command structure is  `/track create [tracking_number] [description]` ");
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
                  data += "Error: " + JSON.stringify(err);
                } else {
                  data += 'Track added with ID: '+ result.id;
                }
                res.send(data);
              });
            }
            else {
              res.send("This tracking number is not from one of our supported carriers. \n Try using command /track create tracking_number carrier_code. \n Example: `/track add 058200005422993 dpd Order from Digikey`");
            }
          });
        }
        break;

      case "add":
        if (!command[1] && !command[2] && !command[3]) {
          res.send(" Try: `/track add 058200005422993 ups Order from Digikey` \n *Slackship* *add* command structure is `/track add [tracking_number] [carrier] [description]`");
        }
        else {
          var _trackNumber = command[1];
          var _carrier = command[2];
          command.splice(3, command.length); // remove everything but the description
          var _description = command.join(" ");
          packpin.createTracking(_trackNumber, _carrier, {description:  _description}, function(err, result) {
            if (err) {
              data += "Error: " + JSON.stringify(err);
            } else {
              data += 'Track added with ID: '+ result.id;
            }
            res.send(data);
          });
        }
        break;

      case "get": // Prenium
        if (!command[1]) {
          res.send(" Try: `/track get 058200005422993 dpd` \n *Slackship* *get* command structure is `/track get [tracking_number] [carrier]`");
        }
        else {
          var _trackNumber = command[1];
          var _carrier = "";
          if (command[2]) {
            _carrier = command[2];
          }
          packpin.getTracking(_trackNumber, _carrier, function(err, result) {
            if (err) {
              data += "Error: " + JSON.stringify(err);
            } else {
              data += 'get Track';
            }
            res.send(data);
          });
        }
        break;

      case "getAll": // Prenium
        packpin.getTrackings(function(err, result) {
          if (err) {
            data += "Error: "+ JSON.stringify(err) + JSON.stringify(result.reason);
          } else {
            data += "*ALL TRACKINGS* (" + result.total + ") \n "
            var counter = 1;
            for (var val of result.items) {
              data += counter+") *"+ val.code + "* ("+val.carrier_code+") "+val.description+ "\n";
              counter++;
            }
          }
          res.send(data);
        });
        break;

      case "track": // Last position
        if (!command[1]) {
          res.send(" Try: `/track track 058200005422993 dpd` \n *Slackship* *track* command structure is `/track track [tracking_number] [carrier]` ");
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
              data += "*"+result.code+"* (" + result.description + ") \n";
              var last_step = result.track_details[0];
              console.log(last_step);
              data += " *STATUS:* "+ last_step.status_string + "\n";
              data += " *LOCATION:* " + last_step.zip + "\n";
              data += " *DATE:* "+last_step.event_date+" "+last_step.event_time + "\n";
            }
            res.send(data);
          });
        }
        break;

      case "update":
        var _trackNumber = command[1];
        if (!command[1]) {
          res.send(" Try: `/track update 058200005422993 Order 2 from Farnell` \n *Slackship* *update* command structure is `/track update [tracking_number] [description]` ");
        }
        else {
          var _trackNumber = command[1];
          command.splice(2, command.length); // remove everything but the description
          var _description = command.join(" ");
          packpin.updateTracking(_trackNumber, _carrier, _description, function(err, result) {
            if (err) {
              data += "Error: " + JSON.stringify(err);
            } else {
              data += 'Track *'+_trackNumber+'* updated !';
            }
            res.send(data);
          });
        }
        break;

      case "delete": // Non prenium
        var _trackNumber = command[1];
        if (!command[1]) {
          res.send(" Try: `/track delete 058200005422993 dpd` \n *Slackship* *delete* command structure  `/track delete [tracking_number] [carrier]` ");
        }
        else {
          var _trackNumber = command[1];
          var _carrier = "";
          if (command[2]) {
            _carrier = command[2];
          }
          packpin.deleteTracking(_trackNumber, _carrier, function(err, result) {
            if (err) {
              data += "Error: " + JSON.stringify(err);
            } else {
              data += 'Track *'+_trackNumber+'* deleted !';
            }
            res.send(data);
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
