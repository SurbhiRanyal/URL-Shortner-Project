const mongoose = require("mongoose")
//const shortId = require('shortid')


const urlSchema = new mongoose.Schema({
    urlCode :{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true
        },
        longUrl:{
            type:String,
            required:true,
         },
         shortUrl:{
             type:String,
             required:true,
             unique:true,
            //  default: shortId.generate
         }, 
}, { timestamps: true });


module.exports = mongoose.model('url', urlSchema)