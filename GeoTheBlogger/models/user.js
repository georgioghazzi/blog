var mongoose                = require("mongoose");
var passportLocalMongoose   = require('passport-local-mongoose');

var UserSchema = mongoose.Schema({
    username: { 
    	type: String,
        required: true,
        unique: true,
},
    password: { 
    	type: String,
       
},
    name:String,
    work:String,
    description:String,
    img:String,
    email:{ 
    	type: String,
        required: true,
        unique: true,
},
 verified: {
        type: Boolean,
        default: false,
    },
    resetPasswordToken:String,
    resetPasswordExpires:Date,
    verifyAccountToken:String,
    verifyAccountExpires:Date
});

UserSchema.plugin(passportLocalMongoose);

var User = mongoose.model("User", UserSchema);

module.exports = User;