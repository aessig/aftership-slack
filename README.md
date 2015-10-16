# Slackship
Slack Integration of aftership API

# -- NOT READY YET --

[![Deploy](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy)

Simply create a Slash Command, such as `/track`, which accepts a tracking number to get notify of his status:

    /track 1Z934E2R6845846127

##Installation

First you'll want to create your Slack Slash Command, which you can do by going to your [Slash Commands page](https://my.slack.com/services/new/slash-commands).

During setup, have your slash command submit a POST to your app's `/store` endpoint, e.g. `https://app-name.herokuapp.com/store`.

Make a note of the `token`, as you'll need it later to help guard against cross-site request forgery.

###Aftership

Head over to [Aftership's Developer Site](https://www.aftership.com/signup) and create a new Application (Apps/API).

Generate a new API key and make a not of it, as you'll need these later as well.

###Environment variables

Once you've cloned slackbox or hit the "Deploy with Heroku" button you'll need to setup the following environment variables. These can either be stored in a `.env` or set up as config variables in Heroku.

* `AFTERSHIP_TOKEN` - Aftership token key.
* `SLACK_TOKEN` - Slack token key.

###Authentication

Visit your slackbox's home page to authenticate yourself with Spotify and you should be all set!
