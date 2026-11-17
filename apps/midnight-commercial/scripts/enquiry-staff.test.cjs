const {test}=require('node:test');
const assert=require('node:assert/strict');
const {authorize}=require('../lib/server/enquiryStaff.cjs');
const {databaseConnection}=require('../lib/server/enquiryDatabaseConfig.cjs');
const project='a'.repeat(20),id='11111111-1111-4111-8111-111111111111',other='22222222-2222-4222-8222-222222222222';
const env={MIDNIGHT_ENQUIRY_AUTH_PROJECT_REF:project,MIDNIGHT_ENQUIRY_STAFF_SUBJECTS:id,NEXT_PUBLIC_SUPABASE_URL:'https://'+project+'.supabase.co',NEXT_PUBLIC_SUPABASE_ANON_KEY:'synthetic-public-key'};
const req={headers:{authorization:'Bearer synthetic-token'}};
const provider=(user)=>async()=>({ok:true,json:async()=>user});
const user={id,email_confirmed_at:'2026-01-01T00:00:00Z'};
test('staff access requires pinned provider, bearer token and verified subject',async()=>{
 assert.equal((await authorize(req,env,provider(user))).code,200);
 assert.equal((await authorize(req,env,provider({...user,id:other,user_metadata:{role:'super_admin'}}))).code,403);
 assert.equal((await authorize(req,env,provider({...user,email_confirmed_at:null}))).code,403);
 assert.equal((await authorize(req,env,provider({...user,is_anonymous:true}))).code,403);
 assert.equal((await authorize(req,env,provider({...user,banned_until:'2099-01-01T00:00:00Z'}))).code,403);
 assert.equal((await authorize({headers:{}},env,()=>{throw Error('Must not fetch');})).code,401);
 for(const patch of [{MIDNIGHT_ENQUIRY_STAFF_SUBJECTS:''},{MIDNIGHT_ENQUIRY_AUTH_PROJECT_REF:'b'.repeat(20)},{NEXT_PUBLIC_SUPABASE_URL:'https://untrusted.example.invalid'}])assert.equal((await authorize(req,{...env,...patch},()=>{throw Error('Must not fetch');})).code,503);
});
test('revoked/expired provider sessions and outages fail without leaking provider errors',async()=>{
 for(const status of [401,403])assert.equal((await authorize(req,env,async()=>({ok:false,status}))).code,401);
 const result=await authorize(req,env,async()=>{throw Error('private diagnostics');});
 assert.deepEqual(result,{code:503});
});
test('database target cannot switch product, role, host or TLS through its URI',()=>{
 const good={MIDNIGHT_ENQUIRY_EXPECTED_HOST:'dedicated.example.invalid',MIDNIGHT_ENQUIRY_DATABASE_URL:'postgresql://midnight_capture:synthetic@dedicated.example.invalid/midnight_enquiries?sslmode=verify-full'};
 assert.equal(databaseConnection(good),good.MIDNIGHT_ENQUIRY_DATABASE_URL);
 for(const value of ['postgresql://midnight_capture:synthetic@dedicated.example.invalid/other?sslmode=verify-full','postgresql://owner:synthetic@dedicated.example.invalid/midnight_enquiries?sslmode=verify-full','postgresql://midnight_capture:synthetic@dedicated.example.invalid/midnight_enquiries?sslmode=disable',good.MIDNIGHT_ENQUIRY_DATABASE_URL+'&host=other.example.invalid',good.MIDNIGHT_ENQUIRY_DATABASE_URL+'&ssl=false',good.MIDNIGHT_ENQUIRY_DATABASE_URL+'&sslmode=disable'])assert.throws(()=>databaseConnection({...good,MIDNIGHT_ENQUIRY_DATABASE_URL:value}));
 assert.throws(()=>databaseConnection({...good,MIDNIGHT_ENQUIRY_EXPECTED_HOST:'other.example.invalid'}));
});
