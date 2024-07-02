const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const errorHandler = require("./midddlewares/error");
const authRoutes = require("./routes/authRoute");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(cors("*"));

app.get("/api/v1", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Welcome to SwiftAid",
  });
});


app.use("/api/v1/auth", authRoutes);

app.all("*", (req, res) => {
  res.status(404).json({
    status: "fail",
    message: `Can't find ${req.originalUrl} with method ${req.method} on this server. Route not defined`,
  });
});

// Calling our error handler
app.use(errorHandler);
module.exports = app;
