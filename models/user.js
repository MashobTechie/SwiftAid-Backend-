const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { token } = require("morgan");

const userSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: [true, "Please provide a first name"],
    trim: true,
  },
  lastname: {
    type: String,
    required: [true, "Please provide a last name"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Please provide an email"],
    unique: [true, "Email must be unique"],
    trim: true,
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    minlength: [6, "Password must be at least 6 characters long"],
    select: false,
  },
  role: {
    type: String,
    enum: ["user", "responder"],
    default: "user",
  },
 verification_token: String,
  email_verified: {
    type: Boolean,
    default: false,
  },
  profileImage: {
    type: String,
    default: "",
  },
  reset_password_token: String,
  contact_number: {
    type: String,
  },
  address: {
    type: String,
  },
});

userSchema.methods.getFullName = function () {
  return `${this.firstname} ${this.lastname}`;
};

userSchema.methods.comparePassword = async function (password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
};
const Users = mongoose.model("Users", userSchema);

module.exports = Users;
