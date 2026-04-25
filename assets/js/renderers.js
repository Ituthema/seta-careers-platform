window.CP_RENDER = {
  routeBaseForCategory(category){
    const map = { learnership:'learnerships', internship:'internships', bursary:'bursaries', apprenticeship:'apprenticeships' };
    return map[category] || 'opportunities';
  },
  cardTemplate(path, data){
    let html = path;
    Object.entries(data).forEach(([key, value]) => { html = html.replaceAll(`{{${key}}}`, value); });
    return html;
  },
  opportunityCard(item, base){
    const routeBase = base || window.CP_RENDER.routeBaseForCategory(item.category);
    const verifiedText = item.verified ? "Verified" : "Needs review";
    const verifiedClass = item.verified ? "good" : "warn";
    const days = window.CP_UTIL.daysUntil(item.closing_date);
    const closeLabel = days === null ? "—" : (days < 0 ? "Closed" : `${days} day${days === 1 ? "" : "s"} left`);
    return `
      <article class="card opportunity-card">
        <div class="card-top">
          <span class="pill">${window.CP_UTIL.escapeHTML(item.category)}</span>
          <span class="pill ${verifiedClass}">${verifiedText}</span>
        </div>
        <h3><a href="/${routeBase}/${item.slug}/">${window.CP_UTIL.escapeHTML(item.title)}</a></h3>
        <p class="muted">${window.CP_UTIL.escapeHTML(item.province)} • ${window.CP_UTIL.escapeHTML(item.sector)}</p>
        <p>${window.CP_UTIL.escapeHTML(item.description)}</p>
        <div class="meta-row">
          <strong>Closing:</strong> ${window.CP_UTIL.formatDate(item.closing_date)} <span class="muted small">(${closeLabel})</span>
        </div>
        <a class="btn btn-secondary" href="/${routeBase}/${item.slug}/">View details</a>
      </article>
    `;
  },
  guideCard(item){
    return `
      <article class="card guide-card">
        <span class="pill pill-guide">${window.CP_UTIL.escapeHTML(item.category)}</span>
        <h3><a href="/${item.category}/${item.slug}/">${window.CP_UTIL.escapeHTML(item.title)}</a></h3>
        <p>${window.CP_UTIL.escapeHTML(item.intro)}</p>
      </article>
    `;
  },
  categoryCard(item){
    return `
      <article class="card category-card">
        <h3><a href="/${item.slug}/">${window.CP_UTIL.escapeHTML(item.name)}</a></h3>
        <p>${window.CP_UTIL.escapeHTML(item.description)}</p>
        <a class="btn btn-secondary" href="/${item.slug}/">Explore</a>
      </article>
    `;
  },
  detailOpportunity(item){
    return `
      <div class="detail-layout">
        <section class="card detail-box">
          <div class="card-top">
            <span class="pill">${window.CP_UTIL.escapeHTML(item.category)}</span>
            <span class="pill ${item.verified ? 'good' : 'warn'}">${item.verified ? 'Verified' : 'Needs review'}</span>
          </div>
          <h1>${window.CP_UTIL.escapeHTML(item.title)}</h1>
          <p class="lead">${window.CP_UTIL.escapeHTML(item.description)}</p>
          <div class="inline-stats">
            <div class="inline-stat"><strong>Province</strong><br>${window.CP_UTIL.escapeHTML(item.province)}</div>
            <div class="inline-stat"><strong>Qualification</strong><br>${window.CP_UTIL.escapeHTML(item.qualification_level)}</div>
            <div class="inline-stat"><strong>Closing</strong><br>${window.CP_UTIL.formatDate(item.closing_date)}</div>
          </div>
          <div class="divider"></div>
          <h2>Eligibility</h2>
          <ul>${(item.eligibility || []).map(v => `<li>${window.CP_UTIL.escapeHTML(v)}</li>`).join("")}</ul>
          <h2>Documents needed</h2>
          <ul>${(item.documents_needed || []).map(v => `<li>${window.CP_UTIL.escapeHTML(v)}</li>`).join("")}</ul>
          <h2>Benefits</h2>
          <p>${window.CP_UTIL.escapeHTML(item.benefits || "—")}</p>
          <h2>How to apply</h2>
          <p><a class="btn btn-primary" href="${window.CP_UTIL.escapeHTML(item.application_url)}" target="_blank" rel="noopener">Apply now</a></p>
          <div class="divider"></div>
          <p class="small muted"><strong>Source:</strong> <a href="${window.CP_UTIL.escapeHTML(item.source_url)}" target="_blank" rel="noopener">${window.CP_UTIL.escapeHTML(item.source_name)}</a></p>
          <p class="small muted">Last updated: ${window.CP_UTIL.formatDate(item.updated_date)}</p>
        </section>
        <aside class="grid" style="gap:18px">
          <section class="card">
            <h3>Quick facts</h3>
            <p><strong>Sector:</strong> ${window.CP_UTIL.escapeHTML(item.sector)}</p>
            <p><strong>Location:</strong> ${window.CP_UTIL.escapeHTML(item.location)}</p>
            <p><strong>Stipend:</strong> ${window.CP_UTIL.escapeHTML(item.stipend)}</p>
          </section>
          <section class="card">
            <h3>Related actions</h3>
            <p>Use the filters to compare similar opportunities and review the deadline calendar.</p>
            <p><a class="btn btn-secondary" href="/calendar/">Open calendar</a></p>
          </section>
        </aside>
      </div>
    `;
  },
  detailGuide(item){
    return `
      <article class="card detail-box">
        <span class="pill pill-guide">${window.CP_UTIL.escapeHTML(item.category)}</span>
        <h1>${window.CP_UTIL.escapeHTML(item.title)}</h1>
        <p class="lead">${window.CP_UTIL.escapeHTML(item.intro)}</p>
        ${item.body_sections.map(s => `
          <h2>${window.CP_UTIL.escapeHTML(s.heading)}</h2>
          <p>${window.CP_UTIL.escapeHTML(s.content)}</p>
        `).join("")}
        <h2>FAQ</h2>
        ${item.faq.map(q => `
          <div class="card" style="margin:12px 0">
            <h3>${window.CP_UTIL.escapeHTML(q.question)}</h3>
            <p>${window.CP_UTIL.escapeHTML(q.answer)}</p>
          </div>
        `).join("")}
      </article>
    `;
  },
  toolPage(item, opportunities){
    const shortlist = opportunities.slice(0, 5);
    return `
      <div class="detail-layout">
        <section class="card detail-box">
          <span class="pill">Tool</span>
          <h1>${window.CP_UTIL.escapeHTML(item.title)}</h1>
          <p class="lead">${window.CP_UTIL.escapeHTML(item.description)}</p>
          <h2>How it works</h2>
          <ol>${(item.instructions || []).map(v => `<li>${window.CP_UTIL.escapeHTML(v)}</li>`).join("")}</ol>
          <h2>Inputs</h2>
          <ul>${(item.inputs || []).map(v => `<li>${window.CP_UTIL.escapeHTML(v)}</li>`).join("")}</ul>
          <h2>Outputs</h2>
          <ul>${(item.outputs || []).map(v => `<li>${window.CP_UTIL.escapeHTML(v)}</li>`).join("")}</ul>
          <div class="divider"></div>
          <h2>Recommended opportunities</h2>
          <div class="grid grid-2">${shortlist.map(i => window.CP_RENDER.opportunityCard(i)).join("")}</div>
        </section>
        <aside class="card">
          <h3>Tool notes</h3>
          <p>This starter project is designed to support a decision engine, not a simple blog.</p>
        </aside>
      </div>
    `;
  },
  homePage({ opportunities, guides, categories, tools }){
    const featured = opportunities.filter(o => o.featured).slice(0, 3);
    const latest = [...opportunities].sort(window.CP_UTIL.byUpdatedDesc).slice(0, 6);
    const latestGuides = [...guides].slice(0, 4);
    return `
      <section class="hero">
        <div class="hero-grid wrap">
          <div>
            <span class="kicker">South Africa-only career opportunity platform</span>
            <h1>Find, filter, and track learnerships, bursaries, internships, and apprenticeships.</h1>
            <p class="lead">A content-rich authority site with structured opportunity pages, deadline tracking, and practical career guidance.</p>
            <div style="margin:18px 0">${window.CP_RENDER.searchBar()}</div>
            <div class="inline-stats">
              <div class="inline-stat">Searchable directory</div>
              <div class="inline-stat">Deadline calendar</div>
              <div class="inline-stat">Filters by province</div>
            </div>
          </div>
          <div class="card">
            <h3>Quick filters</h3>
            ${window.CP_RENDER.filterPanel()}
          </div>
        </div>
      </section>
      <section class="section wrap">
        <div class="section-head"><div><h2>Explore categories</h2><p>Start with the route that matches your goal.</p></div></div>
        <div class="grid grid-4">${categories.map(window.CP_RENDER.categoryCard).join("")}</div>
      </section>
      <section class="section wrap">
        <div class="section-head"><div><h2>Featured opportunities</h2><p>High-priority listings surfaced first.</p></div></div>
        <div class="grid grid-3">${featured.map(i => window.CP_RENDER.opportunityCard(i, 'opportunities')).join("")}</div>
      </section>
      <section class="section wrap">${window.CP_RENDER.adSlot()}</section>
      <section class="section wrap">
        <div class="section-head"><div><h2>Latest opportunities</h2><p>Newest updates and closing dates.</p></div></div>
        <div class="grid grid-3" id="latestList">${latest.map(i => window.CP_RENDER.opportunityCard(i, 'opportunities')).join("")}</div>
      </section>
      <section class="section wrap">
        <div class="section-head"><div><h2>Tools</h2><p>Utility features that make the site more than a publishing feed.</p></div></div>
        <div class="grid grid-3">${tools.map(t => `<article class="card"><h3><a href="/tools/${t.slug}/">${window.CP_UTIL.escapeHTML(t.title)}</a></h3><p>${window.CP_UTIL.escapeHTML(t.description)}</p><a class="btn btn-secondary" href="/tools/${t.slug}/">Open tool</a></article>`).join("")}</div>
      </section>
      <section class="section wrap">
        <div class="section-head"><div><h2>Latest guides</h2><p>Authority content that supports the directory.</p></div></div>
        <div class="grid grid-2">${latestGuides.map(window.CP_RENDER.guideCard).join("")}</div>
      </section>
      <section class="section wrap"><div class="card"><h2>Trust layer</h2><p>Use source links, verification labels, and clear disclaimers on every opportunity page.</p></div></section>
    `;
  },
  searchBar(){
    return `<div class="search-panel"><input id="searchInput" type="search" placeholder="Search opportunities, guides, sectors..." /><button id="searchBtn" class="btn btn-primary">Search</button></div>`;
  },
  filterPanel(){
    const provinces = window.CP_DATA.provinces || [];
    return `
      <div class="filter-panel">
        <select id="categoryFilter">
          <option value="">All categories</option>
          <option value="learnership">Learnerships</option>
          <option value="internship">Internships</option>
          <option value="bursary">Bursaries</option>
          <option value="apprenticeship">Apprenticeships</option>
        </select>
        <select id="provinceFilter">
          <option value="">All provinces</option>
          ${provinces.map(p => `<option value="${window.CP_UTIL.escapeHTML(p)}">${window.CP_UTIL.escapeHTML(p)}</option>`).join("")}
        </select>
        <select id="qualificationFilter">
          <option value="">All qualification levels</option>
          <option value="Matric">Matric</option>
          <option value="TVET">TVET</option>
          <option value="Diploma / Degree">Diploma / Degree</option>
          <option value="Matric / University">Matric / University</option>
        </select>
        <select id="verifiedFilter">
          <option value="">Verified and unverified</option>
          <option value="true">Verified only</option>
          <option value="false">Unverified only</option>
        </select>
        <select id="sortFilter">
          <option value="updated_desc">Newest first</option>
          <option value="deadline_asc">Closing soon</option>
          <option value="title_asc">Title A-Z</option>
        </select>
      </div>
    `;
  },
  adSlot(){ return `<div class="ad-slot"><span>Ad slot</span></div>`; },
  directoryPage({ title, intro, opportunities, prefilter }){
    const list = prefilter ? opportunities.filter(o => o.category === prefilter) : opportunities;
    const results = window.CP_FILTERS.filterOpportunities(list, window.CP_STATE);
    return `
      <section class="page wrap">
        <div class="breadcrumb"><a href="/">Home</a><span>/</span><span>${window.CP_UTIL.escapeHTML(title)}</span></div>
        <div class="section-head"><div><h1>${window.CP_UTIL.escapeHTML(title)}</h1><p>${window.CP_UTIL.escapeHTML(intro)}</p></div></div>
        ${window.CP_RENDER.searchBar()}
        <div style="margin:16px 0">${window.CP_RENDER.filterPanel()}</div>
        <div class="listing-toolbar"><div class="results-info">${results.length} opportunity${results.length === 1 ? "" : "s"} found</div><div class="results-info">Path: ${window.CP_UTIL.escapeHTML(location.pathname)}</div></div>
        <div class="grid grid-3" id="resultsGrid">${results.map(i => window.CP_RENDER.opportunityCard(i, 'opportunities')).join("") || '<div class="card">No matches found. Try removing a filter.</div>'}</div>
        <div class="section">${window.CP_RENDER.adSlot()}</div>
      </section>
    `;
  },
  categoryPage({ title, intro, items }){
    return `
      <section class="page wrap">
        <div class="breadcrumb"><a href="/">Home</a><span>/</span><span>${window.CP_UTIL.escapeHTML(title)}</span></div>
        <h1>${window.CP_UTIL.escapeHTML(title)}</h1>
        <p class="lead">${window.CP_UTIL.escapeHTML(intro)}</p>
        <div class="grid grid-3">${items.map(i => window.CP_RENDER.opportunityCard(i, window.CP_RENDER.routeBaseForCategory(i.category))).join("") || '<div class="card">No items yet.</div>'}</div>
      </section>
    `;
  },
  calendarPage(opportunities){
    const sorted = [...opportunities].sort(window.CP_UTIL.byClosingSoon);
    return `
      <section class="page wrap">
        <div class="breadcrumb"><a href="/">Home</a><span>/</span><span>Calendar</span></div>
        <h1>Deadline Calendar</h1>
        <p class="lead">Track upcoming closing dates across the opportunity directory.</p>
        <div class="grid grid-3">${sorted.slice(0, 9).map(item => `<article class="card"><span class="pill">${window.CP_UTIL.escapeHTML(item.category)}</span><h3><a href="/${window.CP_RENDER.routeBaseForCategory(item.category)}/${item.slug}/">${window.CP_UTIL.escapeHTML(item.title)}</a></h3><p><strong>Closes:</strong> ${window.CP_UTIL.formatDate(item.closing_date)}</p></article>`).join("")}</div>
      </section>
    `;
  }
};
