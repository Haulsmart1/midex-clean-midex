import dynamic from 'next/dynamic';
import FreightHomepage from '@/components/freight/FreightHomepage';
const ProductionHomepage = dynamic(() => import('@/components/recovered/ProductionHomepage'));
export default function Home({ preserveSharedHomepage = false }) {
  return preserveSharedHomepage ? <ProductionHomepage /> : <FreightHomepage />;
}
export function getServerSideProps({ req, res }) {
  const host = String(req.headers.host || '').toLowerCase().split(':')[0];
  const preserveSharedHomepage = /^(www\.)?(express-pallets|lithiumbattery)\.app$/.test(host);
  res.setHeader('Cache-Control', 'private, no-store');
  return { props: { preserveSharedHomepage } };
}

Home.freightMarketing=true;
