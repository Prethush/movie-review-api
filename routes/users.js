var express = require('express');
var router = express.Router();
var User = require('../models/User');
var auth = require('../middlewares/auth');
var Movie = require('../models/Movie');
var Review = require('../models/Review');
var bcrypt = require('bcrypt');

//handling register request
router.post('/register', async (req, res, next) => {
  let {username, email, passwd} = req.body.user;
  try {
    let user = await User.findOne({username});
    if(user) {
      return res.status(400).json({error: {username: "Username is already taken", email: "", passwd: ""}});
    }
    user = await User.findOne({email});
    if(user) {
      return res.status(400).json({error: {email: "Email is already registered", username: "", passwd: ""}});
    }
    user = await User.create(req.body.user);
    let token = await user.signToken();
    res.status(200).json({user: user.userJSON(token)});
  }catch(error) {
    next(error);
  }
});

//handling login request
router.post('/login', async (req, res, next) => {
  console.log(req.body);
  let {email, passwd} = req.body.user;
  if(!email || !passwd) {
    return res.status(400).json({error: { email: "", passwd: ""}});
  }
  try {
    let user = await User.findOne({email});
    if(!user) {
      return res.status(400).json({error: {email: "Email is not registered", passwd: ""}});
    }
    let result = await user.verifyPasswd(passwd);
    if(!result) {
      return res.status(400).json({error: {passwd: "Password is incorrect", email: ""}});
    }
    let token = await user.signToken();
    res.status(200).json({user: user.userJSON(token)});
  } catch(error) {
    next(error);
  }
});

//get current user
router.get('/', auth.verifyToken, async (req, res, next) => {
  let id = req.user.userId;
  try {
    let user = await User.findById(id);
    if(!user) {
     return res.status(400).json({error: {body: ["Invalid user id"]}});
    }
    res.status(200).json({user: user.displayUser()})
  }catch(error) {
    next(error);
  }
});

//get profile of the user
router.get('/profile/:username', async (req, res, next) => {
  let {username} = req.params;
  try {
    let user = await User.findOne({username});
    if(!user) {
      return res.status(400).json({errors: {body: ["Invalid username"]}});
    }
    res.status(200).json({user: user.displayUser()});
  } catch(error) {
    next(error);
  }
});

// get all movies reviewed by a specific user
router.get('/:username/movies', async (req, res, next) => {
  let {username} = req.params;
  try {
    let userReviews = await Review.find({"author.authorname": username});
    if(userReviews.length === 0) {
      return res.status(200).json({msg: "User did not review any movies"});
    }
    res.status(200).json({userReviews});
  }catch(error) {
    next(error);
  }
});

//update user details
router.put('/:username', auth.verifyToken, async (req, res, next) => {
  let {username} = req.params;
  try {
    let user = await User.findOne({username});
    if(!user) {
      return res.status(400).json({error: {body: ["Username is incorrect"]}});
    }
    if(req.body.user.passwd !== user.passwd) {
      req.body.user.passwd = await bcrypt.hash(req.body.user.passwd, 10);  
    }
    user = await User.findOneAndUpdate({username}, req.body.user, {new: true});
    res.status(200).json({user: user.displayUser()});
  }catch(error) {
    next(error);
  }
})

module.exports = router;
