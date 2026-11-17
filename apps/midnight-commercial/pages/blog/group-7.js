import BlogGroup from '@/components/recovered/BlogGroup';
import { productionBlogGroup } from '@/lib/productionBlog';
export function getStaticProps() { return { props: { number: 7, routes: productionBlogGroup(7) } }; }
export default BlogGroup;
