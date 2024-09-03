const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const db = require("../config/db-connection");
const randomString = require("randomstring");
const sendEmail = require("../helpers/send-email");
const dotenv = require("dotenv");
dotenv.config({ path: ".env.dev" });
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = process.env;

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

const verifMail = (req, res) => {
  const token = req.query.token;
  db.query(
    "SELECT * FROM users WHERE token=? LIMIT 1",
    token,
    function (error, result, fields) {
      if (error) {
        console.log(error.message);
      }

      if (result.length > 0) {
        db.query(
          `UPDATE users SET token = NULL, is_verified = 1 WHERE id = ${result[0].id} `
        );

        console.log(result[0].id);
        return res.render("email-verification", {
          message: "mail verified success",
        });
      } else {
        return res.render("404");
      }
    }
  );
};

const login = (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array(),
    });
  }
  db.query(
    `SELECT * FROM users WHERE email =${db.escape(req.body.email)}`,
    (err, result) => {
      if (err) {
        return res.status(400).send({
          status: "fail",
          message: err,
        });
      }

      if (!result.length) {
        return res.status(401).send({
          message: "Email or password is incorrect",
        });
      }
      bcrypt.compare(
        req.body.password,
        result[0]["password"],
        (bError, bResult) => {
          if (err) {
            return res.status(400).send({
              status: "fail",
              message: bError,
            });
          }
          if (bResult) {
            const token = jwt.sign(
              { id: result[0]["id"], is_admin: [0]["is_admin"] },
              JWT_SECRET,
              { expiresIn: "1h" }
            );
            db.query(
              `UPDATE users SET last_login = now(), WHERE id = '${result[0]["id"]}'`
            );
            return res.status(201).send({
              message: "Logged in",
              token: token,
              user: result[0],
            });
          }
          return res.status(401).send({
            message: "Email or Password is incorrent ",
          });
        }
      );
    }
  );
};

const getUser = (req, res) => {
  const autToken = req.headers["authorization"];
  const token = autToken.split(" ")[1];
  try {
    const decodeToken = jwt.verify(token, JWT_SECRET);

    db.query(
      "SELECT * FROM users WHERE id=?",
      decodeToken.id,
      function (error, result, fields) {
        if (error) throw error;
        return res.status(200).send({
          success: true,
          data: result[0],
          message: "success",
        });
      }
    );
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).send({
        success: false,
        message: "Token sudah expired",
      });
    } else {
      return res.status(401).send({
        success: false,
        message: "Token tidak valid",
      });
    }
  }
};

module.exports = { register, verifMail, login, getUser };
