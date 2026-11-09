// Renderer v3: auto outline + top-lit shading + ground shadow. 'shiny' = hue-shifted palette with sparkles.
function hslc(h,s,l){ return `hsl(${Math.round(((h%360)+360)%360)} ${Math.round(Math.max(0,Math.min(100,s)))}% ${Math.round(Math.max(0,Math.min(100,l)))}%)`; }
function sprGrid(name){
  const sp = SPR[name] || SPR.slime, N = 32, g = Array.from({length:N}, ()=>Array(N).fill('.'));
  const rows = sp.rows.map(r => r.length===16 ? r + [...r].reverse().join('') : r);
  let minX = N, maxX = -1;
  rows.forEach(r=>[...r].forEach((ch,x)=>{ if(ch!=='.'){ minX=Math.min(minX,x); maxX=Math.max(maxX,x); } }));
  const dx = Math.round((N - 1 - maxX - minX)/2), top = N - 2 - rows.length;
  rows.forEach((r,y)=>[...r].forEach((ch,x)=>{ const X=x+dx, Y=y+top; if(ch!=='.' && X>=0 && X<N && Y>=0) g[Y][X]=ch; }));
  return g;
}
function sprSVG(name, opts){
  opts = opts || {}; const width = opts.width || 96, locked = !!opts.locked, shiny = !!opts.shiny;
  const sp = SPR[name] || SPR.slime, g = sprGrid(name), N = g.length;
  const shift = shiny ? (sp.shinyShift != null ? sp.shinyShift : 150) : 0;
  const pal = Object.assign({}, sp.pal, opts.pal || {});
  const T = {};
  for(const k in pal){ const [h,s,l] = pal[k]; T[k] = [hslc(h+shift,s+(shiny?10:0),l+15), hslc(h+shift,s+(shiny?10:0),l+(shiny?4:0)), hslc(h+shift,s,l-14)]; }
  const flat = { e: shiny ? '#ffffff' : (sp.e || '#120c0a'), w:'#f3eee4', n:'#1a1110' };
  const solid = (x,y) => y>=0 && y<N && x>=0 && x<N && g[y][x] !== '.';
  const out = []; let minX=N, maxX=0, maxY=0;
  for(let y=0;y<N;y++) for(let x=0;x<N;x++){
    const ch = g[y][x];
    if(ch==='.'){ if(solid(x-1,y)||solid(x+1,y)||solid(x,y-1)||solid(x,y+1)) out.push([x,y, locked?'#000':'#100a08']); continue; }
    minX=Math.min(minX,x); maxX=Math.max(maxX,x); maxY=Math.max(maxY,y);
    let col;
    if(locked) col = '#2c2522';
    else if(T[ch]){ const t=T[ch], up=solid(x,y-1) && g[y-1][x]===ch, dn1=solid(x,y+1), dn2=solid(x,y+2);
      col = !solid(x,y-1) ? t[0] : !up ? t[0] : (!dn1 || !dn2) ? t[2] : (!solid(x-1,y) ? t[2] : t[1]); }
    else col = flat[ch] || (T.a ? T.a[1] : '#888');
    out.push([x,y,col]);
  }
  let extra = '';
  if(opts.aura && !locked){ const gid = 'la' + (++sprSVG.n); extra = `<defs><radialGradient id="${gid}"><stop offset="0" stop-color="${opts.aura}" stop-opacity=".42"/><stop offset="1" stop-color="${opts.aura}" stop-opacity="0"/></radialGradient></defs><ellipse cx="16" cy="17" rx="16" ry="15" fill="url(#${gid})"/>`; }
  if(shiny && !locked){
    const gid = 'sg' + (++sprSVG.n), gc = T.a ? T.a[0] : '#fff';
    extra = `<defs><radialGradient id="${gid}"><stop offset="0" stop-color="${gc}" stop-opacity=".5"/><stop offset="1" stop-color="${gc}" stop-opacity="0"/></radialGradient></defs><ellipse cx="16" cy="17" rx="16" ry="15" fill="url(#${gid})"/>`;
    for(const [x,y] of [[2,4],[28,7],[4,20],[29,22],[24,1]]) if(!solid(x,y)) out.push([x,y,'#fff6b0']);
  }
  const cx = (minX+maxX+1)/2, rw = Math.max(4,(maxX-minX+1)*0.4);
  const shadow = `<ellipse cx="${cx}" cy="${maxY+1.5}" rx="${rw}" ry="1.2" fill="#000" opacity=".38"/>`;
  return `<svg viewBox="0 0 32 32" width="${width}" height="${width}" shape-rendering="crispEdges" aria-hidden="true">${extra}${shadow}${out.map(([x,y,c])=>`<rect x="${x}" y="${y}" width="1.02" height="1.02" fill="${c}"/>`).join('')}</svg>`;
}
sprSVG.n = 0;
