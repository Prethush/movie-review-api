let jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = {
  // verifying the token during incoming request
  verifyToken: async (req, res, next) => {
    let token = req.headers.authorization;
    try{
      if(token) {
        let payload = await jwt.verify(token, process.env.SECRET);
        req.user = payload;
        next();
      }else {
        return res.status(400).json({error: {body: ["Token required"]}});
      }
    }catch(error) {
      console.log(error, "error");
      next(error);
    }
  },

  authOptional: async (req, res, next) => {
    let token = req.headers.authorization === 'undefined' ? null : req.headers.authorization;
    try{
      if(token) {
        let payload = await jwt.verify(token, process.env.SECRET);
        req.user = payload;
        next();
      }else {
        next();
      }
    }catch(error) {
      console.log(error, "error");
      next(error);
    }
  }
}