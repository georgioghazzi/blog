var express = require("express");
var router  = express.Router();
var passport = require("passport");
var User = require("../models/user");
var async = require('async');
var crypto = require('crypto');
var nodemailer = require('nodemailer');
var xoauth2 = require('xoauth2');
var middlewareObj = require('../middleware/index.js');
var usernameToLowerCase= middlewareObj.usernameToLowerCase;
var upload= require("express-fileupload")


    
var isVerified = middlewareObj.isVerified;
var smtpTrans = nodemailer.createTransport({
         host: 'mail.geotheblogger.com',
         port:465,
         secure:true,
         rejectUnauthorized: false, 
          tls: {rejectUnauthorized: false},
        debug:true,
         ssl: {rejectUnauthorized: false},
        debug:true,
         auth: {

              user: 'noreply@geotheblogger.com',
                 pass: '2392129040'
       
}
       },);
    


//root route
router.get("/", function(req, res){
    res.render("landing");
});

//About route
router.get("/about",function(req,res){
  res.render("about")
})


//Contact route
router.get("/contact",function(req,res){
  res.render("contact")
})


// show register form
router.get("/register", function(req, res){
   res.render("register"); 
});


//handle sign up logic
router.post("/register", usernameToLowerCase ,function(req, res){
    var newUser = new User({username: req.body.username ,email:req.body.email});
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            console.log(err.message);
            req.flash("error",err.message)
            return res.redirect("/register");
        }
        
         async.waterfall([
    function(done) {
      crypto.randomBytes(20, function(err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function(token, done) {
      User.findOne({ email: req.body.email }, function(err, user) {
        if (!user) {
          req.flash('error', 'No account with that email address exists.');
          return res.redirect('/');
        }

        user.verifyAccountToken = token;
        user.verifyAccountExpires = Date.now() + 3600000; // 1 hour

        user.save(function(err) {
          done(err, token, user);
        });
      });
    },
    function(token, user, done) {
      let mailOptions={
         
        to: user.email,
        from: 'noreply@geotheblogger.com',
        subject: 'GeoTheBlogger Confirmation Email',
        text: 'You are receiving this because you (or someone else) have created a user on www.geotheblogger.com.\n\n' +
          'Please click on the following link, or paste this into your browser to activate your account:\n\n' +
          'http://' + req.headers.host + '/verify/'+token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'

      };
      smtpTrans.sendMail(mailOptions, function(err) {
        console.log('mail sent');
        req.flash('success', 'A Confimration e-mail has been sent to ' + user.email + ' with further instructions.');
        done(err, 'done');
      });
    }
  ], function(err) {
    if (err) return next(err);
    res.redirect('/');
  });
        
                         
         
    });
});

//Verify Account
router.get('/verify/:token', function(req, res) {
 
    res.render('verify', {token: req.params.token});
  });




router.post('/verify/:token', function(req, res) {
  async.waterfall([
    function(done) {
      User.findOne({ verifyAccountToken: req.params.token, verifyAccountExpires: { $gt: Date.now() } }, function(err, user) {
        if (!user) {
          req.flash('error', 'Password reset token is invalid or has expired.');
          return res.redirect('back');
        }
       
            user.verified = true
            user.verifyAccountToken = undefined;
            user.verifyAccountExpires = undefined;

            user.save(function(err) {
              req.logIn(user, function(err) {
                done(err, user);
              });
            });
          })
       
      
    },
    function(user, done) {
 
      let mailOptions = {

        to: user.email,
        from: 'noreply@geotheblogger.com',
        subject: 'GeoTheBlogger Confimration Done',
        text: 'done'

      };
      smtpTrans.sendMail(mailOptions, function(err) {
        req.flash('success', 'Success! Your account is activated');
        done(err);
      });
    }
  ], function(err) {
    res.redirect('/');
  });
});



//show login form
router.get("/login", function(req, res){
   res.render("login"); 
});


//handling login logic
router.post("/login", usernameToLowerCase ,isVerified, passport.authenticate("local",
    {
      


        successRedirect: "/posts",
        failureRedirect: "/",
        successFlash : ("success","Welcome Back!"),
        failureFlash: ("error","Wrong Username and/or password!")
    }), function(req, res){
});


//Forgot route
router.get('/forgot', function(req, res) {
  res.render('forgot');
});

router.post('/forgot', function(req, res, next) {
  async.waterfall([
    function(done) {
      crypto.randomBytes(20, function(err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function(token, done) {
      User.findOne({ email: req.body.email }, function(err, user) {
        if (!user) {
          req.flash('error', 'No account with that email address exists.');
          return res.redirect('/forgot');
        }

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        user.save(function(err) {
          done(err, token, user);
        });
      });
    },
    function(token, user, done) {
      let mailOptions = {

        to: user.email,
        from: 'noreply@geotheblogger.com',
        subject: 'Node.js Password Reset',
        text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'http://' + req.headers.host + '/reset/' + token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'

      };
      smtpTrans.sendMail(mailOptions, function(err) {
        console.log('mail sent');
        req.flash('success', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
        done(err, 'done');
      });
    }
  ], function(err) {
    if (err) return next(err);
    res.redirect('/forgot');
  });
});

router.get('/reset/:token', function(req, res) {
  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
    if (!user) {
      req.flash('error', 'Password reset token is invalid or has expired.');
      return res.redirect('/forgot');
    }
    res.render('reset', {token: req.params.token});
  });
});

router.post('/reset/:token', function(req, res) {
  async.waterfall([
    function(done) {
      User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        if (!user) {
          req.flash('error', 'Password reset token is invalid or has expired.');
          return res.redirect('back');
        }
       
          user.setPassword(req.body.password, function(err) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;

            user.save(function(err) {
              req.logIn(user, function(err) {
                done(err, user);
              });
            });
          })
       
      });
    },
    function(user, done) {
     var smtpTrans = nodemailer.createTransport({
         host: 'mail.geotheblogger.com',
         port:465,
         secure:true,
         rejectUnauthorized: false, 
          tls: {rejectUnauthorized: false},
        debug:true,
         ssl: {rejectUnauthorized: false},
        debug:true,
         auth: {

              user: 'noreply@geotheblogger.com',
                 pass: '2392129040'
       
}
       },);
      let mailOptions = {

        to: user.email,
        from: 'noreply@geotheblogger.com',
        subject: 'Node.js Password Reset Done',
        text: 'done'

      };
      smtpTrans.sendMail(mailOptions, function(err) {
        req.flash('success', 'Success! Your password has been changed.');
        done(err);
      });
    }
  ], function(err) {
    res.redirect('/posts');
  });
});


//Edit Route
router.get("/edit",function(req,res){
  res.render("edit")
})
router.post("/edit",function(req,res){
  
  
    console.log(req.files)
    res.redirect("/")
})
// logout route
router.get("/logout", function(req, res){
   req.logout();
   req.flash("success", "See you later!");
   res.redirect("/");
});



module.exports = router;