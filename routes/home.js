var express=require("express");
var router= express.Router();
var multer=require("multer");
var Posts=require("../models/posts");
var middleware=require("../middleware");
const e = require("express");
const posts = require("../models/posts");
router.use(express.static('public'))
var multerStorage = multer.diskStorage({
	destination: (req,file,cb)=>{
		cb(null, 'public/img/users')
	},
	filename:(req,file,cb)=>{
		//user-id-currenttime.jpeg
		var ext=file.mimetype.split('/')[1];
		cb(null,'user-'+req.user._id+'-'+Date.now()+'.'+ext)
	}
});

var multerFilter =(req,file,cb)=>
{
	if(file.mimetype.startsWith('image'))
	{
		cb(null,true)
	}
	else
	{
		cb("its not image",false)
	}
}

var upload = multer({
	storage: multerStorage,
	fileFilter: multerFilter
});
var uploadUserPhoto=upload.single('photo');

router.get("/home",function(req,res) {
	Posts.find({},function(err,allcampgrounds) {
		if(err)
		{
			console.log(err);
		}
		else
		{
		
		
			res.render("posts/index.ejs",{campgrounds:allcampgrounds,currentUser:req.user});
		}
		// body...
	})
	
	// body...
})

router.post("/home",uploadUserPhoto,middleware.isLoggedIn,function(req,res) {
	console.log(req.file);
	var name=req.body.name;
	var desc=req.body.description;
	var author={
		id:req.user._id,
		username:req.user.username
	};
	var pphoto='http://localhost:3000/img/users/'+req.file.filename;

	
	var newCampground={name:name,description:desc,author:author,pphoto:pphoto};

	Posts.create(newCampground,function(err,newlyCreated) {
		// body...if(err)
		if(err)
		{
			console.log(err);
		}
		else
		{	
			res.redirect("/home");
		}
	})
	
	// body...
})
router.get("/home/new",middleware.isLoggedIn,function (req,res) {
	// body...
	res.render("posts/new.ejs");
})


router.get("/home/:id",function(req,res) {
	//find cg by id
	Posts.findById(req.params.id).populate("comments").exec(function(err,foundCampground) {
		// body...
		if(err)
		{
			console.log(err);		
		}
		else
		{
			
			res.render("posts/show",{campground:foundCampground});
			
		}
	})
	
	// body...
});

//edit cg route
router.get("/home/:id/edit",middleware.checkPostOwnership,function(req,res) {
	//is user logged in at all

		Posts.findById(req.params.id,function(err,foundCampground) {
		
				res.render("posts/edit",{campground:foundCampground});
			
			});
});
//update cg route
router.put("/home/:id/edit",middleware.checkPostOwnership,function(req,res) {
	//find and update

	Posts.findByIdAndUpdate(req.params.id,req.body.campground,function(err,updatedCampground) {
		// body...
		if(err)
		{
				res.redirect("/home")
		}
		else
		{
			res.redirect("/home/"+req.params.id);
		}
	})
	//redir
});

router.delete("/home/:id",middleware.checkPostOwnership,function(req,res) {
	// body...
	Posts.findByIdAndRemove(req.params.id,function(err) {
		if(err)
		{
			res.redirect("/home");
		// body...
		}
		else
		{
			res.redirect("/home");
		}
	})
});


/* router.get("/home/:id/likes",middleware.isLoggedIn,function(req,res) {
	var likedby=req.user.username;
	var postid=req.params.id;
	var newCampLike={likedby:likedby,postid:postid};
	Like.create(newCampLike,function(err,newlyLike) {
		// body...if(err)
		if(err)
		{
			console.log(err);
		}
		else
		{	
			console.log(newlyLike);
			res.redirect("/home/"+req.params.id);
		}
	}) */

	

	  
	  

	/* Campground.findByIdAndUpdate(req.params.id,{$inc:{ likes: 1 }} ).populate("comments").exec(function(err,foundCampground) {
		// body...
		if(err)
		{
			console.log(err);
			res.redirect("/home/"+req.params.id);
		}
		else
		{
		var likedby=req.user.username;
		var id=req.params.id;
		var newLike={likedby:likedby,postid:id};
		console.log("route wala array",newLike);
		Like.create(newLike,function(err,newlyAddedLike) 
			{
				console.log(newlyAddedLike);
			});
		console.log(foundCampground.likes);
		res.redirect("/home/"+req.params.id);
		}
	}) */

/* }) */

router.get("/home/:id/likes",middleware.isLoggedIn,function(req,res) 
{
	//find the post by id
		Posts.findById(req.params.id, function (err, doc){
		if(err)
		{
			console.log(err);
		}
		else{
		// take username of the user who liked the post
		var us=req.user.username;
		// append the username to the error and save
		doc.likedby.addToSet(us);
		doc.save() 
		console.log(doc.likedby);
		res.redirect("/home/"+req.params.id);
		}
	});
	

});





module.exports=router;