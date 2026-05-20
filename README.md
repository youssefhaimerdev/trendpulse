# TrendPulse — Deployment & Publishing Guide

## Stack
- Pure HTML / CSS / JS — no build step, no framework
- Hosted on **Vercel** via GitHub
- Auto-deploy on every push to `main`

---

## First-Time Deployment

### 1. Create GitHub repo
1. Go to github.com → New repository
2. Name it `trendpulse` (or whatever you prefer)
3. Set to Public
4. Don't initialize with README (you already have files)

### 2. Push all files
```bash
git init
git add .
git commit -m "Initial TrendPulse launch"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/trendpulse.git
git push -u origin main
```

### 3. Connect to Vercel
1. Go to vercel.com → Add New Project
2. Import your GitHub repo
3. Framework Preset: **Other**
4. Root Directory: `/` (default)
5. No build command needed
6. Output Directory: leave blank
7. Click Deploy

Your site is live. Every push to `main` auto-redeploys in ~30 seconds.

---

## Custom Domain
1. In Vercel → Project → Settings → Domains
2. Add your domain (e.g. `trendpulse.news`)
3. Update your domain's DNS with the records Vercel gives you
4. SSL is automatic

---

## Publishing Workflow (Daily)

When a new topic is trending, ask Claude to generate an article.
Claude will give you exactly **2 files**:

```
articles/YOUR-SLUG.html       ← new article file
data/articles.json            ← updated with new article at top
```

**Upload steps (2 minutes):**
1. Drop both files into your local repo folder (replacing articles.json)
2. `git add . && git commit -m "Article: [topic]" && git push`
3. Vercel deploys automatically — article is live in ~30 seconds

That's it. No zip files. No FTP. No build process.

---

## Configuration Checklist (do before launch)

### Google Analytics
1. Go to analytics.google.com → Create property
2. Copy your Measurement ID (looks like `G-XXXXXXXXXX`)
3. In `index.html` AND `articles/*.html`, replace `G-XXXXXXXXXX` with your ID
4. Do this once — all future articles will have GA pre-filled

### Google Search Console
1. Go to search.google.com/search-console
2. Add property → URL prefix → `https://trendpulse.news`
3. Verify via HTML tag → copy the `content` value
4. In `index.html` AND `articles/*.html`, replace `PASTE_YOUR_GSC_VERIFICATION_CODE_HERE`
5. Submit sitemap: `https://trendpulse.news/sitemap.xml`

### Google AdSense
1. Apply at adsense.google.com (need some content live first)
2. Once approved, replace ad placeholder `<div>` blocks with your `<ins>` ad units
3. Ad slots are already positioned correctly throughout the site

---

## File Structure

```
trendpulse/
├── index.html                    ← Homepage (never changes)
├── vercel.json                   ← Vercel config
├── robots.txt                    ← SEO crawl rules
├── assets/
│   ├── css/style.css             ← All styles (never changes)
│   └── js/main.js                ← All JavaScript (never changes)
├── data/
│   └── articles.json             ← Article list (updated on each publish)
└── articles/
    └── *.html                    ← Individual article files
```

---

## Article SEO Checklist (Claude handles this automatically)

Each article file includes:
- [x] Target keyword in `<title>` tag
- [x] Target keyword in `<meta name="description">`
- [x] Target keyword in H1
- [x] Answer to search query in first paragraph
- [x] Schema.org `NewsArticle` structured data
- [x] Open Graph tags for social sharing
- [x] Twitter Card tags
- [x] Canonical URL
- [x] Breadcrumb navigation
- [x] Internal links to related articles
- [x] Ad placements (leaderboard + in-article + sidebar rectangle)
- [x] GA + GSC placeholders

---

## Speed Tips

- When a topic starts trending, you have a **2-3 hour window** to rank
- Paste the trending topic to Claude → article is ready in 2 minutes → live in 5 minutes
- Google indexes new Vercel pages within hours of going live
- The more articles you publish, the faster Google trusts the domain

---

## Support
Ask Claude to generate new articles, update the homepage layout, add new categories, or fix anything.
