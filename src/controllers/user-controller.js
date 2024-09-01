const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const db = require("../config/db-connection");

const register = (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array(),
    });
  }

  db.query(
    `SELECT * FROM users WHERE LOWER(email) = LOWER(${db.escape(
      req.body.email
    )})`,
    (err, result) => {
      if (err) {
        return res.status(500).send({
          message: "Database query error",
        });
      }

      if (result && result.length) {
        return res.status(409).send({
          error: true,
          message: "This email is already in use!",
        });
      } else {
        bcrypt.hash(req.body.password, 10, (err, hash) => {
          if (err) {
            return res.status(400).send({
              error: true,
              message: err,
            });
          } else {
            db.query(
              `INSERT INTO users (name, email, password) VALUES('${
                req.body.name
              }', ${db.escape(req.body.email)}, ${db.escape(hash)})`,
              (err, result) => {
                if (err) {
                  return res.status(500).send({
                    error: true,
                    message: "Error occurred while registering the user!",
                  });
                }
                // Mengirimkan respons sukses setelah insert
                return res.status(201).send({
                  error: false,
                  message: "The user has been successfully registered!",
                });
              }
            );
          }
        });
      }
    }
  );
};

module.exports = { register };
