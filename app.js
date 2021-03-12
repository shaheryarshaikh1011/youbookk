//Requiring packages
var express = require("express");
var multer  = require("multer")
var app= express();
var bodyParser=require("body-parser");
var mongoose=require("mongoose");
var flash=require("connect-flash");
var passport=require("passport");
var LocalStrategy=require("passport-local");
var methodOverride=require("method-override");

//requiring Middleware
var middleware=require("./middleware");

//setting up multer destination
var upload = multer({dest: 'public/img/users'})

//requiring models
var Posts=require("./models/posts");
var Comment =require("./models/comment");

var User    =require("./models/user");

//Requiring routes
var commentRoutes =require("./routes/comments");
var postRoutes=require("./routes/home");
var indexRoutes=require("./routes/index");

//seting up env file
require('dotenv').config();


//Setting up static folder
app.use(express.static(__dirname + "/public"))
//setting up method override module and flash module
app.use(methodOverride("_method"));
app.use(flash());

//MongoDb configuration
mongoose.set('useNewUrlParser', true);
mongoose.set('useUnifiedTopology', true);
mongoose.connect(process.env.CloudDB,function(err) {
	if(err)
	{
		//if connection fails
		console.log(err);
	}
	else
	{
		console.log("we are connected to Database "+process.env.CloudDB);
	}
});

//setting up bodyparser
app.use(bodyParser.urlencoded({extended:true}));

//setting up view engine
app.set("view engine","ejs");



//passport configuration
app.use(require("express-session")({
	secret:process.env.SESSION_KEY,
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




//using routes
app.use(indexRoutes);
app.use(postRoutes);
app.use(commentRoutes);



//socket connections
const path = require('path');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers
} = require('./utils/users');
const http = require('http').createServer(app);
const io =require('socket.io')(http);

//route when user clicks on Enter chatroom button on navbar
app.get('/joinChat',middleware.isLoggedIn,function (req, res) {
	res.sendFile(__dirname + '/public/room.html');
  });
  
  
  //botname
  const botName = 'Youbook Bot';

 


// Run when client connects
io.on('connection', socket => {
  socket.on('joinRoom', ({ username, room }) => {
    const user = userJoin(socket.id, username, room);
    console.log(user);

    
    
    socket.join(user.room.toLowerCase());

    // Welcome current user
    socket.emit('message', formatMessage(botName, 'Welcome to YouBook Chatrooms!'));

    // Broadcast when a user connects
    socket.broadcast
      .to(user.room.toLowerCase())
      .emit(
        'message',
        formatMessage(botName, `${user.username} has joined the chat`)
      );

    // Send users and room info
    io.to(user.room.toLowerCase()).emit('roomUsers', {
      room: user.room.toLowerCase(),
      users: getRoomUsers(user.room.toLowerCase())
    });
  });

  // Listen for chatMessage
  socket.on('chatMessage', msg => {
    const user = getCurrentUser(socket.id);

    io.to(user.room.toLowerCase()).emit('message', formatMessage(user.username, msg));
  });

  // Runs when client disconnects
  socket.on('disconnect', () => {
    const user = userLeave(socket.id);

    if (user) {
      io.to(user.room.toLowerCase()).emit(
        'message',
        formatMessage(botName, `${user.username} has left the chat`)
      );

      // Send users and room info
      io.to(user.room.toLowerCase()).emit('roomUsers', {
        room: user.room.toLowerCase(),
        users: getRoomUsers(user.room)
      });
    }
  });
});

app.get('/api/user_data', function(req, res) {

  if (req.user === undefined) {
      // The user is not logged in
      res.json({});
  } else {
      res.json({
          userr: req.user
      });
  }
});



//server listener
http.listen(process.env.PORT || 3000, function() {
	var host = http.address().address
	var port = http.address().port
	console.log('YouBook WebApp listening at http://%s:%s', host, port)
  });