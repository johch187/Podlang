const express = require("express");
const session = require("express-session");
const crypto = require("crypto");
const SpotifyWebApi = require("spotify-web-api-node");
const app = express();

app.set("view engine", "pug");
app.use(express.static("public"));
app.set("trust proxy", 1);
app.use(
  session({
    resave: true,
    saveUninitialized: false,
    secret: process.env.SESSION_SECRET,
    maxAge: 60000 * 5
  })
);

// ---------authorization and ladning page ------------------

app.get("/", function(request, response) {
  response.render("index");
});

const redirectUri =
  "https://" + process.env.PROJECT_DOMAIN + ".glitch.me/callback";
const scopes = [];
const showDialog = true;

let spotifyApi = new SpotifyWebApi({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  redirectUri: redirectUri
});

app.get("/authorize", function(request, response) {
  let state = crypto.randomBytes(12).toString("hex");
  request.session.state = state;
  let authorizeURL = spotifyApi.createAuthorizeURL(scopes, state, showDialog);
  response.redirect(authorizeURL);
});

app.get("/callback", function(request, response) {
  if (request.session.state !== request.query.state) {
    response.sendStatus(401);
  }
  let authorizationCode = request.query.code;
  spotifyApi.authorizationCodeGrant(authorizationCode).then(
    data => {
      request.session.access_token = data.body["access_token"];
      response.redirect("/main.html"); // redirect from an sucsessful login
    },
    error => {
      console.log(
        "Something went wrong when retrieving the access token!",
        error.message
      );
    }
  );
});

// log out fuction
app.get("/logout", function(request, response) {
  request.session.destroy();
  response.redirect("/");
});

// --------------------- calls -------------------------

app.get("/main.html", function(request, response) {
  let loggedInSpotifyApi = new SpotifyWebApi();
  loggedInSpotifyApi.setAccessToken(request.session.access_token);

  spotifyApi.searchShows("SV", { limit: 5, offset: 1 }).then(
    function(data) {
      response.send(data.body);
    },
    function(err) {
      console.log(err);
    }
  );
});

//-------------------- server request ------------------------
let listener = app.listen(process.env.PORT, function() {
  console.log("Your app is listening on port " + listener.address().port);
});
