const express = require("express");
const authRoutes = require("./routes/authRoutes");
const errorHandler = require("./middleware/errorMiddleware");

const app = express();

app.use(express.json());

app.use("/api/v1/auth", authRoutes);

app.use(errorHandler);

module.exports = app;
