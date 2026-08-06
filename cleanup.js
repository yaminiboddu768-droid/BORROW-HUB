const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.tsx') || file.endsWith('.ts')) results.push(file);
    }
  });
  return results;
}

const files = walk('app/admin');
files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  content = content.replace(/import\s+\{([^}]+)\}\s+from\s+['"]@\/lib\/adminMockData['"];?/g, '');
  content = content.replace(/INITIAL_ADMIN_KYC_REQUESTS/g, '[]');
  content = content.replace(/INITIAL_ADMIN_REPORTS/g, '[]');
  content = content.replace(/INITIAL_ADMIN_USERS/g, '[]');
  content = content.replace(/INITIAL_ADMIN_ANALYTICS/g, '{ monthlyGMV: [], revenueByCategory: [] }');
  content = content.replace(/INITIAL_ADMIN_LISTINGS/g, '[]');
  content = content.replace(/INITIAL_ADMIN_PARTNERS/g, '[]');
  content = content.replace(/INITIAL_ADMIN_REQUESTS/g, '[]');
  fs.writeFileSync(f, content);
});
console.log('Cleanup complete');
