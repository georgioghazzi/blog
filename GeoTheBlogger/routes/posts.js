var express = require("express");
var router  = express.Router();
var Post = require("../models/posts");



//middleware
var middlewareObj = require('../middleware/index.js');
var isLoggedIn = middlewareObj.isLoggedIn;
var checkPostOwnership = middlewareObj.checkPostOwnership;



//INDEX - show all campgrounds
router.get("/", function(req, res){
    // Get all campgrounds from DB
    Post.find({}, function(err, allPosts){
       if(err){
           console.log(err);
       } else {
          res.render("post/index",{posts:allPosts});
       }
    });
});


//CREATE - add new posts to DB
router.post("/", isLoggedIn, function(req, res){
    // get data from form and add to posts array
    var title = req.body.title;
    var image = req.body.image;
    var text = req.body.text;
    var author = {
        id: req.user._id,
        username: req.user.username
    }
    var newPost = {title: title, image: image, text: text, author:author}
    // Create a new posts and save to DB
    Post.create(newPost, function(err, newlyCreated){
        if(err){
            console.log(err);
        } else {
            //redirect back to posts page
            res.redirect("/posts");
        }
    });
});

//NEW - show form to create new campground
router.get("/new", isLoggedIn, function(req, res){
   res.render("post/new"); 
});


// SHOW - shows more info about one campground
router.get("/:id", function(req, res){
    //find the campground with provided ID
    Post.findById(req.params.id).exec(function(err, foundPost){
        if(err){
            console.log(err);
        } else {
            var loggedInUser = req.user;
            //render show template with that campground
            res.render("post/show", {post: foundPost, user: loggedInUser });
        }
    });
})


//Edit Campground Route

router.get('/:id/edit', checkPostOwnership, function(req, res){
    Post.findById(req.params.id, function(err, post){
        if(err){
            console.log(err);
        }else{
            res.render('post/edit', {post:post});
        }
    });
});


//Update Campground Route
router.put('/:id', checkPostOwnership, function(req, res){
    Post.findByIdAndUpdate(req.params.id, req.body.post, {new: true}, function(err, campground){
        if(err){
            console.log(err);
        }else{
            res.redirect('/posts/'+req.params.id);
        }
    });
});

//Delete Campground
router.delete('/:id', checkPostOwnership, function(req, res){
   Post.findByIdAndRemove(req.params.id, function(err){
       if(err){
           console.log(err);
       }else{
        res.redirect('/posts'); 
       }
   });
});



module.exports = router;