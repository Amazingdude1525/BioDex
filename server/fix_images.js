import fs from 'fs';
let c = fs.readFileSync('client/src/components/BiodiversityParks.jsx', 'utf8');
c = c.replace(/\.jpg"/g, '.jpg.jpg"');
fs.writeFileSync('client/src/components/BiodiversityParks.jsx', c);
