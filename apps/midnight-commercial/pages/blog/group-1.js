import BlogGroup from '@/components/recovered/BlogGroup';
import { productionBlogGroup } from '@/lib/productionBlog';
export function getStaticProps() { return { props: { number: 1, routes: productionBlogGroup(1) } }; }
export default BlogGroup;
