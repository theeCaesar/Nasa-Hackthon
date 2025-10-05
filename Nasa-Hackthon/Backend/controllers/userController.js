const Publication = require("../models/publicationModel");
const AppError = require("../utils/appError");

exports.createResource = async (req, res, next) => {
  try {
    const { title, link, year } = req.body;
    if (!title || !link) {
      return next(new AppError("Please provide both title and link", 400));
    }
    const doc = await Publication.create({
      title: title.trim(),
      link: link.trim(),
      year,
      user: req.user._id,
    });
    res.status(201).json({ status: "success", data: { resource: doc } });
  } catch (err) {
    next(err);
  }
};

exports.getResources = async (req, res, next) => {
  try {
    const resources = await Publication.find({ user: req.user._id });
    res.json({
      status: "success",
      count: resources.length,
      data: { resources },
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteResource = async (req, res, next) => {
  try {
    const { id } = req.params;
    const resource = await Publication.findById(id);
    if (!resource)
      return next(new AppError("No resource found with that ID", 404));
    if (
      !resource.user ||
      resource.user.toString() !== req.user._id.toString()
    ) {
      return next(
        new AppError("You do not have permission to delete this resource", 403)
      );
    }
    await resource.deleteOne();
    res.status(204).json({ status: "success", data: null });
  } catch (err) {
    next(err);
  }
};
