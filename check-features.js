/**
 * Check all available feature IDs in web-features
 */

const webFeatures = require('web-features');

console.log('🔍 Checking web-features package...\n');

// Get all feature IDs
const allFeatureIds = Object.keys(webFeatures);
console.log(`Total features: ${allFeatureIds.length}\n`);

// Search for features we're trying to detect
const searchTerms = [
  'await', 'top-level',
  'container', 'queries',
  'has',
  'grid', 'subgrid',
  'nesting',
  'custom', 'properties',
  'optional', 'chaining',
  'nullish', 'coalescing',
  'dynamic', 'import',
  'private', 'field'
];

console.log('Searching for relevant features:');
console.log('================================\n');

for (const term of searchTerms) {
  const matches = allFeatureIds.filter(id => 
    id.toLowerCase().includes(term.toLowerCase())
  );
  
  if (matches.length > 0) {
    console.log(`"${term}" matches:`);
    matches.forEach(match => {
      const feature = webFeatures[match];
      console.log(`  - ${match}: ${feature.name || 'N/A'}`);
    });
    console.log('');
  }
}
