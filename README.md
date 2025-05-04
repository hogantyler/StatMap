# StatMap

[![Stars](https://img.shields.io/github/stars/hogantyler/StatMap.svg)](https://github.com/hogantyler/StatMap)  
**Live Demo:** https://statmap.world/ :contentReference[oaicite:0]{index=0}

StatMap is an interactive geography trivia game that challenges players to guess countries based on intriguing, randomly selected facts. 

---

## 🚀 Features

- **Quiz Mode**  
  Ten unique, random facts per session for a quick challenge.
- **Unlimited Mode**  
  Play through the entire facts database at your own pace.
- **Multiplayer Mode**
  Join a friend's lobby and play quiz mode vs other people in a battle royale format.
- **Dynamic Hints**  
  Unlock up to three hints — continent, capital city, then ISO abbreviation—to help refine your guess.
- **Scoring System**  
  Earn up to 1000 points per question:  
  - Correct on first try: **1000 pts**  
  - After 1 hint (continent): **750 pts**  
  - After 2 hints (capital): **500 pts**  
  - After 3 hints (abbreviation): **250 pts**  
  - No correct guess: **0 pts**

---

## 🏗️ Tech Stack & Architecture

- **Frontend**: React and Three.js
- **Backend**: Supabase and PostgreSQL
- **Data**: CSV file, facts harvested from Wikipedia via chatGPT API using Python scripts

---

## ⚙️ Installation & Setup

1. **Clone the repo**  
 ```bash
 git clone https://github.com/hogantyler/StatMap
 cd StatMap
```

2. **Locate folder and install npm**
```bash
 cd frontend/statmap-app
 npm install
 npm start
```

3. **Play/Test**
Open http://localhost:3000 in your browser.
