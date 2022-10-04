const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Users = mongoose.model('Users')
module.exports = (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) {
    return res.status(401).send({ error: "unauthorized" })
  }
  const token = authorization.replace("Bearer ", "");
  jwt.verify(token, process.env.secret_Key, async (err, payload) => {
    if (err) {
      return res.status(401).send({ error: "unathorized" })
    }
    const { userId } = payload;
    const user = await Users.findById(userId)
    req.user = user;
    next();
  })
}  
