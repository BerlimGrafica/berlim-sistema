const fs = require('fs');
let utils = fs.readFileSync('lib/utils.js', 'utf8');

// Replace "const XXX = " with "export const XXX = "
utils = utils.replace(/^const /gm, 'export const ');
// Also replace "function " with "export function "
utils = utils.replace(/^function /gm, 'export function ');

// Fix the import section that might have been hit
utils = utils.replace(/export const supabase/, 'const supabase');

fs.writeFileSync('lib/utils.js', utils);
