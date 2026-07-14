const fs = require('fs');

const content = fs.readFileSync('app/page.jsx', 'utf8');
const appStart = content.indexOf('function App()');

let braceCount = 0;
let inApp = false;
let mainReturnStart = -1;

for (let i = appStart; i < content.length; i++) {
    if (content[i] === '{') {
        if (!inApp) inApp = true;
        braceCount++;
    } else if (content[i] === '}') {
        braceCount--;
        if (inApp && braceCount === 0) {
            // App ends at i
            break;
        }
    }
    
    // Look for return ( at braceCount 1
    if (inApp && braceCount === 1) {
        if (content.substr(i, 8) === 'return (') {
            mainReturnStart = i;
            break;
        }
    }
}

if (mainReturnStart !== -1) {
    const logic = content.substring(appStart, mainReturnStart);
    console.log("Logic length:", logic.split('\n').length, "lines");
} else {
    console.log("Main return not found");
}
