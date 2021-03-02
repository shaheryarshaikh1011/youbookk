var express = require("express");
var multer  = require("multer")
var app= express();
var bodyParser=require("body-parser");
var mongoose=require("mongoose");
var flash=require("connect-flash");
var passport=require("passport");
var LocalStrategy=require("passport-local");
var methodOverride=require("method-override");

var upload = multer({dest: 'public/img/users'})
var Campground=require("./models/posts");
var Comment =require("./models/comment");
var Like    =require("./models/likke.js");
var User    =require("./models/user");

var commentRoutes =require("./routes/comments");
var postRoutes=require("./routes/home");
var indexRoutes=require("./routes/index");
app.use(express.static(__dirname + "/public"))
app.use(methodOverride("_method"));
app.use(flash());

mongoose.set('useNewUrlParser', true);
mongoose.set('useUnifiedTopology', true);
mongoose.connect("mongodb://localhost/yelp_camp");
app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine","ejs");



//passport configuration
app.use(require("express-session")({
	secret:"Once again Bittu wins cutest dog!",
	resave: false,
	saveUninitialized:false
}));
app.locals.moment = require('moment');

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use(function(req,res,next) {
	res.locals.currentUser=req.user;
	res.locals.error=req.flash("error");
	res.locals.success=req.flash("success");
	next();
});




//requiring routes
app.use(indexRoutes);
app.use(postRoutes);
app.use(commentRoutes);












app.listen(3000,'localhost',function() {
	// body...
	console.log("Listening to port"+3000);
	console.log("Youbook Local Server has Started");

});