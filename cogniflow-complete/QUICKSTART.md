# CogniFlow React - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies

```bash
cd cogniflow-react
npm install
```

### Step 2: Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:
```
REACT_APP_API_URL=http://localhost:5000/api
```

### Step 3: Start Development Server

```bash
npm start
```

App opens at: `http://localhost:3000`

---

## 📋 What You Need

### Backend Running

Make sure your Node.js backend is running on `http://localhost:5000`

If not yet created, use the technical guide to set up:
1. MongoDB connection
2. Express server
3. All API endpoints
4. Claude API integration

### Test Data (Optional)

For testing without backend, the frontend has:
- Mock authentication (any email/password works during development)
- Sample data in components
- Error boundaries for failed API calls

---

## 🎯 Key Pages

Once running, you'll have access to:

1. **Dashboard** (`/`) - Overview, load status, focus windows, priority tasks
2. **Tasks** (`/tasks`) - Create and manage AI-scheduled or manual tasks
3. **Thoughts** (`/thoughts`) - Capture unstructured productivity thoughts
4. **Reflections** (`/reflections`) - Daily structured feedback
5. **Insights** (`/insights`) - View your productivity patterns
6. **Chat** (`/chat`) - AI assistant for questions and schedule adjustments

---

## 🔧 Customization

### Change Colors

Edit `src/styles/global.css`:

```css
:root {
  --accent-light: #3282b8;  /* Change this */
  /* ... */
}
```

### Change Fonts

Edit `public/index.html` Google Fonts import and update CSS variables

---

## 🐛 Common Issues

### "Cannot connect to backend"
- Check backend is running: `http://localhost:5000`
- Verify CORS is enabled on backend
- Check `.env` has correct API URL

### "Module not found"
```bash
npm install
```

### Port 3000 in use
```bash
# Use different port
PORT=3001 npm start
```

---

## 📦 Production Build

```bash
npm run build
```

Creates optimized build in `build/` directory

---

## ✅ Checklist

- [ ] Node.js installed (v14+)
- [ ] Backend running and accessible
- [ ] `npm install` completed
- [ ] `.env` file configured
- [ ] `npm start` running successfully
- [ ] Can see login page at localhost:3000

---

## 🆘 Need Help?

Check:
1. README.md - Full documentation
2. Console for errors - Browser DevTools (F12)
3. Network tab - See API call status

---

Ready to build something amazing! 🚀
