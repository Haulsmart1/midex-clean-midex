import BlogGroup from '@/components/recovered/BlogGroup';
import { productionBlogGroup } from '@/lib/productionBlog';
export function getStaticProps() { return { props: { number: 2, routes: productionBlogGroup(2) } }; }
export default BlogGroup;
