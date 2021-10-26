let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let bcrypt = require('bcrypt');
let jwt = require('jsonwebtoken');
require("dotenv").config();

// Defining the structure of user
let userSchema = new Schema({
  username: {type: String, required: true, unique: true},
  email: {type: String, required: true, unique: true},
  passwd: {type: String, required: true},
  watchList: [{type: Schema.Types.ObjectId, ref: "Movie"}],
  bio: String
},{timestamps: true});

//hasing the password
userSchema.pre('save', async function(next) {
  if(this.passwd && this.isModified("passwd")) {
   try {
    this.passwd = await bcrypt.hash(this.passwd, 10);
   }catch(error){
     next(error);
   }
  }
  next();
});

//verifying the passwd during login request
userSchema.methods.verifyPasswd = async function(passwd) {
  try {
    let result = await bcrypt.compare(passwd, this.passwd);
    return result;
  }catch(error) {
    return error;
  }
}

//generating a token
userSchema.methods.signToken = async function() {
  let payload = {username: this.username, userId: this.id, email: this.email};
  try{
    let token = await jwt.sign(payload, process.env.SECRET);
    return token;
  }catch(error) {
    return error;
  }
}

//defining the structure of the user details to display
userSchema.methods.userJSON = function(token){
  return {
    username: this.username,
    email: this.email,
    bio: this.bio,
    token: token,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  }
}

userSchema.methods.displayUser = function() {
  return {
    username: this.username,
    email: this.email,
    bio: this.bio,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  }
}
let User = mongoose.model("User", userSchema);
module.exports = User;
