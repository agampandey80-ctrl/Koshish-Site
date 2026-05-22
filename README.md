```
 ██╗  ██╗ ██████╗ ███████╗██╗  ██╗██╗███████╗██╗  ██╗
 ██║ ██╔╝██╔═══██╗██╔════╝██║  ██║██║██╔════╝██║  ██║
 █████╔╝ ██║   ██║███████╗███████║██║███████╗███████║
 ██╔═██╗ ██║   ██║╚════██║██╔══██║██║╚════██║██╔══██║
 ██║  ██╗╚██████╔╝███████║██║  ██║██║███████║██║  ██║
 ╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝  ╚═╝╚═╝╚══════╝╚═╝  ╚═╝
```

# Koshish — Free Education Initiative Website

> **Shaping Futures, One Lesson at a Time**

A full-stack website for **Koshish** — a non-profit free education initiative run by engineering college students (1st–4th year) who mentor underprivileged children from Kindergarten to Class 12, including competitive exam coaching. Guided by college faculty.

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Vanilla JS](https://img.shields.io/badge/Vanilla_JS-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)

---

## 📁 Folder Structure

```
koshish/
│
├── frontend/
│   ├── index.html              ← Home page
│   ├── events.html             ← Events gallery
│   ├── team.html               ← Team hierarchy
│   ├── admin.html              ← Admin dashboard
│   ├── manifest.json           ← PWA manifest
│   ├── css/
│   │   └── style.css           ← Full design system
│   └── js/
│       ├── main.js             ← Shared: API helper, navbar, toasts, skeletons
│       ├── home.js             ← Notices, counters, event teasers
│       ├── events.js           ← Tab switching, gallery, lightbox
│       ├── team.js             ← Tiered team rendering
│       └── admin.js            ← Login, JWT, CRUD dashboard
│
├── backend/
│   ├── server.js               ← Express entry point
│   ├── package.json
│   ├── .env.example
│   ├── config/
│   │   └── supabaseClient.js   ← Supabase client init
│   ├── middleware/
│   │   └── authMiddleware.js   ← JWT verification
│   ├── routes/
│   │   ├── auth.js
│   │   ├── notices.js
│   │   ├── events.js
│   │   ├── team.js
│   │   └── content.js
│   └── controllers/
│       ├── authController.js
│       ├── noticeController.js
│       ├── eventController.js
│       ├── teamController.js
│       └── contentController.js
│
├── supabase/
│   └── schema.sql              ← Tables, RLS, seed data
│
└── README.md
```

---

## 🚀 Getting Started

### 1. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** → paste the entire contents of `supabase/schema.sql` → **Run**
3. Go to **Storage** → Create two buckets:
   - `event-photos` (set to **Public**)
   - `team-photos` (set to **Public**)
4. Copy your **Project URL** and **Service Role Key** from **Settings → API**

### 2. Backend Setup

```bash
cd backend
cp .env.example .env
```

Edit `.env` with your Supabase credentials:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
JWT_SECRET=pick_a_long_random_string_here
PORT=3000
FRONTEND_URL=http://localhost:5500
```

Install dependencies and start:

```bash
npm install
node server.js
```

You should see the ASCII art "KOSHISH" banner on startup! 🎉

### 3. Frontend Setup

Open the `frontend/` folder with **VS Code Live Server** (default port 5500) or any static file server.

```bash
# Or use npx:
npx serve frontend -l 5500
```

---

## 🔐 Default Admin Credentials

| Field    | Value              |
|----------|--------------------|
| Email    | `admin@koshish.org`|
| Password | `koshish2024`      |

> ⚠️ Change these in production by updating the `admins` table in Supabase.

---

## 📡 API Reference

All endpoints return:
```json
{ "success": true, "data": { ... } }
{ "success": false, "error": "Human-readable message" }
```

### Authentication

| Method | Endpoint           | Auth | Description                    |
|--------|--------------------|------|--------------------------------|
| POST   | `/api/auth/login`  | —    | Login, returns JWT (8h expiry) |
| GET    | `/api/auth/verify` | JWT  | Verify token, return admin info|

### Notices

| Method | Endpoint            | Auth | Description           |
|--------|---------------------|------|-----------------------|
| GET    | `/api/notices`      | —    | All active notices    |
| POST   | `/api/notices`      | JWT  | Create notice         |
| PUT    | `/api/notices/:id`  | JWT  | Update notice         |
| DELETE | `/api/notices/:id`  | JWT  | Delete notice         |

### Events

| Method | Endpoint              | Auth | Description                         |
|--------|-----------------------|------|-------------------------------------|
| GET    | `/api/events`         | —    | All photos; `?event=udaan` or `abhyuday` |
| POST   | `/api/events/upload`  | JWT  | Upload photo (multipart form)       |
| DELETE | `/api/events/:id`     | JWT  | Delete photo + storage file         |

### Team

| Method | Endpoint          | Auth | Description                    |
|--------|-------------------|------|--------------------------------|
| GET    | `/api/team`       | —    | All members (ordered by tier)  |
| POST   | `/api/team`       | JWT  | Add member + optional photo    |
| PUT    | `/api/team/:id`   | JWT  | Update member details          |
| DELETE | `/api/team/:id`   | JWT  | Delete member + photo          |

### Site Content

| Method | Endpoint             | Auth | Description            |
|--------|----------------------|------|------------------------|
| GET    | `/api/content`       | —    | All content as key-value |
| PUT    | `/api/content/:key`  | JWT  | Update one content value |

---

## 🌐 Deployment

### Backend → Render (Free Tier)

1. Push the `backend/` folder to a GitHub repo
2. Connect to [render.com](https://render.com) → **New Web Service**
3. Set:
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
4. Add all `.env` variables in Render's **Environment** tab

### Frontend → Netlify

1. Drag and drop the `frontend/` folder to [netlify.com](https://netlify.com)
2. Update `API_BASE` in `frontend/js/main.js` to your Render URL
3. Update `FRONTEND_URL` in backend `.env` to your Netlify URL

---

## 🎨 Pages Overview

| Page         | URL             | Description                                     |
|--------------|-----------------|--------------------------------------------------|
| Home         | `index.html`    | Hero, stats, about, notices, event teasers      |
| Events       | `events.html`   | Tab-switchable gallery with lightbox             |
| Team         | `team.html`     | Tiered cards: Faculty → 4th → 3rd → 2nd → 1st  |
| Admin        | `admin.html`    | Login + Dashboard: Notices, Events, Team, Content|

---

## ✅ Features Checklist

- [x] Centralized `koshishAPI()` helper with auto-attached Bearer token
- [x] Skeleton loaders (pulsing gray bars) while fetching
- [x] Toast notifications (success/error/warning, auto-dismiss 3s)
- [x] Counter animation with IntersectionObserver (fires once)
- [x] File upload with real `xhr.upload.onprogress` progress bars
- [x] Image fallback: initials for team, placeholder SVG for gallery
- [x] Mobile: hamburger → full-screen slide-in drawer
- [x] Sticky navbar with `backdrop-filter: blur(10px)`
- [x] Client-side validation (no empty fields, file size < 5 MB)
- [x] JWT stored in `sessionStorage` (clears on tab close)
- [x] `manifest.json` + SVG favicon
- [x] ASCII art "KOSHISH" banner on server boot
- [x] Scroll-triggered entrance animations (staggered)
- [x] Lightbox with keyboard navigation (← → Esc)
- [x] RLS policies on all Supabase tables

---

## 🤝 Contributing

We welcome all engineering students who want to contribute as developers!

1. **Fork** this repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a **Pull Request**

### Coding Standards
- Use meaningful variable and function names
- Add JSDoc comments for all functions
- Follow the existing CSS naming convention (BEM)
- Test on both desktop and mobile before submitting

---

## 📝 License

This project is licensed under the MIT License. Free to use, modify, and distribute.

---

<div align="center">
  <strong>Made with ❤️ by the Koshish Team</strong><br>
  <em>Shaping futures, one lesson at a time.</em>
</div>
