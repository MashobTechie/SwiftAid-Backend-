const mongoose = require("mongoose");
const mongoPassword = process.env.mongoPassword;
const mongoURI = process.env.mongoURI.replace("<password>", mongoPassword);

const connectDatabase = async () => {
  try {
    await mongoose.connect(mongoURI).then(() => {
      console.log("Database connected uccessfully!");
    });
  } catch (error) {
    console.log("An error occurred while connecting to the database", error);
  }
};
 
  

module.exports = connectDatabase;
