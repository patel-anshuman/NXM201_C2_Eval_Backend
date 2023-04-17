const express = require('express');
const {connection} = require('../database/db');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const userRoute = require('../routes/user.route');
const blogRoute = require('../routes/blog.route');

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use('/users',userRoute);
app.use('/blogs',blogRoute);

app.listen( process.env.PORT, async () => {
    try {
        await connection;
        console.log("Connected to Mongo DB Atlas");
    } catch (err) {
        console.log("Couldn't connect to Mongo atlas");
        console.log(err.message);
    }
    console.log(`Server is running at port ${process.env.PORT}`);
})

module.exports = app;