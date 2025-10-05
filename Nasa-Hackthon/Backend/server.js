process.on("uncaughtException", (err) => {
  console.error(err.name, err.message, err.stack);
  console.error("UNCAUGHT EXCEPTION! 🔥 Shutting down the server…");
  process.exit(1);
});

const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config({ path: "./config.env" });

const app = require("./app");

const DB = process.env.MONGODB_URI;
mongoose
  .connect(DB)
  .then(() => {
    console.log("MongoDB connection established");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

const port = process.env.PORT || 5001;
const server = app.listen(port, () => {
  console.log(`Space Biology Engine listening on port ${port}`);
});

process.on("unhandledRejection", (err) => {
  console.error(err.name, err.message);
  console.error("UNHANDLED REJECTION! 🔥 Shutting down the server…");
  server.close(() => {
    process.exit(1);
  });
});
