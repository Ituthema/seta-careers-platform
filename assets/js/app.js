(async function(){
  const headerTarget = document.getElementById('site-header');
  const footerTarget = document.getElementById('site-footer');
  const app = document.getElementById('app');

  async function includeHTML(el, url){
    if(!el) return;
    const res = await fetch(url, {cache:'no-store'});
    el.innerHTML = await res.text();
  }

  await includeHTML(headerTarget, '/components/header.html');
  await includeHTML(footerTarget, '/components/footer.html');

  const [opportunities, guides, tools, categories, provinces] = await Promise.all([
    CP_UTIL.loadJSON('/data/opportunities.json'),
    CP_UTIL.loadJSON('/data/guides.json'),
    CP_UTIL.loadJSON('/data/tools.json'),
    CP_UTIL.loadJSON('/data/categories.json'),
    CP_UTIL.loadJSON('/data/provinces.json')
  ]);

  CP_DATA.opportunities = opportunities;
  CP_DATA.guides = guides;
  CP_DATA.tools = tools;
  CP_DATA.categories = categories;
  CP_DATA.provinces = provinces;

  const route = CP_ROUTER.parsePath(location.pathname);
  const section = route.section;
  const slug = route.slug;

  function setMeta(title, description, canonical){
    document.title = title;
    let desc = document.querySelector('meta[name="description"]');
    if(!desc){ desc = document.createElement('meta'); desc.name='description'; document.head.appendChild(desc); }
    desc.content = description || '';
    let canon = document.querySelector('link[rel="canonical"]');
    if(!canon){ canon = document.createElement('link'); canon.rel='canonical'; document.head.appendChild(canon); }
    canon.href = canonical || location.origin + location.pathname;
  }

  function renderHome(){
    app.innerHTML = CP_RENDER.homePage({ opportunities, guides, categories, tools });
    setMeta('Career Opportunity SA | Learnerships, Bursaries, Internships','South Africa-only career opportunities, guides, tools, and deadline tracking.', location.origin + '/');
    bindSearchAndFilters();
  }

  function renderDirectory(prefilter){
    const nameMap = { opportunities: 'All Opportunities', learnerships: 'Learnerships', internships: 'Internships', bursaries: 'Bursaries', apprenticeships: 'Apprenticeships' };
    app.innerHTML = CP_RENDER.directoryPage({
      title: nameMap[section] || 'Opportunities',
      intro: 'Search and filter opportunities by category, province, qualification, verified status, and closing date.',
      opportunities,
      prefilter
    });
    setMeta(`${nameMap[section] || 'Opportunities'} | Career Opportunity SA`, `Search ${nameMap[section] ? nameMap[section].toLowerCase() : 'opportunities'} in South Africa with filters, deadlines, and source links.`, location.origin + `/${section}/`);
    bindSearchAndFilters(prefilter);
  }

  function renderGuideDetail(slug){
    const item = guides.find(g => g.slug === slug);
    if(!item){ app.innerHTML = '<section class="page wrap card"><h1>Guide not found</h1><p>We could not find the guide you requested.</p></section>'; return; }
    app.innerHTML = CP_RENDER.detailGuide(item);
    setMeta(item.meta_title, item.meta_description, location.origin + `/${item.category}/${item.slug}/`);
  }

  function renderOpportunityDetail(categorySection, detailSlug){
    const categoryMap = { learnerships:'learnership', internships:'internship', bursaries:'bursary', apprenticeships:'apprenticeship', opportunities:null };
    const expected = categoryMap[categorySection] || null;
    const item = opportunities.find(o => o.slug === detailSlug && (!expected || o.category === expected));
    if(!item){ app.innerHTML = '<section class="page wrap card"><h1>Opportunity not found</h1><p>We could not find the opportunity you requested.</p></section>'; return; }
    app.innerHTML = `<section class="page wrap">${CP_RENDER.detailOpportunity(item)}<div class="section">${CP_RENDER.adSlot()}</div></section>`;
    setMeta(`${item.title} | Career Opportunity SA`, `${item.title} in ${item.province}. Closing date, requirements, source, and application details.`, location.origin + `/${categorySection}/${item.slug}/`);
  }

  function renderTool(slug){
    const item = tools.find(t => t.slug === slug);
    if(!item){ app.innerHTML = '<section class="page wrap card"><h1>Tool not found</h1><p>We could not find the tool you requested.</p></section>'; return; }
    app.innerHTML = `<section class="page wrap"><div class="breadcrumb"><a href="/">Home</a><span>/</span><a href="/tools/">Tools</a><span>/</span><span>${CP_UTIL.escapeHTML(item.title)}</span></div>${CP_RENDER.toolPage(item, opportunities)}</section>`;
    setMeta(`${item.title} | Career Opportunity SA`, item.description, location.origin + `/tools/${item.slug}/`);
  }

  function renderCalendar(){
    app.innerHTML = CP_RENDER.calendarPage(opportunities);
    setMeta('Deadline Calendar | Career Opportunity SA', 'Track closing dates for learnerships, bursaries, internships, and apprenticeships in one calendar view.', location.origin + '/calendar/');
  }

  function renderStaticPage(title, body){
    app.innerHTML = `<section class="page wrap"><div class="card"><h1>${title}</h1><p>${body}</p></div></section>`;
    setMeta(`${title} | Career Opportunity SA`, body, location.origin + location.pathname);
  }

  function bindSearchAndFilters(prefilter){
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const categoryFilter = document.getElementById('categoryFilter');
    const provinceFilter = document.getElementById('provinceFilter');
    const qualificationFilter = document.getElementById('qualificationFilter');
    const verifiedFilter = document.getElementById('verifiedFilter');
    const sortFilter = document.getElementById('sortFilter');

    if(categoryFilter && prefilter) categoryFilter.value = prefilter;

    const applyState = () => {
      CP_STATE.search = searchInput ? searchInput.value : '';
      CP_STATE.category = categoryFilter ? categoryFilter.value : (prefilter || '');
      CP_STATE.province = provinceFilter ? provinceFilter.value : '';
      CP_STATE.qualification = qualificationFilter ? qualificationFilter.value : '';
      CP_STATE.verified = verifiedFilter ? verifiedFilter.value : '';
      CP_STATE.sort = sortFilter ? sortFilter.value : 'updated_desc';
      const base = prefilter ? opportunities.filter(o => o.category === prefilter) : opportunities;
      const filtered = CP_FILTERS.filterOpportunities(base, CP_STATE);
      const resultsGrid = document.getElementById('resultsGrid');
      if(resultsGrid){
        resultsGrid.innerHTML = filtered.length ? filtered.map(i => CP_RENDER.opportunityCard(i, 'opportunities')).join('') : '<div class="card">No matches found. Try removing a filter.</div>';
      }
      const info = document.querySelector('.results-info');
      if(info) info.textContent = `${filtered.length} opportunity${filtered.length === 1 ? '' : 's'} found`;
    };

    [searchInput, categoryFilter, provinceFilter, qualificationFilter, verifiedFilter, sortFilter].forEach(el => {
      if(el) el.addEventListener('change', applyState);
    });
    if(searchBtn) searchBtn.addEventListener('click', applyState);
    if(searchInput) searchInput.addEventListener('input', applyState);
  }

  if(section === 'home' || section === '') renderHome();
  else if(['opportunities','learnerships','internships','bursaries','apprenticeships'].includes(section)) {
    if(slug) renderOpportunityDetail(section, slug);
    else renderDirectory(section === 'opportunities' ? null : {learnerships:'learnership', internships:'internship', bursaries:'bursary', apprenticeships:'apprenticeship'}[section]);
  }
  else if(['seta-guides','career-advice','tvet-pathways'].includes(section)) {
    if(slug) renderGuideDetail(slug);
    else {
      const label = section.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      renderStaticPage(label, 'Browse educational guides and support content.');
    }
  }
  else if(section === 'tools') {
    if(slug) renderTool(slug);
    else renderStaticPage('Tools', 'Browse practical tools including eligibility checks and deadline tracking.');
  }
  else if(section === 'calendar') renderCalendar();
  else if(section === 'about') renderStaticPage('About', 'This platform is a South Africa-only career opportunity and guidance starter site.');
  else if(section === 'contact') renderStaticPage('Contact', 'Use this page for enquiries, submissions, and partnership requests.');
  else if(section === 'disclaimer') renderStaticPage('Disclaimer', 'All listings should be verified against official sources before applying.');
  else if(section === 'privacy-policy') renderStaticPage('Privacy Policy', 'Explain how user data and alerts will be handled.');
  else if(section === 'terms') renderStaticPage('Terms', 'Define the rules of use for the platform.');
  else renderStaticPage('Page not found', 'The requested route does not exist.');

  const menuBtn = document.getElementById('menuBtn');
  if(menuBtn){
    menuBtn.addEventListener('click', () => {
      const nav = document.querySelector('.nav');
      if(nav) nav.style.display = nav.style.display === 'flex' ? 'none' : 'flex';
    });
  }
})();
