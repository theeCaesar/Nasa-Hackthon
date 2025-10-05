const express = require("express");
const contactController = require("../controllers/contactController");
const authController = require("../controllers/authController");

const router = express.Router();

router.post("/", authController.optionalProtect, contactController.sendMessage);

module.exports = router;
