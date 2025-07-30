const fs = require('fs');
const path = require('path');

const basePath = path.join(__dirname, '..', 'public', 'locales');
const defaultContent = {
  greeting: "Welcome",
  cookieMessage: "We use cookies to enhance your experience. By continuing to visit this site you agree to our use of cookies.",
  accept: "Accept",
  language: "Language"
};

fs.readdirSync(basePath).forEach((lang) => {
  const langPath = path.join(basePath, lang);
  const filePath = path.join(langPath, 'common.json');

  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultContent, null, 2), 'utf-8');
    console.log(`✅ Created: ${filePath}`);
  } else {
    console.log(`⚠️  Skipped (already exists): ${filePath}`);
  }
});
