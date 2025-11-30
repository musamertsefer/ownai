import fs from "fs";

const DATA_FILE = "./data.json";
const TRAIN_FILE = "./training.json";

// data.json yoksa oluştur
if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, JSON.stringify({}));

let knowledge = JSON.parse(fs.readFileSync(DATA_FILE));
const training = JSON.parse(fs.readFileSync(TRAIN_FILE));

// Her prompt/cevap çiftini data.json’a ekle
training.forEach(item => {
  const { prompt, answer, score } = item;
  knowledge[prompt] = { answer, score };
});

// Kaydet
fs.writeFileSync(DATA_FILE, JSON.stringify(knowledge, null, 2));
console.log("Batch training tamamlandı. AI artık bu prompt/cevapları biliyor!");

