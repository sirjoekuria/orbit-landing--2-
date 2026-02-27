const fs = require('fs');

const targetFile = 'client/pages/Admin.tsx';
let content = fs.readFileSync(targetFile, 'utf8');
const replacement = fs.readFileSync('earnings-replacement.txt', 'utf8');

// Normalize line endings for safer matching
const normalizedContent = content.replace(/\r\n/g, '\n');

const startMarker = `            {/* Rider Earnings Tab */}`;

const endMarker = `            {/* Rider Activity Log Tab */}`;

const startIndex = normalizedContent.indexOf(startMarker);
const endIndex = normalizedContent.indexOf(endMarker);

if (startIndex === -1) {
    console.error("Could not find start marker");
    process.exit(1);
}

if (endIndex === -1) {
    console.error("Could not find end marker");
    process.exit(1);
}

const newContent = normalizedContent.substring(0, startIndex) + replacement + normalizedContent.substring(endIndex);

fs.writeFileSync(targetFile, newContent, 'utf8');
console.log("Successfully replaced Rider Earnings Tab via Node script!");
