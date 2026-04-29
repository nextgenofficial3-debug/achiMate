import { cp, mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const root = path.resolve(path.dirname(__filename), '..');
const dist = path.join(root, 'dist');

await rm(dist, { recursive: true, force: true });
await mkdir(path.join(dist, 'src'), { recursive: true });
await cp(path.join(root, 'index.html'), path.join(dist, 'index.html'));
await cp(path.join(root, 'src', 'index.css'), path.join(dist, 'src', 'index.css'));
await cp(path.join(root, 'src', 'app.js'), path.join(dist, 'src', 'app.js'));
await cp(path.join(root, 'public'), dist, { recursive: true });

console.log('Built static AchiMate client.');
