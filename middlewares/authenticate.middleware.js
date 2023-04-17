const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();

const authenticate = async (req, res, next) => {
    const accessToken = res.cookie.access_token || req.headers?.authorization.split(" ")[1];
    const refreshToken = res.cookie.refresh_token;
    try {
        const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
        if(decoded){
            req.body.userID = decoded.userID;
            req.role = decoded.role;
            next();
        } else {
            res.status(400).send({msg: "Login first"});
        }
    } catch (err) {
        res.status(400).send({msg: err.message});
    }
}

module.exports = { authenticate };