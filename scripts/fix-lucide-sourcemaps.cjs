#!/usr/bin/env node
/**
 * Patches empty/corrupt .map files in lucide-react that cause build errors.
 * Run by postinstall.
 */
const fs = require('fs');
const path = require('path');

const validMap = JSON.stringify({ version: 3, sources: [], names: [], mappings: '' });
const lucidePath = path.join(__dirname, '..', 'node_modules', 'lucide-react', 'dist', 'esm', 'icons');
const files = ['bandage.js.map', 'user-round-check.js.map'];

if (!fs.existsSync(lucidePath)) process.exit(0);

for (const file of files) {
  const filePath = path.join(lucidePath, file);
  if (fs.existsSync(filePath)) {
    const stat = fs.statSync(filePath);
    if (stat.size === 0 || stat.size < 10) {
      fs.writeFileSync(filePath, validMap, 'utf8');
      console.log('Fixed empty source map:', file);
    }
  }
}
