const Contact = require("../models/contactModel");
const AppError = require("../utils/appError");

exports.sendMessage = async (req, res, next) => {
  try {
    const { message, email } = req.body;
    if (!message) return next(new AppError("Please provide a message", 400));
    if (!req.user && !email) {
      return next(
        new AppError("Anonymous messages require an email address", 400)
      );
    }
    const doc = await Contact.create({
      user: req.user ? req.user._id : undefined,
      email,
      message,
    });
    res.status(201).json({ status: "success", data: { id: doc._id } });
  } catch (err) {
    next(err);
  }
};
