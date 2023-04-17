const {Router} = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const {UserModel} = require('../models/user.model');
const {BlacklistModel} = require('../models/blacklist.model');

const userRouter = Router();

//Register
userRouter.post('/register', async (req,res) => {
    let {name, email, password, role} = req.body;
    // if(!role){
    //     role = "User";
    // }
    try {
        const user = await UserModel.findOne({email});
        if(user){
            return res.status(400).send({msg: "User already registered. Kindly Login."});
        }
        bcrypt.hash(password, 5, async (err, hash) => {
            const payload = {name, email, password: hash, role};
            const user = new UserModel(payload);
            await user.save();
            res.status(200).send({msg: "Registration Successful"});
        });
    } catch (err) {
        res.status(400).send({msg: err.message});
    }
});

//Login
userRouter.post('/login', async (req,res) => {
    const {email, password} = req.body;
    try {
        const user = await UserModel.findOne({email});
        if(!user){
            return res.status(400).send({msg: "No user found. Register first"});
        }
        bcrypt.compare(password, user.password, (err, result) => {
            if(result){
                const accessToken = jwt.sign({ userID: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1m' });
                const refreshToken = jwt.sign({ userID: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '3m' });

                res.cookie('access_token', accessToken, {
                    maxAge: 1000*60,
                    httpOnly: true,
                    secure: false
                });
                res.cookie('refresh_token', refreshToken, {
                    maxAge: 1000*60*3,
                    httpOnly: true,
                    secure: false
                });
                res.status(200).send({
                    msg: "Login Successful",
                    token: accessToken
                });
            } else {
                console.log(err);
                res.status(400).send({msg: "Wrong credentials."});
            }
        });
    } catch (err) {
        res.status(400).send({msg: err.message});
    }
});

//Logout
userRouter.get('/logout', async (req,res) => {
    const accessToken = res.cookie.access_token || req.headers?.authorization.split(" ")[1];
    const refreshToken = res.cookie.refresh_token || req.headers?.authorization.split(" ")[1];
    try {
        const blacklistAccessToken = new BlacklistModel({token: accessToken});
        const blacklistRefreshToken = new BlacklistModel({token: refreshToken});
        await blacklistAccessToken.save();
        await blacklistRefreshToken.save();
        res.status(200).send({msg: "Logged out"});
    } catch (err) {
        res.status(400).send({msg: err.message});
    }
});

//RefreshToken







module.exports = userRouter;