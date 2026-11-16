const {test}=require('node:test');
const assert=require('node:assert/strict');
const {randomUUID}=require('node:crypto');
const {createHandler,notify,configured}=require('../lib/server/enquiryCapture.cjs');
const {attachments}=require('../lib/server/enquiryAttachments.cjs');
const env={MIDNIGHT_ENQUIRY_ENABLED:'true',MIDNIGHT_ENQUIRY_DATABASE_URL:'postgresql://midnight_capture:fixture@dedicated.example.invalid/midnight_enquiries?sslmode=verify-full',MIDNIGHT_ENQUIRY_EXPECTED_HOST:'dedicated.example.invalid',MIDNIGHT_ENQUIRY_HASH_SECRET:'synthetic-test-value-'.repeat(3),MIDNIGHT_ENQUIRY_EMAIL_ENABLED:'true',MIDNIGHT_ENQUIRY_SMTP_HOST:'example.invalid',MIDNIGHT_ENQUIRY_SMTP_USER:'test',MIDNIGHT_ENQUIRY_SMTP_PASS:'test',MIDNIGHT_ENQUIRY_FROM:'sender@example.invalid',MIDNIGHT_ENQUIRY_TO:'ops@example.invalid'};
const input=()=>({requestId:randomUUID(),mode:'Road',urgency:'Urgent',dangerousGoods:'No',collection:'London',delivery:'Paris',description:'Synthetic freight',name:'Preview Test',email:'test@example.invalid'});
function fixture(options={}) {
  const rows=new Map(),calls=[];
  const repo={async capture(v){calls.push('store');const old=rows.get(v.requestKey);if(old)return old.fingerprint===v.fingerprint?old:{conflict:true};const row={...v,reference:'MID-'+randomUUID().replaceAll('-','').toUpperCase()};rows.set(v.requestKey,row);return row;},async claim(ref){const row=[...rows.values()].find(v=>v.reference===ref);if(!['pending','disabled','failed'].includes(row.notification))return false;row.notification='sending';return true;},async finish(ref,state){[...rows.values()].find(v=>v.reference===ref).notification=state;}};
  const handler=createHandler({env,repository:()=>repo,send:async()=>{calls.push('mail');return {accepted:[env.MIDNIGHT_ENQUIRY_TO]};},...options});
  return {repo,rows,calls,async call(body=input(),patch={}){const req={method:'POST',headers:{host:'localhost',origin:'http://localhost','content-type':'application/json'},body,...patch};const res={headers:{},setHeader(k,v){this.headers[k]=v;},status(v){this.code=v;return this;},json(v){this.body=v;return this;}};await handler(req,res);return res;}};
}
test('durable capture precedes notification; unchanged retry returns one reference and one notification',async()=>{
  const f=fixture(),data=input(),a=await f.call(data),b=await f.call(data);assert.equal(a.body.state,'received');assert.equal(a.body.reference,b.body.reference);assert.deepEqual(f.calls,['store','mail','store']);assert.equal(f.rows.size,1);
});
test('disabled email retains full enquiry and truthfully reports pending notification',async()=>{
  const f=fixture({env:{...env,MIDNIGHT_ENQUIRY_EMAIL_ENABLED:'false'}}),r=await f.call();assert.equal(r.code,200);assert.match(r.body.message,/stored/);assert.match(r.body.message,/pending/);assert.deepEqual(f.calls,['store']);assert.equal([...f.rows.values()][0].data.collection,'London');
});
test('provider timeout and explicit rejection never lose capture; unknown acceptance cannot retry',async()=>{
  for(const error of [Error('secret provider failure'),Object.assign(Error('reject'),{responseCode:550})]){
    let sends=0;const f=fixture({send:async()=>{sends++;throw error;}}),data=input();const r=await f.call(data);assert.equal(r.body.state,'received');assert(!JSON.stringify(r.body).includes('secret'));await f.call(data);
    assert.equal(f.rows.size,1);assert.equal([...f.rows.values()][0].notification,error.responseCode?'failed':'uncertain');assert.equal(sends,error.responseCode?2:1);
  }
});
test('database outage fails truthfully without attempting notification',async()=>{
  const f=fixture({repository:()=>{throw Error('private database URL');}}),r=await f.call();assert.equal(r.code,503);assert.equal(r.body.state,'unconfirmed');assert.equal(f.calls.length,0);assert(!JSON.stringify(r.body).includes('private'));
});
test('different payload with same idempotency key is rejected rather than overwriting',async()=>{
  const f=fixture(),data=input();await f.call(data);const r=await f.call({...data,delivery:'Berlin'});assert.equal(r.code,409);assert.equal(f.rows.size,1);assert.equal([...f.rows.values()][0].data.delivery,'Paris');
});
test('capture enforces method, origin, content type, validation and configuration before database',async()=>{
  for(const [patch,code] of [[{method:'GET'},405],[{headers:{host:'localhost',origin:'https://evil.invalid','content-type':'application/json'}},403],[{headers:{'content-type':'text/plain'}},415],[{body:{}},400]]){
    const f=fixture();assert.equal((await f.call(input(),patch)).code,code);assert.equal(f.calls.length,0);
  }
  assert(!configured({...env,MIDNIGHT_ENQUIRY_ENABLED:'false'}));assert(!configured({...env,MIDNIGHT_ENQUIRY_HASH_SECRET:'short'}));
});
test('rate limit is truthful and does not attempt email',async()=>{const f=fixture({repository:()=>({capture:async()=>({limited:true})})});const r=await f.call();assert.equal(r.code,429);assert.equal(r.headers['Retry-After'],'600');assert(!f.calls.includes('mail'));});
test('files require allowed extension, magic, strict encoding and bounded size/count',()=>{
  const pdf={name:'SDS.pdf',content:Buffer.from('%PDF-1.4\n%%EOF').toString('base64')};assert.equal(attachments([pdf])[0].mediaType,'application/pdf');
  for(const files of [[{...pdf,name:'payload.exe'}],[{...pdf,name:'../SDS.pdf'}],[{...pdf,content:Buffer.from('<script>bad</script>').toString('base64')}],[{...pdf,content:'?'}],Array(4).fill(pdf),[{...pdf,content:Buffer.alloc(1048577).toString('base64')}]])assert.throws(()=>attachments(files));
});
test('notification audit failure still returns durable receipt without claiming email acceptance',async()=>{
  const f=fixture();f.repo.finish=async()=>{throw Error('lost acknowledgement');};const r=await f.call();assert.equal(r.body.state,'received');assert.match(r.body.message,/pending/);assert.equal(f.rows.size,1);assert.equal([...f.rows.values()][0].notification,'sending');
});
