const fs = require('fs');
const execSync = require('child_process').execSync;
const origCode = execSync('git show HEAD:app/page.jsx').toString();

const appStart = origCode.indexOf('function App()');
const topPart = origCode.substring(0, appStart);
fs.writeFileSync('utils_extracted.js', topPart);
