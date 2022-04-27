const multer = require('multer');
const storage = multer.memoryStorage();
const multerUploads = multer({ storage }).single('image');
const Datauri = require('datauri/parser');
const dUri = new Datauri();
const path = require('path');

const dataUri = req => dUri.format(path.extname(req.file.originalname).toString(), req.file.buffer);


module.exports = { multerUploads, dataUri };