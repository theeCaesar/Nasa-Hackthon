const express = require("express");
const analysisController = require("../controllers/analysisController");

const router = express.Router();

router.get("/stats", analysisController.getStats);

module.exports = router;
