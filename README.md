# Fiyinfoluwa Balogun — Cloud Data Analyst Portfolio

A sleek, premium, and highly responsive single-page portfolio website designed for a Cloud Data Analyst. The site features a dark-themed aesthetic with neon green accents, custom SVG tech iconography, smooth scroll-reveal animations, and a seamless, serverless Google Sheets integration that acts as a lightweight Content Management System (CMS) for the client.

---

## 🚀 Features

- **Premium Dark Mode UI:** Designed using a custom color palette (`#071a0f` deep green background with `#e8ff47` glowing accents).
- **Custom Tech Iconography:** Handcrafted, scalable SVG outlines for specialized data tools (Power BI, SQL, Python, R, Cloud Analytics, and Data Storytelling).
- **Dynamic Projects Section:** Automatically fetches, parses, and displays project cards directly from a published Google Sheet.
- **Cache-Busted Fetching:** Implements client-side cache busting (`&_t=[timestamp]`) to guarantee that updates made to the spreadsheet reflect immediately upon page refresh.
- **Robust Field Parsing:** Seamlessly handles multi-tag semicolons and commas enclosed within double quotes in project descriptions.
- **Fully Responsive Layout:** Automatically adapts between multi-column grids on large displays and centralized, stacked modules on tablet and mobile viewports.

---

## 🛠️ Tech Stack

- **Structure:** HTML5 (Semantic modules)
- **Styling:** CSS3 (Custom properties, CSS Grid, Flexbox, Keyframe animations)
- **Interactivity & Data Parsing:** Vanilla JavaScript (ES6+, Fetch API, Intersection Observer API)
- **Data Storage (CMS):** Google Sheets (Published to Web as CSV)

---

## 📂 Project Structure
```text
├── index.html          # Main structure, navigation, hero, skills, and contact forms
├── css/
│   └── style.css       # Core layout styles, variables, grid systems, and responsive break points
├── js/
│   └── main.js        # Main interaction engine (mobile menu, scroll reveal, and Google Sheet fetcher)
└── README.md           # Documentation and client instructions