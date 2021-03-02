const { ObjectID } = require("mongodb");
var mongoose = require("mongoose");

var LikeSchema = new mongoose.Schema({
    likedby:{type:String},
    postid:{type:ObjectID}
});

module.exports = mongoose.model("Likke", LikeSchema);