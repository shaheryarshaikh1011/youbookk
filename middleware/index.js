//all middleware
var Campground=require("../models/posts");
var Comment =require("../models/comment");
var Like    =require("../models/likke");
const e = require("express");
var middlewareObj={}

middlewareObj.checkCampgroundOwnership = function(req,res,next) {
	// body...
	if(req.isAuthenticated()){
		Campground.findById(req.params.id,function(err,foundCampground) {
		if(err)
		{
			req.flash("error","campground not found");
			res.redirect("back");
		}
		else
		{
			//does user own it
			if(foundCampground.author.id.equals(req.user._id))
			{
				next();
			}
			else
			{
				req.flash("error","you dnt have permission to do that");
				res.redirect("back")
			}
			
		}
	});
	}
	else
	{
		req.flash("error","you need to be logged in to do that");
		res.redirect("back");
	}
};

middlewareObj.checkCommentOwnership = function(req,res,next) {
	// body...
	if(req.isAuthenticated()){
		Comment.findById(req.params.comments_id,function(err,foundComment) {
		if(err)
		{
			res.redirect("back");
		}
		else
		{
			//does user own it
			if(foundComment.author.id.equals(req.user._id))
			{
				next();
			}
			else
			{
				req.flash("error","no permission to do that");
				res.redirect("back")
			}
			
		}
	});
	}
	else
	{
		req.flash("error","you need to be logged in to do that");
		res.redirect("back");
	}
};
	// body...
middlewareObj.isLoggedIn=function(req,res,next){
	if(req.isAuthenticated()){
		return next();
	}
	req.flash("error","you need to be logged in 1st");
	res.redirect("/login");
};

middlewareObj.hasUserLiked=function(req,res,next)
{
	Like.exists({likedby:req.user.username,postid:req.params.id},function(err,obj)
	{
		if(err)
		{
			console.log("error occured")

		}
		else
		{
			console.log("data from like db",obj);
			if(obj==true)
			{
				console.log("user has liked");
				res.redirect("/home/"+req.params.id);
			}
			else
			{
				console.log("not true hasnt liked")
				return next();
			}
			
		}
	}); 
}

module.exports=middlewareObj;