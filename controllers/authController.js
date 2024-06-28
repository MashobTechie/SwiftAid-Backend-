const Users = require("./../models/user");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const AppError = require ("./../utils/appError")
const sendEmail = require("./../utils/email");
const signJWT = require("./../utils/signJWT");
const validateUserSignup = require("./../utils/validateUserSignup");
const cloudinary = require("./../utils/cloudinary");
const { dataUri, imageUploads } = require("./../utils/multer");
const generateInitialsImageUrl = require("./../utils/generateInitialsImageUrl")



const signup = async (req, res, next) => {
  imageUploads(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        status: "fail",
        message: err.message,
      });
    }

    try {
      console.log(req.body);
      const validation = validateUserSignup(req.body);
      if (validation?.error) {
        throw new AppError(validation?.error.message, 400);
      }

      const { firstname, lastname, email, password } = req.body;

      // Check if the user with the email already exists
      const existingUser = await Users.findOne({ email });
      if (existingUser) {
        throw new Error("User with the email address already exists");
      }

      // Hashing the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      console.log(hashedPassword);

      // Initialize profileImage to null
      let profileImage = null;

      // Check if a profile picture is uploaded
      if (req.file) {
        const file = dataUri(req).content;
        const result = await cloudinary.uploader.upload(file);
        profileImage = result.url; // URL of the uploaded image in Cloudinary
      } else {
        // Use initials as profile image
        profileImage = generateInitialsImageUrl(firstname, lastname);
      }

      // Create User account
      const user = await Users.create({
        firstname,
        lastname,
        email,
        password: hashedPassword,
        profileImage: profileImage, // Save the profile image URL
      });

      if (!user) {
        throw new Error("Failed to create user account", 500);
      }

      // Send welcome mail
      const options = {
        email: email,
        subject: "Welcome !!!",
        message: "Welcome to SwiftAid, your best emergency app. Stay tuned to verify your email.",
      };

      try {
        await sendEmail(options);
        console.log("Welcome email sent successfully!");
      } catch (emailError) {
        console.error("Failed to send welcome email:", emailError);
      }

      // Create verification token
      const verificationToken = crypto.randomBytes(32).toString("hex");
      console.log('verificationToken', verificationToken);

      // Hash the verification token
      const hashedVerificationToken = await bcrypt.hash(verificationToken, salt);

      // Create verification URL
      const verificationUrl = `${req.protocol}://${req.get(
        "host"
      )}/api/v1/auth/verify/${user.email}/${verificationToken}`;

      // Create verification message
      const verificationMessage = `Please click on the link below to verify your email address.\n${verificationUrl}`;

      // Verification mail options
      const verificationMailOptions = {
        email: email,
        subject: "Verify your email address",
        message: verificationMessage,
      };

      // Send verification mail
      await sendEmail(verificationMailOptions);

      // Update user record with hashed verification token
      user.verification_token = hashedVerificationToken;
      await user.save();

      // Create auth token
      const token = signJWT(user._id);

      res.status(201).json({
        status: "success",
        data: {
          user,
          token,
        },
      });

    } catch (error) {
      res.status(500).json({
        status: "fail",
        message: error.message,
      });
    }
  });
};

const verifyEmail = async (req, res, next) => {
  try {
    const { email, token } = req.params;

    // Find the user by email
    const user = await Users.findOne({ email });
    if (!user) {
      return res.status(400).json({
        status: "fail",
        message: "Invalid verification link",
      });
    }

    // Verify the token
    const isValid = await bcrypt.compare(token, user.verification_token);
    if (!isValid) {
      return res.status(400).json({
        status: "fail",
        message: "Invalid or expired verification link",
      });
    }

    // Update the user verification status
    user.email_verified = true;
    user.verification_token = undefined; // Clear the verification token
    await user.save();

    res.status(200).json({
      status: "success",
      message: "Email verified successfully",
    });

  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};

module.exports = {
  signup,
  verifyEmail,
};
