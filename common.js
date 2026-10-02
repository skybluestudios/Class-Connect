// Shared helpers for Class Connect
const PX='awtyfm1',ADMIN_ID=PX+'-admin',$=i=>document.getElementById(i);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const set=(e,h)=>{if(e._h!==h){e._h=h;e.innerHTML=h}};
const sw=(l,on,fn,d)=>`<label class=sw style="margin:6px 18px 6px 0"><input type=checkbox ${on?'checked':''} ${d?'disabled':''} onchange="${fn}"><i></i><span>${l}</span></label>`;
const MOB=/Android|iPhone|iPod|iPad|Mobile|Windows Phone/i.test(navigator.userAgent)||(/Macintosh/.test(navigator.userAgent)&&navigator.maxTouchPoints>1);
if(MOB){window.NOGO=1;addEventListener('DOMContentLoaded',()=>{document.body.innerHTML='<div class=ov><div class=box><div style="font-size:64px">💻</div><h2>Please open this on a laptop</h2><p class=mu>This page only works on a laptop or desktop computer, not on a phone or tablet. Open it on your laptop to continue.</p></div></div>'})}
// No server of our own: PeerJS's free public broker is used only for the first handshake. Video/data then flow directly device-to-device; iceServers is empty so media never leaves the LAN.
const mkPeer=id=>{const o={config:{iceServers:[]}},p=id?new Peer(id,o):new Peer(o);setInterval(()=>{if(!p.destroyed&&p.disconnected)try{p.reconnect()}catch(e){}},2500);p.on('error',e=>{if(/network|server-error|socket/.test(e.type))setTimeout(()=>{try{p.reconnect()}catch(x){}},2000)});(window.PEERS=window.PEERS||[]).push(p);return p};
const sha=async s=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)))].map(b=>b.toString(16).padStart(2,'0')).join('');
function toast(m){let w=$('tw');if(!w){w=document.createElement('div');w.id='tw';document.body.appendChild(w)}const d=document.createElement('div');d.className='toast';d.textContent=m;w.appendChild(d);setTimeout(()=>d.remove(),4500)}
// Stream quality profiles (bits/s, frames/s). "lo" = grid preview, "hi" = expanded view.
const CAP={eco:{lo:60e3,mid:25e4,hi:1.2e6,lf:3,hf:12},bal:{lo:100e3,mid:45e4,hi:2.4e6,lf:4,hf:20},max:{lo:160e3,mid:7e5,hi:4e6,lf:5,hf:30}};
// ---- lv: does this stream have a live video track?
const lv=st=>!!(st&&st.getVideoTracks().some(t=>t.readyState=='live'));
// ---- Recording + export (runs in the viewer's browser: teacher / admin). Pure JS, no libraries.
const CRC=(()=>{const t=new Uint32Array(256);for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;t[n]=c>>>0}return t})();
async function crcOf(b){let c=-1;const r=b.stream().getReader();for(;;){const{done,value}=await r.read();if(done)break;for(let i=0;i<value.length;i++)c=CRC[(c^value[i])&255]^(c>>>8)}return(c^-1)>>>0}
async function zipBlob(files){const parts=[],cd=[],enc=new TextEncoder();let off=0;const d0=new Date(),tm=(d0.getHours()<<11)|(d0.getMinutes()<<5)|(d0.getSeconds()>>1),dt=((d0.getFullYear()-1980)<<9)|((d0.getMonth()+1)<<5)|d0.getDate();
 for(const f of files){const n=enc.encode(f.path),crc=await crcOf(f.blob),sz=f.blob.size,l=new DataView(new ArrayBuffer(30));
  l.setUint32(0,0x04034b50,true);l.setUint16(4,20,true);l.setUint16(6,0x0800,true);l.setUint16(10,tm,true);l.setUint16(12,dt,true);l.setUint32(14,crc,true);l.setUint32(18,sz,true);l.setUint32(22,sz,true);l.setUint16(26,n.length,true);parts.push(l.buffer,n,f.blob);
  const c=new DataView(new ArrayBuffer(46));c.setUint32(0,0x02014b50,true);c.setUint16(4,20,true);c.setUint16(6,20,true);c.setUint16(8,0x0800,true);c.setUint16(12,tm,true);c.setUint16(14,dt,true);c.setUint32(16,crc,true);c.setUint32(20,sz,true);c.setUint32(24,sz,true);c.setUint16(28,n.length,true);c.setUint32(42,off,true);cd.push(c.buffer,n);off+=30+n.length+sz}
 const cs=cd.reduce((a,x)=>a+x.byteLength,0),e=new DataView(new ArrayBuffer(22));e.setUint32(0,0x06054b50,true);e.setUint16(8,files.length,true);e.setUint16(10,files.length,true);e.setUint32(12,cs,true);e.setUint32(16,off,true);
 return new Blob([...parts,...cd,e.buffer],{type:'application/zip'})}
async function snapPng(name,kind,vid){if(!vid||!vid.videoWidth)return false;const c=document.createElement('canvas');c.width=vid.videoWidth;c.height=vid.videoHeight;c.getContext('2d').drawImage(vid,0,0);const b=await new Promise(r=>c.toBlob(r,'image/png')),a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=safeN(name)+' - '+kind+' - '+new Date().toISOString().slice(0,19).replace(/[:T]/g,'-')+'.png';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),60000);return true}
const safeN=s=>String(s).replace(/[\\/:*?"<>|\u0000-\u001f]/g,'_').trim().slice(0,60)||'student';
const Rec={on:false,cid:null,name:'',k:{scr:true,cam:true},R:new Map(),F:[],
 start(cid,name,k){Rec.on=true;Rec.cid=cid;Rec.name=name;Rec.k=k;Rec.F=[];Rec.R.clear()},
 // L = [{id,name,scr:MediaStream,cam:MediaStream}] ; called about once a second while recording
 sync(L){if(!Rec.on||!window.MediaRecorder)return;L.forEach(x=>['scr','cam'].forEach(kd=>{if(!Rec.k[kd])return;const st=x[kd],key=x.id+kd,live=lv(st);let r=Rec.R.get(key);
  if(r&&(r.st!==st||!live)){try{r.mr.stop()}catch(e){}Rec.R.delete(key);r=null}
  if(!r&&live){const f={sid:x.id,name:x.name,kd,seg:Rec.F.filter(q=>q.sid==x.id&&q.kd==kd).length+1,chunks:[],size:0},mt=['video/webm;codecs=vp9','video/webm;codecs=vp8','video/webm'].find(m=>MediaRecorder.isTypeSupported(m));
   try{const mr=new MediaRecorder(st,{mimeType:mt,videoBitsPerSecond:kd=='scr'?4e5:2.5e5});mr.ondataavailable=e=>{if(e.data.size){f.chunks.push(e.data);f.size+=e.data.size}};mr.start(3000);Rec.F.push(f);Rec.R.set(key,{st,mr})}catch(e){}}}))},
 async stop(){Rec.on=false;const rs=[...Rec.R.values()];Rec.R.clear();await Promise.all(rs.map(r=>new Promise(ok=>{r.mr.onstop=ok;try{r.mr.state!='inactive'?r.mr.stop():ok()}catch(e){ok()}})))},
 mb(){return(Rec.F.reduce((a,f)=>a+f.size,0)/1e6).toFixed(1)},
 // Folder rule: a student gets their own subfolder only when BOTH screen and webcam were recorded for them.
 files(){const by={},used=new Set(),out=[];Rec.F.forEach(f=>{if(f.size)(by[f.sid]=by[f.sid]||[]).push(f)});
  Object.values(by).forEach(fs=>{let b=safeN(fs[0].name);if(used.has(b))b+=' ('+fs[0].sid.slice(0,4)+')';used.add(b);const both=fs.some(f=>f.kd=='scr')&&fs.some(f=>f.kd=='cam');
   fs.forEach(f=>{const n=(f.kd=='scr'?'screen':'webcam')+(f.seg>1?'-'+f.seg:''),fn=both?n+'.webm':b+' - '+n+'.webm';out.push({dir:both?b:'',name:fn,path:both?b+'/'+fn:fn,blob:new Blob(f.chunks,{type:'video/webm'})})})});return out},
 async zip(){const fs=Rec.files();if(!fs.length)return toast('Nothing recorded yet');toast('Building ZIP…');const b=await zipBlob(fs),a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='class-recordings-'+new Date().toISOString().slice(0,16).replace(/[:T]/g,'-')+'.zip';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),120000)},
 async dir(){if(!window.showDirectoryPicker)return toast('This browser cannot save to a folder. Use Chrome or Edge, or download the ZIP.');const fs=Rec.files();if(!fs.length)return toast('Nothing recorded yet');
  try{const root=await showDirectoryPicker({mode:'readwrite'});for(const f of fs){const d=f.dir?await root.getDirectoryHandle(f.dir,{create:true}):root,w=await(await d.getFileHandle(f.name,{create:true})).createWritable();await w.write(f.blob);await w.close()}toast('✅ Saved '+fs.length+' file'+(fs.length==1?'':'s')+' to your folder')}catch(e){if(e.name!='AbortError')toast('Could not save: '+e.message)}},
 html(){return`<div class=row style="gap:8px">${Rec.on?`<span class="pill pr">⏺ Recording ${esc(Rec.name)} · ${Rec.R.size} stream${Rec.R.size==1?'':'s'} · ${Rec.mb()} MB</span><button class="sm r" onclick=recStop()>⏹ Stop</button>`:`<button class="sm r" onclick=recStart()>⏺ Start recording</button>`}${Rec.F.length&&!Rec.on?`<span class=mu>${Rec.mb()} MB saved in this browser</span><button class="sm g" onclick=Rec.zip()>⬇ Download ZIP</button><button class="sm g" onclick=Rec.dir()>📁 Save to folder…</button><button class="sm g" onclick=recClear()>Discard</button>`:''}</div>`}};
addEventListener('beforeunload',e=>{if(Rec.on||Rec.F.length){e.preventDefault();e.returnValue=''}});

// Keyed tile grid: tiles (and their <video> elements) persist across updates so previews never flicker.
function Grid(el,o){const T=new Map();
 const mk=x=>{const e=document.createElement('div');e.className='tile';
  e.innerHTML='<div class=pv title="Click to expand"><video muted autoplay playsinline></video><video class=cm muted autoplay playsinline></video><div class=ph>📺<small>No screen</small></div><span class=live>LIVE</span></div><div class=tf><label class=ck><input type=checkbox><i></i></label><b></b><span class=pill></span><button class="sm g rm" title="Remove from class">✕</button></div>';
  const t={el:e,v:e.querySelector('video'),cv:e.querySelector('video.cm'),cb:e.querySelector('input'),nm:e.querySelector('b'),pl:e.querySelector('.pill')};
  e.querySelector('.pv').onclick=()=>o.expand(x.id);t.cb.onchange=()=>o.tick(x.id,t.cb.checked);e.querySelector('.rm').onclick=()=>o.rm(x.id);return t};
 return{update(L){const ids=new Set(L.map(x=>x.id));T.forEach((t,i)=>{if(!ids.has(i)){t.el.remove();T.delete(i)}});
  L.forEach((x,n)=>{let t=T.get(x.id);if(!t){t=mk(x);T.set(x.id,t)}
   if(t.nm.textContent!==x.name)t.nm.textContent=x.name;t.pl.className='pill '+x.cls;if(t.pl.textContent!==x.txt)t.pl.textContent=x.txt;t.cb.checked=!!x.ck;
   const st=x.stream||null;if(t.v.srcObject!==st){t.v.srcObject=st;if(st)t.v.play().catch(()=>{})}
   const cs=x.cam||null;if(t.cv.srcObject!==cs){t.cv.srcObject=cs;if(cs)t.cv.play().catch(()=>{})}t.cv.classList.toggle('on',lv(cs));
   t.el.classList.toggle('on',!!(st&&st.active&&st.getVideoTracks().some(k=>k.readyState=='live')));
   if(el.children[n]!==t.el)el.insertBefore(t.el,el.children[n]||null)})}}}
// Expanded single-student view. Opening asks for high resolution; closing returns to low.
function Expand(o){const m=document.createElement('div');m.className='xp hide';
 m.innerHTML='<div class=xb><div class=xh><b></b><span class=pill></span><span class=sp></span><button class="sm g" data-a=p>◀</button><button class="sm g" data-a=n>▶</button><button class="sm g" data-a=s style="display:none">📸 Photo</button><button class="sm r" data-a=r>Remove</button><button class="sm g" data-a=c>Close</button></div><video autoplay playsinline muted></video><video class=cm autoplay playsinline muted></video></div>';document.body.appendChild(m);
 let id=null;const v=m.querySelector('video'),cv=m.querySelector('video.cm'),api={get id(){return id},
  open(i){id=i;m.classList.remove('hide');o.q();api.refresh()},
  close(){id=null;m.classList.add('hide');v.srcObject=null;cv.srcObject=null;o.q()},
  shot(){const k=o.snapK&&o.snapK(),s=id&&o.info(id);if(!k||!s)return;(async()=>{let n=0;if(k.scr&&await snapPng(s.name,'screen',v))n++;if(k.cam&&await snapPng(s.name,'webcam',cv))n++;toast(n?'📸 Saved '+n+' photo'+(n>1?'s':'')+' (PNG) to your Downloads folder':'No live video to photograph yet')})()},
  refresh(){if(!id)return;const s=o.info(id);if(!s)return api.close();m.querySelector('[data-a=s]').style.display=o.snapK&&o.snapK()?'':'none';const b=m.querySelector('b');if(b.textContent!==s.name)b.textContent=s.name;const p=m.querySelector('.pill');p.className='pill '+s.cls;p.textContent=s.txt;if(v.srcObject!==(s.stream||null)){v.srcObject=s.stream||null;v.play().catch(()=>{})}if(cv.srcObject!==(s.cam||null)){cv.srcObject=s.cam||null;cv.play().catch(()=>{})}cv.classList.toggle('on',lv(s.cam))}};
 m.onclick=e=>{const a=e.target.dataset.a;if(e.target===m||a=='c')api.close();else if(a=='s')api.shot();else if(a=='r'){if(o.rm(id))api.close()}else if(a=='p'||a=='n'){const L=o.ids(),k=L.indexOf(id);if(L.length>1)api.open(L[(k+(a=='n'?1:L.length-1))%L.length])}};
 addEventListener('keydown',e=>{if(id&&e.key=='Escape')api.close()});return api}
// First-open local-network permission. Chrome/Edge ask "Look for and connect to devices on your local network";
// we trigger that prompt up front (from a click) so screen sharing / peer links work right away. Remembered after the first time.
(()=>{if(window.NOGO)return;
 const K='cc_lan_ok',st=async()=>{try{return(await navigator.permissions.query({name:'local-network-access'})).state}catch(e){try{return(await navigator.permissions.query({name:'local-network'})).state}catch(x){return'unknown'}}};
 const probe=async()=>{
  const t=(u,sp)=>{const c=new AbortController();setTimeout(()=>c.abort(),2500);return fetch(u,{mode:'no-cors',cache:'no-store',targetAddressSpace:sp,signal:c.signal}).catch(()=>{})};
  await Promise.all([t('http://192.168.0.1/','local'),t('http://10.0.0.1/','local'),t('http://localhost:9/','loopback')]);
  try{const pc=new RTCPeerConnection({iceServers:[]});pc.createDataChannel('x');await pc.setLocalDescription(await pc.createOffer());await new Promise(r=>{pc.onicecandidate=e=>{if(!e.candidate)r()};setTimeout(r,1500)});pc.close()}catch(e){}
 };
 const show=denied=>{const o=document.createElement('div');o.className='ov';o.style.zIndex=99999;
  o.innerHTML='<div class=box><h2>🌐 Allow local network access</h2><p class=mu>Class Connect connects computers in your school directly to each other. When your browser asks to <b>“look for and connect to devices on your local network”</b>, choose <b>Allow</b>.</p>'+
  (denied?'<p class=mu style="color:#d33">Access was blocked. Click the 🔒 icon next to the address bar → Site settings → set <b>Local network access</b> to Allow, then reload.</p>':'')+
  '<button id=lanb>Continue</button></div>';document.body.appendChild(o);
  $('lanb').onclick=async()=>{$('lanb').disabled=true;$('lanb').textContent='Waiting for permission…';await probe();const s=await st();
   if(s=='denied'){o.remove();show(true);return}try{localStorage.setItem(K,'1')}catch(e){}o.remove()}};
 addEventListener('DOMContentLoaded',async()=>{const s=await st();let seen=0;try{seen=localStorage.getItem(K)}catch(e){}
  if(s=='granted'||(seen&&s!='denied')||s=='unknown'&&seen)return;
  if(s=='unknown'&&!seen&&!(window.isSecureContext&&/Chrome|Edg/.test(navigator.userAgent)))return;
  show(s=='denied')})
})();

// Admin console open on this computer => the student page must not run here.
(()=>{const K='cc_admin_hb',P=location.pathname;
 if(/admin/i.test(P)){const b=()=>{try{localStorage.setItem(K,Date.now())}catch(e){}};b();setInterval(b,1000);return}
 if(/teacher/i.test(P))return;
 const up=()=>{try{return Date.now()-(+localStorage.getItem(K)||0)<3500}catch(e){return false}},was=up();
 if(was){window.NOGO=1;(window.PEERS||[]).forEach(p=>{try{p.destroy()}catch(e){}});
  const m=()=>{document.body.innerHTML='<div class=ov><div class=box><h2>🚫 Not available here</h2><p class=mu>The admin console is open on this computer, so the student page can\'t be used. Close the admin page to continue.</p></div></div>'};
  document.body?m():addEventListener('DOMContentLoaded',m)}
 setInterval(()=>{if(up()!==was)location.reload()},1500)})();
