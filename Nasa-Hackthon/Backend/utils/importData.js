const fs = require("fs");
const path = require("path");
const axios = require("axios");
const csv = require("csvtojson");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Publication = require("../models/publicationModel");

const ROOT = path.join(__dirname, "..");
dotenv.config({ path: path.join(ROOT, "config.env") });

const DATA_URL =
  process.env.DATA_URL ||
  "https://raw.githubusercontent.com/theeCaesar/SB_publication_PMC.csv/main/SB_publication_PMC.csv";

const DATA_DIR = path.join(ROOT, "data");
const DATA_FILE = path.join(DATA_DIR, "SB_publication_PMC.csv");

function logStep(msg, ...rest) {
  console.log(`[import:data] ${msg}`, ...rest);
}

async function downloadCsv(force = false) {
  const exists = fs.existsSync(DATA_FILE);
  const ensureDir = () => {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  };

  if (exists && !force) {
    const stat = fs.statSync(DATA_FILE);
    // If file is suspiciously small (<32B) or only whitespace, re-download
    let needsRedownload = stat.size < 32;
    if (!needsRedownload) {
      const probe = fs.readFileSync(DATA_FILE, "utf8");
      if (!/\S/.test(probe)) needsRedownload = true; // whitespace-only
    }
    if (!needsRedownload) {
      logStep("Dataset already exists:", DATA_FILE);
      return;
    }
    logStep("Existing dataset is empty/invalid; re-downloading…");
  } else {
    logStep("Downloading dataset from GitHub…", DATA_URL);
  }

  try {
    ensureDir();
    const res = await axios.get(DATA_URL, {
      responseType: "text",
      validateStatus: (s) => s >= 200 && s < 400,
    });
    fs.writeFileSync(DATA_FILE, res.data, "utf8");
    logStep("Dataset saved to", DATA_FILE);
  } catch (err) {
    logStep("Failed to download dataset.");
    if (err.response) {
      console.error("HTTP", err.response.status, err.response.statusText);
    } else {
      console.error(err.message);
    }
    throw err;
  }
}

async function parseCsvFile() {
  logStep("Reading CSV:", DATA_FILE);
  if (!fs.existsSync(DATA_FILE)) {
    throw new Error(`CSV file not found at ${DATA_FILE}`);
  }

  const buf = fs.readFileSync(DATA_FILE);
  function decodeBuffer(b) {
    if (b.length >= 2 && b[0] === 0xff && b[1] === 0xfe) {
      return b.toString("utf16le"); // UTF-16 LE BOM
    }
    if (b.length >= 2 && b[0] === 0xfe && b[1] === 0xff) {
      // UTF-16 BE BOM: swap then decode as LE
      const clone = Buffer.from(b);
      for (let i = 0; i + 1 < clone.length; i += 2) {
        const t = clone[i];
        clone[i] = clone[i + 1];
        clone[i + 1] = t;
      }
      return clone.toString("utf16le");
    }
    if (b.length >= 3 && b[0] === 0xef && b[1] === 0xbb && b[2] === 0xbf) {
      return b.slice(3).toString("utf8"); // UTF-8 BOM
    }
    let zeroCount = 0;
    for (let i = 0; i < Math.min(b.length, 4096); i++)
      if (b[i] === 0x00) zeroCount++;
    if (zeroCount / Math.min(b.length, 4096) > 0.02) {
      return b.toString("utf16le");
    }
    return b.toString("utf8");
  }

  let raw = decodeBuffer(buf);

  if (!/\S/.test(raw)) {
    logStep("Decoded text is whitespace-only. Forcing re-download…");
    await downloadCsv(true);
    const buf2 = fs.readFileSync(DATA_FILE);
    raw = decodeBuffer(buf2);
  }

  raw = raw
    .replace(/\u0000/g, "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\u00A0/g, " ")
    .replace(/[ \t]+$/gm, "");

  const nonEmptyLines = raw.split("\n").filter((l) => l.trim().length > 0);

  if (nonEmptyLines.length === 0) {
    logStep("File appears empty after normalization.");
    return [];
  }

  logStep("First line seen:", JSON.stringify(nonEmptyLines[0].slice(0, 160)));

  const probe = nonEmptyLines.slice(0, Math.min(5, nonEmptyLines.length));
  const commaScore = probe.reduce(
    (s, l) => s + (l.match(/,/g)?.length || 0),
    0
  );
  const semiScore = probe.reduce((s, l) => s + (l.match(/;/g)?.length || 0), 0);
  const delimiter = semiScore > commaScore ? ";" : ",";
  logStep("Detected delimiter:", JSON.stringify(delimiter));

  const headerCand = nonEmptyLines[0].trim().toLowerCase().replace(/\s+/g, "");
  const looksLikeHeader =
    (delimiter === "," && headerCand === "title,link") ||
    (delimiter === ";" && headerCand === "title;link");

  const options = {
    trim: true,
    ignoreEmpty: true,
    delimiter,
  };

  let rows;
  if (looksLikeHeader) {
    rows = await csv(options).fromString(raw);
  } else {
    // Force headers; treat first row as data
    rows = await csv({
      ...options,
      noheader: true,
      headers: ["Title", "Link"],
    }).fromString(raw);
  }

  // --- Normalize fields and filter valid entries ---
  const normalized = rows.map((r) => {
    const title = (r.Title ?? r[" Title"] ?? r.title ?? r["title"] ?? "")
      .toString()
      .trim();
    const link = (r.Link ?? r[" Link"] ?? r.link ?? r["link"] ?? "")
      .toString()
      .trim();
    return { title, link };
  });

  const valid = normalized.filter((r) => r.title && r.link);
  logStep(`Parsed ${rows.length} rows, ${valid.length} valid entries.`);
  return valid;
}

async function importData() {
  logStep(
    "Using MONGODB_URI:",
    process.env.MONGODB_URI ? "(set)" : "(MISSING!)"
  );
  if (!process.env.MONGODB_URI) {
    throw new Error(
      "MONGODB_URI is not set. Check config.env path and contents."
    );
  }

  await downloadCsv();
  const entries = await parseCsvFile();

  logStep("Connecting to MongoDB…");
  await mongoose.connect(process.env.MONGODB_URI, {
    // options here if you want, mongoose 7 doesn’t need useNewUrlParser/useUnifiedTopology
  });
  logStep("MongoDB connected.");

  // Prepare bulk operations: upsert on link (idempotent)
  const ops = entries.map(({ title, link }) => ({
    updateOne: {
      filter: { link },
      update: { $setOnInsert: { title, link } },
      upsert: true,
    },
  }));

  if (ops.length === 0) {
    logStep("No valid entries to import.");
    await mongoose.connection.close();
    process.exit(0);
  }

  logStep(`Upserting ${ops.length} records (dedup by "link")…`);
  try {
    const res = await Publication.bulkWrite(ops, { ordered: false });
    const inserted = res.upsertedCount || 0;
    logStep(
      `Done. Inserted ${inserted} new publications (others already existed).`
    );
  } catch (err) {
    // If the model enforces unique index on link, duplicate key errors can still appear in races
    console.error("Bulk write encountered errors:", err.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

importData().catch(async (err) => {
  console.error("Error importing data:", err.message);
  try {
    await mongoose.connection.close();
  } catch (_) {}
  process.exit(1);
});
