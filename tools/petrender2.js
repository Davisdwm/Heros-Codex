// Renderer v2: auto outline, top-lit shading, ground shadow; three forms from one grid.
function hslc(h,s,l){ return `hsl(${Math.round(h)} ${Math.round(Math.max(0,Math.min(100,s)))}% ${Math.round(Math.max(0,Math.min(100,l)))}%)`; }
function pet2Grid(species, form){
  const sp = PET2[species] || PET2.slime, W = 32, H = 24;
  const rows = sp.rows, top = H - 2 - rows.length;           // feet sit on row 21
  const g = Array.from({length:H}, ()=>Array(W).fill('.'));
  // centre on the body (ignore wings/horns) so forms line up
  let minX = W, maxX = 0;
  rows.forEach(r=>[...r].forEach((ch,x)=>{ if(ch!=='.' && ch!=='W' && ch!=='H'){ minX=Math.min(minX,x); maxX=Math.max(maxX,x); } }));
  const shift = Math.round((W - 1 - maxX - minX)/2);
  rows.forEach((r,y)=>[...r].forEach((ch,x)=>{
    if(ch==='.') return;
    if(ch==='W' && form!=='rare') return;
    if(ch==='H' && form==='base') return;
    if(ch==='p') ch = form==='elder' ? 'p' : 'a';
    const X = x + shift, Y = y + top;
    if(X>=0 && X<W && Y>=0 && Y<H) g[Y][X] = ch;
  }));
  return g;
}
function pet2Palette(species, form){
  const sp = PET2[species] || PET2.slime, P = {};
  const tone = ([h,s,l]) => [hslc(h,s,l+13), hslc(h,s,l), hslc(h,s,l-13)];
  let pal = sp.pal;
  if(form==='rare'){ const r = sp.rareHue!=null ? sp.rareHue : RARE_HUE[species]; pal = { a:[r,70,60], c:[r,80,82], d:[r,50,34], x:[(r+40)%360,90,70] }; }
  for(const k of ['a','c','d','x']) P[k] = tone(pal[k]);
  P.p = tone([215,14,50]);                             // steel barding
  P.g = tone([44,75,58]);                              // gold trim on armor
  P.H = form==='rare' ? tone([48,90,72]) : tone([40,30,80]);   // horn: bone, or gold on the rare form
  P.W = form==='rare' ? tone([(sp.rareHue!=null?sp.rareHue:RARE_HUE[species]),90,80]) : P.a;
  P.l = form==='base' ? tone([4,60,40]) : form==='elder' ? tone([45,80,55]) : tone([(RARE_HUE[species]+40)%360,90,70]);
  P.e = form==='rare' ? '#fffbe0' : form==='elder' ? '#e8452e' : '#120c0a';
  P.n = '#1a1110'; P.w = '#f4efe6';
  P.o = form==='rare' ? hslc((sp.rareHue!=null?sp.rareHue:RARE_HUE[species]),50,12) : '#120c0a';
  return P;
}
function pet2SVG(species, form, w, locked){
  const g = pet2Grid(species, form), P = pet2Palette(species, form), H = g.length, W = g[0].length;
  const solid = (x,y) => y>=0 && y<H && x>=0 && x<W && g[y][x] !== '.';
  const rects = []; let minX=W, maxX=0, maxY=0;
  for(let y=0;y<H;y++) for(let x=0;x<W;x++){
    const ch = g[y][x];
    if(ch==='.'){
      if(solid(x-1,y)||solid(x+1,y)||solid(x,y-1)||solid(x,y+1)) rects.push([x,y, locked ? '#000' : P.o]);
      continue;
    }
    minX=Math.min(minX,x); maxX=Math.max(maxX,x); maxY=Math.max(maxY,y);
    let col;
    if(locked) col = '#2c2522';
    else if(ch==='p' && y+1<H && g[y+1][x]!=='p'){ col = P.g[1]; }
    else if(ch==='W'){ const t = P.W; col = !solid(x,y-1) ? t[0] : (x%2 ? t[1] : t[2]); }
    else if(Array.isArray(P[ch])){ const t = P[ch]; col = !solid(x,y-1) ? t[0] : (!solid(x,y+1) || !solid(x,y+2)) ? t[2] : t[1]; }
    else col = P[ch] || P.a[1];
    rects.push([x,y,col]);
  }
  const cx = (minX+maxX+1)/2, rw = (maxX-minX+1)*0.42;
  const shadow = `<ellipse cx="${cx}" cy="${maxY+1.6}" rx="${rw}" ry="1.1" fill="#000" opacity=".35"/>`;
  const gid = 'pg' + (++pet2SVG.n);
  const glow = form==='rare' && !locked ? `<defs><radialGradient id="${gid}"><stop offset="0" stop-color="${P.W[1]}" stop-opacity=".45"/><stop offset="1" stop-color="${P.W[1]}" stop-opacity="0"/></radialGradient></defs><ellipse cx="16" cy="12" rx="16" ry="12" fill="url(#${gid})"/>` : '';
  return `<svg viewBox="0 0 ${W} ${H}" width="${w}" height="${Math.round(w*H/W)}" shape-rendering="crispEdges" aria-hidden="true">${glow}${shadow}${rects.map(([x,y,c])=>`<rect x="${x}" y="${y}" width="1.02" height="1.02" fill="${c}"/>`).join('')}</svg>`;
}
pet2SVG.n = 0;
