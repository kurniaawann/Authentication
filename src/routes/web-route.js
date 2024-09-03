const express = require("express");

const userRoute = express();
userRoute.set("view engine", "ejs"); // Perbaikan penulisan "view engine"
userRoute.set("views", "./views"); // Menetapkan direktori untuk views
userRoute.use(express.static("public")); // Menetapkan direktori untuk file statis

const userController = require("../controllers/user-controller");

// Route untuk verifikasi email
userRoute.get("/mail-verification", userController.verifMail);

module.exports = userRoute;
