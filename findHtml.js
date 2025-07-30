// 📁 findHtml.js
const fs = require('fs');
const path = require('path');

function searchHtmlImports(dir) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      searchHtmlImports(fullPath);
    } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
      const contents = fs.readFileSync(fullPath, 'utf8');
      if (contents.includes("Html") && contents.includes("from 'next/document'")) {
        console.log(`❌ Found bad Html import in: ${fullPath}`);
      }
    }
  });
}

console.log('🔍 Scanning for illegal <Html> usage...');
searchHtmlImports('./');
