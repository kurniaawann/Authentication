require("dotenv").config();

const express = require("express");
const cors = require("cors");
require("./config/db-connection");

const userRouter = require("./routes/user-route");
const webRouter = require("./routes/web-route");

const app = express();

// Middleware untuk parsing JSON dan URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mengaktifkan CORS
app.use(cors());

// Menggunakan router
app.use("/api", userRouter);
app.use("/", webRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  // Log error jika diperlukan
  console.error(`Error: ${message}`);

  // Mengirim response error
  res.status(statusCode).json({
    status: "error",
    statusCode,
    message,
  });
});

// Menentukan port dari environment variable atau default 5000
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
