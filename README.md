# TalentSync – Talent Matchmaker Lite

A modern web app to match client briefs with the most relevant creative talent, built for the BreadButter Fullstack Internship Assignment.

---

## 🚀 Features

- **Client Brief Input:** Enter location, required skills, budget, and style preferences.
- **Smart Matching:** Backend algorithm scores and ranks the top 3 most relevant talents.
- **Results Display:** See matches with scores, reasoning, and portfolio links.
- **Profile View:** View full details of any talent.
- **Recent Searches:** Quickly re-run or revisit previous searches.
- **Sample Briefs:** Auto-fill the form with real gig data.
- **Feedback & Bookmarking:** Thumbs up/down and bookmark matches (bonus).
- **Statistics Dashboard:** Visualize talent stats, city/category distribution, and popular skills/styles.
- **Contact Modal:** Reach out to talents directly from the app.
- **Modern UI:** Responsive, clean, and user-friendly (React + Tailwind).

---

## 📦 Sample Data Used

- `TalentProfiles.json` – Talent database (skills, experience, location, budget, etc.)
- `Gigs Dataset.json` – Client briefs (location, budget, skills, style preferences)
- `Match History.json` – (Bonus) Stores feedback/bookmarks

---

## 🛠️ Tech Stack

- **Frontend:** React, Tailwind CSS, Chart.js
- **Backend:** Node.js, Express.js
- **Storage:** JSON files (no database)
- **Other:** LocalStorage for recent searches and feedback

---

## 🖥️ Screenshots

<img width="1597" height="863" alt="image" src="https://github.com/user-attachments/assets/7d0ae95a-d728-4557-a0db-dd1fbfc92bc2" />
<img width="1585" height="854" alt="image" src="https://github.com/user-attachments/assets/0a4d2c9b-162c-483a-8e50-abb386938a70" />
<img width="1584" height="858" alt="image" src="https://github.com/user-attachments/assets/5d135921-4177-48c8-9be0-edaa3c6401db" />

---

## ⚙️ Setup Instructions

### 1. Clone the repo
```sh
git clone https://github.com/yourusername/talentsync.git
cd talentsync
```

### 2. Install dependencies

#### Backend
```sh
cd server
npm install
```

#### Frontend
```sh
cd ../client
npm install
```

### 3. Run the app

#### Start the backend
```sh
cd server
npm start
```

#### Start the frontend
```sh
cd ../client
npm run dev
```

- The frontend will run at [http://localhost:5174](http://localhost:5174)
- The backend will run at [http://localhost:3000](http://localhost:3000)

---

## 🧠 Scoring Logic

| Rule                        | Score |
|-----------------------------|-------|
| Location match              | +3    |
| Budget within creator range | +2    |
| Each matching skill         | +2    |
| Each matching style tag     | +1    |

- The backend returns the top 3 ranked creators with scores and reasoning.

---

## 📝 Optional Enhancements

- Feedback loop (thumbs up/down, bookmarks)
- Show past feedback
- Sample briefs auto-fill
- Statistics dashboard
- Contact modal

---

## 📬 Contact

- [GitHub](https://github.com/deepanshikadian)
- [LinkedIn](https://linkedin.com/in/deepanshikadian)
- [Email](mailto:deepanshikadian@gmail.com)

---

