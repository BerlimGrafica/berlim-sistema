const fs = require('fs');
const code = fs.readFileSync('app/page.jsx', 'utf8');
const appStart = code.indexOf('function App() {');
const mainReturn = 116593;
const logic = code.substring(appStart, mainReturn);
fs.writeFileSync('app_body.txt', logic);
