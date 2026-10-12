import routeMeta from '@/data/recovered-production-freight.json';
import ProductionFreightRoute from '@/components/recovered/ProductionFreightRoute';
import LegacyFreightRoute from '@/components/recovered/LegacyFreightRoute';
const slugs = ["liverpool-to-dublin","cairnryan-to-larne","dover-to-calais","rosslare-to-cherbourg","felixstowe-to-zeebrugge","heysham-to-belfast","heysham-to-dublin","heysham-to-warrenpoint","liverpool-to-belfast","rosslare-to-bilbao","immingham-to-esbjerg","immingham-to-hook-of-holland","southampton-to-plymouth","bristol-to-portsmouth","cardiff-to-swansea","edinburgh-to-nottingham","liverpool-to-leeds","bristol-to-sheffield","birmingham-to-glasgow","manchester-to-birmingham","london-to-manchester","cardiff-to-newcastle","london-to-glasgow","sheffield-to-leicester","leeds-to-london","portsmouth-to-bristol","oxford-to-cambridge","glasgow-to-edinburgh","nottingham-to-leeds","coventry-to-derby","newcastle-to-hull","liverpool-to-york"];
export function getStaticPaths() { return { paths: slugs.map(slug => ({ params: { slug } })), fallback: false }; }
export function getStaticProps({ params }) { return { props: { slug: params.slug, description: routeMeta[params.slug]?.desc || '' } }; }
export default function FreightRoute(props) { return routeMeta[props.slug] ? <ProductionFreightRoute {...props} /> : <LegacyFreightRoute {...props} />; }
