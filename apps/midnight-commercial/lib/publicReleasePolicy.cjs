// The public freight release exposes only the reviewed enquiry/auth surface.
// Legacy booking, payment, user-management and mail handlers stay in source,
// but cannot be activated by requests to this minimum commercial release.
function publicReleaseRoute(path) {
  try {path=decodeURIComponent(path).toLowerCase().replace(/\/+/g,'/');} catch {return false;}
  if(path.includes('%') || path.split('/').some(part=>part==='.'||part==='..') || /[\u0000-\u001f]/.test(path))return false;
  if(/^\/_next\/data\/[^/]+\/(dashboard)(\/|\.)/.test(path))return false;
  if (path.startsWith('/api/')) {
    return path.startsWith('/api/auth/') || ['/api/enquiry','/api/operations/enquiries','/api/sitemap'].includes(path.replace(/\/$/,''));
  }
  return !/^\/(dashboard)(\/|$)/.test(path);
}
module.exports={publicReleaseRoute};
