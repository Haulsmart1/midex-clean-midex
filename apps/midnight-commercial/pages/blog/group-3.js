import BlogGroup from '@/components/recovered/BlogGroup';
import { productionBlogGroup } from '@/lib/productionBlog';
export function getStaticProps() { return { props: { number: 3, routes: productionBlogGroup(3) } }; }
export default BlogGroup;
