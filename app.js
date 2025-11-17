let quotes = [];
let lang = localStorage.getItem("lang") || "fr";
let todayQuoteIndex = null;

// Chargement initial
window.onload = async () => {
    quotes = await fetch("quotes.json").then(r => r.json());

    loadQuoteOfTheDay();

    document.getElementById("btnToday").onclick = loadQuoteOfTheDay;
    document.getElementById("btnRandom").onclick = loadRandomQuote;
    document.getElementById("btnSettings").onclick = () => toggleSettings(true);
    document.getElementById("btnClose").onclick = () => toggleSettings(false);
    document.getElementById("btnSave").onclick = saveSettings;

    document.getElementById("langSelect").value = lang;

    setupNotifications();
};


//
// 🔥 1. TRADUCTION AVEC LIBRETRANSLATE
//
async function translateText(text, targetLang) {
    const res = await fetch("https://libretranslate.de/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            q: text,
            source: lang === "fr" ? "fr" : "en",
            target: targetLang,
            format: "text"
        })
    });

    const data = await res.json();
    return data.translatedText;
}


//
// 🔥 2. AFFICHAGE D’UNE CITATION
//
async function showQuote(id) {
    let q = quotes[id % quotes.length];

    let text = lang === "fr" ? q.citation : q.citation_en;
    let author = lang === "fr" ? q.auteur : q.auteur_en;
    let year = q.date_creation ? q.date_creation.split("-")[0] : "";

    // Si texte anglais manquant → traduction automatique
    if (lang === "en" && (!q.citation_en || q.citation_en.trim() === "")) {
        q.citation_en = await translateText(q.citation, "en");
        text = q.citation_en;
    }

    document.getElementById("quoteText").innerText = "« " + text + " »";
    document.getElementById("quoteAuthor").innerText = author;
    document.getElementById("quoteYear").innerText = year;
}


//
// 🔥 3. CITATION DU JOUR
//
function getDayOfYear() {
    let now = new Date();
    let start = new Date(now.getFullYear(), 0, 0);
    return Math.floor((now - start) / 86400000);
}

function loadQuoteOfTheDay() {
    todayQuoteIndex = getDayOfYear();

    showQuote(todayQuoteIndex);

    // 🔒 Cache le bouton "citation du jour" quand elle est affichée
    document.getElementById("btnToday").style.display = "none";
}


//
// 🔥 4. CITATION ALÉATOIRE
//
function loadRandomQuote() {
    let id = Math.floor(Math.random() * quotes.length);

    // assure qu'on n'affiche pas la citation du jour
    if (id === todayQuoteIndex) id = (id + 1) % quotes.length;

    showQuote(id);

    // Réaffiche le bouton "citation du jour"
    document.getElementById("btnToday").style.display = "block";
}


//
// 🔥 5. MODAL PARAMÈTRES
//
function toggleSettings(show) {
    document.getElementById("settingsModal").classList.toggle("hidden", !show);
}

function saveSettings() {
    lang = document.getElementById("langSelect").value;
    localStorage.setItem("lang", lang);

    alert("Réglages enregistrés ✓");
    toggleSettings(false);

    loadQuoteOfTheDay();
}


//
// 🔥 6. NOTIFICATIONS QUOTIDIENNES
//
function setupNotifications() {
    if (!("Notification" in window)) return;

    if (Notification.permission !== "granted") {
        Notification.requestPermission();
    }

    setInterval(checkNotificationTime, 1000);
}

function checkNotificationTime() {
    const notifEnabled = document.getElementById("notifToggle").checked;
    const notifTime = document.getElementById("notifTime").value;

    if (!notifEnabled || !notifTime) return;

    const now = new Date();
    const current = now.toTimeString().slice(0, 5);

    if (current === notifTime) {
        new Notification("Citation du jour", {
            body: "Ta citation du jour est disponible !",
            icon: "favicon.png"
        });
    }
}
