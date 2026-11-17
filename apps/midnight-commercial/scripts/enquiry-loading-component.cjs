// Actual enquiry React component; synthetic session and HTTP only.
// NODE_PATH=../midex-tools0620/node_modules node scripts/enquiry-loading-component.cjs
const assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs');
const {build}=require(path.resolve(__dirname,'../tools/enquiry-review/node_modules/esbuild')),{JSDOM}=require(path.resolve(__dirname,'../tools/enquiry-review/node_modules/jsdom'));
const root=path.resolve(__dirname,'..');
(async()=>{
 const bundle=await build({stdin:{contents:`import React from 'react';import{createRoot}from'react-dom/client';import Enquiry from './pages/enquiry.js';createRoot(document.getElementById('root')).render(<Enquiry deliveryEnabled={true}/>);`,resolveDir:root,loader:'jsx'},bundle:true,write:false,platform:'browser',format:'iife',jsx:'automatic',nodePaths:(process.env.NODE_PATH||'').split(path.delimiter).filter(Boolean),plugins:[{name:'synthetic',setup(b){
  b.onLoad({filter:/pages\/enquiry\.js$/},({path:p})=>({contents:fs.readFileSync(p,'utf8').split('export async function getServerSideProps')[0],loader:'jsx'}));
  b.onResolve({filter:/^react(?:\/.*)?$/},({path:p})=>({path:require.resolve(p)}));
  b.onResolve({filter:/^@\/lib\/useEnquirySession$/},()=>({path:'session',namespace:'fixture'}));
  b.onResolve({filter:/^@\/components\/freight\/FreightLayout$/},()=>({path:'layout',namespace:'fixture'}));
  b.onResolve({filter:/^@\/styles\//},()=>({path:'styles',namespace:'fixture'}));
  b.onResolve({filter:/^@\/lib\//},({path:p})=>({path:path.join(root,p.slice(2))}));
  b.onLoad({filter:/.*/,namespace:'fixture'},({path:p})=>({loader:'jsx',resolveDir:root,contents:p==='session'?`import React from 'react';let value={data:{user:{id:'a'}},status:'authenticated'};const listeners=new Set();window.sessionFixture=(id,status)=>{value={data:id?{user:{id}}:null,status};for(const l of [...listeners])l();};export const useEnquirySession=()=>React.useSyncExternalStore(l=>{listeners.add(l);return()=>listeners.delete(l)},()=>value);`:p==='layout'?`import React from 'react';export default function Layout({children}){React.useLayoutEffect(()=>{if(window.inspectIdentityCommit)window.identityCommits.push({collection:document.querySelector('#enquiry-collection')?.value,brief:document.querySelector('#enquiry-brief')?.value,text:document.body.textContent});});return <main>{children}</main>}`:`export default {};`}));
 }}]});
 const tick=()=>new Promise(r=>setTimeout(r,25));let failures=0;
 for(const scenario of ['missing-session','same-session','retained-files','late-receipt','late-receipt-same','late-file']){
  const dom=new JSDOM('<div id="root"></div>',{url:'https://midnight.example.invalid/enquiry',runScripts:'outside-only'}),{window}=dom,{document}=window;let pending,reader;
  window.fetch=(url,options)=>new Promise(resolve=>{pending={resolve,options};});
  try{
   window.eval(bundle.outputFiles[0].text);const ready=Date.now()+2500;while(!document.querySelector('#enquiry-collection')&&Date.now()<ready)await tick();
   const fixtures={collection:'PRIVATE A COLLECTION',delivery:'PRIVATE A DELIVERY',description:'PRIVATE A FREIGHT',name:'PRIVATE A NAME',email:'private-a@example.invalid'};
   for(const [key,value]of Object.entries(fixtures)){const input=document.querySelector('#enquiry-'+key);Object.getOwnPropertyDescriptor(input.tagName==='TEXTAREA'?window.HTMLTextAreaElement.prototype:window.HTMLInputElement.prototype,'value').set.call(input,value);input.dispatchEvent(new window.Event('input',{bubbles:true}));await tick();}
   if(scenario.startsWith('late-receipt')){document.querySelector('form').dispatchEvent(new window.Event('submit',{bubbles:true,cancelable:true}));await tick();assert(pending);}
   if(scenario==='late-file'||scenario==='retained-files'){window.FileReader=class{constructor(){reader=this;}readAsDataURL(){}};const input=document.querySelector('#enquiry-files');Object.defineProperty(input,'files',{value:[{name:'PRIVATE-A.pdf',size:4}]});input.dispatchEvent(new window.Event('change',{bubbles:true}));await tick();assert(reader);if(scenario==='retained-files'){reader.result='data:application/pdf;base64,JVBERg==';reader.onload();await tick();}}
   const saved=window.sessionStorage.getItem('midnight-enquiry');
   window.sessionFixture(scenario==='same-session'?'a':null,'loading');await tick();
   assert(!document.querySelector('#enquiry-collection'),'Prior customer draft controls must be absent while authentication is unresolved');
   assert(!document.querySelector('#enquiry-brief'),'Prior customer brief must be absent while authentication is unresolved');
   assert(!document.body.textContent.includes('PRIVATE A'),'Prior customer data must not be exposed');
   assert.match(document.querySelector('[role="status"]').textContent,/sign.in|checking|session/i);
   assert.equal(window.sessionStorage.getItem('midnight-enquiry'),saved,'Loading must not erase a recoverable draft');
   if(scenario.startsWith('late-receipt'))pending.resolve({ok:true,json:async()=>({state:'received',reference:'MID-PRIVATE-A',message:'PRIVATE A RECEIPT'})});
   if(scenario==='late-file'){reader.result='data:application/pdf;base64,JVBERg==';reader.onload();}
   await tick();assert(!document.body.textContent.includes('PRIVATE A'));
   const finalOwner=['same-session','retained-files','late-receipt-same'].includes(scenario)?'a':'b';window.identityCommits=[];window.inspectIdentityCommit=true;window.sessionFixture(finalOwner,'authenticated');await tick();if(finalOwner==='b'){assert(window.identityCommits.length>0);for(const snapshot of window.identityCommits)assert(!JSON.stringify(snapshot).includes('PRIVATE A'),'A sensitive draft appeared in a B commit before passive cleanup');}
   assert.equal(document.querySelector('#enquiry-collection').value,finalOwner==='a'?fixtures.collection:'');
   if(finalOwner==='b'){assert.equal(document.querySelector('[role="status"]').textContent,'');assert(!document.querySelector('#enquiry-brief').value.includes('PRIVATE A'));}
   if(scenario==='late-receipt-same'){assert.match(document.querySelector('[role="status"]').textContent,/not been confirmed/);assert(!document.body.textContent.includes('PRIVATE A RECEIPT'));assert(document.querySelector('#enquiry-collection').matches(':disabled'));assert.equal(window.sessionStorage.getItem('midnight-enquiry'),saved);}
   if(scenario==='retained-files'){assert(document.body.textContent.includes('Ready to attach: PRIVATE-A.pdf'));document.querySelector('form').dispatchEvent(new window.Event('submit',{bubbles:true,cancelable:true}));await tick();assert.equal(JSON.parse(pending.options.body).attachments[0].name,'PRIVATE-A.pdf');pending.resolve({ok:true,json:async()=>({state:'received',reference:'MID-CURRENT-A',message:'Current receipt'})});await tick();}
   console.log('PASS actual enquiry loading '+scenario);
  }catch(error){failures++;console.error('FAIL actual enquiry loading '+scenario+': '+error.message);}finally{window.close();}
 }
 assert.equal(failures,0,failures+' unresolved-session privacy regressions');
})().catch(error=>{console.error(error);process.exitCode=1;});
