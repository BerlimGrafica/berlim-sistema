const fs = require('fs');
const content = fs.readFileSync('app.js', 'utf8');

// Find all React component definitions (const Name = ...)
const componentRegex = /const ([A-Z][a-zA-Z0-9]+) =/g;
let match;
let components = [];
while ((match = componentRegex.exec(content)) !== null) {
    components.push(match[1]);
}

let unused = [];
for (let comp of components) {
    // Count occurrences of the component name
    let regex = new RegExp('\\b' + comp + '\\b', 'g');
    let matches = content.match(regex);
    // If it's only found once (the declaration itself), it's unused.
    if (matches && matches.length === 1) {
        unused.push(comp);
    }
}
console.log('Potentially unused components:');
console.log(unused.join(', '));

// Find large comment blocks
const blockCommentRegex = /\/\*[\s\S]*?\*\//g;
let comments = [];
while ((match = blockCommentRegex.exec(content)) !== null) {
    if (match[0].split('\n').length > 10) {
        comments.push({
            lines: match[0].split('\n').length,
            preview: match[0].substring(0, 50).replace(/\n/g, ' ')
        });
    }
}
console.log('\nLarge block comments (>10 lines):');
console.dir(comments);
