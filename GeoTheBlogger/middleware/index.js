var         Post      = require('../models/posts'),
            middlewareObj = {},
            User      = require ('../models/user');
middlewareObj.isLoggedIn = function (req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    
    req.flash("error","Please Login First!")
    res.redirect("/login");
}


middlewareObj.isVerified = function (req,res,next){
    User.findOne({ username: req.body.username }, function(err, user){        
    if(!user.verified){
        
        req.flash("error","Account Not Verified");
        res.redirect("/")
    }else{
        return next();
    }   
    })
}

 middlewareObj.usernameToLowerCase = function (req, res, next){
            req.body.username = req.body.username.toLowerCase();
            next();
        }
middlewareObj.checkPostOwnership = function (req, res, next){
    if(req.isAuthenticated()){
        Post.findById(req.params.id, function(err, post){
            if(err){
                req.flash("error","Post not found!")
              res.redirect("back");
            }else{
              if(post.author.id.equals(req.user._id)){
                   next();
                }else{
                    req.flash("error","You don't have persmission to do that!")
                   res.redirect("back");
                }
            }   
        });
    }else{
        req.flash("error","You need to be logged in to do that!")
        res.redirect("back");
    }
}


module.exports = middlewareObj;