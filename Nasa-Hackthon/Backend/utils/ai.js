const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API);

async function summarise(title, text = "", asExpert = true) {
  const style = asExpert
    ? "as an expert scientist"
    : "in plain language for a high school student";
  const prompt = `You are a helpful assistant ${style}. Provide a concise, high‑level summary of the following publication in 3–5 bullet points. If the body text is empty, infer what you can from the title.\n\nTitle: ${title}\n\nBody:\n${text}`;

  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
  const result = await model.generateContent(prompt);
  return result.response.text().trim();
}

let _gemini;
function gemini() {
  if (!_gemini) {
    if (!process.env.GOOGLE_API) {
      throw new Error("GOOGLE_API_KEY is missing");
    }
    _gemini = new GoogleGenerativeAI(process.env.GOOGLE_API);
  }
  return _gemini;
}

async function generateEmbedding(text) {
  const input = (text ?? "").toString().trim();
  if (!input) return [];
  const model = gemini().getGenerativeModel({ model: "text-embedding-004" });
  const result = await model.embedContent(input);
  const values = result?.embedding?.values || [];
  console.log("Generated embedding of length", values.length); // <-- your log
  return values;
}

async function generateStudyCards(title, text = "", count = 5) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

  const prompt = [
    `Create ${count} question-and-answer pairs that test understanding of the publication below. start reading from the Abstract not the entire website dont crerate questions from anything else except the article content.  `,
    `Return ONLY a JSON array like: [{"question":"...","answer":"..."}].`,
    `Do NOT include markdown/code fences or any extra text.`,
    "",
    `Title: ${title}`,
    "",
    "Body:",
    text,
  ].join("\n");

  function extractFirstJSONArray(raw) {
    if (typeof raw !== "string") throw new Error("Non-string model output");
    let s = raw.replace(/```(?:json)?|```/gi, "").trim();

    const start = s.indexOf("[");
    if (start < 0) throw new Error("No JSON array start '[' found");

    let depth = 0;
    for (let i = start; i < s.length; i++) {
      const ch = s[i];
      if (ch === "[") depth++;
      else if (ch === "]") {
        depth--;
        if (depth === 0) {
          return s.slice(start, i + 1);
        }
      }
    }
    throw new Error("No matching ']' for JSON array");
  }

  function normalize(arr) {
    if (!Array.isArray(arr)) {
      if (arr && Array.isArray(arr.cards)) arr = arr.cards;
      else return [];
    }
    const cleaned = arr
      .filter(
        (x) =>
          x &&
          typeof x === "object" &&
          typeof x.question === "string" &&
          typeof x.answer === "string"
      )
      .map((x) => ({
        question: x.question.trim(),
        answer: x.answer.trim(),
      }));
    return cleaned.slice(0, Math.max(1, Number(count) || 5));
  }

  try {
    const resp = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    });

    const raw = resp?.response?.text?.() ?? "";
    try {
      const parsed = JSON.parse(raw);
      return normalize(parsed);
    } catch {
      const parsed = JSON.parse(extractFirstJSONArray(raw));
      return normalize(parsed);
    }
  } catch (e) {
    try {
      const result = await model.generateContent(prompt);
      const raw = result?.response?.text?.() ?? "";
      const parsed = JSON.parse(extractFirstJSONArray(raw));
      return normalize(parsed);
    } catch (err) {
      console.error("Error parsing study cards:", e, err);
      return [];
    }
  }
}

async function chat(messages) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

  const history = messages.slice(0, -1).map((msg) => ({
    role: msg.role === "assistant" ? "model" : "user",
    parts: [{ text: msg.content }],
  }));

  const chatSession = model.startChat({ history });
  const lastMessage = messages[messages.length - 1];
  const result = await chatSession.sendMessage(lastMessage.content);

  return result.response.text().trim();
}

module.exports = {
  summarise,
  generateEmbedding,
  generateStudyCards,
  chat,
};
