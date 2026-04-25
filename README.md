# Career Opportunity SA Starter Project

This starter project is a vanilla HTML/CSS/JS site for a South Africa-only career opportunity platform.

## Features
- Clean static folder structure
- Reusable HTML partials
- Sample JSON content
- Responsive styling
- Search and filters
- Homepage, listing, detail, calendar, and tools templates
- Clean route support for:
  - /opportunities/{slug}
  - /learnerships/{slug}
  - /internships/{slug}
  - /bursaries/{slug}
  - /apprenticeships/{slug}
  - /seta-guides/{slug}
  - /career-advice/{slug}
  - /tvet-pathways/{slug}
  - /tools/{tool-name}

## Important routing note
Because this is a static starter project, clean URLs require either:
1. a hosting rewrite rule that sends unknown paths to `404.html` or `index.html`, or
2. a small server rewrite configuration.

The app router reads `window.location.pathname` and renders the matching content.

## Suggested next steps
- Replace demo data in `/data`
- Connect a CMS or backend later
- Add JSON-LD schema output
- Add email capture and alerts
- Add admin import workflow
