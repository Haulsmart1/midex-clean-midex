import BlogGroup from '@/components/recovered/BlogGroup';
import { productionBlogGroup } from '@/lib/productionBlog';
export function getStaticProps() { return { props: { number: 9, routes: productionBlogGroup(9) } }; }
export default BlogGroup;
