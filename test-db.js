require('dotenv').config();
console.log('DATABASE_URL:', process.env.DATABASE_URL?.slice(0, 50) + '...');
console.log('DIRECT_URL:', process.env.DIRECT_URL?.slice(0, 50) + '...');

// Check if port 6543 is in the URL
if (process.env.DATABASE_URL?.includes(':6543')) {
  console.log('❌ Found problematic port 6543 in DATABASE_URL');
} else if (process.env.DATABASE_URL?.includes(':5432')) {
  console.log('✅ Found correct port 5432 in DATABASE_URL');
} else {
  console.log('⚠️ No port found in DATABASE_URL');
}
