import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// Serve the installed, locked PDF.js as static ESM. Metro never compiles these files.
const require = createRequire(import.meta.url);
const source = dirname(require.resolve('pdfjs-dist/package.json'));
const { version } = JSON.parse(await readFile(join(source, 'package.json'), 'utf8'));
if (version !== '5.4.296') throw new Error('PDF.js version changed: update the static loader and verify extraction before publishing.');
const target = fileURLToPath(new URL(`../public/pdfjs/${version}/`, import.meta.url));
await mkdir(target, { recursive: true });
await Promise.all(['pdf.mjs', 'pdf.worker.mjs'].map(name => copyFile(join(source, 'legacy/build', name), join(target, name))));
await copyFile(join(source, 'LICENSE'), join(target, 'LICENSE'));
await writeFile(join(target, 'loader.mjs'), `import * as pdfjs from './pdf.mjs';
pdfjs.GlobalWorkerOptions.workerSrc = new URL('./pdf.worker.mjs', import.meta.url).href;
globalThis.__cifrioPdfJs = pdfjs;
`);
console.log(`PDF.js ${version}: static browser modules prepared.`);
