const fs = require('fs');
const { Client } = require('pg');

async function run() {
  const client = new Client({ connectionString: 'postgresql://postgres.yrbtdqwuxtuzktapmriz:BorrowHub2026@aws-0-ap-south-1.pooler.supabase.com:6543/postgres' });
  try {
    // Read as UTF-16 LE because PowerShell > operator outputs UTF-16 LE
    let sql = fs.readFileSync('schema.sql', 'utf16le');
    
    // Remove BOM if present
    if (sql.charCodeAt(0) === 0xFEFF) {
      sql = sql.slice(1);
    }

    await client.connect();
    console.log('Connected to DB');
    
    // Split by statement
    const statements = sql.split(';').map(s => s.trim()).filter(s => s.length > 0);
    
    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      console.log(`Executing ${i+1}/${statements.length}:`, stmt.substring(0, 50).replace(/\n/g, ' '));
      await client.query(stmt);
    }
    
    console.log('Schema created successfully');
  } catch(e) {
    console.error('Error executing schema:', e);
  } finally {
    await client.end();
  }
}
run();
