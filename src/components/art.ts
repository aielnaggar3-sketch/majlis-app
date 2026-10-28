// Original illustrated avatars and venue scenes, generated as SVG strings from static catalogue data.
// Placeholder art for Phase 1; production venues add licensed imagery and ambient audio.
/* eslint-disable */
export const SKIN=["#F2CFAE","#E2B08A","#C68A62","#8D5A3B"], HAIR=["#1F1410","#4A2C1A","#7A4A26","#2B2B2B"], SHIRT=["#B4470F","#2E6F8E","#2E7D4F","#6D3FC0","#A86A00","#9A3412"];
export function avatarSvg(c: { skin: number; hair: number; hairColor?: number; shirt?: number }, size: number, { ring }: { ring?: string } = {}): string {
  const sk=SKIN[c.skin%4], hc=HAIR[(c.hairColor||0)%4], sh=SHIRT[(c.shirt||0)%6], hs=c.hair%5;
  const hair=[
    `<path d="M22 44c0-20 12-30 28-30s28 10 28 30c0 6-2 10-3 12-1-14-8-22-25-22S26 42 25 56c-2-3-3-7-3-12z" fill="${hc}"/><path d="M24 50c-4 14-2 34 4 44h10c-6-12-8-28-6-40z M76 50c4 14 2 34-4 44H62c6-12 8-28 6-40z" fill="${hc}"/>`,
    `<path d="M24 46c0-20 12-31 26-31s26 11 26 31c-6-8-14-12-26-12s-20 4-26 12z" fill="${hc}"/>`,
    `<path d="M25 44c2-18 12-27 25-27s23 9 25 27c-5-5-12-8-25-8s-20 3-25 8z" fill="${hc}"/><path d="M36 70c4 6 24 6 28 0 0 8-6 14-14 14s-14-6-14-14z" fill="${hc}" opacity=".85"/>`,
    `<path d="M20 50c0-24 14-36 30-36s30 12 30 36c0 4 0 8-2 10l-4-14c-6-8-14-12-24-12s-18 4-24 12l-4 14c-2-2-2-6-2-10z" fill="${hc}"/><circle cx="50" cy="14" r="9" fill="${hc}"/>`,
    `<path d="M20 52c0-26 14-38 30-38s30 12 30 38v40h-8c2-14 2-30-2-40-6-6-12-8-20-8s-14 2-20 8c-4 10-4 26-2 40h-8z" fill="${hc}"/>`
  ][hs];
  return `<svg class="av" width="${size}" height="${size}" viewBox="0 0 100 100" aria-hidden="true">
    <circle cx="50" cy="50" r="50" fill="${ring||"rgba(255,255,255,.08)"}"/>
    <g class="head">
      <path d="M18 100c2-18 14-26 32-26s30 8 32 26z" fill="${sh}"/>
      <rect x="43" y="62" width="14" height="14" rx="5" fill="${sk}"/>
      ${hs===4||hs===0?hair:""}
      <ellipse cx="50" cy="47" rx="22" ry="25" fill="${sk}"/>
      ${hs!==4&&hs!==0?hair:hair.split("</path>")[0]+"</path>"}
      <ellipse cx="41" cy="48" rx="2.6" ry="3" fill="#201812"/><ellipse cx="59" cy="48" rx="2.6" ry="3" fill="#201812"/>
      <rect class="lid" x="37" y="44" width="8" height="7" fill="${sk}"/><rect class="lid" x="55" y="44" width="8" height="7" fill="${sk}"/>
      <path d="M37 41q4-3 8 0M55 41q4-3 8 0" stroke="#201812" stroke-width="1.6" fill="none" stroke-linecap="round" opacity=".7"/>
      <ellipse class="mouth" cx="50" cy="61" rx="5" ry="1.8" fill="#7A2E22"/>
      <circle cx="36" cy="56" r="3" fill="#E07A6A" opacity=".25"/><circle cx="64" cy="56" r="3" fill="#E07A6A" opacity=".25"/>
    </g></svg>`;
}
export function sceneSvg(v: { id: string; art: string; palette: [string, string, string] | string[] }): string {
  const [a,b,c]=v.palette; const k=v.art;
  const sky=`<defs><linearGradient id="g${v.id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset=".7" stop-color="${b}"/><stop offset="1" stop-color="${c}"/></linearGradient></defs><rect width="400" height="250" fill="url(#g${v.id})"/>`;
  const shapes: Record<string, string> = {
    cafe:`<circle cx="320" cy="60" r="26" fill="${c}" opacity=".5"/><rect x="0" y="150" width="400" height="100" fill="${a}" opacity=".85"/><path d="M0 150h400" stroke="${c}" stroke-opacity=".3"/>${[40,140,240,340].map(x=>`<g opacity=".9"><line x1="${x}" y1="0" x2="${x}" y2="40" stroke="${c}" stroke-opacity=".5"/><path d="M${x-14} 40h28l-6 14h-16z" fill="${c}"/><circle cx="${x}" cy="60" r="16" fill="${c}" opacity=".18"/></g>`).join("")}<rect x="60" y="175" width="90" height="10" rx="5" fill="${b}"/><rect x="250" y="175" width="90" height="10" rx="5" fill="${b}"/><rect x="95" y="160" width="12" height="15" rx="3" fill="${c}" opacity=".8"/><rect x="290" y="160" width="12" height="15" rx="3" fill="${c}" opacity=".8"/><path d="M0 120q100-14 200 0t200 0v30H0z" fill="${a}" opacity=".5"/>`,
    pyramid:`<circle cx="300" cy="80" r="34" fill="${c}" opacity=".85"/><path d="M40 200L150 70l110 130z" fill="${a}" opacity=".9"/><path d="M150 70l110 130h-40z" fill="#000" opacity=".25"/><path d="M220 200l70-80 70 80z" fill="${a}" opacity=".75"/><path d="M0 200h400v50H0z" fill="${a}"/><path d="M0 205q200-14 400 0" stroke="${c}" stroke-opacity=".3" fill="none"/>`,
    loft:`${[0,1,2,3].map(i=>`<rect x="${30+i*90}" y="30" width="70" height="110" fill="${c}" opacity=".18"/><path d="M${65+i*90} 30v110M${30+i*90} 85h70" stroke="${a}" stroke-opacity=".6"/>`).join("")}<rect x="0" y="170" width="400" height="80" fill="${a}"/><rect x="50" y="160" width="140" height="10" rx="4" fill="${b}"/><rect x="230" y="160" width="140" height="10" rx="4" fill="${b}"/><rect x="90" y="140" width="40" height="20" rx="3" fill="${c}" opacity=".6"/>`,
    garden:`<circle cx="70" cy="60" r="28" fill="${c}" opacity=".4"/>${[40,110,300,360].map((x,i)=>`<circle cx="${x}" cy="${110+i%2*10}" r="${44-i%2*8}" fill="${b}" opacity=".85"/><rect x="${x-4}" y="${140}" width="8" height="40" fill="${a}"/>`).join("")}<rect x="0" y="180" width="400" height="70" fill="${a}"/><ellipse cx="200" cy="190" rx="60" ry="10" fill="${c}" opacity=".5"/><path d="M200 150v30" stroke="${c}" stroke-width="3" opacity=".7"/>`,
    library:`${[0,1,2,3,4,5].map(i=>`<rect x="${10+i*66}" y="20" width="56" height="170" fill="${a}" opacity=".9"/>${[0,1,2,3].map(j=>`<rect x="${14+i*66}" y="${30+j*40}" width="48" height="30" fill="${b}" opacity="${.4+((i+j)%3)*.2}"/>`).join("")}`).join("")}<circle cx="200" cy="110" r="60" fill="${c}" opacity=".25"/><rect x="0" y="190" width="400" height="60" fill="${a}"/>`,
    studio:`<rect x="0" y="0" width="400" height="250" fill="${a}" opacity=".4"/>${[0,1,2,3,4,5,6,7,8,9].map(i=>`<rect x="${20+i*38}" y="40" width="26" height="100" rx="4" fill="${b}" opacity="${.25+(i%3)*.12}"/>`).join("")}<ellipse cx="300" cy="120" rx="26" ry="34" fill="${c}" opacity=".7"/><rect x="296" y="60" width="8" height="40" fill="${c}" opacity=".7"/><rect x="0" y="180" width="400" height="70" fill="${a}"/>`,
    garage:`<rect x="20" y="20" width="360" height="130" fill="${a}" opacity=".6"/>${[0,1,2,3,4].map(i=>`<line x1="20" y1="${30+i*24}" x2="380" y2="${30+i*24}" stroke="${c}" stroke-opacity=".15"/>`).join("")}<path d="M110 175q10-40 60-44h70q40 4 60 44z" fill="${b}"/><circle cx="150" cy="180" r="16" fill="#111"/><circle cx="270" cy="180" r="16" fill="#111"/><rect x="0" y="190" width="400" height="60" fill="${a}"/>`,
    roastery:`<circle cx="90" cy="70" r="44" fill="${c}" opacity=".18"/><rect x="230" y="60" width="80" height="80" rx="40" fill="${b}"/><rect x="262" y="30" width="16" height="30" fill="${b}"/><rect x="0" y="160" width="400" height="90" fill="${a}"/>${[40,80,120,160].map(x=>`<rect x="${x}" y="135" width="26" height="25" rx="4" fill="${c}" opacity=".7"/>`).join("")}<rect x="30" y="160" width="340" height="8" fill="${b}"/>`
  };
  return `<svg class="scene" viewBox="0 0 400 250" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${sky}${shapes[k]||""}</svg>`;
}
