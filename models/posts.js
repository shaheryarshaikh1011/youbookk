var mongoose = require("mongoose");

var campgroundSchema = new mongoose.Schema({
   name: String,

   image: String,
   pphoto: {type: String},
   description: String,
   createdAt:{type:Date,default:Date.now},
   author:{
   	id:{
   		type: mongoose.Schema.Types.ObjectId,
         ref: "User"
   	},
   	username:String
   },
   comments: [
      {
         type: mongoose.Schema.Types.ObjectId,
         ref: "Comment"
      }
   ],
   likedby:[String]
});

module.exports = mongoose.model("Campground", campgroundSchema);