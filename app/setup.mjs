import {writeFileSync} from 'node:fs';
writeFileSync('.installed', 'AutoDiag ready\n');
console.log('AutoDiag installed. No runtime packages required.');
