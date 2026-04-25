window.CP_ROUTER = {
  parsePath(pathname){
    const clean = pathname.replace(/\/index\.html$/,'/').replace(/\/+/g,'/');
    const parts = clean.split('/').filter(Boolean);
    if(parts.length === 0) return { section: 'home', slug: null };
    if(parts.length === 1) return { section: parts[0], slug: null };
    return { section: parts[0], slug: parts.slice(1).join('/') };
  }
};
