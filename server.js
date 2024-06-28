const dotenv = require("dotenv").config();
const app = require("./app")
const connectDatabase = require("./config/database")
const port = process.env.PORT || 8080;
connectDatabase();
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
  