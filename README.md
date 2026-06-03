# 🧭 OpportunitiesZA — Complete Deployment Guide

South Africa's career opportunity intelligence platform for learnerships, bursaries, internships, and apprenticeships.

**Live site:** https://opportunitiesza.co.za  
**Repository:** https://github.com/Ituthema/seta-careers-platform1  
**Stack:** Vanilla HTML / CSS / JS · GitHub Pages · Zero build step  

---

## 📁 Project Structure

```
/opportunitiesza/
│
├── index.html              ← Main SPA (the entire website)
├── 404.html                ← GitHub Pages SPA routing fallback
├── robots.txt              ← SEO crawl directives
├── sitemap.xml             ← Auto-generated (run sitemap-generator.js)
├── sitemap-generator.js    ← Node script to regenerate sitemap
├── validate-content.js      ← Checks data, index loader, and sitemap slugs
├── CNAME                   ← Custom domain (create after buying domain)
├── README.md               ← This file
│
├── /data/
│   ├── opportunities.json  ← All opportunity records
│   ├── guides.json         ← All guide articles
│   ├── categories.json     ← Category metadata
│   └── provinces.json      ← Province list
│
└── /assets/
    ├── /images/            ← OG images, icons
    └── og-default.jpg      ← 1200×630 social share image
```

---

## 🚀 Initial Deployment (GitHub Pages)

### Prerequisites (Termux)
```bash
# Install git if not already installed
pkg install git

# Install Node.js for the sitemap generator
pkg install nodejs

# Configure git identity
git config --global user.name "Your Name"
git config --global user.email "your@email.com"

# Fix Termux safe directory warning
git config --global --add safe.directory /storage/emulated/0/Download/opportunitiesza
```

### First Push
```bash
# Navigate to project folder
cd /storage/emulated/0/Download/opportunitiesza

# Initialise and push
rm -rf .git
git init
git add .
git commit -m "Initial deployment — OpportunitiesZA"
git branch -M main
git remote add origin https://github.com/Ituthema/seta-careers-platform1.git
git push -u origin main

# When prompted:
#   Username: ituthema
#   Password: YOUR_GITHUB_PERSONAL_ACCESS_TOKEN
#   (Not your account password — generate at github.com/settings/tokens)
```

### Enable GitHub Pages
1. Go to your repository on GitHub
2. **Settings → Pages**
3. Source: **Deploy from a branch**
4. Branch: **main**, Folder: **/ (root)**
5. Click **Save**
6. Site will be live at: `https://ituthema.github.io/seta-careers-platform1/`

---

## 🔑 Set Up SSH (Recommended — No Token Prompts)

```bash
# Generate SSH key
ssh-keygen -t ed25519 -C "your@email.com"
# Press Enter for all prompts (no passphrase needed)

# View and copy your public key
cat ~/.ssh/id_ed25519.pub

# Add to GitHub:
# github.com → Settings → SSH and GPG Keys → New SSH Key
# Paste the public key, save

# Switch your remote to SSH
git remote set-url origin git@github.com:Ituthema/seta-careers-platform1.git

# Test connection
ssh -T git@github.com
# Should see: "Hi Ituthema! You've successfully authenticated."

# From now on, push with no prompts:
git push
```

---

## 🌐 Custom Domain Setup

### Step 1 — Buy Your Domain
Recommended SA registrars (cheapest to most features):
- **Hetzner.co.za** — ~R99/year for .co.za
- **Afrihost.com** — ~R150/year, good DNS management
- **Domains.co.za** — ~R129/year

Recommended names:
- `opportunitiesza.co.za`
- `setacareershub.co.za`
- `careerssouthafrica.co.za`

### Step 2 — Create CNAME File
```bash
# In your project root
echo "opportunitiesza.co.za" > CNAME
git add CNAME
git commit -m "Add custom domain CNAME"
git push
```

### Step 3 — Set DNS Records at Your Registrar
In your registrar's DNS management panel, add these records:

| Type  | Host | Value                |
|-------|------|----------------------|
| A     | @    | 185.199.108.153      |
| A     | @    | 185.199.109.153      |
| A     | @    | 185.199.110.153      |
| A     | @    | 185.199.111.153      |
| CNAME | www  | ituthema.github.io   |

### Step 4 — Configure in GitHub Pages
1. Settings → Pages → Custom domain
2. Enter: `opportunitiesza.co.za`
3. Click Save, wait for DNS check ✓
4. **Enable "Enforce HTTPS"** once verified

DNS propagation takes 15 minutes to 48 hours.

---

## 📝 Daily Content Workflow

### Add New Opportunity (Termux)
```bash
cd /storage/emulated/0/Download/opportunitiesza

# Edit the opportunities data file
nano data/opportunities.json

# Add new record at the TOP of the array using this template:
# {
#   "id": "023",
#   "slug": "company-type-2026",
#   "title": "Company Name Learnership 2026",
#   "category": "learnership",
#   "sector": "MICT SETA",
#   "province": "Gauteng",
#   "qualification_level": "Matric",
#   "stipend": "R4 000/month",
#   "closing_date": "2026-09-30",
#   "application_url": "https://company.co.za/careers",
#   "source_name": "Company Official Website",
#   "source_url": "https://company.co.za/careers",
#   "verified": true,
#   "featured": false,
#   "expired": false,
#   "description": "...",
#   "eligibility": ["..."],
#   "documents_needed": ["..."],
#   "tags": ["matric", "gauteng"],
#   "posted_date": "2026-05-01",
#   "updated_date": "2026-05-01"
# }

# Validate JSON before pushing
python3 -m json.tool data/opportunities.json > /dev/null && echo "✅ Valid JSON" || echo "❌ JSON Error — fix before pushing"

# Validate that index.html loads /data/ and live opportunity slugs match sitemap.xml
node validate-content.js

# Push live
git add data/opportunities.json
git commit -m "Add [Company] [type] - closing [date]"
git push
```

### Regenerate Sitemap After Publishing
`data/` is the canonical content source. After editing opportunities or guides, regenerate the sitemap from the JSON files and run the slug agreement check before publishing.

```bash
node sitemap-generator.js
node validate-content.js
git add sitemap.xml
git commit -m "Update sitemap"
git push
```

### Nano Quick Reference (Termux Editor)
| Keys | Action |
|------|--------|
| `CTRL + O` | Save file |
| `CTRL + X` | Exit |
| `CTRL + K` | Cut line |
| `CTRL + U` | Paste line |
| `CTRL + W` | Search |
| `ALT + /`  | Jump to end |

### One-Command Publish Alias
Add to `~/.bashrc` for a single-command publish:
```bash
echo "alias publish='cd /storage/emulated/0/Download/opportunitiesza && git add . && git commit -m \"Content update \$(date +%Y-%m-%d)\" && git push'" >> ~/.bashrc
source ~/.bashrc

# Then use:
publish
```

---

## 🔍 Google Search Console Setup

### Add Property
1. Go to [search.google.com/search-console](https://search.google.com/search-console)
2. Add property → **URL prefix**
3. Enter: `https://opportunitiesza.co.za` (your custom domain)

### Verify Ownership
```bash
# Download the HTML verification file from GSC
# Place it in your project root
cp ~/Downloads/google[XXXXX].html /storage/emulated/0/Download/opportunitiesza/
git add google[XXXXX].html
git commit -m "Add GSC verification"
git push
# Then click Verify in GSC
```

### Submit Sitemap
1. GSC → Sitemaps → Add a new sitemap
2. Enter: `sitemap.xml`
3. Click Submit

### Request Indexing for New Pages
After publishing important new pages:
1. GSC → URL Inspection
2. Paste the URL
3. Click **Request Indexing**

Do this for: homepage, all category pages, and first 10 opportunity pages in week 1.

---

## 📊 Google Analytics 4 Setup

1. Create a GA4 property at [analytics.google.com](https://analytics.google.com)
2. Get your Measurement ID (format: `G-XXXXXXXXXX`)
3. Add to `index.html` inside `<head>`:

```html
<!-- Google Analytics 4 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){ dataLayer.push(arguments); }
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

---

## 💰 Google AdSense Setup

### Requirements Before Applying
- Minimum 15–20 original published articles/guides
- Working About page and Privacy Policy page
- Site live for at least 2–4 weeks
- No copied content — all original

### Apply
1. Go to [adsense.google.com](https://adsense.google.com)
2. Add your site URL
3. Add the AdSense script to `<head>` of `index.html`:
```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXX" crossorigin="anonymous"></script>
```
4. Wait for approval (1–7 days typically)

---

## 🗑️ Mark Expired Opportunities

Opportunities past their closing date should be marked expired (not deleted — they retain SEO value):

```bash
nano data/opportunities.json
# Find the expired opportunity and change:
#   "expired": false  →  "expired": true
# Save and push
git add data/opportunities.json
git commit -m "Archive expired: [opportunity name]"
git push
```

The website automatically filters out expired opportunities from all listings, but the URL remains live showing an "expired" notice.

---

## 📱 WhatsApp Broadcast Setup

### Phase 1 — Personal Broadcast List
1. Create a WhatsApp Broadcast List
2. Add contacts who want daily opportunity updates
3. Use the daily template from the documentation
4. Max 256 contacts per broadcast list

### Phase 2 — WhatsApp Business
1. Download WhatsApp Business app
2. Register with a dedicated phone number
3. Set up: Business name, description, website URL, hours
4. Enables catalogue and quick-reply features

### Phase 3 — WhatsApp Channel (Unlimited)
1. In WhatsApp: Updates tab → + → New Channel
2. Name it "OpportunitiesZA Daily Updates"
3. Add channel link to your website and social bios
4. No follower limit, no phone number needed from followers

---

## 📈 Monthly Checklist

### Content
- [ ] Add 5–10 new opportunity records per week
- [ ] Publish 2–3 new guide articles per week
- [ ] Mark expired opportunities (check weekly)
- [ ] Regenerate sitemap.xml after publishing

### SEO
- [ ] Check GSC for new keyword impressions
- [ ] Request indexing for new pages
- [ ] Review pages with high impressions but low CTR — rewrite meta descriptions
- [ ] Check for crawl errors in GSC Coverage report

### Distribution
- [ ] Post 1–2 TikTok/Reels videos daily
- [ ] Send 1 WhatsApp broadcast daily
- [ ] Post in 3–5 Facebook groups weekly
- [ ] Send weekly email digest (Monday)

### Technical
- [ ] Validate opportunities.json after every edit
- [ ] Run `node sitemap-generator.js` and `node validate-content.js` before publishing content changes
- [ ] Test site on mobile after any HTML changes
- [ ] Check that apply links are not broken
- [ ] Review Core Web Vitals in GSC

---

## 🐛 Troubleshooting

### Site not updating after `git push`
GitHub Pages can take 1–5 minutes. Check status at:  
`https://github.com/Ituthema/seta-careers-platform/actions`

### JSON validation error
```bash
python3 -m json.tool data/opportunities.json
# Shows exactly which line has the error
```

### Sitemap or slug validation error
```bash
node sitemap-generator.js
node validate-content.js
# Confirms live opportunity slugs in data/opportunities.json match sitemap.xml and that index.html loads /data/opportunities.json
```

Common mistakes:
- Missing comma after a field
- Trailing comma after the last item in an array
- Unescaped quotes inside strings — use `\"` instead of `"`

### Custom domain not working
1. Check DNS records are saved correctly at your registrar
2. Run: `nslookup opportunitiesza.co.za` — should show GitHub IPs
3. Wait up to 48 hours for DNS propagation
4. Ensure CNAME file exists in repo root with just your domain

### Mobile menu not closing
Hard refresh: `CTRL+SHIFT+R` in browser, or clear site data.

---

## 📞 Contacts & Resources

| Resource | URL |
|----------|-----|
| GitHub Pages docs | https://docs.github.com/en/pages |
| Google Search Console | https://search.google.com/search-console |
| Google Analytics | https://analytics.google.com |
| Google AdSense | https://adsense.google.com |
| PageSpeed Insights | https://pagespeed.web.dev |
| Rich Results Test | https://search.google.com/test/rich-results |
| CIPC (verify companies) | https://www.cipc.co.za |
| DPSA vacancies | https://www.dpsa.gov.za/dpsa2g/vacancies.asp |
| NSFAS applications | https://mynsfas.nsfas.org.za |
| myNSFAS portal | https://mynsfas.nsfas.org.za |

---

## 📄 Licence

This project is for the exclusive use of the repository owner.  
Content is original and verified against official South African government and corporate sources.  
All opportunity listings link to official sources — we are an information platform, not an employer.

---

*OpportunitiesZA · South Africa's Career Opportunity Intelligence Platform · 2026*
# seta-careers-platform1
