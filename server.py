#!/usr/bin/env python
# -*- coding: utf-8 -*-

from dotenv import load_dotenv, find_dotenv
import spotipy, os
from spotipy.oauth2 import SpotifyClientCredentials
from flask import Flask, request, render_template, jsonify
# Spotify API wrapper, documentation here: http://spotipy.readthedocs.io/en/latest/

load_dotenv(find_dotenv())
print(os.getenv('SPOTIPY_CLIENT_ID'))

SPOTIPY_CLIENT_ID = os.environ.get("SPOTIPY_CLIENT_ID")
SPOTIPY_CLIENT_SECRET = os.environ.get("SPOTIPY_CLIENT_SECRET")
SESSION_SECRET = os.environ.get("SESSION_SECRET")

# Authenticate with Spotify using the Client Credentials flow
sp = spotipy.Spotify(client_credentials_manager=SpotifyClientCredentials())

app = Flask(__name__, static_folder='public', template_folder='views')

@app.route('/')
def homepage():
    return "hello world"

@app.route('/authorize')
def authorize():
  client_id = app.config['CLIENT_ID']
  redirect_uri = app.config['REDIRECT_URI']
  scope = app.config['SCOPE']
  state_key = createStateKey(15)
  session['state_key'] = state_key

  authorize_url = 'https://accounts.spotify.com/en/authorize?'
  params = {'response_type': 'code', 'client_id': client_id,
            'redirect_uri': redirect_uri, 'scope': scope, 
            'state': state_key}
  query_params = urlencode(params)
  response = make_response(redirect(authorize_url + query_params))
  return response

if __name__ == '__main__':
    app.run()
    