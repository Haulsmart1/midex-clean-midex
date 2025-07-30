'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const NoSSRMap = dynamic(() => import('./ORSLeafletMap'), { ssr: false });

const ORSRouteMap = ({ from, to, routeLine }) => {
  if (!from || !to) return <p>⚠️ Invalid coordinates</p>;
  return <NoSSRMap from={from} to={to} routeLine={routeLine} />;
};

export default ORSRouteMap;
