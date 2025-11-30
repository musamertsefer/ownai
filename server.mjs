import express from "express";
import { askAI, rateAnswer } from "./ai.mjs";
import 'dotenv/config';

const app = express();
app.use(express.json());
app.use(express.static("public"));

app.post("/ask", (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: "Prompt boş olamaz" });

  const answer = askAI(prompt);
  res.json({ answer });
});

// AI puanlama endpoint
app.post("/rate", (req, res) => {
  const { prompt, score } = req.body;
  if (!prompt || !score) return res.status(400).json({ error: "Eksik veri" });

  rateAnswer(prompt, score);
  res.json({ success: true });
});

app.listen(3000, () => console.log("Server çalışıyor: http://localhost:3000"));

app.post("/teach", (req, res) => {
  const { prompt, answer, score } = req.body;
  if (!prompt || !answer) return res.status(400).json({ error: "Eksik veri" });

  const s = score || 5;
  knowledge[prompt] = { answer, score: s };
  fs.writeFileSync(DATA_FILE, JSON.stringify(knowledge, null, 2));

  res.json({ success: true });
});

// Basit Levenshtein mesafe hesaplayıcı
function levenshtein(a, b) {
    const dp = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));
    for (let i = 0; i <= a.length; i++) dp[i][0] = i;
    for (let j = 0; j <= b.length; j++) dp[0][j] = j;
    for (let i = 1; i <= a.length; i++) {
        for (let j = 1; j <= b.length; j++) {
            if (a[i - 1] === b[j - 1]) dp[i][j] = dp[i - 1][j - 1];
            else dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
        }
    }
    return dp[a.length][b.length];
}
// Benzer prompt bul
function findMostSimilar(prompt) {
    let bestMatch = null;
    let minDistance = Infinity;
    for (const key of Object.keys(knowledge)) {
        const dist = levenshtein(prompt, key);
        if (dist < minDistance) {
            minDistance = dist;
            bestMatch = key;
        }
    }
    return minDistance <= 5 ? bestMatch : null;
}

// AI endpoint
app.post("/ask", async (req, res) => {
  const { prompt } = req.body;

  // Local memory kontrolü
  let answer = askAI(prompt);

  if (!answer) {
    // Local'da yoksa Wikipedia API
    answer = await getWikipediaSummary(prompt) || "Bu konuda bilgim yok.";
  }

  res.json({ answer });
});

// Yeni bilgi ekleme endpoint (opsiyonel)
app.post("/teach", (req, res) => {
  const { prompt, answer } = req.body;
  addKnowledge(prompt, answer);
  res.json({ success: true });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));