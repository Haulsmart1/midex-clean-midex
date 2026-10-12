const configs = {
  atech: () => import('@/components/partners/atechConfig'),
  fastfreight: () => import('@/components/partners/fastFreightConfig'),
  bond: () => import('@/components/partners/bondConfig'),
  tcr: () => import('@/components/partners/tcrConfig'),
  alptrans: () => import('@/components/partners/alptransConfig'),
  '247despatch': () => import('@/components/partners/247despatchConfig'),
  dwcook: () => import('@/components/partners/dwcookConfig'),
  jjx: () => import('@/components/partners/jjxConfig'),
};

export default function loadPartnerConfig(request) {
  const name = request.replace(/^\.\//, '').replace(/Config$/, '');
  if (!configs[name]) return Promise.reject(new Error('Unknown partner configuration'));
  return configs[name]();
}
