const {Router} = require('express');

const {BlogModel} = require('../models/blog.model');
const { authenticate } = require('../middlewares/authenticate.middleware');
const { authorise } = require('../middlewares/authorise.middleware');

const blogRouter = Router();


//Create a blog
blogRouter.post('/create',authenticate, async (req,res) => {
    const {title, body, userID} = req.body;
    try {
        const payload = {title, body, userID};
        const blog = new BlogModel(payload);
        await blog.save();
        res.status(200).send({msg: "New blog added"});
    } catch (err) {
        res.status(400).send({msg: err.message});
    }
});

//Read all blogs
blogRouter.get('/read',authenticate, async (req,res) => {
    try {
        const blogs = await BlogModel.aggregate([{$project: {title: 1, body: 1 }}]);
        res.status(200).send(blogs);
    } catch (err) {
        res.status(400).send({msg: err.message});
    }
});

//Update a blog
blogRouter.patch('/update/:id',authenticate, authorise(["User","Moderator"]), async (req,res) => {
    const payload = req.body;
    const blogId = req.params.id;
    try {
        const blog = await BlogModel.findOne({_id: blogId});
        if(!blog){
            return res.status(400).send({msg: "No such blogs"});
        }
        if(req.body.userID==blog.userID || req.role=="Moderator"){
            await BlogModel.findByIdAndUpdate(blogId,payload);
            res.status(200).send({msg: "Blog post updated"});
        } else {
            res.status(400).send({msg: "User can update only their blogs"});
        }
        
    } catch (err) {
        res.status(400).send({msg: err.message});
    }
});

//Delete a blog
blogRouter.delete('/delete/:id',authenticate, authorise(["User","Moderator"]), async (req,res) => {
    const blogId = req.params.id;
    try {
        const blog = await BlogModel.findOne({_id: blogId});
        if(!blog){
            return res.status(400).send({msg: "No such blogs"});
        }
        if(req.body.userID==blog.userID || req.role=="Moderator"){
            await BlogModel.findByIdAndDelete(blogId);
            res.status(200).send({msg: "Blog post deleted"});
        } else {
            res.status(400).send({msg: "User can delete only own blogs"});
        }
        
    } catch (err) {
        res.status(400).send({msg: err.message});
    }
});

module.exports = blogRouter;