// Wavelord ArtUp v1.0.0. 3D MODE COMING - Fountain Pen 3D pattern. Future: Three.js importmap + es-module-shims, one Three instance, GLB viewer, draw in 3D.
const API_BASE='https://wavelord-artup.netlify.app';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const toast=t=>{const e=$('#toast');if(!e)return;e.textContent=t;e.classList.add('on');clearTimeout(toast._t);toast._t=setTimeout(()=>e.classList.remove('on'),2200)};
const PAL={Sunset:['#ff5e3a','#ff9500','#ffcc00','#c1272d','#6a1b9a','#1a237e'],Neon:['#39ff14','#00ffff','#ff00ff','#ffff00','#ff073a','#7df9ff'],Pastel:['#ffd1dc','#c1f0c1','#bde0fe','#fff1b8','#e0bbff','#ffdab9'],Copic:['#2b2b2b','#8d5524','#e0ac69','#d4af37','#14b8a6','#c1272d']};
const errLog=[];
const redact=s=>String(s||'').replace(/AIza[\w-]+/g,'[key]').replace(/gsk_[\w-]+/g,'[key]');
function pushErr(kind,err){const entry={t:new Date().toISOString(),kind,msg:redact(err&&err.message?err.message:err)};errLog.push(entry);if(errLog.length>20)errLog.shift();console.warn('ArtUp error:',entry.msg)}
window._artupErrors=errLog;
addEventListener('error',e=>pushErr('error',e.message||e.error));
addEventListener('unhandledrejection',e=>pushErr('rejection',e.reason));

function killNetlify(){
  document.querySelectorAll('a,div,span,button,iframe').forEach(el=>{
    if(el.id==='app'||el.id==='splash'||el.id==='stage'||el.id==='stack')return;
    const txt=(el.textContent||'').trim();
    const href=el.getAttribute('href')||'';
    const cls=typeof el.className==='string'?el.className:'';
    if(/powered by netlify/i.test(txt)||/netlify\.com|netlify\.app/i.test(href)||/netlify/i.test(cls)){
      try{el.remove()}catch(_){el.style.display='none'}
    }
  });
}
setInterval(killNetlify,800);
if(document.body){new MutationObserver(killNetlify).observe(document.body,{childList:true,subtree:true})}

let L=[],A=0,tool='pen',col='#d4af37',size=8,op=100,stab=20,hist=[],redo=[],recent=[],bgv='#ffffff',ver=0;
const st=$('#stack'),ov=$('#ov'),W=Math.max(260,Math.min(innerWidth-16,1000)),H=Math.max(260,innerHeight-230);
st.style.width=W+'px';st.style.height=H+'px';ov.width=W;ov.height=H;const octx=ov.getContext('2d');
const cx=()=>L[A].c.getContext('2d',{willReadFrequently:true});
function addLayer(n,img){const c=document.createElement('canvas');c.width=W;c.height=H;c.style.cssText='position:absolute;inset:0';st.insertBefore(c,ov);
 L.push({c,n:n||'Layer '+(L.length+1),v:1,o:100,b:'normal'});A=L.length-1;if(img){const i=new Image();i.onload=()=>c.getContext('2d').drawImage(i,0,0);i.src=img}sync();return L[A]}
function sync(){L.forEach((l,i)=>{l.c.style.opacity=l.v?l.o/100:0;l.c.style.mixBlendMode=l.b;st.insertBefore(l.c,ov)});$('#ll').innerHTML=L.map((l,i)=>`<div class="${i==A?'on':''}" data-i="${i}"><span>${l.n}</span><button data-e="${i}">${l.v?'Hide':'Show'}</button></div>`).reverse().join('');
 if(L[A]){$('#lo').value=L[A].o;$('#lb').value=L[A].b}}
$('#ll').onclick=e=>{const b=e.target.closest('[data-e]');if(b){L[b.dataset.e].v^=1;sync();return}const d=e.target.closest('[data-i]');if(d){A=+d.dataset.i;sync()}};
$('#lo').oninput=e=>{if(L[A]){L[A].o=+e.target.value;sync()}};$('#lb').onchange=e=>{if(L[A]){L[A].b=e.target.value;sync()}};
$('#la').onclick=()=>{addLayer();hist=[];redo=[]};
$('#ld').onclick=()=>{const s=L[A];if(!s)return;const n=addLayer(s.n+' copy');n.c.getContext('2d').drawImage(s.c,0,0)};
$('#lx').onclick=()=>{if(L.length<2)return toast('Keep one layer');L[A].c.remove();L.splice(A,1);A=Math.max(0,A-1);hist=[];sync()};
$('#lm').onclick=()=>{if(A<1)return toast('Nothing below');const t=L[A],b=L[A-1],x=b.c.getContext('2d');x.save();x.globalAlpha=t.o/100;x.globalCompositeOperation=t.b=='normal'?'source-over':t.b;x.drawImage(t.c,0,0);x.restore();t.c.remove();L.splice(A,1);A--;hist=[];sync()};
$('#lc').onclick=()=>{if(!L[A])return;snap();cx().clearRect(0,0,W,H)};
$('#lu').onclick=()=>{if(A<L.length-1){[L[A],L[A+1]]=[L[A+1],L[A]];A++;sync()}};$('#lw').onclick=()=>{if(A>0){[L[A],L[A-1]]=[L[A-1],L[A]];A--;sync()}};
const snap=()=>{if(!L[A])return;hist.push({i:A,d:cx().getImageData(0,0,W,H)});if(hist.length>40)hist.shift();redo=[]};
$('#undo').onclick=()=>{const h=hist.pop();if(!h||!L[h.i])return;const x=L[h.i].c.getContext('2d');redo.push({i:h.i,d:x.getImageData(0,0,W,H)});x.putImageData(h.d,0,0)};
$('#redo').onclick=()=>{const h=redo.pop();if(!h||!L[h.i])return;const x=L[h.i].c.getContext('2d');hist.push({i:h.i,d:x.getImageData(0,0,W,H)});x.putImageData(h.d,0,0)};
$('#clr').onclick=()=>{L.forEach((l,i)=>{A=i;snap();l.c.getContext('2d').clearRect(0,0,W,H)});A=0;sync()};
// background
function setBg(v){bgv=v;st.style.background=v=='grid'?'#fff linear-gradient(#0002 1px,transparent 1px) 0 0/24px 24px,linear-gradient(90deg,#0002 1px,transparent 1px) 0 0/24px 24px':v=='transparent'?'repeating-conic-gradient(#ccc 0 25%,#fff 0 50%) 0 0/20px 20px':v}
$('#bgs').onchange=e=>setBg(e.target.value);$('#bgc').oninput=e=>setBg(e.target.value);
// toolbar
const TOOLS=['pen','marker','airbrush','neon','watercolor','calligraphy','eraser','fill','line','circle','square','triangle','text','eyedropper'];
$('#tb').innerHTML=TOOLS.map(t=>`<button data-t="${t}" class="${t==tool?'on':''}">${t}</button>`).join('');
$('#tb').onclick=e=>{const b=e.target.closest('[data-t]');if(!b)return;tool=b.dataset.t;$$('#tb button').forEach(x=>x.classList.toggle('on',x==b))};
$('#sz').oninput=e=>size=+e.target.value;$('#op').oninput=e=>op=+e.target.value;$('#sb').oninput=e=>stab=+e.target.value;
function setCol(c){col=c;$('#cp').value=c;recent=[c,...recent.filter(x=>x!=c)].slice(0,10);$('#sw').innerHTML=recent.map(x=>`<i data-c="${x}" style="background:${x}"></i>`).join('')}
$('#cp').oninput=e=>setCol(e.target.value);$('#sw').onclick=e=>{if(e.target.dataset.c)setCol(e.target.dataset.c)};
$('#pal').onchange=e=>PAL[e.target.value].forEach(setCol);setCol(col);
// panels
const tog=id=>{['#lp','#ap','#rp'].forEach(p=>$(p).classList.toggle('hidden',p!=id||!$(p).classList.contains('hidden')))};
$('#lay').onclick=()=>tog('#lp');
// drawing
function seg(x,a,b,c,d){x.lineCap=x.lineJoin='round';x.globalAlpha=op/100;x.strokeStyle=x.fillStyle=col;x.globalCompositeOperation='source-over';x.shadowBlur=0;x.lineWidth=size;
 if(tool=='eraser'){x.globalCompositeOperation='destination-out';x.globalAlpha=1}
 if(tool=='marker'){x.globalAlpha=op/100*.5;x.lineWidth=size*1.6}
 if(tool=='neon'){x.shadowColor=col;x.shadowBlur=size*1.5;x.strokeStyle='#fff'}
 if(tool=='watercolor'){x.globalAlpha=op/100*.12;x.lineWidth=size*2.2}
 if(tool=='airbrush'){const n=Math.ceil(Math.hypot(c-a,d-b)/(size/4))||1;for(let i=0;i<=n;i++){const px=a+(c-a)*i/n,py=b+(d-b)*i/n,g=x.createRadialGradient(px,py,0,px,py,size*1.5);g.addColorStop(0,col);g.addColorStop(1,'transparent');x.globalAlpha=op/100*.15;x.fillStyle=g;x.fillRect(px-size*1.5,py-size*1.5,size*3,size*3)}return}
 if(tool=='calligraphy'){const n=Math.ceil(Math.hypot(c-a,d-b))||1;for(let i=0;i<=n;i++){x.beginPath();x.ellipse(a+(c-a)*i/n,b+(d-b)*i/n,size,size/3,-.8,0,7);x.fill()}return}
 x.beginPath();x.moveTo(a,b);x.lineTo(c,d);x.stroke();x.shadowBlur=0}
function shape(x,a,b,c,d){x.globalAlpha=op/100;x.strokeStyle=col;x.lineWidth=size;x.lineCap='round';x.beginPath();
 if(tool=='line'){x.moveTo(a,b);x.lineTo(c,d)}else if(tool=='circle')x.arc(a,b,Math.hypot(c-a,d-b),0,7);else if(tool=='square')x.rect(a,b,c-a,d-b);else{x.moveTo((a+c)/2,b);x.lineTo(c,d);x.lineTo(a,d);x.closePath()}x.stroke()}
function flood(sx,sy){const x=cx(),img=x.getImageData(0,0,W,H),p=img.data,i0=(sy*W+sx)*4,t=[p[i0],p[i0+1],p[i0+2],p[i0+3]],h=col.slice(1).match(/../g).map(v=>parseInt(v,16));if(t[0]==h[0]&&t[1]==h[1]&&t[2]==h[2]&&t[3]==255)return;const q=[[sx,sy]];
 const m=i=>Math.abs(p[i]-t[0])+Math.abs(p[i+1]-t[1])+Math.abs(p[i+2]-t[2])+Math.abs(p[i+3]-t[3])<40;
 while(q.length){const[a,b]=q.pop();if(a<0||b<0||a>=W||b>=H)continue;const i=(b*W+a)*4;if(!m(i))continue;p[i]=h[0];p[i+1]=h[1];p[i+2]=h[2];p[i+3]=255;q.push([a+1,b],[a-1,b],[a,b+1],[a,b-1])}x.putImageData(img,0,0)}
function eyedrop(px,py){const t=document.createElement('canvas');t.width=W;t.height=H;const x=t.getContext('2d');L.forEach(l=>{if(l.v)x.drawImage(l.c,0,0)});const d=x.getImageData(px,py,1,1).data;setCol('#'+[...d].slice(0,3).map(v=>v.toString(16).padStart(2,'0')).join(''))}
let down=false,sp=null,lp=null;const pos=e=>{const r=ov.getBoundingClientRect();return[(e.clientX-r.left)*W/r.width,(e.clientY-r.top)*H/r.height]};
ov.onpointerdown=e=>{e.preventDefault();ov.setPointerCapture(e.pointerId);const p=pos(e);if(tool=='eyedropper')return eyedrop(p[0]|0,p[1]|0);if(tool=='fill'){snap();return flood(p[0]|0,p[1]|0)}
 if(tool=='text'){const t=prompt('Text');if(t){snap();const x=cx();x.globalAlpha=op/100;x.fillStyle=col;x.font=`${size*3}px Cinzel,serif`;x.fillText(t,p[0],p[1])}return}
 snap();down=true;sp=lp=p;};
ov.onpointermove=e=>{const p=pos(e);bc&&bc.postMessage({k:'cur',u:me,p});if(!down)return;
 if(['line','circle','square','triangle'].includes(tool)){octx.clearRect(0,0,W,H);shape(octx,sp[0],sp[1],p[0],p[1]);return}
 const s=stab/100*.85,q=[lp[0]+(p[0]-lp[0])*(1-s),lp[1]+(p[1]-lp[1])*(1-s)];seg(cx(),lp[0],lp[1],q[0],q[1]);bc&&bc.postMessage({k:'seg',u:me,a:lp,b:q,col,size,tool});lp=q};
ov.onpointerup=ov.onpointercancel=e=>{if(!down)return;down=false;if(['line','circle','square','triangle'].includes(tool)){const p=pos(e);octx.clearRect(0,0,W,H);shape(cx(),sp[0],sp[1],p[0],p[1])}};
// autosave: 3 versions
setInterval(()=>{try{localStorage.setItem('artup_v'+(ver++%3),JSON.stringify({t:Date.now(),L:L.map(l=>({n:l.n,d:l.c.toDataURL()}))}))}catch(e){pushErr('autosave',e)}},10000);
$('#rest').onclick=()=>{try{const vs=[0,1,2].map(i=>JSON.parse(localStorage.getItem('artup_v'+i)||'null')).filter(Boolean).sort((a,b)=>b.t-a.t);if(!vs.length)return toast('No saved version');const v=vs[(window._r=((window._r||0)+1)%vs.length)];L.forEach(l=>l.c.remove());L=[];v.L.forEach(l=>addLayer(l.n,l.d));toast('Restored version')}catch(e){pushErr('restore',e);toast('Restore failed')}};
$('#exp').onclick=()=>{const t=document.createElement('canvas');t.width=W;t.height=H;const x=t.getContext('2d'),jpg=confirm('OK = JPG, Cancel = PNG');if(jpg||(bgv!='transparent')){x.fillStyle=bgv=='transparent'||bgv=='grid'?'#fff':bgv;x.fillRect(0,0,W,H)}
 L.forEach(l=>{if(l.v){x.globalAlpha=l.o/100;x.globalCompositeOperation=l.b=='normal'?'source-over':l.b;x.drawImage(l.c,0,0)}});const a=document.createElement('a');a.download='artup.'+(jpg?'jpg':'png');a.href=t.toDataURL(jpg?'image/jpeg':'image/png');a.click()};
$('#gal').onclick=()=>toast('Gallery = Export saves to your phone');
// AI helper: every action makes a NEW layer
function note(title,txt){const l=addLayer(title),x=l.c.getContext('2d');x.fillStyle='#0f1624cc';x.fillRect(10,10,W-20,120);x.fillStyle='#ffd700';x.font='16px sans-serif';txt.split('\n').slice(0,5).forEach((s,i)=>x.fillText(s.slice(0,Math.floor(W/9)),20,36+i*22))}
async function groq(messages,context){const c=new AbortController(),t=setTimeout(()=>c.abort(),15000);try{const r=await fetch(API_BASE+'/.netlify/functions/groq-chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages,context:context||'general'}),signal:c.signal});const j=await r.json();if(!j.reply)throw 0;return j.reply}catch(e){pushErr('groq',e);return null}finally{clearTimeout(t)}}
const TIPS={idea:'1. A fox made of constellations\n2. Your street as a tiny floating island\n3. A giant teapot house at sunset',fix:'Eyes sit halfway down the head.\nHands are about as big as the face.\nBlock shapes first, details last.'};
$('#ap').onclick=async e=>{const m=e.target.dataset.ai;if(!m)return;
 if(m=='palette'){const k=Object.keys(PAL)[Math.random()*4|0];PAL[k].forEach(setCol);const l=addLayer('Palette '+k),x=l.c.getContext('2d');PAL[k].forEach((c,i)=>{x.fillStyle=c;x.fillRect(10+i*60,10,56,56)});return toast(k+' palette ready')}
 if(m=='bg'){const l=addLayer('Background'),x=l.c.getContext('2d'),g=x.createLinearGradient(0,0,W,H);g.addColorStop(0,'#1a237e');g.addColorStop(1,'#ffd700');x.fillStyle=g;x.fillRect(0,0,W,H);L.unshift(L.pop());A=0;return sync()}
 toast('Asking AI...');const r=await groq([{role:'user',content:m=='idea'?'Give me 3 short drawing ideas':'Give 3 short tips to fix proportions, eyes and hands in a sketch'}]);note(m=='idea'?'AI Idea':'AI Tips',r||TIPS[m])};
$('#d3').onclick=()=>toast('3D coming in V2');
// Buddy + bubble (BUBBLE_RULE): open app = popup Return/Talk/Collapse; collapsed = bubble, tap = Return/Talk/Exit. Exit = collapse, no ending screen.
function dragify(b,onTap){let sx,sy,ox,oy,mv=0,just=0;const K='artup_pos_'+b.id,s=localStorage.getItem(K);if(s){const p=JSON.parse(s);b.style.left=p[0]+'px';b.style.top=p[1]+'px';b.style.right=b.style.bottom='auto'}
 const clamp=()=>{b.style.left=Math.min(innerWidth-56,Math.max(0,b.offsetLeft))+'px';b.style.top=Math.min(innerHeight-56,Math.max(0,b.offsetTop))+'px'};
 b.onpointerdown=e=>{b.setPointerCapture(e.pointerId);sx=e.clientX;sy=e.clientY;ox=b.offsetLeft;oy=b.offsetTop;mv=0;b._d=1};
 b.onpointermove=e=>{if(!b._d)return;const dx=e.clientX-sx,dy=e.clientY-sy;if(Math.hypot(dx,dy)>12||mv){mv=1;b.style.right=b.style.bottom='auto';b.style.left=ox+dx+'px';b.style.top=oy+dy+'px';clamp()}};
 b.onpointerup=()=>{b._d=0;if(mv){just=Date.now();const x=b.offsetLeft<innerWidth/2?4:innerWidth-60;b.style.left=x+'px';clamp();localStorage.setItem(K,JSON.stringify([b.offsetLeft,b.offsetTop]))}else if(Date.now()-just>250)onTap()}}
const showPop=(p,b)=>{$('#pop').classList.add('hidden');$('#pop2').classList.add('hidden');const r=b.getBoundingClientRect();p.classList.remove('hidden');p.style.left=Math.max(6,Math.min(innerWidth-190,r.left-120))+'px';p.style.top=Math.max(6,Math.min(innerHeight-170,r.top-150))+'px'};
dragify($('#buddy'),()=>showPop($('#pop'),$('#buddy')));dragify($('#bubble'),()=>showPop($('#pop2'),$('#bubble')));
const collapse=()=>{$('#app').classList.add('hidden');$('#buddy').classList.add('hidden');$('#bubble').classList.remove('hidden')};
const ret=()=>{$('#app').classList.remove('hidden');$('#buddy').classList.remove('hidden');$('#bubble').classList.add('hidden')};
document.addEventListener('click',e=>{const p=e.target.dataset.p;if(!p)return;$('#pop').classList.add('hidden');$('#pop2').classList.add('hidden');
 if(p=='ret')ret();if(p=='talk')$('#chat').classList.remove('hidden');if(p=='col')collapse();if(p=='exit')collapse()});
let hx=[];const say=(r,t)=>{$('#cl').insertAdjacentHTML('beforeend',`<p><b>${r}:</b> ${t.replace(/</g,'&lt;')}</p>`);$('#cl').scrollTop=1e5};
const LOCAL=['Try a limited palette of 3 colors.','Block big shapes first, then add detail.','Squint at your sketch to check values.'];
$('#cs').onclick=async()=>{const t=$('#ci').value.trim();if(!t)return;$('#ci').value='';say('You',t);hx.push({role:'user',content:t});hx=hx.slice(-12);const r=await groq(hx)||LOCAL[Math.random()*3|0];hx.push({role:'assistant',content:r});say('Buddy',r)};$('#cx').onclick=()=>$('#chat').classList.add('hidden');
// Draw Together V1: room id in URL; BroadcastChannel demo on same device. V2 will use server store for true live sync (localStorage never syncs).
const me='u'+Math.random().toString(36).slice(2,6),cur={};let bc=null,rl=null,room=new URLSearchParams(location.search).get('room');
function joinRoom(id){room=id;bc=new BroadcastChannel('artup-'+id);rl=addLayer('Room');bc.onmessage=({data:d})=>{if(d.k=='seg'){const x=rl.c.getContext('2d'),a=[tool,col,size];tool=d.tool;col=d.col;size=d.size;seg(x,d.a[0],d.a[1],d.b[0],d.b[1]);[tool,col,size]=a}
 if(d.k=='cur'){let c=cur[d.u];if(!c){c=cur[d.u]=document.createElement('div');c.className='cur';c.textContent='Guest '+d.u.slice(1);c.style.background='#14b8a6';st.appendChild(c)}c.style.left=d.p[0]+'px';c.style.top=d.p[1]+'px'}}}
$('#mk').onclick=()=>{const id=Math.random().toString(36).slice(2,8);joinRoom(id);$('#rl').value=API_BASE+'/?room='+id;toast('Room ready - share the link')};
$$('[data-go]').forEach(b=>b.onclick=()=>{start();if(b.dataset.go=='room')tog('#rp');if(b.dataset.go=='ai')tog('#ap')});
function start(){$('#splash').classList.add('hidden');$('#app').classList.remove('hidden');$('#buddy').classList.remove('hidden')}
$$('[data-act=skipSplash]').forEach(b=>b.onclick=start);$('#buddy').classList.add('hidden');addLayer('Layer 1');
if(room){start();joinRoom(room);$('#rl').value=location.href;tog('#rp')}
if('serviceWorker' in navigator)navigator.serviceWorker.register('sw.js').catch(e=>pushErr('sw',e));
killNetlify();
// APK bridge: native bubble "Talk to AI" calls this
window.openTalk=()=>{ret();start();$('#chat').classList.remove('hidden')};
