// Actual enquiry component; synthetic session, FileReader and HTTP fixtures only.
// NODE_PATH=../midex-tools0620/node_modules node scripts/enquiry-document-retention-component.cjs
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const { build } = require(path.resolve(__dirname,'../tools/enquiry-review/node_modules/esbuild'));
const { JSDOM } = require(path.resolve(__dirname,'../tools/enquiry-review/node_modules/jsdom'));
const root = path.resolve(__dirname, '..');
(async () => {
  const bundle = await build({
    stdin: { contents: `import React from 'react';import{createRoot}from'react-dom/client';import Enquiry from './pages/enquiry.js';createRoot(document.getElementById('root')).render(<Enquiry deliveryEnabled={true}/>);`, resolveDir: root, loader: 'jsx' },
    bundle: true, write: false, platform: 'browser', format: 'iife', jsx: 'automatic',
    nodePaths: (process.env.NODE_PATH || '').split(path.delimiter).filter(Boolean),
    plugins: [{ name: 'synthetic', setup(b) {
      b.onLoad({ filter: /pages\/enquiry\.js$/ }, ({ path: p }) => ({ contents: fs.readFileSync(p, 'utf8').split('export async function getServerSideProps')[0], loader: 'jsx' }));
      b.onResolve({ filter: /^react(?:\/.*)?$/ }, ({ path: p }) => ({ path: require.resolve(p) }));
      b.onResolve({ filter: /^@\/lib\/useEnquirySession$/ }, () => ({ path: 'session', namespace: 'fixture' }));
      b.onResolve({ filter: /^@\/components\/freight\/FreightLayout$/ }, () => ({ path: 'layout', namespace: 'fixture' }));
      b.onResolve({ filter: /^@\/styles\// }, () => ({ path: 'styles', namespace: 'fixture' }));
      b.onResolve({ filter: /^@\/lib\// }, ({ path: p }) => ({ path: path.join(root, p.slice(2)) }));
      b.onLoad({ filter: /.*/, namespace: 'fixture' }, ({ path: p }) => ({ loader: 'jsx', resolveDir: root, contents: p === 'session' ? `import React from 'react';let value={data:{user:{id:'a'}},status:'authenticated'};const listeners=new Set();window.sessionFixture=id=>{value={data:{user:{id}},status:'authenticated'};for(const l of listeners)l();};export const useEnquirySession=()=>React.useSyncExternalStore(l=>{listeners.add(l);return()=>listeners.delete(l)},()=>value);` : p === 'layout' ? `export default function Layout({children}){return <main>{children}</main>}` : `export default {};` }));
    } }],
  });
  const tick = () => new Promise(r => setTimeout(r, 25));
  let failures = 0;
  for (const scenario of ['too-many', 'too-large', 'unreadable', 'replacement', 'uncertain-unreadable', 'owner-switch', 'overlap', 'late-error', 'partial-failure', 'cancel', 'clear']) {
    const dom = new JSDOM('<div id="root"></div>', { url: 'https://midnight.example.invalid/enquiry', runScripts: 'outside-only' });
    const { window } = dom, { document } = window;
    const readers = [], requests = [];
    window.FileReader = class { constructor() { readers.push(this); } readAsDataURL() {} };
    window.fetch = (_url, options) => new Promise((resolve, reject) => requests.push({ payload: JSON.parse(options.body), resolve, reject }));
    const select = async files => { const input = document.querySelector('#enquiry-files'); Object.defineProperty(input, 'files', { value: files, configurable: true }); input.dispatchEvent(new window.Event('change', { bubbles: true })); await tick(); };
    const finish = async (reader, content = 'T1JJR0lOQUw=') => { reader.result = 'data:application/pdf;base64,' + content; reader.onload(); await tick(); };
    try {
      window.eval(bundle.outputFiles[0].text); await tick();
      for (const [key, value] of Object.entries({ collection: 'A collection', delivery: 'A delivery', description: 'Synthetic freight', name: 'Fixture person', email: 'fixture@example.invalid' })) {
        const input = document.querySelector('#enquiry-' + key);
        Object.getOwnPropertyDescriptor(input.tagName === 'TEXTAREA' ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype, 'value').set.call(input, value);
        input.dispatchEvent(new window.Event('input', { bubbles: true })); await tick();
      }
      await select([{ name: 'original.pdf', size: 8 }]); await finish(readers[0]);
      assert.match(document.body.textContent, /Ready to attach: original.pdf/);
      if (scenario === 'clear') {
        [...document.querySelectorAll('button')].find(button => button.textContent === 'Clear draft').click(); await tick();
        assert(!document.body.textContent.includes('Ready to attach:')); assert.equal(document.querySelector('#enquiry-collection').value, '');
        console.log('PASS document retention ' + scenario); continue;
      }
      if (scenario === 'uncertain-unreadable') {
        document.querySelector('form').dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true })); await tick();
        requests[0].reject(new Error('Synthetic lost acknowledgement')); await tick();
      }
      if (scenario === 'too-many') await select(Array.from({ length: 4 }, (_, i) => ({ name: 'extra' + i + '.pdf', size: 4 })));
      else if (scenario === 'too-large') await select([{ name: 'large.pdf', size: 1048577 }]);
      else if (scenario === 'cancel') await select([]);
      else if (scenario === 'partial-failure') {
        await select([{ name: 'part-one.pdf', size: 8 }, { name: 'part-two.pdf', size: 8 }]);
        await finish(readers[1], 'T05F');
        assert.match(document.body.textContent, /Ready to attach: original.pdf/, 'Partial replacement must not commit');
        readers[2].onerror(new Error('Synthetic partial failure')); await tick();
      }
      else {
        await select([{ name: 'replacement.pdf', size: 8 }]);
        const replacement = readers[1];
        if (scenario === 'replacement') await finish(replacement, 'TkVX');
        else if (scenario === 'owner-switch') {
          window.sessionFixture('b'); await tick();
          await select([{ name: 'b.pdf', size: 8 }]); await finish(readers[2], 'Qg==');
          await finish(replacement); assert.match(document.body.textContent, /Ready to attach: b.pdf/); assert(!document.body.textContent.includes('original.pdf')); assert(!document.body.textContent.includes('replacement.pdf'));
          console.log('PASS document retention ' + scenario); continue;
        } else if (scenario === 'overlap' || scenario === 'late-error') {
          await select([{ name: 'latest.pdf', size: 8 }]); await finish(readers[2], 'TEFURVNU');
          if (scenario === 'overlap') await finish(replacement);
          else { replacement.onerror(new Error('Synthetic obsolete error')); await tick(); assert.equal(document.querySelector('[role="status"]').textContent, '', 'Obsolete error must not replace current status'); }
        } else { replacement.onerror(new Error('Synthetic unreadable file')); await tick(); }
      }
      const expected = scenario === 'replacement' ? 'replacement.pdf' : ['overlap', 'late-error'].includes(scenario) ? 'latest.pdf' : 'original.pdf';
      assert(document.body.textContent.includes('Ready to attach: ' + expected), 'Previous valid documents must survive rejected replacements, and late reads must not overwrite newer selection');
      document.querySelector('form').dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true })); await tick();
      const sent = requests.at(-1); assert(sent, 'Actual component submitted to fixture');
      assert.equal(sent.payload.attachments[0].name, expected);
      assert.equal(sent.payload.attachments[0].content, scenario === 'replacement' ? 'TkVX' : ['overlap', 'late-error'].includes(scenario) ? 'TEFURVNU' : 'T1JJR0lOQUw=');
      if (scenario === 'uncertain-unreadable') { assert.equal(sent.payload.requestId, requests[0].payload.requestId); assert.deepEqual(sent.payload.attachments, requests[0].payload.attachments); }
      sent.resolve({ ok: true, json: async () => ({ state: 'received', reference: 'MID-FIXTURE', message: 'Stored' }) }); await tick();
      console.log('PASS document retention ' + scenario);
    } catch (error) { failures++; console.error('FAIL document retention ' + scenario + ': ' + error.message); }
    finally { window.close(); }
  }
  assert.equal(failures, 0, failures + ' document retention regressions');
})().catch(error => { console.error(error); process.exitCode = 1; });
