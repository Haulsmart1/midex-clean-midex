useEffect(() => {
  const drawRoute = async () => {
    if (!mapRef.current || !fromLat || !fromLng || !toLat || !toLng) return;

    // 🧼 Total clean-up
    if (mapInstance.current) {
      mapInstance.current.remove();
      mapInstance.current = null;
    }
    if (mapRef.current && mapRef.current._leaflet_id) {
      delete mapRef.current._leaflet_id;
    }

    const map = L.map(mapRef.current).setView([fromLat, fromLng], 6);
    mapInstance.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    try {
      const polylineCoords = await getRoutePolyline(
        { lat: fromLat, lng: fromLng },
        { lat: toLat, lng: toLng }
      );

      L.polyline(polylineCoords.map(([lng, lat]) => [lat, lng]), {
        color: '#00BFFF',
        weight: 5,
      }).addTo(map);
    } catch (err) {
      console.error('Routing error:', err.message);
    }
  };

  drawRoute();
}, [fromLat, fromLng, toLat, toLng]);
