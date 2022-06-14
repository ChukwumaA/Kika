const ErrorResponse = require('utils/errorResponse');
const asyncHandler = require('middleware/async');
const sendTokenResponse = require('utils/sendTokenResponse');
const { cloudinary } = require('middleware/cloudinary');
const { dataUri } = require('utils/multer');
const {transporter} = require('utils/nodemail')

const User = require('models/User');
const Vendor = require('models/Vendor');

// @desc      Auth Detais
// @route     POST /api/v1/auth/
// @access    Public
exports.auth = asyncHandler(async (req, res) => {
  const { email, phone, business_name } = req.body;
  const existingEmail = (await User.findOne({ email })) || (await Vendor.findOne({ email }));
  const existingPhone = await Vendor.findOne({ phone });
  const existingBusiness_name = await Vendor.findOne({ business_name });
  const errorResponse = (key) => res.status(200).send({
    message:`${key === 'business_name'? "Business Name": key} already exists`, 
    key})
 
  if (existingEmail) {
   return errorResponse('email')
  }else if(existingPhone){
    return errorResponse('phone')
  }else if(existingBusiness_name){
    return errorResponse('business_name')
  }else{
    let mailOptions = {
      from: 'kikathriftstore@gmail.com',
      to: `${email}`,
      subject: 'Hi Chuma!',
      text: 'Still cleaning up..'
      };
      
      transporter.sendMail(mailOptions, function(err, data) {
          if (err) {
            console.log("Error " + err);
          } else {
            console.log("Email sent successfully");
          }
        });
    res.status(200).send({success: true})
  }

});

// @desc      Register user
// @route     POST /api/v1/auth/register
// @access    Public
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email } = req.body;
  
  let user_name = name.split(" ")[0];
  let mailOptions = {
    from: 'kikathriftstore@gmail.com',
    to: `${email}`,
    subject: 'Welcome to Kika!',
    text: `Hey ${user_name}!

    Welcome to kika, we are glad to have you onboard!

    Best regards,
    The Kika Team.
    ` 
    };

  // Create user
  const user = await User.create({
    ...req.body,
  });

  // Send mail.
  transporter.sendMail(mailOptions, function(err, data) {
    if (err) {
      console.log("Error " + err);
    } else {
      console.log("Email sent successfully");
    }
  });
  sendTokenResponse(user, 200, res);
});

// @desc      Register vendor
// @route     POST /api/v1/auth/register/vendor
// @access    Public
exports.registerVendor = asyncHandler(async (req, res, next) => {
  const { email, name } = req.body;

  const existingUser = await User.findOne({ email });

  // console.log(`User ${existingUser}`);

  if (existingUser) {
    return next(new ErrorResponse('Already existing user', 401));
  }

  if (!req.file) {
    return next(new ErrorResponse(`No file found`, 404));
  }

  const file = dataUri(req).content;
  const result = await cloudinary.uploader.upload(file, { folder: 'ID_CARDS' });
 
  let user_name = name.split(" ")[0];
  let mailOptions = {
    from: 'kikathriftstore@gmail.com',
    to: `${email}`,
    subject: 'Welcome to Kika!',
    text: `Hey ${user_name}!

    Welcome to kika, we are glad to have you onboard!

    Best regards,
    The Kika Team.
    ` 
    };
    
  
  // Create vendor
  const vendor = await Vendor.create({
    ...req.body,
    id_card: result.secure_url,
    cloudinary_id: result.public_id,
  });

  // Send mail.
  transporter.sendMail(mailOptions, function(err, data) {
    if (err) {
      console.log("Error " + err);
    } else {
      console.log("Email sent successfully");
    }
  });

  sendTokenResponse(vendor, 200, res);
});

// @desc      Login user
// @route     POST /api/v1/auth/login
// @access    Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate email & password
  if (!email || !password) {
    return next(new ErrorResponse('Please provide email and password', 400));
  }

  // Check for user in user or vendor db
  const user =
    (await User.findOne({ email }).select('+password')) ||
    (await Vendor.findOne({ email }).select('+password'));

  if (!user) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  sendTokenResponse(user, 200, res);
});

// @desc      Get current logged in user
// @route     GET /api/v1/auth/profile
// @access    Private
exports.getProfile = asyncHandler(async (req, res, next) => {
  // const user = await User.findById(req.user.id); // no need to do this since logged in user is attached to the req object

  res.status(200).json({
    success: true,
    data: req.user,
  });
});

// @desc      Update user details
// @route     PUT /api/v1/auth/updatedetails
// @access    Private
exports.updateDetails = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    ...req.body,
  };

  let user;

  if (req.user.role === 'user') {
    user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true,
    });
  } else if (req.user.role === 'vendor') {
    user = await Vendor.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true,
    });
  }

  if (!user) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  res.status(200).json({
    success: true,
    message: 'Details updated!',
    data: user,
  });
});

// @desc      Update password
// @route     PUT /api/v1/auth/updatepassword
// @access    Private
exports.updatePassword = asyncHandler(async (req, res, next) => {
  let user;

  if (req.user.role === 'user') {
    user = await User.findById(req.user.id).select('+password');
  } else if (req.user.role === 'vendor') {
    user = await Vendor.findById(req.user.id).select('+password');
  }

  // Check current password
  if (!(await user.matchPassword(req.body.currentPassword))) {
    return next(new ErrorResponse('Password is incorrect', 401));
  }

  user.password = req.body.newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// @desc      Forgot password
// @route     POST /api/v1/auth/forgotpassword
// @access    Public
// exports.forgotPassword = asyncHandler(async (req, res, next) => {
//   const user = await User.findOne({ email: req.body.email });

//   if (!user) {
//     return next(new ErrorResponse('There is no user with that email', 404));
//   }

//   // Get reset token
//   const resetToken = user.getResetPasswordToken();

//   await user.save({ validateBeforeSave: false });

//   // Create reset url
//   const resetUrl = `${req.protocol}://${req.get(
//     'host'
//   )}/api/v1/auth/resetpassword/${resetToken}`;

//   const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

//   try {
//     await sendEmail({
//       email: user.email,
//       subject: 'Password reset token',
//       message,
//     });

//     res.status(200).json({ success: true, data: 'Email sent' });
//   } catch (err) {
//     console.log(err);
//     user.resetPasswordToken = undefined;
//     user.resetPasswordExpire = undefined;

//     await user.save({ validateBeforeSave: false });

//     return next(new ErrorResponse('Email could not be sent', 500));
//   }

//   res.status(200).json({
//     success: true,
//     data: user,
//   });
// });

// @desc      Reset password
// @route     PUT /api/v1/auth/resetpassword/:resettoken
// @access    Public
// exports.resetPassword = asyncHandler(async (req, res, next) => {
//   // Get hashed token
//   const resetPasswordToken = crypto
//     .createHash('sha256')
//     .update(req.params.resettoken)
//     .digest('hex');

//   const user = await User.findOne({
//     resetPasswordToken,
//     resetPasswordExpire: { $gt: Date.now() },
//   });

//   if (!user) {
//     return next(new ErrorResponse('Invalid token', 400));
//   }

//   // Set new password
//   user.password = req.body.password;
//   user.resetPasswordToken = undefined;
//   user.resetPasswordExpire = undefined;
//   await user.save();

//   sendTokenResponse(user, 200, res);
// });
