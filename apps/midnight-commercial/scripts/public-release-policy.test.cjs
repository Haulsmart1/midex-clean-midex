const {test}=require('node:test');
const assert=require('node:assert/strict');
const {publicReleaseRoute}=require('../lib/publicReleasePolicy.cjs');
test('public release permits enquiry and authentication without exposing legacy mutations',()=>{
 for(const path of ['/','/contact','/enquiry','/operations/enquiries','/api/enquiry','/api/enquiry/','/api/operations/enquiries','/api/auth/session','/api/auth/callback/credentials','/api/sitemap'])assert.equal(publicReleaseRoute(path),true,path);
 for(const path of ['/api/create-checkout-session','/api/register','/api/delete-user','/api/users','/api/contact','/api/send-welcome','/api/invoice/123','/api/bookings','/api/enquiry/unsafe','/dashboard/admin','/dashboard','/API/USERS','/api%2fdelete-user','/api%252fdelete-user','/api/auth/../delete-user','/_next/data/build/dashboard/admin.json'])assert.equal(publicReleaseRoute(path),false,path);
});
