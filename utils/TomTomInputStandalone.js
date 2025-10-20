'use client';

import React, { useState, useEffect } from 'react';
import { Controller } from 'react-hook-form';

export default function TomTomAutocompleteInput({
  name,
  control,
  value,
  onChange,
  placeholder = 'Enter address...',
}) {
  const [query, setQuery] = useState(value?.address || '');
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [manualMode, setManualMode] = useState(false);

  const fetchSuggestions = async (input) => {
    if (!input) return setResults([]);
    try {
      const res = await fetch(
        `https://api.tomtom.com/search/2/search/${encodeURIComponent(
          input
        )}.json?key=${process.env.NEXT_PUBLIC_TOMTOM_API_KEY}&limit=5&countrySet=GB`
      );
      const data = await res.json();
      setResults(data.results || []);
    } catch (err) {
      console.error('TomTom API error:', err);
      setResults([]);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!manualMode) fetchSuggestions(query);
    }, 300);
    return () => clearTimeout(timeout);
  }, [query, manualMode]);

  const renderInput = (inputOnChange) => (
    <div style={{ position: 'relative', width: '100%' }}>
      <div style={{ marginBottom: '0.5rem' }}>
        <label style={{ color: '#fff', fontSize: '0.9rem' }}>
          <input
            type="checkbox"
            checked={manualMode}
            onChange={(e) => {
              setManualMode(e.target.checked);
              setResults([]);
              setQuery('');
              inputOnChange({
                address: '',
                postcode: '',
                lat: null,
                lon: null,
              });
            }}
            style={{ marginRight: '0.5rem' }}
          />
          Enter address manually
        </label>
      </div>

      <input
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setShowDropdown(true);
          if (manualMode) {
            inputOnChange({
              address: e.target.value,
              postcode: '',
              lat: null,
              lon: null,
            });
          }
        }}
        onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
        style={{
          width: '100%',
          padding: '8px',
          fontSize: '1rem',
          backgroundColor: '#1a1a1a',
          color: '#fff',
          border: '1px solid #333',
        }}
      />

      {!manualMode && showDropdown && results.length > 0 && (
        <ul
          style={{
            listStyle: 'none',
            position: 'absolute',
            zIndex: 10,
            background: '#1a1a1a',
            color: '#fff',
            border: '1px solid #333',
            width: '100%',
            maxHeight: '150px',
            overflowY: 'auto',
            margin: 0,
            padding: 0,
          }}
        >
          {results.map((res, idx) => {
            const address = res.address?.freeformAddress || '';
            return (
              <li
                key={idx}
                style={{
                  padding: '8px',
                  cursor: 'pointer',
                  borderBottom: '1px solid #333',
                }}
                onMouseOver={(e) => (e.currentTarget.style.background = '#333')}
                onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
                onClick={() => {
                  const payload = {
                    address,
                    postcode: res.address?.postalCode || '',
                    lat: res.position?.lat,
                    lon: res.position?.lon,
                  };
                  inputOnChange(payload);
                  setQuery(address);
                  setShowDropdown(false);
                }}
              >
                {address}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );

  if (control) {
    return (
      <Controller
        name={name}
        control={control}
        defaultValue={{ address: '', postcode: '', lat: null, lon: null }}
        render={({ field: { onChange: rhfOnChange } }) => renderInput(rhfOnChange)}
      />
    );
  }

  return renderInput(onChange);
}
