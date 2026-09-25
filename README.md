# Safar (सफ़र) — AI-Powered India Travel Logistics Engine

<div align="center">

![Shree Ram Mandir Ayodhya](https://upload.wikimedia.org/wikipedia/commons/d/df/Ayodhya_Ram_Mandir_Inauguration_Day_Picture.jpg)

### *Har Safar. Perfectly Planned.*
**A high-precision Indian travel logistics and itinerary generator built for real ground realities.**

[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Gemini AI](https://img.shields.io/badge/Google%20Gemini-Flash-8E75B2?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![Security](https://img.shields.io/badge/Zero--Key--Storage-Secured-brightgreen?style=for-the-badge&logo=shield)](https://github.com/harshlagwal/Safar)

[Live Demo](https://safar-ai.vercel.app) • [Report Bug](https://github.com/harshlagwal/Safar/issues) • [Request Feature](https://github.com/harshlagwal/Safar/issues)

</div>

---

## 🇮🇳 Why Safar?

Generic AI chatbots often fail when planning travel across India because they do not understand **Indian ground realities**:
- They hallucinate highway speeds (e.g., claiming Manali to Leh takes 4 hours).
- They lack awareness of **ghat curves, single-lane mountain passes, and monsoon detours**.
- They cannot calculate realistic multi-modal transitions (e.g., matching a Vande Bharat arrival with a pre-booked local cab or Volvo sleeper).
- They fail at real Indian budget tiers (Dorm vs. Boutique Hotel vs. Heritage Haveli).

**Safar is engineered from the ground up for how India actually moves.**

---

## ✨ Key Features

### 1. 🗺️ Living India Interactive Map
- **Antigravity GPU Acceleration Layer**: Sub-pixel accurate mainland outline rendered with deterministic vector projection (0ms calculation latency).
- **34 State & UT Capitals**: Latitudinal color gradient mapping (Northern Saffron `#FF6B00` ➔ Central White `#FFFFFF` ➔ Southern Emerald `#00A844`).
- **Smart Edge-Clamping Hover Cards**: Tooltips dynamically clamp away from screen corners (Kavaratti, Port Blair, Kohima, Srinagar) to guarantee 100% visibility without clipping.
- **60/120 FPS Fluid Motion**: Hardware-composited animations offload all breathing and outer tricolor flame pulses to the GPU compositor thread.

### 2. 🤖 Dual AI Engine Support (Gemini + OpenRouter)
- **Bring Your Own Key (BYOK)**: Users can securely use their own **Google Gemini API Key** or **OpenRouter API Key** directly from the frontend UI.
- **Automatic Fallback Hierarchy**: If Gemini experiences temporary rate limits (`503 UNAVAILABLE`), the chat engine seamlessly cascades to OpenRouter models without breaking conversation state.
- **Zero-Storage Security Policy**: API keys provided by users are **NEVER stored on the backend server or databases**. They remain securely in the user's browser session.

### 3. 🚆 Multi-Modal Transit Intelligence
- Evaluates real corridors: **Vande Bharat Superfast Rail**, **BharatBenz / Volvo AC Sleepers**, **National Expressways (NH44, NH48, Yamuna Expressway)**, and **Domestic Flights**.
- Automatically computes realistic **ghat transit physics** (25–35 km/h hairpin curve limits) instead of straight-line estimates.
- Integrated 1-click direct booking helpers for **IRCTC**, **RedBus**, **AbhiBus**, and **MakeMyTrip**.

### 4. 💰 Scientific Budget Architecture (₹500 to ₹1,00,000)
- Mathematical budget allocation:
  - **Stay Logic**: 35% – 45%
  - **Transit Strategy**: 25% – 35%
  - **Meals & Street Food**: 20%
  - **Emergency Buffer**: 10%
- Persona matching: Backpacker Student, Friends Roadtrip, Curated Heritage Family Vacation.

### 5. 📅 Agli Chhutti Long Weekend Predictor
- Analyzes Indian gazetted and festive holidays to automatically discover upcoming long weekends.
- Provides pre-computed 2-day and 3-day getaway blueprints based on departure cities.

### 6. 📄 Offline PDF Travel Dossier
- Generates downloadable, print-ready travel itineraries complete with day-wise timelines, packing checklists, emergency contacts, and transport passes.

---

## 🛠️ Architecture & Tech Stack

```
safar/
├── src/                    # Frontend Client (React 19 + TypeScript + Vite)
│   ├── assets/             # Precomputed mainland GeoJSON & coordinates
│   ├── components/         # IndiaMapSvg, SafarAiChat, AgliChhuttiSection, Footer, etc.
│   ├── pages/              # Landing, Plan, Result, Trips, Auth
│   ├── services/           # Client-side API gateways & AI proxy handlers
│   └── index.css           # Apple & Google Antigravity GPU layer styles
│
└── server/                 # Backend Core (Node.js + Express)
    ├── src/
    │   ├── config/         # MongoDB connection & security headers
    │   ├── controllers/    # Itinerary & Chat route handlers
    │   ├── models/         # User & Saved Trip schemas
    │   ├── routes/         # Express REST API endpoints
    │   └── services/       # ChatService, GeminiService & OpenRouter handlers
    └── .env.example        # Sanitized environment template (No keys committed)
```

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite 8, Tailwind CSS v4, Motion (Framer Motion), Lucide Icons, React Simple Maps |
| **Smooth Scroll** | Official Lenis Smooth Scroll Engine + Antigravity GPU Compositor Layer |
| **Backend** | Node.js, Express.js, Mongoose, CORS, JSONWebToken, Brevo Email API |
| **Database** | MongoDB Atlas / Local MongoDB |
| **AI Models** | Google Gemini (`gemini-2.5-flash`), OpenRouter AI Gateway |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm** or **bun** / **yarn**
- **MongoDB**: Local community server or MongoDB Atlas URI

---

### 1. Clone the Repository
```bash
git clone https://github.com/harshlagwal/Safar.git
cd Safar
```

---

### 2. Frontend Setup
```bash
# Install dependencies
npm install

# Configure environment variables
cp .env.example .env

# Start development server
npm run dev
```
The client will be running at `http://localhost:5173`.

---

### 3. Backend Setup
```bash
cd server

# Install backend dependencies
npm install

# Configure environment variables
cp .env.example .env

# Start backend server
npm run dev
```
The backend API will be running at `http://localhost:5000`.

---

## 🔒 Security & Privacy Architecture

Safar follows strict security best practices:
1. **Zero Secret Retention**: No personal AI keys or passwords are saved on the backend server.
2. **Environment Sanitization**: `.env` and all credential patterns are strictly ignored via `.gitignore`.
3. **CORS & Rate Limiting**: Production endpoints enforce origin validation and sanitized input payloads.
4. **JWT Authentication**: Secure user session tokens stored with HTTP-only standards.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📜 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

<div align="center">
  <b>Built with ❤️ for Indian Travellers</b><br />
  <sub>Safar AI © 2026. All rights reserved.</sub>
</div>
