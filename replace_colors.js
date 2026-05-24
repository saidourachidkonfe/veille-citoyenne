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
    
    // Replace hex colors with Tailwind utility class variables
    content = content.replace(/\[#1D4ED8\]/g, 'primary');
    content = content.replace(/\[#1E40AF\]/g, 'primary-hover');
    content = content.replace(/blue-800/g, 'primary-hover');

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        changedCount++;
        console.log('Updated:', file);
    }
});

console.log('Done. Files updated:', changedCount);
