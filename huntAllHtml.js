// 📁 huntAllHtml.js
const fs = require('fs');
const path = require('path');

function scan(dir) {
  const entries = fs.readdirSync(dir);
  for (const entry of entries) {
    const fullPath = path.join(dir, entry);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      scan(fullPath);
    } else if (/\.(js|jsx|ts|tsx)$/.test(entry)) {
      const content = fs.readFileSync(fullPath, 'utf-8');

      if (
        content.includes("Html") ||
        content.includes("from 'next/document'") ||
        content.includes('from "next/document"') ||
        content.includes('_document')
      ) {
        console.log(`💀 SUS FILE: ${fullPath}`);
        const lines = content.split('\n');
        lines.forEach((line, index) => {
          if (line.includes('Html') || line.includes('next/document') || line.includes('_document')) {
            console.log(`  ${index + 1}: ${line.trim()}`);
          }
        });
        console.log('\n');
      }
    }
  }
}

console.log('🧨 Hunting all traces of Html, next/document, and _document.js');
scan('./');
