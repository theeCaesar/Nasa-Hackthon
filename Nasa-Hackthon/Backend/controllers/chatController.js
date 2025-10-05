const Publication = require("../models/publicationModel");
const { chat, summarise, generateEmbedding } = require("../utils/ai");
const { fetchArticleText } = require("../utils/scrape");
const AppError = require("../utils/appError");

const cosineSimilarity = (vecA, vecB) => {
  const dot = vecA.reduce((acc, v, i) => acc + v * vecB[i], 0);
  const normA = Math.sqrt(vecA.reduce((acc, v) => acc + v * v, 0));
  const normB = Math.sqrt(vecB.reduce((acc, v) => acc + v * v, 0));
  if (normA === 0 || normB === 0) return 0;
  return dot / (normA * normB);
};

exports.chat = async (req, res, next) => {
  try {
    const { messages, top_k = 3 } = req.body;
    if (!Array.isArray(messages) || messages.length === 0) {
      return next(
        new AppError("Request body must include a messages array", 400)
      );
    }
    const userMessage = messages
      .slice()
      .reverse()
      .find((m) => m.role === "user");
    if (!userMessage)
      return next(new AppError("No user message found in messages", 400));
    const query = userMessage.content;
    const queryEmbedding = await generateEmbedding(query);
    const pubs = await Publication.find();
    const scored = [];
    for (const pub of pubs) {
      let emb = pub.embedding;
      if (!emb) {
        emb = await generateEmbedding(pub.title);
        pub.embedding = emb;
        await pub.save();
      }
      const score = cosineSimilarity(queryEmbedding, emb);
      if (score > 0) scored.push({ pub, score });
    }
    scored.sort((a, b) => b.score - a.score);
    const top = scored.slice(0, top_k);
    const contextParts = [];
    for (const item of top) {
      const pub = item.pub;
      let summary = pub.summary;
      if (!summary) {
        const body = await fetchArticleText(pub.link);
        summary = await summarise(pub.title, body, true);
        pub.summary = summary;
        await pub.save();
      }
      contextParts.push(`Title: ${pub.title}\nSummary: ${summary}`);
    }
    const contextString = contextParts.join("\n\n");
    const systemMessage = {
      role: "system",
      content: `You are a space biology assistant. Use the following context from NASA bioscience publications to answer questions.\n\n${contextString}`,
    };
    const finalMessages = [systemMessage, ...messages];
    const response = await chat(finalMessages);
    res.json({
      response,
      sources: top.map((t) => ({
        id: t.pub._id,
        title: t.pub.title,
        link: t.pub.link,
      })),
    });
  } catch (err) {
    next(err);
  }
};
