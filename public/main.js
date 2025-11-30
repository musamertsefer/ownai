const input = document.getElementById("prompt");
const button = document.getElementById("send");
const chat = document.getElementById("chat");

button.addEventListener("click", async () => {
  const prompt = input.value.trim();
  if (!prompt) return;

  addMessage(prompt, "user");
  
  const res = await fetch("/ask", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt })
  });

  const data = await res.json();
  addMessage(data.answer, "ai", prompt);

  input.value = "";
  chat.scrollTop = chat.scrollHeight; // otomatik kaydırma
});

// Mesaj ekleme fonksiyonu
function addMessage(text, sender, prompt=null) {
  const div = document.createElement("div");
  div.className = `message ${sender}`;
  div.textContent = text;

  if (sender === "ai") {
    const buttons = document.createElement("div");
    buttons.className = "buttons";

    [1,2,3,4,5].forEach(score => {
      const btn = document.createElement("button");
      btn.textContent = `⭐${score}`;
      btn.onclick = () => rateAnswer(prompt, score, btn);
      buttons.appendChild(btn);
    });

    div.appendChild(buttons);
  }

  chat.appendChild(div);
}

// AI cevabını puanlama fonksiyonu
async function rateAnswer(prompt, score, btn) {
  await fetch("/rate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, score })
  });
  btn.disabled = true;
  btn.textContent = "Oy verildi";
}
// Öğretme alanı
const teachDiv = document.createElement("div");
teachDiv.innerHTML = `
  <input type="text" id="teachPrompt" placeholder="Prompt">
  <input type="text" id="teachAnswer" placeholder="Cevap">
  <button id="teachButton">Öğret</button>
`;
document.body.insertBefore(teachDiv, chat);

document.getElementById("teachButton").addEventListener("click", async () => {
  const prompt = document.getElementById("teachPrompt").value.trim();
  const answer = document.getElementById("teachAnswer").value.trim();
  if (!prompt || !answer) return alert("Hem prompt hem cevap girilmeli!");

  const res = await fetch("/teach", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, answer, score: 5 })
  });

  const data = await res.json();
  if (data.success) {
    alert("AI artık bu cevabı biliyor!");
    document.getElementById("teachPrompt").value = "";
    document.getElementById("teachAnswer").value = "";
  }
});