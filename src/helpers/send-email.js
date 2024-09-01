const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

dotenv.config({ path: ".env.dev" });

const { SMTP_MAIL, SMTP_PASSWORD } = process.env;

const sendEmail = (email, mailSubject, content) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: SMTP_MAIL,
        pass: SMTP_PASSWORD,
      },
    });

    const mailOptions = {
      from: "Kurni APP",
      to: email,
      subject: mailSubject,
      html: content,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("Error sending email:", error);
      } else {
        console.log("Mail sent successfully:", info.response);
      }
    });
  } catch (error) {
    console.log("Error:", error);
  }
};

module.exports = sendEmail;
