#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# OpportunitiesZA — Termux Deploy & Maintenance Script
# Save as: deploy.sh
# Make executable: chmod +x deploy.sh
# Run: ./deploy.sh
# ═══════════════════════════════════════════════════════════════

# ── CONFIG ────────────────────────────────────────────────────
PROJECT_DIR="/storage/emulated/0/Download/opportunitiesza"
REPO_URL="https://github.com/Ituthema/seta-careers-platform.git"
BRANCH="main"

# Colors
GREEN="\033[0;32m"
AMBER="\033[0;33m"
RED="\033[0;31m"
CYAN="\033[0;36m"
WHITE="\033[1;37m"
RESET="\033[0m"

# ── HEADER ────────────────────────────────────────────────────
clear
echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════════╗${RESET}"
echo -e "${GREEN}║${WHITE}  🧭 OpportunitiesZA — Deploy & Maintenance Script  ${GREEN}  ║${RESET}"
echo -e "${GREEN}║${AMBER}     South Africa's Career Opportunity Platform       ${GREEN}  ║${RESET}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════╝${RESET}"
echo ""

# ── CHECK PROJECT DIR ─────────────────────────────────────────
if [ ! -d "$PROJECT_DIR" ]; then
  echo -e "${RED}❌ Project directory not found: $PROJECT_DIR${RESET}"
  echo -e "${AMBER}   Edit PROJECT_DIR at the top of this script.${RESET}"
  exit 1
fi

cd "$PROJECT_DIR" || exit 1
echo -e "${CYAN}📁 Working directory: $PROJECT_DIR${RESET}"
echo ""

# ── MAIN MENU ─────────────────────────────────────────────────
echo -e "${WHITE}What would you like to do?${RESET}"
echo ""
echo "  1) 🚀 Quick publish (add all, commit, push)"
echo "  2) 📝 Add new opportunity (guided)"
echo "  3) ✅ Validate JSON files"
echo "  4) 🗑️  Mark opportunity as expired"
echo "  5) 🗺️  Regenerate sitemap.xml"
echo "  6) 📊 Show project stats"
echo "  7) 🔄 Pull latest from GitHub"
echo "  8) 🏗️  Initial setup (first time)"
echo "  9) ❌ Exit"
echo ""
read -r -p "Enter choice [1-9]: " choice

echo ""

case $choice in

# ── 1. QUICK PUBLISH ─────────────────────────────────────────
1)
  echo -e "${CYAN}🚀 Quick Publish${RESET}"
  echo ""

  # Show what will be committed
  echo -e "${AMBER}Changes to commit:${RESET}"
  git status --short
  echo ""

  if [ -z "$(git status --porcelain)" ]; then
    echo -e "${AMBER}ℹ️  Nothing to commit — working tree is clean.${RESET}"
    exit 0
  fi

  # Validate JSON before pushing
  echo -e "${CYAN}Validating JSON files...${RESET}"
  for f in data/*.json; do
    if python3 -m json.tool "$f" > /dev/null 2>&1; then
      echo -e "  ${GREEN}✅ $f — valid${RESET}"
    else
      echo -e "  ${RED}❌ $f — INVALID JSON! Fix this before pushing.${RESET}"
      python3 -m json.tool "$f"
      exit 1
    fi
  done
  echo ""

  # Commit message
  read -r -p "Commit message (or press Enter for auto): " msg
  if [ -z "$msg" ]; then
    msg="Content update $(date '+%Y-%m-%d %H:%M')"
  fi

  git add .
  git commit -m "$msg"

  echo ""
  echo -e "${CYAN}Pushing to GitHub...${RESET}"
  if git push origin "$BRANCH"; then
    echo ""
    echo -e "${GREEN}✅ Pushed successfully!${RESET}"
    echo -e "${CYAN}   Site updates in 1–5 minutes.${RESET}"
    echo -e "${CYAN}   Check: https://github.com/Ituthema/seta-careers-platform/actions${RESET}"
  else
    echo -e "${RED}❌ Push failed. Check your internet connection or GitHub credentials.${RESET}"
    exit 1
  fi
  ;;

# ── 2. ADD NEW OPPORTUNITY ────────────────────────────────────
2)
  echo -e "${CYAN}📝 Add New Opportunity${RESET}"
  echo ""

  DATA_FILE="data/opportunities.json"

  if [ ! -f "$DATA_FILE" ]; then
    echo -e "${RED}❌ $DATA_FILE not found.${RESET}"
    exit 1
  fi

  # Gather details
  read -r -p "Title:              " title
  echo "Category (learnership/internship/bursary/apprenticeship):"
  read -r -p "Category:           " cat
  echo "Province (Nationwide/Gauteng/Western Cape/KwaZulu-Natal/Eastern Cape/Limpopo/Mpumalanga/North West/Free State/Northern Cape):"
  read -r -p "Province:           " prov
  read -r -p "Qualification (Matric/Diploma/Degree): " qual
  read -r -p "Stipend:            " stipend
  read -r -p "Closing date (YYYY-MM-DD): " close
  read -r -p "Application URL:    " url
  read -r -p "Source name:        " srcname
  read -r -p "Source URL:         " srcurl
  read -r -p "Description (1-2 sentences): " desc
  read -r -p "Tags (comma-separated, e.g. matric,gauteng): " tags
  read -r -p "Verified? (y/n):    " verif

  # Build ID from timestamp
  id=$(date +%s)
  today=$(date '+%Y-%m-%d')

  # Build slug from title
  slug=$(echo "$title" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9 ]//g' | sed 's/ \+/-/g' | sed 's/-\+/-/g' | sed 's/^-//;s/-$//')

  verified="true"
  [ "$verif" = "n" ] && verified="false"

  # Build JSON record
  record=$(cat <<EOF
{
  "id": "$id",
  "slug": "$slug",
  "title": "$title",
  "category": "$cat",
  "province": "$prov",
  "qualification_level": "$qual",
  "stipend": "$stipend",
  "closing_date": "$close",
  "application_url": "$url",
  "source_name": "$srcname",
  "source_url": "$srcurl",
  "verified": $verified,
  "featured": false,
  "expired": false,
  "description": "$desc",
  "eligibility": ["South African citizen", "Valid ID", "$qual certificate"],
  "documents_needed": ["Certified ID", "Certified $qual certificate", "CV", "Motivational letter"],
  "tags": [$(echo "$tags" | sed 's/,/","/g' | sed 's/^/"/' | sed 's/$/"/')],
  "posted_date": "$today",
  "updated_date": "$today"
}
EOF
)

  echo ""
  echo -e "${AMBER}Record to be added:${RESET}"
  echo "$record"
  echo ""
  read -r -p "Add this to $DATA_FILE? (y/n): " confirm

  if [ "$confirm" = "y" ]; then
    # Insert after the opening bracket of the JSON array
    tmp=$(mktemp)
    python3 -c "
import json, sys

with open('$DATA_FILE', 'r') as f:
    data = json.load(f)

new_record = json.loads('''$record''')
data.insert(0, new_record)

with open('$DATA_FILE', 'w') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)
print('✅ Record added successfully.')
"
    if [ $? -eq 0 ]; then
      echo ""
      echo -e "${GREEN}✅ Opportunity added to $DATA_FILE${RESET}"
      read -r -p "Push to GitHub now? (y/n): " dopush
      if [ "$dopush" = "y" ]; then
        git add "$DATA_FILE"
        git commit -m "Add opportunity: $title (closes $close)"
        git push origin "$BRANCH"
        echo -e "${GREEN}✅ Pushed!${RESET}"
      fi
    fi
  else
    echo -e "${AMBER}Cancelled — nothing was changed.${RESET}"
  fi
  ;;

# ── 3. VALIDATE JSON ─────────────────────────────────────────
3)
  echo -e "${CYAN}✅ Validating all JSON data files...${RESET}"
  echo ""
  errors=0
  for f in data/*.json; do
    if [ -f "$f" ]; then
      if python3 -m json.tool "$f" > /dev/null 2>&1; then
        count=$(python3 -c "import json; d=json.load(open('$f')); print(len(d) if isinstance(d,list) else 'object')")
        echo -e "  ${GREEN}✅ $f — valid ($count records)${RESET}"
      else
        echo -e "  ${RED}❌ $f — INVALID JSON${RESET}"
        echo -e "  ${AMBER}Error details:${RESET}"
        python3 -m json.tool "$f" 2>&1 | head -5
        errors=$((errors + 1))
      fi
    fi
  done
  echo ""
  if [ $errors -eq 0 ]; then
    echo -e "${GREEN}✅ All JSON files are valid!${RESET}"
  else
    echo -e "${RED}❌ $errors file(s) have errors. Fix them before pushing.${RESET}"
  fi
  ;;

# ── 4. MARK EXPIRED ──────────────────────────────────────────
4)
  echo -e "${CYAN}🗑️  Mark Opportunity as Expired${RESET}"
  echo ""
  echo -e "${AMBER}Current live opportunities:${RESET}"
  python3 -c "
import json
from datetime import date
with open('data/opportunities.json') as f:
    opps = json.load(f)
live = [o for o in opps if not o.get('expired', False)]
for i, o in enumerate(live):
    closing = o.get('closing_date','')
    try:
        days = (date.fromisoformat(closing) - date.today()).days
        status = f'{days}d left' if days >= 0 else 'OVERDUE'
    except:
        status = 'unknown'
    print(f'  [{i+1}] {o[\"title\"]} ({status})')
"
  echo ""
  read -r -p "Enter number to mark as expired (or 0 to cancel): " num

  if [ "$num" -gt 0 ] 2>/dev/null; then
    python3 -c "
import json
with open('data/opportunities.json') as f:
    opps = json.load(f)
live = [o for o in opps if not o.get('expired', False)]
idx = $num - 1
if 0 <= idx < len(live):
    slug = live[idx]['slug']
    title = live[idx]['title']
    for o in opps:
        if o.get('slug') == slug:
            o['expired'] = True
            print(f'Marked as expired: {title}')
    with open('data/opportunities.json', 'w') as f:
        json.dump(opps, f, indent=2, ensure_ascii=False)
else:
    print('Invalid selection.')
"
    read -r -p "Push change to GitHub? (y/n): " dopush
    if [ "$dopush" = "y" ]; then
      git add data/opportunities.json
      git commit -m "Archive expired opportunity"
      git push origin "$BRANCH"
      echo -e "${GREEN}✅ Pushed!${RESET}"
    fi
  else
    echo -e "${AMBER}Cancelled.${RESET}"
  fi
  ;;

# ── 5. REGENERATE SITEMAP ─────────────────────────────────────
5)
  echo -e "${CYAN}🗺️  Regenerating sitemap.xml...${RESET}"
  if command -v node &>/dev/null; then
    node sitemap-generator.js
    read -r -p "Push sitemap to GitHub? (y/n): " dopush
    if [ "$dopush" = "y" ]; then
      git add sitemap.xml
      git commit -m "Update sitemap $(date '+%Y-%m-%d')"
      git push origin "$BRANCH"
      echo -e "${GREEN}✅ Sitemap pushed!${RESET}"
    fi
  else
    echo -e "${RED}❌ Node.js not installed. Run: pkg install nodejs${RESET}"
  fi
  ;;

# ── 6. PROJECT STATS ──────────────────────────────────────────
6)
  echo -e "${CYAN}📊 Project Statistics${RESET}"
  echo ""
  python3 -c "
import json
from datetime import date

try:
    with open('data/opportunities.json') as f:
        opps = json.load(f)
    live = [o for o in opps if not o.get('expired', False)]
    expired = [o for o in opps if o.get('expired', False)]
    closing_soon = [o for o in live if o.get('closing_date') and (date.fromisoformat(o['closing_date']) - date.today()).days <= 30]
    by_cat = {}
    for o in live:
        c = o.get('category', 'unknown')
        by_cat[c] = by_cat.get(c, 0) + 1
    print(f'  Total opportunities:  {len(opps)}')
    print(f'  Live (open):          {len(live)}')
    print(f'  Expired:              {len(expired)}')
    print(f'  Closing this month:   {len(closing_soon)}')
    print(f'  Verified:             {sum(1 for o in live if o.get(\"verified\"))}')
    print()
    print('  By category:')
    for cat, count in sorted(by_cat.items()):
        print(f'    {cat}: {count}')
except Exception as e:
    print(f'Error reading opportunities.json: {e}')

print()
try:
    with open('data/guides.json') as f:
        guides = json.load(f)
    print(f'  Guide articles:       {len(guides)}')
except:
    print('  Guide articles:       (guides.json not found)')
"
  echo ""
  echo -e "  Git status:"
  git log --oneline -5 | sed 's/^/    /'
  ;;

# ── 7. PULL LATEST ────────────────────────────────────────────
7)
  echo -e "${CYAN}🔄 Pulling latest changes from GitHub...${RESET}"
  git fetch origin
  git pull origin "$BRANCH"
  echo -e "${GREEN}✅ Up to date with GitHub.${RESET}"
  ;;

# ── 8. INITIAL SETUP ─────────────────────────────────────────
8)
  echo -e "${CYAN}🏗️  Initial Setup${RESET}"
  echo ""
  echo "This will initialize the git repository and make the first push."
  echo ""

  # Check if git already initialized
  if [ -d ".git" ]; then
    echo -e "${AMBER}⚠️  Git already initialized in this directory.${RESET}"
    read -r -p "Re-initialize? This will reset git history. (y/n): " reinit
    if [ "$reinit" != "y" ]; then
      echo "Cancelled."
      exit 0
    fi
    rm -rf .git
  fi

  # Fix Termux safe directory
  git config --global --add safe.directory "$PROJECT_DIR"

  git init
  git add .
  git commit -m "Initial deployment — OpportunitiesZA $(date '+%Y-%m-%d')"
  git branch -M main

  echo ""
  echo -e "${AMBER}Enter your GitHub repository URL:${RESET}"
  read -r -p "URL: " repo_url
  git remote add origin "$repo_url"

  echo ""
  echo -e "${CYAN}Pushing to GitHub...${RESET}"
  echo -e "${AMBER}You'll be prompted for your GitHub username and Personal Access Token.${RESET}"
  git push -u origin main

  echo ""
  echo -e "${GREEN}✅ Initial push complete!${RESET}"
  echo -e "${CYAN}   Enable GitHub Pages: Repository → Settings → Pages → main branch${RESET}"
  ;;

# ── 9. EXIT ──────────────────────────────────────────────────
9)
  echo -e "${AMBER}Goodbye! 🧭${RESET}"
  exit 0
  ;;

*)
  echo -e "${RED}❌ Invalid choice. Run the script again.${RESET}"
  exit 1
  ;;
esac

echo ""
echo -e "${GREEN}═══════════════════════════════════════════${RESET}"
echo -e "${GREEN}  Done — OpportunitiesZA Deploy Script      ${RESET}"
echo -e "${GREEN}═══════════════════════════════════════════${RESET}"
echo ""
