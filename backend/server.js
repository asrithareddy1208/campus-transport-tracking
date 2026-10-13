
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const busRoutes = require("./routes/busroutes");
const noticeRoutes = require("./routes/noticeroutes");
const driverRoutes = require("./routes/driverroutes");
const authRoutes = require("./routes/auth");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Existing transport routes
app.use("/api/buses", busRoutes);
app.use("/api/notices", noticeRoutes);
app.use("/api/drivers", driverRoutes);

// Authentication routes
app.use("/api/auth", authRoutes);
app.use((req, res, next) => {
  console.log("REQUEST:", req.method, req.url);
  next();
});
console.log("AUTH ROUTES MOUNTED");

// Home route
app.get("/", (req, res) => {
    res.send("Campus Transport Backend is running!");
});

// Connect to MongoDB and start server
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected successfully!");

        app.listen(5000, () => {
            console.log("Server running on port 5000");
        });
    })
    .catch((err) => {
        console.log("MongoDB connection failed:", err.message);
    });
