require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("./config/db-connection");

const userRouter = require("./routes/user-route");

const app = express();
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.use("/api", userRouter);

//error handling
app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;

  err.message = err.message || "Internal Server Error";
  res.status(err.statusCode).json({
    message: err.message,
  });
});

app.listen(5000, () => console.log("server running"));
