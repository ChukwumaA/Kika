const multer = require("multer");
const path = require("path"); 
// Multer config
// module.exports = multer({
//   storage: multer.diskStorage({}),
//   fileFilter: (req, file, cb) => {
//     let ext = path.extname(file.originalname);
//       if (ext !== ".jpg" && ext !== ".jpeg" && ext !== ".png") {
//       cb(new Error("File type is not supported"), false);
//       return;
//     }
//     cb(null, true);
//   },
// });

// import multer from ‘multer’;
// const storage = multer.memoryStorage();
// const multerUploads = multer({ storage }).single(‘image’);
// export { multerUploads };

//import multer from "multer";
const storage = multer.memoryStorage();
const multerUploads = multer({ storage }).single("image");
module.exports = multerUploads