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
    
    // Replace all tailwind blue classes with orange
    content = content.replace(/bg-blue-/g, 'bg-orange-');
    content = content.replace(/text-blue-/g, 'text-orange-');
    content = content.replace(/border-blue-/g, 'border-orange-');
    content = content.replace(/from-blue-/g, 'from-orange-');
    content = content.replace(/to-blue-/g, 'to-orange-');
    content = content.replace(/via-blue-/g, 'via-orange-');
    content = content.replace(/shadow-blue-/g, 'shadow-orange-');
    content = content.replace(/ring-blue-/g, 'ring-orange-');

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        changedCount++;
        console.log('Updated:', file);
    }
});

console.log('Done. Files updated:', changedCount);
