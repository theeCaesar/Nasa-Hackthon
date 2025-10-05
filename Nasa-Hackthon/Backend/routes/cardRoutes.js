const express = require("express");
const cardController = require("../controllers/cardController");

const router = express.Router();

router.get("/:id", cardController.generateCards);

module.exports = router;
