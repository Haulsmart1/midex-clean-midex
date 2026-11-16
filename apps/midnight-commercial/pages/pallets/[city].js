import {cities} from '@/lib/cities';
import DestinationPage from '@/components/freight/DestinationPage';
export function getStaticPaths(){return {paths:cities.map(city=>({params:{city:city.slug}})),fallback:false};}
export function getStaticProps({params}){const city=cities.find(city=>city.slug===params.city);return city?{props:{name:city.name,path:'/pallets/'+city.slug}}:{notFound:true};}
export default DestinationPage;
