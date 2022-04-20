// const cloudinary = require("cloudinary").v2;
// const { cloud_name, cloud_api_key, cloud_api_secret } = require('../config');
// cloudinary.config({
//     cloud_name,
//     api_key: cloud_api_key,
//     api_secret: cloud_api_secret,
// }); 
// module.exports = cloudinary;

//import cloudinary from "cloudinary’;
const cloudinary = require("cloudinary").v2;
//import dotenv from "dotenv’;
//dotenv.config();
const { cloud_name, cloud_api_key, cloud_api_secret } = require('../config');
cloudinary.config({
    cloud_name,
    api_key: cloud_api_key,
    api_secret: cloud_api_secret,
}); 
const cloudUpload = cloudinary;


const cloud = {
uploadToCloud(req, res, next) {
const { path } = req.file;
cloudUpload.uploader.upload(path,
{
tags: "profilePicture",
width: 150,
height: 150,
crop: "pad",
})
.then((image) => {
req.image = image;
return next();
});
}
};
module.exports = cloudinary;