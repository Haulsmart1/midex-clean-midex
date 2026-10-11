// hash-generator.js
const bcrypt = require('bcryptjs');

const password = process.env.HASH_GENERATOR_PASSWORD;
if (!password) {
  console.error('Set HASH_GENERATOR_PASSWORD before running this local utility.');
  process.exit(1);
}

bcrypt.hash(password, 10, (err, hash) => {
  if (err) {
    console.error('Hashing error:', err);
    return;
  }

  console.log(`Hash : ${hash}`);
});
