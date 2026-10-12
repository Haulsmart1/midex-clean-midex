import BlogGroup from '@/components/recovered/BlogGroup';
import { productionBlogGroup } from '@/lib/productionBlog';
export function getStaticProps() { return { props: { number: 8, routes: productionBlogGroup(8) } }; }
export default BlogGroup;
