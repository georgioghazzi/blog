var mongoose = require("mongoose");

var postSchema = new mongoose.Schema({
   title: String,
   image: String,
   text: String,
       author:{
         id:{
            type: mongoose.Schema.Types.ObjectId,
            ref:"user"
         },
         username:String
         
      },
      
   comments: [
      {
         type: mongoose.Schema.Types.ObjectId,
         ref: "Comment"
      }]
  
   
});

module.exports = mongoose.model("post", postSchema);