const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const db = require("../config/db-connection");
const randomString = require("randomstring");
const sendEmail = require("../helpers/send-email");
const register = (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array(),
    });
  }

  const email = db.escape(req.body.email);

  try {
    db.query(
      `SELECT * FROM users WHERE LOWER(email) = LOWER(${email})`,
      (err, result) => {
        if (err) {
          return res.status(500).send({
            message: "Database query error",
          });
        }

        if (result.length) {
          return res.status(409).send({
            error: true,
            message: "This email is already in use!",
          });
        }

        bcrypt.hash(req.body.password, 10, (err, hash) => {
          if (err) {
            return res.status(400).send({
              error: true,
              message: err,
            });
          }

          const name = db.escape(req.body.name);
          const hashedPassword = db.escape(hash);

          db.query(
            `INSERT INTO users (name, email, password) VALUES(${name}, ${email}, ${hashedPassword})`,
            (err, result) => {
              if (err) {
                return res.status(500).send({
                  error: true,
                  message: "Error occurred while registering the user!",
                });
              }

              const mailSubject = "Mail Verification";
              const randomToken = randomString.generate();
              const emailContent = `<p>Hi ${req.body.name},</p>
                                    <p>Please <a href="http://localhost:5000/mail-verification?token=${randomToken}">click here</a> to verify your email.</p>`;

              console.log(req.body.email);
              sendEmail(req.body.email, mailSubject, emailContent);

              db.query(
                "UPDATE users SET token=? WHERE email=?",
                [randomToken, req.body.email],
                (error) => {
                  if (error) {
                    return res.status(400).send({
                      error: true,
                      message: error,
                    });
                  }
                }
              );

              return res.status(201).send({
                error: false,
                message:
                  "The user has been successfully registered! Please check your email or spam folder.",
              });
            }
          );
        });
      }
    );
  } catch (error) {
    return res.status(500).send({
      error: true,
      message: "Internal server error",
    });
  }
};

module.exports = { register };
