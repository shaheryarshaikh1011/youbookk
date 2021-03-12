//requiring express 
var express=require("express");
var router= express.Router();

//requiring posts and comment model from mongodb
var Posts=require("../models/posts");
var Comment =require("../models/comment");

//requiring middleware file
var middleware=require("../middleware");


//new comments form
router.get("/home/:id/comments/new",middleware.isLoggedIn,function(req,res) {
	//find the post by id
	
	Posts.findById(req.params.id,function(err,posts) {
		
		if(err)
		{
			console.log(err);
		}
		else
		{
			res.render("comments/new",{campground:posts});
		}
	})
	
});


//comments create
router.post("/home/:id/comments",middleware.isLoggedIn,function(req,res) {
	//lookup posts using id
	Posts.findById(req.params.id,function(err,campground) {
		if(err)
		{
			console.log(err);
			res.redirect("/home");
		}
		else
		{
			//create new comment
			Comment.create(req.body.comment,function(err,comment) {
				if(err)
				{
					req.flash("error","something went wrong");
					console.log(err);
				}
				else
				{
					//add username and id to comment
					comment.author.id=req.user._id;
					comment.author.username=req.user.username;
					comment.save();
					//save comments
					campground.comments.push(comment);
					campground.save();
					console.log(comment);
					//show page
					req.flash("success","Added comment");
					res.redirect("/home/"+campground._id);
				}
				// body...
			})
		}
		// body...
	})
	
	//connect comment to post
	//redirect to show page

});

//edit route
router.get("/home/:id/comments/:comments_id/edit",middleware.checkCommentOwnership,function(req,res) {
	//find the comment using id
	Comment.findById(req.params.comments_id,function(err,foundComment) {
		if(err)
		{
			res.redirect("back");
		}
		else
		{
			res.render("comments/edit",{campground_id:req.params.id,comment:foundComment});
		}
	})
	
});

//comment update route
router.put("/home/:id/comments/:comments_id/edit",middleware.checkCommentOwnership,function(req,res) {
	//update the comment using comments/edit.js details
	Comment.findByIdAndUpdate(req.params.comments_id,req.body.comment,function(err,updatedComment) {
		if(err)
		{
			res.redirect("back");
		}
		else
		{
			res.redirect("/home/"+req.params.id);
		}
	})
})

//commment destroy route
router.delete("/home/:id/comments/:comments_id",middleware.checkCommentOwnership,function(req,res) {
	//find and delete the comment using ID
	Comment.findByIdAndRemove(req.params.comments_id,function(err) {
		if(err)
		{
			res.redirect("back");
		}
		else
		{
			req.flash("success","Comment deleted");
			res.redirect("/home/"+req.params.id);
		}
	
	})
})



module.exports=router;