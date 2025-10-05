const express = require("express");
const path = require("path");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const cors = require("cors");
const bodyParser = require("body-parser");

const summarizerRoutes = require("./routes/summarizerRoutes");
const searchRoutes = require("./routes/searchRoutes");
const chatRoutes = require("./routes/chatRoutes");
const cardRoutes = require("./routes/cardRoutes");
const analysisRoutes = require("./routes/analysisRoutes");
const userRoutes = require("./routes/userRoutes");
const contactRoutes = require("./routes/contactRoutes");

const errorController = require("./controllers/errorController");
const AppError = require("./utils/appError");

const app = express();

app.use(helmet());

app.use(bodyParser.json({ limit: "10kb" }));

app.use(mongoSanitize());

app.use(xss());

app.use(hpp());

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: false,
  })
);

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.json({ message: "Space Biology Knowledge Engine backend is running" });
});

app.use("/api/v1/summarize", summarizerRoutes);
app.use("/api/v1/search", searchRoutes);
app.use("/api/v1/chat", chatRoutes);
app.use("/api/v1/cards", cardRoutes);
app.use("/api/v1/analysis", analysisRoutes);
app.use("/api/v1", userRoutes);
app.use("/api/v1/contact", contactRoutes);

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(errorController);

module.exports = app;
