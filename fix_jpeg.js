import fs from 'fs';
let c = fs.readFileSync('client/src/components/BiodiversityParks.jsx', 'utf8');
c = c.replace(/\.jpg\.jpg"/g, '.jpg.jpeg"');
fs.writeFileSync('client/src/components/BiodiversityParks.jsx', c);
