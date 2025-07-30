// utils/selectRoute.js

import { routes } from './routesConfig';

export function selectRoute(collectionPostcode, deliveryPostcode) {
  const colPrefix = collectionPostcode.slice(0, 2).toUpperCase();
  const delPrefix = deliveryPostcode.slice(0, 2).toUpperCase();

  return (
    routes.find(
      (route) =>
        route.status === 'open' &&
        route.ports.collection.slice(0, 2).toUpperCase() === colPrefix &&
        route.ports.delivery.slice(0, 2).toUpperCase() === delPrefix
    ) || null
  );
}
