// components/common/SlideContainer.js
'use client';
import React from "react";

export default function SlideContainer({ children, style = {} }) {
  return (
    <div
      style={{
        background: "linear-gradient(145deg, #2a1a3d, #1f1430)",
        borderRadius: "1rem",
        boxShadow: "0 0 20px rgba(0,212,255,0.25), 0 0 40px rgba(157,107,255,0.2)",
        padding: "1.5rem",
        color: "#f5f5f5",
        ...style
      }}
    >
      {children}
    </div>
  );
}
