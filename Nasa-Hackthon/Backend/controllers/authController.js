const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const User = require("../models/userModel");
const AppError = require("../utils/appError");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.signup = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !password) {
      return next(new AppError("Please provide a username and password", 400));
    }
    const existing = await User.findOne({ username });
    if (existing) return next(new AppError("Username already exists", 400));
    const user = await User.create({ username, email, password });
    const token = signToken(user._id);
    res
      .status(201)
      .json({
        status: "success",
        token,
        data: {
          user: { id: user._id, username: user.username, email: user.email },
        },
      });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return next(new AppError("Please provide a username and password", 400));
    }
    const user = await User.findOne({ username }).select("+password");
    if (!user || !(await user.checkPassword(password, user.password))) {
      return next(new AppError("Incorrect username or password", 401));
    }
    const token = signToken(user._id);
    res
      .status(200)
      .json({
        status: "success",
        token,
        data: {
          user: { id: user._id, username: user.username, email: user.email },
        },
      });
  } catch (err) {
    next(err);
  }
};

exports.protect = async (req, res, next) => {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }
    if (!token) {
      return next(
        new AppError("You are not logged in! Please provide a token.", 401)
      );
    }
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    const currentUser = await User.findById(decoded.id);
    if (!currentUser)
      return next(
        new AppError("The user belonging to this token no longer exists.", 401)
      );
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return next(
        new AppError(
          "User recently changed password. Please log in again.",
          401
        )
      );
    }
    req.user = currentUser;
    next();
  } catch (err) {
    next(err);
  }
};

exports.optionalProtect = async (req, res, next) => {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }
    if (!token) {
      req.user = undefined;
      return next();
    }
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    const currentUser = await User.findById(decoded.id);
    if (!currentUser)
      return next(
        new AppError("The user belonging to this token no longer exists.", 401)
      );
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return next(
        new AppError(
          "User recently changed password. Please log in again.",
          401
        )
      );
    }
    req.user = currentUser;
    next();
  } catch (err) {
    next(err);
  }
};
