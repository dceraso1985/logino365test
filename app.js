require("dotenv").config();
var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var session = require("express-session");
var flash = require("connect-flash");
var passport = require("passport");
var OIDCStrategy = require("passport-azure-ad").OIDCStrategy;
var graph = require("./graph");
//const dbhelper = require("./db/DBHelper.js");
//const Model = require("./db/Models");

// Configure simple-oauth2
const oauth2 = require("simple-oauth2").create({
  client: {
    id: process.env.OAUTH_APP_ID,
    secret: process.env.OAUTH_APP_PASSWORD
  },
  auth: {
    tokenHost: process.env.OAUTH_AUTHORITY,
    authorizePath: process.env.OAUTH_AUTHORIZE_ENDPOINT,
    tokenPath: process.env.OAUTH_TOKEN_ENDPOINT
  }
});

// Configure passport

// In-memory storage of logged-in users
// For demo purposes only, production apps should store
// this in a reliable storage
var users = {};
let user_o365;
let token;
// Passport calls serializeUser and deserializeUser to
// manage users
passport.serializeUser(function (user, done) {
  // Use the OID property of the user as a key

  users[user.profile.oid] = user;
  done(null, user.profile.oid);
});

passport.deserializeUser(function (id, done) {
  done(null, users[id]);
});

// Callback function called once the sign-in is complete
// and an access token has been obtained
async function signInComplete(
  iss,
  sub,
  profile,
  accessToken,
  refreshToken,
  params,
  done
) {
  if (!profile.oid) {
    return done(new Error("No OID found in user profile."), null);
  }

  user_o365 = profile;
  token = accessToken;

  try {
    const user = await graph.getUserDetails(accessToken);

    if (user) {
      // Add properties to profile
      profile["email"] = user.mail ? user.mail : user.userPrincipalName;
    }
  } catch (err) {
    done(err, null);
  }

  // Create a simple-oauth2 token from raw tokens
  let oauthToken = oauth2.accessToken.create(params);

  // Save the profile and tokens in user storage
  users[profile.oid] = { profile, oauthToken };
  //console.log(users);
  return done(null, users[profile.oid]);
}

// Configure OIDC strategy
passport.use(
  new OIDCStrategy(
    {
      identityMetadata: `${process.env.OAUTH_AUTHORITY}${process.env.OAUTH_ID_METADATA}`,
      clientID: process.env.OAUTH_APP_ID,
      responseType: "code id_token",
      responseMode: "form_post",
      redirectUrl: process.env.OAUTH_REDIRECT_URI,
      allowHttpForRedirectUrl: true,
      clientSecret: process.env.OAUTH_APP_PASSWORD,
      validateIssuer: false,
      passReqToCallback: false,
      scope: process.env.OAUTH_SCOPES.split(" ")
    },
    signInComplete
  )
);



var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var authRouter = require("./routes/auth");

var app = express();
app.use(function (req, res, next) {
  console.log("Entre en url");
  console.log("Protocolo: " + req.protocol);
  console.log("Host: " + req.get('host'));
  console.log("Url: " + req.url);
  console.log("OriginalUrl: " + req.originalUrl)
  //console.log("FullURL: " + req.protocol + '://' + req.get('host') + req.originalUrl);
  //console.log("url: " + req.url)
  //console.log("origin url: " + req.originalUrl)
  req.protocol = "https";
  //req.get('host') = "newcos-sandbox-01.newtech.com.ar";
  console.log("Protocolo222222222: " + req.protocol);
  //console.log("Host: " + req.get('host'));
  next();
})
app.use(
  session({
    secret: "newcos_parana_martinez",
    resave: false,
    saveUninitialized: false,
    unset: "destroy"
  })
);

// Flash middleware
app.use(flash());

// Set up local vars for template layout
app.use(function (req, res, next) {
  // Read any flashed errors and save
  // in the response locals
  res.locals.error = req.flash("error_msg");

  // Check for simple error string and
  // convert to layout's expected format
  var errs = req.flash("error");
  for (var i in errs) {
    res.locals.error.push({ message: "An error occurred", debug: errs[i] });
  }

  next();
});


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

app.use(function (req, res, next) {
  // Set the authenticated user in the
  // template locals
  if (req.user) {
    res.locals.user = req.user.profile;
    console.log("TENGO SESSION")
    console.log("TENGO SESSION")
    console.log("TENGO SESSION")
    req.session.token = token;
    req.session.displayName = user_o365.displayName;
    req.session.mail = user_o365.email;
    req.session.oid = user_o365._json.oid;
    req.session.tid = user_o365._json.tid;
  }
  next();
});





app.use("/", indexRouter);
app.use("/auth", authRouter);
app.use("/users", usersRouter);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
