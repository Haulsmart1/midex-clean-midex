const { createHmac } = require('node:crypto');
const { normalize, brief, emailPattern } = require('../freight/enquiry.cjs');
const { attachments } = require('./enquiryAttachments.cjs');
const { databaseConnection } = require('./enquiryDatabaseConfig.cjs');
const digest = (secret, value) => createHmac('sha256',secret).update(value).digest('hex');
function configured(env) {
  try {
    databaseConnection(env);
    return env.MIDNIGHT_ENQUIRY_ENABLED === 'true' && (env.MIDNIGHT_ENQUIRY_HASH_SECRET || '').length >= 32;
  } catch { return false; }
}
function emailConfigured(env) {
  return env.MIDNIGHT_ENQUIRY_EMAIL_ENABLED === 'true' &&
    ['MIDNIGHT_ENQUIRY_SMTP_HOST','MIDNIGHT_ENQUIRY_SMTP_USER','MIDNIGHT_ENQUIRY_SMTP_PASS'].every(k=>Boolean(env[k])) &&
    ['MIDNIGHT_ENQUIRY_FROM','MIDNIGHT_ENQUIRY_TO'].every(k=>emailPattern.test(env[k] || ''));
}
function sameOrigin(req) {
  try { const url=new URL(req.headers.origin); return ['http:','https:'].includes(url.protocol) && url.host === req.headers.host; } catch { return false; }
}
async function notify({ env, repo, send, reference, data, actor = 'customer' }) {
  if (!emailConfigured(env)) return 'disabled';
  try {
    if (!await repo.claim(reference,actor)) return 'pending';
    let state='uncertain', providerReference=null;
    try {
      const info=await send({ from:env.MIDNIGHT_ENQUIRY_FROM, to:env.MIDNIGHT_ENQUIRY_TO, replyTo:data.email,
        subject:reference+' | '+data.mode+' freight enquiry',
        text:'Originating product: MIDNIGHT\nReference: '+reference+'\nReview stored enquiry and documents in the protected operations view at /operations/enquiries/'+reference+'\n\n'+brief(data),
        headers:{'X-Midnight-Reference':reference,'X-Originating-Product':'MIDNIGHT'}, disableFileAccess:true,disableUrlAccess:true });
      if(info?.accepted?.some(v=>v.toLowerCase()===env.MIDNIGHT_ENQUIRY_TO.toLowerCase()) && !info?.rejected?.length) {
        state='accepted'; providerReference=typeof info.messageId==='string' ? info.messageId.slice(0,300) : null;
      } else if(info?.rejected?.some(v=>v.toLowerCase()===env.MIDNIGHT_ENQUIRY_TO.toLowerCase()) && !info?.accepted?.length) state='failed';
    } catch(error) {
      // Only an explicit SMTP rejection is safe to retry. Timeouts may follow acceptance.
      if (Number.isInteger(error?.responseCode) && error.responseCode>=400 && error.responseCode<=599) state='failed';
    }
    await repo.finish(reference,state,providerReference,actor);
    return state;
  } catch { return 'pending'; }
}
function createHandler({env,repository,send}) {
  return async(req,res)=>{
    res.setHeader('Cache-Control','no-store');
    const reply=(code,state,message,reference)=>res.status(code).json({state,message,...(reference?{reference}:{})});
    if(req.method!=='POST'){res.setHeader('Allow','POST');return reply(405,'invalid','Use POST');}
    if(!(req.headers['content-type']||'').toLowerCase().startsWith('application/json'))return reply(415,'invalid','Use JSON');
    if(!sameOrigin(req))return reply(403,'invalid','Use the enquiry page');
    let data,files;
    try{
      data=normalize(req.body); files=attachments(req.body.attachments);
      if(!/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(req.body.requestId||''))throw Error('Reload the enquiry page before submitting');
    }catch(error){return reply(400,'invalid',error.message);}
    if(!configured(env))return reply(503,'unavailable','Online capture is unavailable. Your enquiry has not been confirmed. Please email or call operations.');
    const secret=env.MIDNIGHT_ENQUIRY_HASH_SECRET;
    const ip=env.VERCEL==='1'?req.headers['x-real-ip']||'unknown':req.socket?.remoteAddress||'unknown';
    let stored,repo;
    try {
      repo=repository();
      stored=await repo.capture({data,files,requestKey:digest(secret,req.body.requestId),
        fingerprint:digest(secret,JSON.stringify({data,files:files.map(f=>({name:f.name,digest:f.digest}))})),
        rates:[{key:'ip:'+digest(secret,ip),limit:20},{key:'email:'+digest(secret,data.email),limit:5}],
        notification:emailConfigured(env)?'pending':'disabled'});
    } catch {return reply(503,'unconfirmed','Receipt could not be confirmed. Your draft is retained. Retry without changing the enquiry to check the same reference, or call operations.');}
    if(stored.limited){res.setHeader('Retry-After','600');return reply(429,'limited','Too many attempts. Please wait ten minutes or call operations.');}
    if(stored.conflict)return reply(409,'invalid','This submission reference belongs to different details. Clear the draft to start a new enquiry.');
    const notification=stored.notification==='accepted'?'accepted':await notify({env,repo,send,reference:stored.reference,data});
    return reply(200,'received','Your enquiry has been received and stored. '+(notification==='accepted'?'The mail server accepted the operations notification.':'Operations notification is pending; please call for urgent freight.')+' This is not a quotation or booking confirmation.',stored.reference);
  };
}
module.exports={configured,emailConfigured,sameOrigin,notify,createHandler};
