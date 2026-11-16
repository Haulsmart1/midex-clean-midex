const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),tools=path.join(root,'tools/enquiry-review/node_modules');
const {build}=require(path.join(tools,'esbuild')),{JSDOM}=require(path.join(tools,'jsdom'));
const pause=()=>new Promise(r=>setTimeout(r,20));
async function wait(check){const until=Date.now()+2500;while(!check()&&Date.now()<until)await pause();assert(check(),'Component did not settle');}
(async()=>{
 const bundle=await build({stdin:{contents:"import {createRoot} from 'react-dom/client';import Operations from './pages/operations/enquiries.js';createRoot(document.getElementById('root')).render(<Operations/>);",resolveDir:root,loader:'jsx'},bundle:true,write:false,format:'iife',platform:'browser',jsx:'automatic',loader:{'.js':'jsx'},nodePaths:[tools],plugins:[{name:'fixtures',setup(b){
 b.onResolve({filter:/^react(?:-dom)?(?:\/.*)?$/},({path:p})=>({path:require.resolve(p,{paths:[tools]})}));
 b.onResolve({filter:/^next\/|^@\/lib\/supabaseClient$/},({path:p})=>({path:p,namespace:'fixture'}));
 b.onLoad({filter:/.*/,namespace:'fixture'},({path:p})=>({loader:'jsx',contents:p==='next/link'?'export default function Link({children,...props}){return <a {...props}>{children}</a>}':p==='next/head'?'export default function Head(){return null}':"let token='staff-a';const listeners=new Set();window.changeOwner=value=>{token=value;for(const cb of listeners)cb();};const client={auth:{signInWithPassword:async()=>{window.changeOwner('staff-a');return {error:null}},signOut:async()=>{window.changeOwner(null);return {error:null}},getSession:async()=>({data:{session:token?{access_token:token}:null}}),onAuthStateChange:cb=>{listeners.add(cb);return {data:{subscription:{unsubscribe:()=>listeners.delete(cb)}}}}}};export const getSupabaseClient=()=>client;export default client;"}));
 }}]});
 const dom=new JSDOM('<div id="root"></div>',{url:'https://example.invalid/operations/enquiries',runScripts:'outside-only'}),w=dom.window,d=w.document,requests=[];w.AbortSignal=AbortSignal;
 w.fetch=(url,options)=>new Promise(resolve=>requests.push({url,options,resolve}));
 const response=data=>({ok:true,status:200,json:async()=>data,headers:{get:()=> 'application/json'}});
 const row={reference:'MID-'+'A'.repeat(32),status:'new',details:{name:'PRIVATE CUSTOMER A',email:'fixture@example.invalid',collection:'PRIVATE A COLLECTION',delivery:'Paris'}};
 try{
  w.eval(bundle.outputFiles[0].text);await wait(()=>d.querySelector('button'));
  const refresh=()=>[...d.querySelectorAll('button')].find(x=>x.textContent.includes('Load / refresh'));
  refresh().click();refresh().click();await wait(()=>requests.length===1);
  w.changeOwner('staff-b');requests[0].resolve(response({rows:[row],next:null}));await wait(()=>!refresh().disabled);assert(!d.body.textContent.includes('PRIVATE'));
  w.changeOwner('staff-a');refresh().click();await wait(()=>requests.length===2);requests[1].resolve(response({rows:[row],next:null}));await wait(()=>d.body.textContent.includes('PRIVATE CUSTOMER A'));
  [...d.querySelectorAll('button')].find(x=>x.textContent===row.reference).click();await wait(()=>requests.length===3);requests[2].resolve(response({item:{...row,attachments:[],audit:[]}}));await wait(()=>d.querySelector('a[href^="mailto:"]'));assert.match(d.querySelector('a[href^="mailto:"]').href,/fixture%40example.invalid/);w.dispatchEvent(new w.Event('pagehide'));assert(!d.body.textContent.includes('PRIVATE'));
  [...d.querySelectorAll('button')].find(x=>x.textContent==='Sign out of operations').click();await wait(()=>!d.body.textContent.includes('PRIVATE'));assert(!d.querySelector('a[href^="mailto:"]'));
  await wait(()=>d.querySelector('[role="status"]').textContent.includes('Operations sign-in cleared.')&&!refresh().disabled);w.changeOwner('staff-a');refresh().click();await wait(()=>requests.length===4);requests[3].resolve(response({rows:'malformed'}));await wait(()=>d.querySelector('[role="status"]').textContent.includes('could not be confirmed'));assert(!d.body.textContent.includes('PRIVATE'));
  console.log('PASS operations component: double-click guard, stale response, account-change privacy, manual reply and malformed response');
 }finally{w.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
