(function(){
'use strict';
if(window._dlUtilsLoaded)return;window._dlUtilsLoaded=true;

const css=`
.dl-progress-container{margin-top:10px;padding:10px 12px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:8px;display:none}
.dl-progress-container.active{display:block}
.dl-progress-bar{height:6px;background:rgba(255,255,255,0.08);border-radius:3px;overflow:hidden;margin-bottom:6px}
.dl-progress-fill{height:100%;background:linear-gradient(90deg,#7c8cff,#00e5c8);border-radius:3px;transition:width 0.15s ease;width:0%}
.dl-progress-fill.error{background:#ef4444}
.dl-progress-fill.done{background:#10b981}
.dl-progress-text{font-size:11px;color:#9aa0c2;text-align:center;font-weight:500}
`;
const style=document.createElement('style');style.textContent=css;document.head.appendChild(style);

function getStatusEl(){
return document.getElementById('exportStatus')||document.querySelector('.export-status');
}

function getOrCreateContainer(statusEl){
if(!statusEl)return null;
let c=statusEl.querySelector('.dl-progress-container');
if(!c){c=document.createElement('div');c.className='dl-progress-container';c.innerHTML='<div class="dl-progress-bar"><div class="dl-progress-fill"></div></div><div class="dl-progress-text"></div>';statusEl.appendChild(c)}
return c;
}

function updateProgress(container,percent,text){
if(!container)return;
container.classList.add('active');
const fill=container.querySelector('.dl-progress-fill');
const txt=container.querySelector('.dl-progress-text');
if(fill){fill.style.width=Math.min(100,Math.max(0,percent))+'%';fill.className='dl-progress-fill'}
if(txt)txt.textContent=text||percent+'%';
}

function completeProgress(container,success){
if(!container)return;
const fill=container.querySelector('.dl-progress-fill');
if(fill)fill.className='dl-progress-fill '+(success?'done':'error');
updateProgress(container,100,success?'✓ সম্পূর্ণ!':'✗ ব্যর্থ');
setTimeout(()=>{container.classList.remove('active')},3000);
}

function parsePercent(text){
const m=text&&text.match(/(\d+)\s*%/);
return m?parseInt(m[1],10):null;
}

// ---- GIF transparency fix ----------------------------------------------
// The GIF format has no real alpha channel: it can only mark ONE exact
// palette color as "transparent" (a hard on/off cutout, not soft alpha).
// Every tool that lets you pick a canvas color and hoped that would carry
// through to the GIF was wrong to assume that; the raw pixel data was being
// captured with its alpha silently dropped, which is why exported GIFs
// always came out with a solid (usually black) background even when the
// on-canvas preview/PNG export looked transparent.
//
// Fix: before handing a frame to gif.js, we paint it onto a very specific,
// unlikely-to-occur "chroma key" color (#00FF00) first, then tell gif.js to
// treat that exact color as the transparent index. Edges that were
// anti-aliased against transparency may show a faint fringe of this color
// (this is an inherent GIF limitation, not a bug in this fix) — for pixel-
// perfect transparency, use the PNG export instead.
window.GIF_CHROMA_HEX = '#00FF00';
window.GIF_CHROMA_INT = 0x00FF00;
window.gifFlattenFrame = function(source){
  const srcCanvas = (source && source.canvas) ? source.canvas : source;
  const w = srcCanvas.width, h = srcCanvas.height;
  const out = document.createElement('canvas');
  out.width = w; out.height = h;
  const octx = out.getContext('2d');
  octx.fillStyle = window.GIF_CHROMA_HEX;
  octx.fillRect(0, 0, w, h);
  octx.drawImage(srcCanvas, 0, 0);
  return out;
};
// -------------------------------------------------------------------------

function safeSetStatus(statusEl, msg, container) {
  if (!statusEl) return;
  const existingContainer = statusEl.querySelector('.dl-progress-container');
  if (existingContainer) {
    let textNode = null;
    for (const child of statusEl.childNodes) {
      if (child.nodeType === Node.TEXT_NODE && child.textContent.trim()) {
        textNode = child;
        break;
      }
    }
    if (textNode) {
      textNode.textContent = msg;
    } else {
      statusEl.insertBefore(document.createTextNode(msg), existingContainer);
    }
  } else {
    statusEl.textContent = msg;
  }
}

function wrapAsync(fnName){
const orig=window[fnName];
if(typeof orig!=='function')return;
window[fnName]=async function(){
const statusEl=getStatusEl();
const container=getOrCreateContainer(statusEl);
const origSetStatus=window.setExportStatus;
let completed=false;
function checkComplete(msg){
if(completed)return;
if(msg && (msg.includes('ডাউনলোড সম্পূর্ণ') || msg.includes('ডাউনলোড শুরু হয়েছে'))){
completed=true;
completeProgress(container,true);
}else if(msg && msg.includes('✓')){
completed=true;
completeProgress(container,true);
}
}
try{
if(fnName==='downloadPng'){
updateProgress(container,20,'PNG তৈরি হচ্ছে…');
}else if(fnName==='downloadGif'){
updateProgress(container,0,'GIF তৈরি হচ্ছে… 0%');
window.setExportStatus=function(msg){
safeSetStatus(statusEl, msg, container);
const p=parsePercent(msg);
if(p!==null&&container)updateProgress(container,p,msg);
checkComplete(msg);
};
}else if(fnName==='downloadVideo'){
updateProgress(container,0,'ভিডিও তৈরি হচ্ছে…');
window.setExportStatus=function(msg){
safeSetStatus(statusEl, msg, container);
const p=parsePercent(msg);
if(p!==null&&container)updateProgress(container,p,msg);
checkComplete(msg);
};
}
const result=orig.apply(this,arguments);
if(fnName==='downloadPng'){
if(result&&typeof result.then==='function'){
await result;
if(!completed)completeProgress(container,true);
}else{
if(!completed)completeProgress(container,true);
}
}
}catch(e){
if(!completed)completeProgress(container,false);
}finally{
window.setExportStatus=origSetStatus;
if(fnName!=='downloadPng' && !completed){
setTimeout(()=>{if(!completed)completeProgress(container,false)},5000);
}
}
};
}

function wrapSetExportStatus(){
const orig=window.setExportStatus;
if(!orig || orig._dlWrapped) return;
window.setExportStatus=function(msg){
const statusEl=getStatusEl();
const container=getOrCreateContainer(statusEl);
safeSetStatus(statusEl, msg, container);
const p=parsePercent(msg);
if(p!==null&&container)updateProgress(container,p,msg);
};
window.setExportStatus._dlWrapped=true;
}

function init(){
wrapSetExportStatus();
wrapAsync('downloadPng');
wrapAsync('downloadGif');
wrapAsync('downloadVideo');

document.querySelectorAll('#exportStatus, .export-status').forEach(el=>{
getOrCreateContainer(el);
});
}

if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',init)}else{init()}
})();
