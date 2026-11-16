import BlogGroup from '@/components/recovered/BlogGroup';
import { productionBlogGroup } from '@/lib/productionBlog';
export function getStaticProps() { return { props: { number: 6, routes: productionBlogGroup(6) } }; }
export default BlogGroup;
