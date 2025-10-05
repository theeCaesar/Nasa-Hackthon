const express = require("express");
const authController = require("../controllers/authController");
const userController = require("../controllers/userController");

const router = express.Router();

router.post("/auth/signup", authController.signup);
router.post("/auth/login", authController.login);

router
  .route("/users/resources")
  .post(authController.protect, userController.createResource)
  .get(authController.protect, userController.getResources);

router.delete(
  "/users/resources/:id",
  authController.protect,
  userController.deleteResource
);

module.exports = router;
