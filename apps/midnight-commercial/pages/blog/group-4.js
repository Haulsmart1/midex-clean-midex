import BlogGroup from '@/components/recovered/BlogGroup';
import { productionBlogGroup } from '@/lib/productionBlog';
export function getStaticProps() { return { props: { number: 4, routes: productionBlogGroup(4) } }; }
export default BlogGroup;
