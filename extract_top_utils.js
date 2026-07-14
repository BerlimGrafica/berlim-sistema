const fs = require('fs');
const content = fs.readFileSync('utils_extracted.js', 'utf8');
const compStart = content.indexOf('function CustomDatePicker');
const topLevel = content.substring(0, compStart);
fs.writeFileSync('lib/utils.js', topLevel);
