let quotes = [];
let lang = localStorage.getItem("lang") || "fr";

window.onload = async () => {
    quotes = await fetch("quotes.json").then(r => r.json());
    loadQuoteOfTheDay();

    document.getElementById("btnToday").onclick = loadQuoteOfTheDay;
    document.getElementById("btnRandom").onclick = loadRandomQuote;
    document.getElementById("btnSettings").onclick = () => toggleSettings(true);
    document.getElementById("btnClose").onclick = () => toggleSettings(false);
    document.getElementById("btnSave").onclick = saveSettings;

    document.getElementById("langSelect").value = lang;
};

function getDayOfYear() {
    let now = new Date();
    let start = new Date(now.getFullYear(), 0, 0);
    return Math.floor((now - start) / 86400000);
}

function showQuote(id) {
    let q = quotes[id % quotes.length];

    let text = lang === "fr" ? q.citation : q.citation_en;
    let author = lang === "fr" ? q.auteur : q.auteur_en;
    let year = q.date_creation ? q.date_creation.split("-")[0] : "";

    document.getElementById("quoteText").innerText = "« " + text + " »";
    document.getElementById("quoteAuthor").innerText = author;
    document.getElementById("quoteYear").innerText = year;
}

function loadQuoteOfTheDay() {
    showQuote(getDayOfYear());
}

function loadRandomQuote() {
    let id = Math.floor(Math.random() * quotes.length);
    showQuote(id);
}

function toggleSettings(show) {
    document.getElementById("settingsModal").classList.toggle("hidden", !show);
}

function saveSettings() {
    lang = document.getElementById("langSelect").value;
    localStorage.setItem("lang", lang);

    alert("Réglages enregistrés ✓");
    toggleSettings(false);
}