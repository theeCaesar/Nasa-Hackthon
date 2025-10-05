// utils/embedAll.js
const path = require("path");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const Publication = require("../models/publicationModel");

const openaiUtilPath = require.resolve("./ai.js");
const { generateEmbedding } = require("./ai");

dotenv.config({ path: path.join(__dirname, "..", "config.env") });

(async function main() {
  try {
    if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI missing");
    if (!process.env.GOOGLE_API) throw new Error("GOOGLE_API_KEY missing");

    console.log("[embedAll] Loaded util from:", openaiUtilPath);
    console.log(
      "[embedAll] typeof generateEmbedding:",
      typeof generateEmbedding
    );
    try {
      console.log(
        "[embedAll] generateEmbedding preview:",
        generateEmbedding && generateEmbedding.toString
          ? generateEmbedding.toString().slice(0, 100)
          : "<no toString>"
      );
    } catch {}

    await mongoose.connect(process.env.MONGODB_URI);
    const conn = mongoose.connection;
    console.log("[embedAll] Connected.");
    console.log("[embedAll] DB:", { host: conn.host, name: conn.name });
    console.log("[embedAll] Collection:", Publication.collection.name);

    const total = await Publication.countDocuments({});
    const missingCount = await Publication.countDocuments({
      $or: [{ embedding: { $exists: false } }, { embedding: { $size: 0 } }],
    });
    console.log(`[embedAll] publications total: ${total}`);
    console.log(`[embedAll] need embeddings: ${missingCount}`);

    const toEmbed = await Publication.find({
      $or: [{ embedding: { $exists: false } }, { embedding: { $size: 0 } }],
    })
      .select("title")
      .lean();

    console.log(`[embedAll] Embedding ${toEmbed.length} docs…`);

    const chunkSize = 5;
    for (let i = 0; i < toEmbed.length; i += chunkSize) {
      const batch = toEmbed.slice(i, i + chunkSize);

      await Promise.all(
        batch.map(async (doc) => {
          try {
            console.log(
              `[embedAll] -> embedding: ${doc._id} | ${doc.title.slice(0, 60)}…`
            );
            const emb = await generateEmbedding(doc.title);
            if (!Array.isArray(emb) || emb.length === 0) {
              throw new Error("Empty embedding returned");
            }
            console.log(`[embedAll] <- length: ${emb.length} for ${doc._id}`);
            await Publication.updateOne(
              { _id: doc._id },
              { $set: { embedding: emb } }
            );
          } catch (e) {
            console.warn(`[embedAll] Failed: ${doc._id} ${e.message}`);
          }
        })
      );
    }

    const missingAfter = await Publication.countDocuments({
      $or: [{ embedding: { $exists: false } }, { embedding: { $size: 0 } }],
    });
    console.log(
      `[embedAll] Done. Remaining without embeddings: ${missingAfter}`
    );

    await mongoose.connection.close();
  } catch (err) {
    console.error("[embedAll] Error:", err);
    try {
      await mongoose.connection.close();
    } catch {}
    process.exit(1);
  }
})();
