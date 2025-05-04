# StatMap

[![Stars](https://img.shields.io/github/stars/hogantyler/StatMap.svg)](https://github.com/hogantyler/StatMap)  
**Live Demo:** https://statmap.world/ :contentReference[oaicite:0]{index=0}

StatMap is an interactive geography trivia game that challenges players to guess countries based on intriguing, randomly selected facts. :contentReference[oaicite:1]{index=1}

---

## 🚀 Features

- **Quiz Mode**  
  Ten unique, random facts per session for a quick challenge. :contentReference[oaicite:2]{index=2}
- **Unlimited Mode**  
  Play through the entire facts database at your own pace. :contentReference[oaicite:3]{index=3}
- **Dynamic Hints**  
  Unlock up to three hints—continent, capital city, then ISO abbreviation—to help refine your guess. :contentReference[oaicite:4]{index=4}
- **Scoring System**  
  Earn up to 1000 points per question:  
  - Correct on first try: **1000 pts**  
  - After 1 hint (continent): **750 pts**  
  - After 2 hints (capital): **500 pts**  
  - After 3 hints (abbreviation): **250 pts**  
  - No correct guess: **0 pts** :contentReference[oaicite:5]{index=5}

---

## 🏗️ Tech Stack & Architecture

- **Languages**: JavaScript (frontend & backend), Python (data scripts) :contentReference[oaicite:6]{index=6}  
- **Frontend**: React (Create React App) :contentReference[oaicite:7]{index=7}  
- **Backend**: Node.js (Express) :contentReference[oaicite:8]{index=8}  
- **Data**: Facts harvested from Wikipedia via custom Python scripts  
- **Monorepo Structure**:  
