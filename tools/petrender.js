// Shared renderer (also embedded in the app)
const PET_SPECIES = {
  hound:   {h:24,  s:62, x:'#3b2230', r:190},
  drake:   {h:200, s:22, x:'#e0893a', r:285},
  owl:     {h:30,  s:40, x:'#e3a23b', r:225},
  songbird:{h:46,  s:85, x:'#d9533b', r:320},
  fox:     {h:18,  s:78, x:'#fff4e6', r:172},
  hare:    {h:36,  s:22, x:'#ef8f8f', r:258},
  slime:   {h:140, s:55, x:'#ffffff', r:45},
  bat:     {h:272, s:32, x:'#e8b84a', r:350},
  sprout:  {h:96,  s:52, x:'#3f8a2c', r:50},
  mimic:   {h:28,  s:48, x:'#d9ad55', r:200},
};
function hsl(h,s,l){ return `hsl(${Math.round(h)} ${Math.round(Math.max(0,Math.min(100,s)))}% ${Math.round(Math.max(0,Math.min(100,l)))}%)`; }
function petPalette(sp, form){
  const {h,s} = sp;
  const base = { e:'#151019', w:'#ffffff', n:'#3b2230', k:'#ef8f8f', g:'#e8b84a' };
  const r = sp.r;
  if(form==='rare') return Object.assign(base,{ o:hsl(r,55,16), a:hsl(r,85,74), b:hsl(r,70,58), c:hsl(r,90,92), x:'#fff1a8', g:'#fff1a8', n:hsl(r,50,28), k:hsl(r+30,90,85) });
  if(form==='elder') return Object.assign(base,{ o:hsl(h,s*.5,10), a:hsl(h-8,s+8,40), b:hsl(h-8,s+8,29), c:hsl(h,s*.7,66), x: sp.x, g:'#e8b84a' });
  return Object.assign(base,{ o:hsl(h,s*.5,14), a:hsl(h,s,58), b:hsl(h,s,44), c:hsl(h,s*.6,82), x:sp.x });
}
function petSVG(species, form, size, locked){
  const rows = PET_SPRITES[species] || PET_SPRITES.slime, pal = petPalette(PET_SPECIES[species]||PET_SPECIES.slime, form);
  const px = [];
  rows.forEach((r,y)=>{ const full = (r.padEnd(8,'.').slice(0,8)); const line = full + full.split('').reverse().join('');
    [...line].forEach((ch,x)=>{ if(ch!=='.') px.push([x,y,ch]); }); });
  // elder: little crown; rare: sparkles
  const extra = [];
  const occupied = new Set(px.map(([x,y])=>x+','+y));
  if(form==='elder'){ [[6,0],[8,0],[6,1],[7,1],[8,1],[9,1],[9,0]].forEach(([x,y])=>{ if(!occupied.has(x+','+y)) extra.push([x,y,'g']); }); }
  if(form==='rare'){ [[1,1],[14,3],[0,12],[15,9],[13,0]].forEach(([x,y])=>{ if(!occupied.has(x+','+y)) extra.push([x,y,'g']); }); }
  const all = px.concat(extra);
  const fill = ch => locked ? (ch==='o' ? '#000' : '#2a2320') : pal[ch] || pal.a;
  const rects = all.map(([x,y,ch])=>`<rect x="${x}" y="${y}" width="1.02" height="1.02" fill="${fill(ch)}"/>`).join('');
  const gid = 'pg' + (++petSVG.n), gc = pal.a;
  const glow = form==='rare' && !locked ? `<defs><radialGradient id="${gid}"><stop offset="0" stop-color="${gc}" stop-opacity=".5"/><stop offset="1" stop-color="${gc}" stop-opacity="0"/></radialGradient></defs><circle cx="8" cy="8.5" r="8" fill="url(#${gid})"/>` : '';
  return `<svg viewBox="0 0 16 16" width="${size}" height="${size}" shape-rendering="crispEdges" aria-hidden="true">${glow}${rects}</svg>`;
}

petSVG.n = 0;
