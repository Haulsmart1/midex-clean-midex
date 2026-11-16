import {internalRegions} from '@/lib/internalRegions';
import DestinationPage from '@/components/freight/DestinationPage';
export function getStaticPaths(){return {paths:internalRegions.map(region=>({params:{region:region.slug}})),fallback:false};}
export function getStaticProps({params}){const region=internalRegions.find(region=>region.slug===params.region);return region?{props:{name:region.name,path:'/internal/'+region.slug}}:{notFound:true};}
export default DestinationPage;
