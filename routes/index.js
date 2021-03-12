//requiring express and passportjs
var express=require("express");
var router= express.Router();
var passport=require("passport");

//requiring user model from mongodb
var User    =require("../models/user");

//requiring middleware file
var middleware=require("../middleware");


//landing page
router.get("/",function(req,res) {
	// body...
	res.render("landing.ejs");
});

//show register form
router.get("/register",middleware.isNotLoggedIn,function(req,res) {
	res.render("register");
	// body...
});

//handle signup logic
router.post("/register",function(req,res) {
	
	var newUser = new User({username:req.body.username});
	 User.register(newUser,req.body.password,function(err,user) {
		// body...
		if(err)
		{
			return res.render("register", {"error": err.message});
		}
		passport.authenticate("local")(req,res,function() {
			// body...
			req.flash("success","Welcome to Youbook "+user.username);
		    res.redirect("/home");
		});
	});
});


//login routes

//show login form
router.get("/login",middleware.isNotLoggedIn,function(req,res) {
	// body...
	res.render("login");
});

//handling login logic
router.post("/login",passport.authenticate("local",
	{
		successRedirect:"/home",
	 	failureRedirect:"/login",
		failureFlash: true
	 }),function(req,res) {

	
});

//logout route
router.get("/logout",function(req,res) {
	req.logout();
	req.flash("success","Logged you out");
	res.redirect("/");
});








module.exports=router;