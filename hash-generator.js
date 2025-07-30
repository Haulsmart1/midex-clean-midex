// hash-generator.js
const bcrypt = require('bcryptjs');

const password = 'SuperSecure123'; // 🔐 Change this to your real password

bcrypt.hash(password, 10, (err, hash) => {
  if (err) {
    console.error('Hashing error:', err);
    return;
  }

  console.log(`Plain: ${password}`);
  console.log(`Hash : ${hash}`);
});
