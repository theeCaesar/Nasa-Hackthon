const Publication = require("../models/publicationModel");

const STOPWORDS = new Set([
  "the",
  "and",
  "of",
  "in",
  "to",
  "a",
  "for",
  "with",
  "on",
  "at",
  "by",
  "an",
  "as",
  "is",
  "are",
  "from",
  "that",
  "be",
  "can",
  "this",
  "into",
  "using",
  "during",
  "their",
  "over",
  "effects",
  "study",
  "studies",
  "analysis",
]);

exports.getStats = async (req, res, next) => {
  try {
    const pubs = await Publication.find();
    const total = pubs.length;
    const yearCounts = {};
    const wordCounts = {};
    pubs.forEach((pub) => {
      if (pub.year) {
        yearCounts[pub.year] = (yearCounts[pub.year] || 0) + 1;
      }
      const tokens = pub.title
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")
        .split(/\s+/)
        .filter((t) => t && !STOPWORDS.has(t));
      tokens.forEach((word) => {
        wordCounts[word] = (wordCounts[word] || 0) + 1;
      });
    });
    const topWords = Object.entries(wordCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word, count]) => ({ word, count }));
    res.json({ totalPublications: total, yearCounts, topWords });
  } catch (err) {
    next(err);
  }
};
