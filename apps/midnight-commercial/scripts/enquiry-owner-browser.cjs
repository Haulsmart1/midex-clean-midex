// Actual enquiry component in a local DOM; synthetic session/API fixtures only.
// Test tools may be installed separately and resolved through NODE_PATH:
// npm install --prefix /tmp/midnight-component-tools react@18.3.1 react-dom@18.3.1 esbuild@0.25.0 jsdom@26.1.0
// NODE_PATH=/tmp/midnight-component-tools/node_modules node scripts/enquiry-owner-browser.cjs
const assert = require('node:assert/strict');
const path = require('node:path');
const { build } = require(path.resolve(__dirname,'../tools/enquiry-review/node_modules/esbuild'));
const { JSDOM } = require(path.resolve(__dirname,'../tools/enquiry-review/node_modules/jsdom'));
const root = path.resolve(__dirname, '..');
const entry = `
import React from 'react';
import { createRoot } from 'react-dom/client';
import Enquiry from './pages/enquiry.js';
window.React = React;
createRoot(document.getElementById('root')).render(<Enquiry deliveryEnabled={true}/>);
`;
(async () => {
  const bundle = await build({
    stdin: { contents: entry, resolveDir: root, loader: 'jsx' }, bundle: true,
    write: false, platform: 'browser', format: 'iife', jsx: 'automatic',
    nodePaths: (process.env.NODE_PATH || '').split(path.delimiter).filter(Boolean),
    plugins: [{ name: 'local-component-fixtures', setup(b) {
      // Next removes getServerSideProps from its browser build too.
      b.onLoad({filter:/pages\/enquiry\.js$/}, async ({path: source}) => ({contents:require('node:fs').readFileSync(source,'utf8').split('export async function getServerSideProps')[0],loader:'jsx'}));
      b.onResolve({filter:/^react(?:\/.*)?$/}, ({path:p}) => ({path:require.resolve(p)}));
      b.onResolve({filter:/^@\/lib\/useEnquirySession$/}, () => ({path:'session',namespace:'fixture'}));
      b.onResolve({filter:/^@\/components\/freight\/FreightLayout$/}, () => ({path:'layout',namespace:'fixture'}));
      b.onResolve({filter:/^@\/styles\//}, () => ({path:'styles',namespace:'fixture'}));
      b.onResolve({filter:/^@\/lib\//}, ({path:p}) => ({path:path.join(root,p.slice(2))}));
      b.onLoad({filter:/.*/,namespace:'fixture'}, ({path:p}) => ({loader:'jsx',resolveDir:root,contents:p==='session'?`
        import React from 'react';
        let snapshot={data:{user:{id:'fixture-a'}},status:'authenticated'};
        const listeners=new Set();
        window.changeFixtureOwner=()=>{snapshot={data:{user:{id:'fixture-b'}},status:'authenticated'};for(const l of listeners)l();};
        export const useEnquirySession=()=>React.useSyncExternalStore(l=>{listeners.add(l);return()=>listeners.delete(l)},()=>snapshot);
      `:p==='layout'?`export default function Layout({children}){return <main>{children}</main>}`:`export default new Proxy({}, {get:(_,key)=>key});`}));
    }}],
  });
  const tick=()=>new Promise(resolve=>setTimeout(resolve,25));
  for(const outcome of ['received','network-failure','file-read-success','file-read-failure']) {
    const dom=new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>',{url:'https://midnight.example.invalid/enquiry',runScripts:'outside-only'});
    const {window}=dom; const {document}=window;
    let pending;
    window.fetch=(_url,options)=>new Promise((resolve,reject)=>{pending={resolve,reject,payload:JSON.parse(options.body)};});
    try {
      window.eval(bundle.outputFiles[0].text); await tick();
      const fixtures={collection:'Fixture A collection',delivery:'Fixture A delivery',description:'Synthetic freight',name:'Fixture Person',email:'fixture@example.invalid'};
      const fill=async(key,value)=>{
        const input=document.querySelector('#enquiry-'+key);
        assert(!input.matches(':disabled'),'New owner input must be usable: '+key);
        Object.getOwnPropertyDescriptor(input.tagName==='TEXTAREA'?window.HTMLTextAreaElement.prototype:window.HTMLInputElement.prototype,'value').set.call(input,value);
        input.dispatchEvent(new window.Event('input',{bubbles:true}));await tick();
      };
      for(const [key,value] of Object.entries(fixtures))await fill(key,value);
      let reader;
      if(outcome.startsWith('file-read')) {
        window.FileReader=class{constructor(){reader=this;}readAsDataURL(){} };
        const input=document.querySelector('#enquiry-files');
        Object.defineProperty(input,'files',{value:[{name:'owner-a.pdf',size:4}],configurable:true});
        input.dispatchEvent(new window.Event('change',{bubbles:true}));await tick();
        assert(reader,'File fixture reached the actual component reader');
      } else {
        document.querySelector('form').dispatchEvent(new window.Event('submit',{bubbles:true,cancelable:true}));await tick();
        assert(pending,'Synthetic request reached fixture handler');
      }
      window.changeFixtureOwner();await tick();
      assert.equal(document.querySelector('#enquiry-collection').value,'');
      // Switching accounts must release the new account's independent draft.
      await fill('collection','Fixture B independent draft');
      if(outcome==='received')pending.resolve({ok:true,json:async()=>({state:'received',reference:'MID-OLD-OWNER',message:'Old owner receipt'})});
      else if(outcome==='network-failure')pending.reject(new Error('Fixture failed response'));
      else if(outcome==='file-read-success'){reader.result='data:application/pdf;base64,JVBERg==';reader.onload();}
      else reader.onerror(new Error('Fixture reader failure'));
      await tick();
      assert.equal(document.querySelector('#enquiry-collection').value,'Fixture B independent draft');
      assert.equal(document.querySelector('[role="status"]').textContent,'','Old result must not repopulate the new account receipt');
      const saved=JSON.parse(window.sessionStorage.getItem('midnight-enquiry'));
      assert.equal(saved.owner,'account:fixture-b','Old response must not overwrite the new account draft');
      assert.equal(saved.data.collection,'Fixture B independent draft');
      assert.equal(saved.status,null);
      if(outcome.startsWith('file-read')) {
        for(const [key,value] of Object.entries(fixtures))if(key!=='collection')await fill(key,value);
        document.querySelector('form').dispatchEvent(new window.Event('submit',{bubbles:true,cancelable:true}));await tick();
        assert.deepEqual(pending.payload.attachments,[],'Old owner documents must not enter the new account submission');
        pending.resolve({ok:true,json:async()=>({state:'received',reference:'MID-NEW-OWNER',message:'New owner receipt'})});await tick();
        assert.match(document.querySelector('[role="status"]').textContent,/MID-NEW-OWNER/);
      }
      console.log('PASS actual component owner switch '+outcome);
    } finally { window.close(); }
  }
})().catch(error=>{console.error(error);process.exitCode=1;});
