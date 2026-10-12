const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const {sessionIsCurrent}=require('../lib/server/sessionPolicy.cjs');
async function load(file,mocks,env={},globals={}){
 const context=vm.createContext({process:{env},console:{log(){},warn(){},error(){}},URL,Date,Buffer,...globals});
 const module=new vm.SourceTextModule(fs.readFileSync(file,'utf8'),{context});
 await module.link(name=>new vm.SyntheticModule(Object.keys(mocks[name]),function(){for(const[k,v]of Object.entries(mocks[name]))this.setExport(k,v);},{context}));
 await module.evaluate();return module.namespace;
}
const response=()=>({statusCode:null,headers:{},setHeader(k,v){this.headers[k]=v;},status(code){this.statusCode=code;return this;},json(value){this.body=value;return this;}});
test('UK postcode geocoding retains the required inward-code separator for spaced and compact input',async()=>{
 const requests=[];
 const module=await load('utils/getTomTomCoords.js',{
  '@/utils/depots':{DEPOTS:{}},
  '@/utils/throttle':{throttledRequest:async(key,fn)=>fn()},
  '@/utils/normalizePostcode':{normalizePostcode:v=>v.toUpperCase().replace(/\s+/g,''),isROI:()=>false},
 },{}, {fetch:async url=>{requests.push(new URL(url));return {ok:true,json:async()=>({results:[{position:{lat:53.4,lon:-2.98}}]})};}});
 for(const postcode of ['L1 8JQ','L18JQ','M11AE']){
  const result=await module.getTomTomCoords(postcode,'mock-key');
  assert.equal(result.lat,53.4);assert.equal(result.lon,-2.98);
 }
 assert.deepEqual(requests.map(u=>decodeURIComponent(u.pathname)),['/search/2/geocode/L1 8JQ.json','/search/2/geocode/L1 8JQ.json','/search/2/geocode/M1 1AE.json']);
});
test('all 23 production route patterns are represented without a fallback deletion',()=>{
 const gaps=require('../docs/OVERNIGHT-PRODUCTION-COMPARISON.json').candidateRouteComparison.productionOnly;
 assert.equal(gaps.length,23);
 for(const route of gaps)assert(fs.existsSync('pages'+route+'.js')||fs.existsSync('pages'+route+'/index.js'),'Missing '+route);
});
test('live partner booking query view and recovered default wizard are both preserved',()=>{
 const page=fs.readFileSync('pages/booking.js','utf8');
 const legacy=fs.readFileSync('components/recovered/LegacyPartnerBookings.js','utf8');
 assert.match(page,/router\.query\.partner \? <LegacyPartnerBookings \/> : <BookingPage \/>/);
 assert.match(page,/releaseRouteAccess/);
 for(const table of ['bookings','bookings_currys','bookings_car_batteries','bookings_luminescence'])assert(legacy.includes('from("'+table+'")'));
 assert(legacy.includes('useReleaseSupabase()'));
});
test('working production freight descriptions and prior candidate freight URLs are retained',()=>{
 const proof=require('../docs/P0-FREIGHT-RECOVERY.json');
 const meta=require('../data/recovered-production-freight.json');
 assert.equal(proof.workingProductionSlugs.length,21);
 assert.equal(proof.preservedSlugs.length,32);
 for(const slug of proof.workingProductionSlugs){assert(proof.preservedSlugs.includes(slug));assert.equal(typeof meta[slug].desc,'string');}
 for(const slug of proof.recoveredCandidateSlugs)assert(proof.preservedSlugs.includes(slug));
});
test('wizard and multipart notification payloads retain consignment and quote contracts',()=>{
 const {bookingAlertPayload}=require('../lib/releaseBooking.cjs');
 const wizard=bookingAlertPayload({from:'L1 1AA',to:'BT1 1AA',pallets:[{type:'Standard',weight:100,height:100}],quote:125,breakdown:{vehicle:'Van'},adr:true});
 assert.equal(wizard.totalQuote,125);assert.equal(wizard.consignments[0].collectionPostcode,'L1 1AA');assert.equal(wizard.consignments[0].adr,true);
 assert.deepEqual(bookingAlertPayload(wizard),wizard);
 assert.throws(()=>bookingAlertPayload({from:'',to:'B',quote:NaN}));
});
test('JSON booking request reaches the mail boundary with mocked delivery only',async()=>{
 let message;
 const handler=(await load('pages/api/sendBookingAlerts.js',{'midnight-nodemailer':{default:{createTransport:()=>({sendMail:async value=>{message=value;}})}},'formidable':{default:{}},'@/lib/releaseBooking.cjs':require('../lib/releaseBooking.cjs')},{NODEMAILER_SMTP_HOST:'smtp.example.invalid',NODEMAILER_USER:'operator@example.invalid',NODEMAILER_PASS:'offline-only'})).default;
 const body=Buffer.from(JSON.stringify({from:'L1 1AA',to:'BT1 1AA',quote:125,breakdown:{vehicle:'Van'}}));
 const req={method:'POST',headers:{'content-type':'application/json'},async *[Symbol.asyncIterator](){yield body;}};
 const res=response();await handler(req,res);assert.equal(res.statusCode,200);assert(message.text.includes('L1 1AA'));assert.equal(message.from,'"Midnight Express Booking" <operator@example.invalid>');assert.equal(message.attachments.length,0);
});
test('recovered complete public post data preserves every grouped production record',()=>{
 const posts=require('../data/recovered-production-blog.json');
 const routes=require('../data/recovered-production-european-routes.json');
 assert.equal(posts.length,2352);assert.equal(routes.length,870);
 const proof=require('../docs/P0-PUBLIC-RECOVERY-PROOF.json');
 const digest=value=>require('node:crypto').createHash('sha256').update(JSON.stringify(value)).digest('hex');
 assert.equal(digest(posts),proof.completePostsSha256);
 assert.equal(digest(routes),proof.europeanRoutesSha256);
 for(const[group,hash]of Object.entries(proof.productionGroupDigests))assert.equal(digest(posts.slice((Number(group)-1)*100,Number(group)*100)),hash);
});
test('restored dashboard access rejects expired, wrong-role and cross-partner sessions',async()=>{
 let session;const guard=(await load('lib/server/releaseRouteAccess.js',{'next-auth':{getServerSession:async()=>session},'./authConfig':{authOptions:{}},'./sessionPolicy.cjs':{sessionIsCurrent}})).releaseRouteAccess;
 const context={params:{partner:'fastfreight'},res:response()};
 assert.equal((await guard(context,['partner'],true)).redirect.destination,'/login');
 const token='h.'+Buffer.from(JSON.stringify({exp:Math.floor(Date.now()/1000)+3600})).toString('base64url')+'.s';
 session={user:{id:'offline-user',roles:['user'],supabaseAccessToken:token}};
 assert.equal((await guard(context,['partner'],true)).redirect.destination,'/unauthorized');
 session.user.roles=['partner'];session.user.partner_type='another-partner';
 assert.equal((await guard(context,['partner'],true)).redirect.destination,'/unauthorized');
 session.user.partner_type='["fastfreight"]';session.user.unset=undefined;
 const valid=await guard(context,['partner'],true);assert.equal(valid.props.session.user.id,'offline-user');assert.equal(context.res.headers['Cache-Control'],'private, no-store');assert(!Object.hasOwn(valid.props.session.user,'unset'));
 session.user.supabaseAccessToken='invalid';assert.equal((await guard(context,['partner'],true)).redirect.destination,'/login');
});
test('invitation flow refuses unauthorised calls and validates inputs before provider access',async()=>{
 let authorised=false;let calls=0;
 const handler=(await load('pages/api/admin/invite.js',{'@supabase/supabase-js':{createClient(){calls++;throw Error('No provider expected');}},'@/lib/server/requireSuperAdmin':{requireSuperAdmin:async(req,res)=>{if(!authorised){res.status(401).json({error:'Unauthorised'});return null;}return {user:{id:'offline-admin'}};}}})).default;
 let res=response();await handler({method:'GET'},res);assert.equal(res.statusCode,405);
 res=response();await handler({method:'POST',body:{}},res);assert.equal(res.statusCode,401);
 authorised=true;res=response();await handler({method:'POST',body:{email:'invalid',role:'admin',account_type:'cash'}},res);assert.equal(res.statusCode,400);
 res=response();await handler({method:'POST',body:{email:'user@example.invalid',role:'partner',account_type:'cash'}},res);assert.equal(res.statusCode,503);assert.equal(calls,0);
});
test('authorised invitation uses the existing Supabase provider and persists canonical profile roles with mocked services',async()=>{
 let invitation;let profile;
 const client={auth:{admin:{inviteUserByEmail:async(email,options)=>{invitation={email,options};return {data:{user:{id:'new-offline-user',email}},error:null};}}},from(table){assert.equal(table,'users');return {upsert:async(row)=>{profile=row;return {error:null};}};}};
 const handler=(await load('pages/api/admin/invite.js',{'@supabase/supabase-js':{createClient:()=>client},'@/lib/server/requireSuperAdmin':{requireSuperAdmin:async()=>({user:{id:'offline-admin'}})}},{NEXT_PUBLIC_SUPABASE_URL:'https://example.invalid',SUPABASE_SERVICE_ROLE_KEY:'offline-only',NEXTAUTH_URL:'https://www.midnight-xpress.com'})).default;
 const res=response();await handler({method:'POST',body:{email:'USER@example.invalid',role:'partner',account_type:'credit',invoice_company_id:null}},res);
 assert.equal(res.statusCode,200);assert.equal(invitation.email,'user@example.invalid');assert.equal(invitation.options.redirectTo,'https://www.midnight-xpress.com/set-password');assert.deepEqual(Array.from(profile.roles),['partner']);assert.equal(profile.account_type,'credit');
});
