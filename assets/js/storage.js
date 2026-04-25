window.CP_STORAGE = {
  key: 'career-platform-saved',
  getSaved(){ try { return JSON.parse(localStorage.getItem(this.key) || '[]'); } catch(e){ return []; } },
  saveItem(id){ const items = new Set(this.getSaved()); items.add(id); localStorage.setItem(this.key, JSON.stringify([...items])); },
  removeItem(id){ const items = this.getSaved().filter(x => x !== id); localStorage.setItem(this.key, JSON.stringify(items)); },
  isSaved(id){ return this.getSaved().includes(id); }
};
