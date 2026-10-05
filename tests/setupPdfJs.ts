// Real Node extraction for the existing PDF tests, outside the Expo/Metro dependency graph.
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';
import * as worker from 'pdfjs-dist/legacy/build/pdf.worker.mjs';
Object.assign(globalThis, { __cifrioPdfJs: pdfjs, pdfjsWorker: worker });
