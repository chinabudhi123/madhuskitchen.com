# Madhu's Kitchen 🍛

Home-Cooked with Love — Order Website

## Features
- 📱 Mobile-friendly ordering page
- 🛵 Delivery option (+₹20 charge) or self pickup
- 📦 Customer fills name, phone, block & floor
- 🔐 Admin portal to manage orders & menu
- ✏️ Toggle items on/off, update prices anytime

---

## How to Deploy on Vercel

### Step 1 — Push to GitHub
1. Create a new repo on [github.com](https://github.com)
2. Run these commands in your terminal:
```bash
cd madhus-kitchen
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/madhus-kitchen.git
git push -u origin main
```

### Step 2 — Deploy on Vercel
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New Project"**
3. Import your GitHub repo
4. Click **Deploy** — Vercel auto-detects Next.js!

### Step 3 — Add your custom domain
1. In Vercel, go to your project → **Settings → Domains**
2. Add `madhuskitchen.com`
3. Go to your domain registrar (GoDaddy, Namecheap, etc.)
4. Point your DNS to Vercel's nameservers (Vercel will show you exactly what to enter)

---

## Admin Portal

Visit: `https://madhuskitchen.com/admin`

**Default password:** `madhu2024`

⚠️ **Change the password** before going live!
Open `src/pages/admin.js` and change line:
```js
const ADMIN_PASSWORD = 'madhu2024'; // ← Change this!
```

### What you can do in Admin:
- View all incoming orders in real time
- Update order status: Pending → Preparing → Ready → Delivered
- Toggle menu items on/off (hide items that are sold out)
- Update prices instantly

---

## Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

Admin: [http://localhost:3000/admin](http://localhost:3000/admin)
