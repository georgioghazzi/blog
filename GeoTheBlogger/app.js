var express     = require("express"),
    app         = express(),
    bodyParser  = require("body-parser"),
    mongoose    = require("mongoose"),
    passport    = require("passport"),
    flash       = require('connect-flash'),
    methodOverride = require("method-override"),
    LocalStrategy = require("passport-local"),
    Campground  = require("./models/posts"),
    User        = require("./models/user"),
    port = process.env.PORT || 8080;

//requiring routes
var postsRoutes = require("./routes/posts"),
    indexRoutes      = require("./routes/index")
mongoose.connect("mongodb://georgioghazzi:2392129040@ds121099.mlab.com:21099/geotheblogger");
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(flash());

// PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "Geo Is Awesome",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate() ));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
   res.locals.currentUser = req.user;
   res.locals.error = req.flash("error");
   res.locals.success = req.flash("success")
   next();  
});

app.use("/", indexRoutes);
app.use("/posts", postsRoutes);


app.listen(port,  function(){
   console.log("GeoTheBlogger Has Started!");
});
