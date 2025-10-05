const axios = require("axios");
const cheerio = require("cheerio");

async function fetchArticleText(url) {
  try {
    const { data } = await axios.get(url, { timeout: 10000 });
    const $ = cheerio.load(data);
    const abstract = $("#abstract").text().trim();
    if (abstract) return abstract;
    const paragraphs = [];
    $("p").each((_, el) => {
      const text = $(el).text().trim();
      if (text) paragraphs.push(text);
    });
    return paragraphs.slice(0, 10).join(" ");
  } catch (err) {
    console.error("Failed to fetch article text:", url, err.message);
    return "";
  }
}

module.exports = { fetchArticleText };
