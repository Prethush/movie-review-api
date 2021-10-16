var express = require('express');
var router = express.Router();
var User = require('../models/User');

/* GET users listing. */
router.get('/', async (req, res, next) {
  try {
    let users = await User.find({});
    res.status(200).json({users: users});
  }catch(error) {
    next(error);
  }
});

//handling register request
router.post('/register', async (req, res, next) => {
  try {
    let user = await User.create(req.body.user);
    let token = await user.signToken();
    console.log(token);
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
    return res.status(400).json({error: {body: "Email/Password required"}});
  }
  try {
    let user = await User.findOne({email});
    if(!user) {
      return res.status(400).json({error: {body: "Email is not registered"}});
    }
    let result = await user.verifyPasswd(passwd);
    if(!result) {
      return res.status(400).json({error: {body: "Password is incorrect"}});
    }
    let token = await user.signToken();
    res.status(200).json({user: user.userJSON(token)});
  } catch(error) {
    next(error);
  }
});



module.exports = router;
