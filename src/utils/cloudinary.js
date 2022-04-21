const cloudinary = require ("cloudinary");
const dotenv = require("dotenv");
dotenv.config();
cloudinary.config({
cloud_name: process.env.CLOUDINARY_NAME,
api_key: process.env.CLOUDINARY_API,
api_secret: process.env.CLOUDINARY_SECRET
});
const cloudUpload = cloudinary.v2;
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
module.exports = {cloud, cloudUpload};