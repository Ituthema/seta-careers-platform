window.CP_FILTERS = {
  filterOpportunities(items, state){
    let out = [...items];
    const q = (state.search || "").trim().toLowerCase();
    if(q){
      out = out.filter(item => [item.title, item.category, item.sector, item.province, item.location, item.description, ...(item.tags || [])].join(" ").toLowerCase().includes(q));
    }
    if(state.category) out = out.filter(item => item.category === state.category);
    if(state.province) out = out.filter(item => item.province === state.province);
    if(state.qualification) out = out.filter(item => item.qualification_level === state.qualification);
    if(state.verified === "true") out = out.filter(item => item.verified === true);
    if(state.verified === "false") out = out.filter(item => item.verified === false);
    switch(state.sort){
      case "deadline_asc": out.sort(window.CP_UTIL.byClosingSoon); break;
      case "title_asc": out.sort(window.CP_UTIL.byTitleAsc); break;
      default: out.sort(window.CP_UTIL.byUpdatedDesc);
    }
    return out;
  }
};
