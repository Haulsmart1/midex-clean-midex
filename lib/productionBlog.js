import posts from '@/data/recovered-production-blog.json';
import routes from '@/data/recovered-production-european-routes.json';

export const blogPosts = posts;
export const europeanRoutes = routes;
export const blogGroupSize = 100;
export const routeGroupSize = 10000;

export function productionBlogGroup(number) {
  return posts.slice((number - 1) * blogGroupSize, number * blogGroupSize);
}

export function productionRouteGroup(number) {
  return routes.slice((number - 1) * routeGroupSize, number * routeGroupSize);
}
