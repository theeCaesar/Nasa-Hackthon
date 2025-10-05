const Publication = require("../models/publicationModel");
const { summarise } = require("../utils/ai");
const { fetchArticleText } = require("../utils/scrape");
const AppError = require("../utils/appError");

exports.summarisePublication = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { style = "expert", force = "false" } = req.query;
    const pub = await Publication.findById(id);
    if (!pub)
      return next(new AppError("No publication found with that ID", 404));
    const asExpert = style !== "student";
    if (pub.summary && force !== "true") {
      return res.json({ title: pub.title, summary: pub.summary, style });
    }
    const body = await fetchArticleText(pub.link);
    const summary = await summarise(pub.title, body, asExpert);
    pub.summary = summary;
    await pub.save();
    res.json({ title: pub.title, summary, style });
  } catch (err) {
    next(err);
  }
};

exports.summariseText = async (req, res, next) => {
  try {
    const { title, text = "", style = "expert" } = req.body;
    if (!title) return next(new AppError("Missing title in request body", 400));
    const asExpert = style !== "student";
    const summary = await summarise(title, text, asExpert);
    res.json({ title, summary, style });
  } catch (err) {
    next(err);
  }
};
