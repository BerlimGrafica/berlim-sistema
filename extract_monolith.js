const { execSync } = require('child_process');
const fs = require('fs');
const buffer = execSync('git show HEAD~1:app/page.jsx', { encoding: 'buffer' });
fs.writeFileSync('monolith.jsx', buffer);
