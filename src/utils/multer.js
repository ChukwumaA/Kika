const multer = require ('multer');
const storage = multer.diskStorage({
destination(req, file, callback) {
callback(null, 'uploads/');
},
filename(req, file, callback) {
callback(null, new Date().toISOString().replace(/:/g, '-')
+ file.originalname);
},
});

const fileFilter = async (req, file, callback) => {
    if (file.mimetype === 'image/jpeg'
    || file.mimetype === 'image/jpg'
    || file.mimetype === 'image/png') {
    callback(null, true);
    } else {
    return callback(
    { message: 'This image format is not allowed' },
    false
    );
    }
    return true;
    };

    const Upload = multer({
        storage,
        limits: {
        fileSize: 1024 * 1024 * 5,
        },
        fileFilter,
        });
module.exports =  Upload;

//https://medium.com/@dharmykoya38/image-upload-in-nodejs-using-multer-and-cloudinary-version-2-17924c22fce7