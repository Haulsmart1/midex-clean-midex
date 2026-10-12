import BlogGroup from '@/components/recovered/BlogGroup';
import { productionBlogGroup } from '@/lib/productionBlog';
export function getStaticProps() { return { props: { number: 5, routes: productionBlogGroup(5) } }; }
export default BlogGroup;
