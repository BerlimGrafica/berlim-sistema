const fs = require('fs');

const logic = fs.readFileSync('app_body.txt', 'utf8');

const stateMatches = [...logic.matchAll(/const \[([a-zA-Z0-9_]+),\s*([a-zA-Z0-9_]+)\]\s*=\s*useState/g)];
const states = [];
stateMatches.forEach(m => {
    states.push(m[1], m[2]);
});

const funcMatches = [...logic.matchAll(/const ([a-zA-Z0-9_]+)\s*=\s*(async\s*)?\(/g)];
const funcs = [];
funcMatches.forEach(m => {
    funcs.push(m[1]);
});

const refMatches = [...logic.matchAll(/const ([a-zA-Z0-9_]+)\s*=\s*useRef/g)];
const refs = [];
refMatches.forEach(m => {
    refs.push(m[1]);
});

const varMatches = [...logic.matchAll(/const ([a-zA-Z0-9_]+)\s*=\s*([^=\n]+);/g)];
const vars = [];
varMatches.forEach(m => {
    if (!states.includes(m[1]) && !funcs.includes(m[1]) && !refs.includes(m[1])) {
        if (m[1] !== 'supabase' && m[1] !== 'canalRealTime' && m[1] !== 'isAdm' && m[1] !== 'isFin' && m[1] !== 'isOpe') {
            vars.push(m[1]);
        }
    }
});

const allExports = [...new Set([...states, ...funcs, ...refs, 'itensPorPagina', 'isAdmin', 'isOperador'])].filter(x => x !== 'supabase');

let contextFile = `"use client";\nimport React, { createContext, useContext, useState, useEffect, useRef, useMemo } from 'react';\nimport { createClient } from '@supabase/supabase-js';\n\nconst supabase = createClient('https://xbanoipgoleuahwbqksy.supabase.co', 'sb_publishable_RSQ4odG0wxy8ZucJHu_WvQ_0JfM8jbh');\n\nexport const AppContext = createContext();\n\nexport const AppProvider = ({ children }) => {\n`;

contextFile += logic.replace('function App() {', '').trim();

contextFile += `\n\n    const value = {\n        ${allExports.join(',\n        ')}\n    };\n\n    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;\n};\n\nexport const useAppContext = () => useContext(AppContext);\n`;

fs.writeFileSync('context/AppContext.jsx', contextFile);
console.log('AppProvider created with', allExports.length, 'exported variables/functions.');
