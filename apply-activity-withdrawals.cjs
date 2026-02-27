const fs = require('fs');

const targetFile = 'client/pages/Admin.tsx';
let content = fs.readFileSync(targetFile, 'utf8');

const activityReplacement = fs.readFileSync('activity-replacement.txt', 'utf8');
const withdrawalReplacement = fs.readFileSync('withdrawals-replacement.txt', 'utf8');

// Normalize line endings for safer matching
let normalizedContent = content.replace(/\r\n/g, '\n');

const activityStartMarker = `            {/* Rider Activity Log Tab */}`;
const activityEndMarker = `            {/* Withdrawal Requests Tab */}`;
const withdrawalEndMarker = `            {/* Automated Payments Tab */}`;

const actStartIndex = normalizedContent.indexOf(activityStartMarker);
const actEndIndex = normalizedContent.indexOf(activityEndMarker);

if (actStartIndex === -1 || actEndIndex === -1) {
    console.error("Could not find activity markers");
    process.exit(1);
}

normalizedContent = normalizedContent.substring(0, actStartIndex) + activityReplacement + normalizedContent.substring(actEndIndex);

const wdStartIndex = normalizedContent.indexOf(activityEndMarker); // this is the new start index for withdrawals
const wdEndIndex = normalizedContent.indexOf(withdrawalEndMarker);

if (wdStartIndex === -1 || wdEndIndex === -1) {
    console.error("Could not find withdrawal markers");
    process.exit(1);
}

const finalContent = normalizedContent.substring(0, wdStartIndex) + withdrawalReplacement + normalizedContent.substring(wdEndIndex);

fs.writeFileSync(targetFile, finalContent, 'utf8');
console.log("Successfully replaced Rider Activity and Withdrawal Tabs via Node script!");
