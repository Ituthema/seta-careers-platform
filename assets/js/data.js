window.CP_DATA = { opportunities: [], guides: [], tools: [], categories: [], provinces: [] };
window.CP_STATE = { search: "", category: "", province: "", qualification: "", verified: "", sort: "updated_desc" };
window.CP_UTIL = {
  async loadJSON(path){ const res = await fetch(path, {cache:'no-store'}); if(!res.ok) throw new Error(`Failed to load ${path}`); return await res.json(); },
  escapeHTML(str){ return String(str ?? "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;"); },
  formatDate(dateStr){ if(!dateStr) return "—"; const d = new Date(dateStr + "T00:00:00"); return d.toLocaleDateString('en-ZA',{year:'numeric', month:'short', day:'numeric'}); },
  daysUntil(dateStr){ if(!dateStr) return null; const now = new Date(); const d = new Date(dateStr + "T00:00:00"); return Math.ceil((d - new Date(now.getFullYear(), now.getMonth(), now.getDate())) / 86400000); },
  byClosingSoon(a,b){ return new Date(a.closing_date) - new Date(b.closing_date); },
  byUpdatedDesc(a,b){ return new Date(b.updated_date) - new Date(a.updated_date); },
  byTitleAsc(a,b){ return a.title.localeCompare(b.title); }
};
