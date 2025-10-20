'use client';

import React from 'react';
import styles from '@/styles/NeonToggle.module.css';

export default function NeonToggle({ checked, onChange, label }) {
  return (
    <label className={styles.toggleContainer}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className={styles.slider}></span>
      {label && <span className={styles.label}>{label}</span>}
    </label>
  );
}
