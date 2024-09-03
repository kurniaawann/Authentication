const { check } = require("express-validator");

exports.signUpValidation = [
  check("name", "Name is required").not().isEmpty(),
  check("email", "please enter a valid mail")
    .isEmail()
    .normalizeEmail({ gmail_remove_dots: true }),
  check("password", "Password is required").isLength({ min: 5 }),
];

exports.loginValidation = [
  check("email", "please enter a valid mail")
    .isEmail()
    .normalizeEmail({ gmail_remove_dots: true }),
  check("password", "Password min 5 lenght").isLength({ min: 5 }),
];
