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
        res.status(400).json({error: {body: ["Token required"]}});
      }
    }catch(error) {
      next(error);
    }
  }
}