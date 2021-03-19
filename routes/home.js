//requiring express and multer
var express=require("express");
var router= express.Router();
var multer=require("multer");

//requiring posts model from mongodb
var Posts=require("../models/posts");

//requiring middleware file
var middleware=require("../middleware");


//multer configuration
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


//get all the posts
router.get("/home",middleware.isLoggedIn,function(req,res) {
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


//make a content post request
router.post("/home",uploadUserPhoto,middleware.isLoggedIn,function(req,res) {
	//retrieve data from the ejs form
	var name=req.body.name;
	var desc=req.body.description;
	var author={
		id:req.user._id,
		username:req.user.username
	};
	var pphoto='http://localhost:3000/img/users/'+req.file.filename;

	
	var newCampground={name:name,description:desc,author:author,pphoto:pphoto};

	//create a new document
	Posts.create(newCampground,function(err,newlyCreated) {
		if(err)
		{
			console.log(err);
		}
		else
		{	
			res.redirect("/home");
		}
	})
	

})


//get new post form
router.get("/home/new",middleware.isLoggedIn,function (req,res) {

	res.render("posts/new.ejs");
})



//get the post by ID
router.get("/home/:id",function(req,res) {
	//find the post details from post models and populate it with comments
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
});

//edit post by ID
router.get("/home/:id/edit",middleware.checkPostOwnership,function(req,res) {
		//find the post and fill the edit form with post details
		Posts.findById(req.params.id,function(err,foundCampground) {
		
				res.render("posts/edit",{campground:foundCampground});
			
			});
});

//update  post route
router.put("/home/:id/edit",middleware.checkPostOwnership,function(req,res) {
	//find and update
	Posts.findByIdAndUpdate(req.params.id,req.body.campground,function(err,updatedCampground) {
		if(err)
		{
				res.redirect("/home")
		}
		else
		{
			res.redirect("/home/"+req.params.id);
		}
	})
});


//delete the post
router.delete("/home/:id",middleware.checkPostOwnership,function(req,res) {
	//find and remove the post from mongodb
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



//like request for the post 
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