const fs = require('fs');

let content = fs.readFileSync('components/Modals.jsx', 'utf8');

// Replace all instances of 'modal<Something>Aberto &&' that are NOT inside curly braces with '{modal<Something>Aberto &&'
// The best way is to parse the modals_ast.json and just regenerate it correctly!
