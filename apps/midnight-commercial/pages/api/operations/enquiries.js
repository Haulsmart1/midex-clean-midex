import { authorize } from '@/lib/server/enquiryStaff.cjs';
import { repository } from '@/lib/server/enquiryRepository.cjs';
import { sameOrigin } from '@/lib/server/enquiryCapture.cjs';
export const config={api:{bodyParser:{sizeLimit:'2kb'}}};
export default async function handler(req,res) {
  res.setHeader('Cache-Control','private, no-store');
  res.setHeader('X-Content-Type-Options','nosniff');
  if(!['GET','POST'].includes(req.method)){res.setHeader('Allow','GET, POST');return res.status(405).end();}
  const access=await authorize(req,process.env);
  if(access.code!==200)return res.status(access.code).json({message:access.code===503?'Staff access is not configured or temporarily unavailable.':'Sign in with an authorised operations account.'});
  const reference=typeof req.query.reference==='string'?req.query.reference:'';
  if(reference && !/^MID-[A-F0-9]{32}$/.test(reference))return res.status(404).end();
  if(req.method==='POST'){
      if(!sameOrigin(req)||!String(req.headers['content-type']).startsWith('application/json'))return res.status(403).end();
      if(!reference)return res.status(400).end();
      const states=['new','open','reviewing','quoted','booked','closed','declined'];
      if(!states.includes(req.body?.expected)||!states.includes(req.body?.status))return res.status(400).end();
  }
  try {
    const repo=repository();
    if(req.method==='POST'){
      const result=await repo.changeStatus(reference,req.body.expected,req.body.status,access.id);
      if(result.missing)return res.status(404).end();
      if(result.conflict)return res.status(409).json({message:'Another operator changed this enquiry. Reload before updating.'});
      return res.status(200).json(result);
    }
    if(reference && req.query.attachment){
      if(typeof req.query.attachment!=='string'||!/^[a-f0-9-]{36}$/i.test(req.query.attachment))return res.status(404).end();
      const file=await repo.download(reference,req.query.attachment);if(!file)return res.status(404).end();
      res.setHeader('Content-Type',file.media_type);
      res.setHeader('Content-Disposition',"attachment; filename=\"enquiry-document\"; filename*=UTF-8''"+encodeURIComponent(file.name));
      res.setHeader('Content-Security-Policy',"default-src 'none'; sandbox");
      return res.status(200).send(file.content);
    }
    if(reference){const item=await repo.detail(reference);return item?res.status(200).json({item}):res.status(404).end();}
    const before=typeof req.query.before==='string'&&!Number.isNaN(Date.parse(req.query.before))?req.query.before:null;
    const cursor=typeof req.query.cursor==='string'?req.query.cursor:'';
    const rows=await repo.list(before,cursor);
    const next=rows.length>50?{before:rows[49].cursor_time,cursor:rows[49].reference}:null;
    return res.status(200).json({rows:rows.slice(0,50),next});
  } catch {return res.status(503).json({message:'The result could not be confirmed. Reload before retrying.'});}
}
