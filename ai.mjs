import fs from "fs";
import axios from "axios";
import 'dotenv/config';

const DATA_FILE = "./data.json";
if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, JSON.stringify({}));

let knowledge = JSON.parse(fs.readFileSync(DATA_FILE));

// Levenshtein Distance
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
// Ana cevap fonksiyonu
export function askAI(prompt) {
    if (knowledge[prompt]) {
        return knowledge[prompt].answer;
    }

    // Benzer prompt kontrolü
    const similar = findMostSimilar(prompt);
    if (similar) {
        // Kreatif varyasyon ile cevap döndür
        const base = knowledge[similar].answer;
        return creativeVariation(base) + " (Bu cevap, benzer prompt üzerinden üretilmiştir.)";
    }

    // Yeni cevap üret
    const answer = `${prompt}  (Bu, ilk kez sorulduğu için rastgele üretilmiş bir cevaptır. Lütfen öğretin!)`;
    knowledge[prompt] = { answer, score: 1 };
    fs.writeFileSync(DATA_FILE, JSON.stringify(knowledge, null, 2));
    return answer;
}

// Puanlama fonksiyonu
export function rateAnswer(prompt, score) {
    if (knowledge[prompt]) {
        knowledge[prompt].score = score;
        fs.writeFileSync(DATA_FILE, JSON.stringify(knowledge, null, 2));
    }
}

// Öğretme fonksiyonu
export function teachAI(prompt, answer, score=5) {
    knowledge[prompt] = { answer, score };
    fs.writeFileSync(DATA_FILE, JSON.stringify(knowledge, null, 2));
}
// Local memory'ye yeni veri ekleme
export function addKnowledge(prompt, answer) {
  knowledge[prompt] = { answer };
  fs.writeFileSync(DATA_FILE, JSON.stringify(knowledge, null, 2));
}

// Wikipedia API’den özet çekme
export async function getWikipediaSummary(topic) {
  try {
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(topic)}`;
    const res = await axios.get(url);
    return res.data.extract;
  } catch (err) {
    console.log("Wikipedia fetch error:", err.message);
    return null;
  }
}