import posts from '@/data/recovered-production-blog.json';
import freight from '@/docs/P0-FREIGHT-RECOVERY.json';
import {cities} from '@/lib/cities';
import {internalRegions} from '@/lib/internalRegions';
const root='https://www.midnight-xpress.com';
export default function handler(req,res){if(!['GET','HEAD'].includes(req.method))return res.status(405).end();const paths=new Set(['/', '/about','/contact','/booking','/register','/login','/blog','/freight-resources','/road-freight','/air-freight','/sea-freight','/time-critical-freight','/european-freight','/blog/routes/group-1',...Array.from({length:10},(_,i)=>'/blog/group-'+(i+1)),...posts.map(p=>'/blog/'+p.slug),...freight.preservedSlugs.map(slug=>'/freight/'+slug),...cities.map(c=>'/pallets/'+c.slug),...internalRegions.map(r=>'/internal/'+r.slug)]);const xml='<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+[...paths].map(p=>'<url><loc>'+root+p.replace(/&/g,'&amp;').replace(/</g,'&lt;')+'</loc></url>').join('')+'</urlset>';res.setHeader('Content-Type','application/xml; charset=utf-8');res.setHeader('Cache-Control','public, max-age=3600');return res.status(200).send(xml);}
