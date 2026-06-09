# 🚀 FindSight AI - Hackathon MVP Setup Guide

## ⚡ Quick Start (5 minutes)

### 1. **Clone & Install**
```bash
cd /Users/dhruveshshyara/projects/vs\ code/hackathons/FindSight-AI
npm install
```

### 2. **Configure MongoDB**
Create `.env.local` in the root directory:
```env
# MongoDB Connection (get from MongoDB Atlas)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/findsight-ai

# Demo Mode (use for reliable hackathon presentation)
NEXT_PUBLIC_DEMO_MODE=false
```

### 3. **Start Dev Server**
```bash
npm run dev
```
Open: http://localhost:3000

---

## 📊 Complete Hackathon Demo Flow

### **Phase 1: Setup (30 seconds)**
1. Go to http://localhost:3000 (Home page)
2. Click **"Register New Case"** or go to `/register`

### **Phase 2: Register Missing Person (1 minute)**
1. Upload a photo of yourself (or any person)
2. Fill in details:
   - Name: "John Doe"
   - Age: 28
   - Gender: Male
   - Last Seen: "Downtown Station"
3. Click **"Register"**
4. Confirm success toast appears ✅

### **Phase 3: Live Monitoring with Demo Mode (2 minutes)**
1. Go to **"/monitor"** (Live Monitor page)
2. Click **"Demo Mode"** button (toggle ON) ⚡
3. Click **"Start Monitoring"** button
4. Watch automatic match detections appear! 🎯
   - System will auto-trigger matches every 5-8 seconds
   - See the **"MATCH FOUND"** alert appear
   - Confidence scores will be 80-99%
   - Click **"Save Detection"** to log it

### **Phase 4: View Results (30 seconds)**
1. Go to **"/dashboard"** to see stats
   - Total Missing Persons: 1+
   - Active Searches: 1+
   - Total Detections: 5+
   - Chart showing detection timeline
2. Go to **"/detections"** to see detailed logs
   - Each detection shows timestamp, confidence, person photo, captured frame

---

## 🎮 Two Operating Modes

### **Demo Mode (Recommended for Hackathon) ⚡**
- **Enable**: Click "Demo Mode" toggle on Monitor page
- **What it does**: Automatically simulates 1-2 matches per minute
- **Why**: 100% reliable, no camera/internet dependencies
- **Perfect for**: Judges, presentations, unreliable WiFi

**To trigger demo mode:**
1. Register a missing person
2. Click "Demo Mode" on Monitor page
3. Click "Start Monitoring"
4. Matches appear automatically

### **Real Camera Mode (Optional) 📹**
- **Enable**: Just don't enable Demo Mode
- **What it does**: Uses your webcam with face-api.js
- **Why**: More realistic, actual face detection
- **Requirements**: Working webcam + camera permissions

**To use real camera:**
1. Register a missing person
2. Click "Start Camera" on Monitor page
3. Allow camera permissions
4. Matches detected from webcam frames

---

## 🏆 Judging Demo Checklist

- [ ] **Landing Page** - Hero section loads beautifully
- [ ] **Register** - Upload photo, fill form, submit successfully
- [ ] **Monitor with Demo** - Click demo mode, start monitoring
- [ ] **Alerts** - See "MATCH FOUND" alert appear
- [ ] **Save Detection** - Click save, detection saved
- [ ] **Dashboard** - Stats update in real-time
- [ ] **Detections Log** - View all detections with photos
- [ ] **UI/UX** - Smooth animations, professional design
- [ ] **Performance** - No lags or errors

---

## 📱 API Endpoints (Backend)

### **Persons** (Missing Person Registration)
```bash
GET /api/persons              # List all persons
POST /api/persons             # Register new person
```

### **Detections** (Recording Matches)
```bash
GET /api/detections           # List all detections
POST /api/detections          # Save new detection
```

### **Match** (Face Matching)
```bash
POST /api/match               # Find matching person
  # With demo mode:
  { "demoMode": true, "demoPersonId": "..." }
```

### **Stats** (Dashboard Data)
```bash
GET /api/stats                # Get dashboard stats
```

---

## 🔧 Troubleshooting

### **"MongoDB connection failed"**
✅ **Fix**: Check `.env.local` has correct `MONGODB_URI`
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/findsight-ai
```

### **"Camera permission denied"**
✅ **Fix**: Use Demo Mode instead!
- Click "Demo Mode" toggle
- Refresh page
- Start monitoring

### **"No demo matches appearing"**
✅ **Check**:
1. Is Demo Mode **ON**? (Toggle should be yellow)
2. Is Monitoring **ON**? (Button should say "Stop Monitoring")
3. Is at least 1 person registered?

### **"Photo upload fails"**
✅ **Check**:
- Image is less than 5MB
- Format is JPG/PNG/WebP
- Try a different image

### **"Database errors"**
✅ **Fix**:
1. Restart dev server: `npm run dev`
2. Check MongoDB Atlas connection status
3. Verify IP whitelist in MongoDB (allow all IPs: 0.0.0.0/0)

---

## 🎨 UI/UX Highlights

- **Dark Theme** with glassmorphism
- **Smooth Animations** with Framer Motion
- **Professional Cards** with gradient accents
- **Responsive Design** (mobile-friendly)
- **Real-time Stats** updating live
- **Beautiful Charts** showing detection trends
- **Confidence Meter** visualizing match scores

---

## 📦 Tech Stack

| Component | Technology |
|-----------|-----------|
| Frontend | Next.js 15, React 19, TypeScript |
| Styling | TailwindCSS 4, Framer Motion |
| Database | MongoDB Atlas (Cloud) |
| Face Detection | face-api.js (Browser-based) |
| UI Components | Lucide Icons, Recharts |
| Notifications | Sonner Toasts |

---

## 📋 File Structure

```
src/
├── app/
│   ├── page.tsx           # Landing page
│   ├── register/          # Registration page
│   ├── monitor/           # Live monitoring
│   ├── dashboard/         # Statistics dashboard
│   ├── detections/        # Detection logs
│   └── api/               # Backend endpoints
├── components/
│   ├── camera/            # Camera feed
│   ├── alerts/            # Alert modals
│   ├── forms/             # Registration form
│   └── dashboard/         # Stats cards
├── models/                # Mongoose schemas
├── lib/                   # Utilities & DB
└── types/                 # TypeScript types
```

---

## 🚀 Performance Tips

- Frame capture every 3 seconds (adjustable)
- Confidence threshold: 60% (only alerts >60%)
- Demo mode: 5-8 second match intervals
- Optimized images with Next.js Image component
- Lazy loading for detection logs

---

## 🎓 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [face-api.js](https://github.com/vladmandic/face-api)
- [TailwindCSS](https://tailwindcss.com/docs)

---

**Built with ❤️ for the Hackathon**
