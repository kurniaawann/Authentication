require("dotenv").config();

const express = require("express");
const cors = require("cors");
require("./config/db-connection");

const app = express();

app.use(cors());

//error handling
app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;

  err.message = err.message || "Internal Server Error";
  res.status(err.statusCode).json({
    message: err.message,
  });
});

app.listen(5000, () => console.log("server running"));
