const Publication = require("../models/publicationModel");
const AppError = require("../utils/appError");
const { generateEmbedding } = require("../utils/ai");

function cosineSimilarity(a, b) {
  let dot = 0,
    na = 0,
    nb = 0;
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) {
    const x = a[i],
      y = b[i];
    dot += x * y;
    na += x * x;
    nb += y * y;
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) || 1);
}

exports.search = async (req, res, next) => {
  try {
    const q = (req.query.q || "").toString().trim();
    if (!q) return next(new AppError("Missing q query parameter", 400));
    const limit = Math.max(
      1,
      Math.min(50, parseInt(req.query.limit, 10) || 10)
    );
    console.log(q);

    const filter = {};
    const year = req.query.year ? Number(req.query.year) : undefined;
    if (!Number.isNaN(year) && year) filter.year = year;

    const own = String(req.query.own || "").toLowerCase() === "true";
    if (own) {
      if (!req.user)
        return res.status(401).json({ message: "Login required for own=true" });
      filter.user = req.user._id;
    }

    const docs = await Publication.find(filter)
      .select("title link embedding")
      .lean();

    if (!docs.length) {
      return res.json({ query: q, count: 0, results: [] });
    }

    const qEmb = await generateEmbedding(q);

    const missing = docs.filter(
      (d) => !Array.isArray(d.embedding) || !d.embedding.length
    );
    if (missing.length) {
      const chunkSize = 5;
      for (let i = 0; i < missing.length; i += chunkSize) {
        const batch = missing.slice(i, i + chunkSize);
        await Promise.all(
          batch.map(async (d) => {
            try {
              const emb = await generateEmbedding(d.title);
              await Publication.updateOne(
                { _id: d._id },
                { $set: { embedding: emb } }
              );
              d.embedding = emb;
            } catch (e) {
              console.warn(`[search] embed failed for ${d._id}: ${e.message}`);
            }
          })
        );
      }
    }

    const scored = [];
    for (const d of docs) {
      if (!Array.isArray(d.embedding) || !d.embedding.length) continue;
      const score = cosineSimilarity(qEmb, d.embedding);
      scored.push({ id: d._id, title: d.title, link: d.link, score });
    }

    scored.sort((a, b) => b.score - a.score);

    return res.json({
      query: q,
      count: Math.min(limit, scored.length),
      results: scored.slice(0, limit),
    });
  } catch (err) {
    next(err);
  }
};
