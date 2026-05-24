const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.jsx')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk('c:\\wamp64\\www\\veille\\frontend\\src');
let changedCount = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;
    
    // Replace all tailwind orange classes back to blue
    content = content.replace(/bg-orange-/g, 'bg-blue-');
    content = content.replace(/text-orange-/g, 'text-blue-');
    content = content.replace(/border-orange-/g, 'border-blue-');
    content = content.replace(/from-orange-/g, 'from-blue-');
    content = content.replace(/to-orange-/g, 'to-blue-');
    content = content.replace(/via-orange-/g, 'via-blue-');
    content = content.replace(/shadow-orange-/g, 'shadow-blue-');
    content = content.replace(/ring-orange-/g, 'ring-blue-');

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        changedCount++;
        console.log('Updated:', file);
    }
});

console.log('Done. Files updated:', changedCount);
