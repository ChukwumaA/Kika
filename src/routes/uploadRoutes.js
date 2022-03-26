//Dependencies
const express = require('express');
const multer = require('multer');
import { v2 as cloudinary } from 'cloudinary';
const streamifier = require('streamifier')
const auth = require('../middleware/auth')
const {isAdmin} = require('../middleware/auth')

const upload = multer();

const uploadRouter