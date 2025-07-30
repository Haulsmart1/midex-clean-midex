// hooks/useDistance.js
import { useState, useEffect } from 'react';

export function useDistance(from, to) {
  const [distance, setDistance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!from || !to) return;

    const fetchDistance = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/distance?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`);
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || 'Distance fetch failed');
        setDistance(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDistance();
  }, [from, to]);

  return { distance, loading, error };
}
