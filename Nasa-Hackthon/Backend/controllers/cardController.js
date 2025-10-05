const Publication = require("../models/publicationModel");
const { summarise, generateStudyCards } = require("../utils/ai");
const { fetchArticleText } = require("../utils/scrape");
const AppError = require("../utils/appError");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

/**
 * Generate study cards for a given publication.  Returns JSON by
 * default but can optionally generate a PDF file.  The route
 * signature is GET /api/v1/cards/:id and accepts query parameters
 * `count` (default 5) and `pdf` (boolean).  The response includes a
 * `cards` array and, if `pdf` is true, a `pdfUrl` field pointing to
 * the generated file in the public folder.
 */
exports.generateCards = async (req, res, next) => {
  try {
    const { id } = req.params;
    const count = parseInt(req.query.count, 10) || 5;
    const pdf = req.query.pdf === "true";
    const pub = await Publication.findById(id);
    if (!pub)
      return next(new AppError("No publication found with that ID", 404));
    const body = await fetchArticleText(pub.link);
    const cards = await generateStudyCards(pub.title, body, count);
    const result = { id: pub._id, title: pub.title, cards };
    if (pdf) {
      const doc = new PDFDocument();
      const publicDir = path.join(__dirname, "..", "public");
      if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir);
      const filename = `study_cards_${id}.pdf`;
      const filePath = path.join(publicDir, filename);
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);
      doc.fontSize(16).text(pub.title, { align: "center", underline: true });
      doc.moveDown();
      cards.forEach((card, idx) => {
        doc
          .fontSize(14)
          .fillColor("blue")
          .text(`Q${idx + 1}. ${card.question}`);
        doc
          .fontSize(12)
          .fillColor("black")
          .text(`A${idx + 1}. ${card.answer}`);
        doc.moveDown();
      });
      doc.end();
      await new Promise((resolve) => stream.on("finish", resolve));
      result.pdfUrl = `/study_cards_${id}.pdf`;
    }
    res.json(result);
  } catch (err) {
    next(err);
  }
};
