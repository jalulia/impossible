(() => {
'use strict';
const aliases={blueSoft:'blue-soft',bluePale:'blue-pale'};
const luminance=h=>{const c=[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return c[0]*.2126+c[1]*.7152+c[2]*.0722};
const contrast=(a,b)=>{const x=luminance(a),y=luminance(b);return(Math.max(x,y)+.05)/(Math.min(x,y)+.05)};
const css=':root{'+Object.entries(IOTokens.colors).map(([k,v])=>'--'+(aliases[k]||k)+':'+v).join(';')+';'+Object.entries(IOTokens.roles).map(([k,v])=>'--'+k.replace(/[A-Z]/g,m=>'-'+m.toLowerCase())+':var(--'+(aliases[v]||v)+')').join(';')+'}';
const style=document.createElement('style');style.id='io-token-properties';style.textContent=css;document.head.append(style);
window.IOColor={luminance,contrast,css,keys:Object.keys(IOTokens.colors),get:key=>IOTokens.colors[key]};
function freeze(obj){Object.values(obj).forEach(v=>{if(v&&typeof v==='object')freeze(v)});return Object.freeze(obj)}freeze(IOTokens);
})();
