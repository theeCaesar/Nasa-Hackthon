const express = require("express");
const summarizerController = require("../controllers/summarizerController");

const router = express.Router();

router.get("/:id", summarizerController.summarisePublication);

router.post("/", summarizerController.summariseText);

module.exports = router;
