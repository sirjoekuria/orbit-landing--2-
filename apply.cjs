const fs = require('fs');

const targetFile = 'client/pages/Admin.tsx';
let content = fs.readFileSync(targetFile, 'utf8');
const replacement = fs.readFileSync('replacement.txt', 'utf8');

// Normalize line endings for safer matching
const normalizedContent = content.replace(/\r\n/g, '\n');

const startMarker = `  return (
    <div className="min-h-screen bg-gray-50">`;

const endMarker = `            {/* Messages Tab */}`;

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

// Map the index back to the exact content if possible or just use normalizedContent
// Since we are replacing, it's safer to just write back the normalizedContent
const newContent = normalizedContent.substring(0, startIndex) + replacement + normalizedContent.substring(endIndex + endMarker.length);

fs.writeFileSync(targetFile, newContent, 'utf8');
console.log("Successfully replaced layout via Node script using replacement.txt!");
