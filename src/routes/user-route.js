const express = require("express");
const router = express.Router();
const { signUpValidation, loginValidation } = require("../helpers/validation");

const userController = require("../controllers/user-controller");

router.post("/register", signUpValidation, userController.register);
router.post("/login", loginValidation, userController.login);
module.exports = router;
