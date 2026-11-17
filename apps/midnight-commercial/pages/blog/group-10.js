import BlogGroup from '@/components/recovered/BlogGroup';
import { productionBlogGroup } from '@/lib/productionBlog';
export function getStaticProps() { return { props: { number: 10, routes: productionBlogGroup(10) } }; }
export default BlogGroup;
