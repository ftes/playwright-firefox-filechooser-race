# Firefox: the second file chooser sometimes never fires (Playwright 1.65)

Minimal reproduction of a race in Juggler's `FilePickerOverride` (Firefox r1572, Playwright 1.65).

```sh
npm install
npx playwright install firefox
npm run repro        # RUNS=40 npm run repro for more runs
```

`repro.js` waits for the file chooser twice in a row on one `<input type=file>`, on a freshly launched Firefox each run, as `page-filechooser.spec.ts` ("should be able to reset selected files with empty file list") does.

- Playwright 1.65.1 (firefox-1572): some runs fail (4 of 20 here); the second `filechooser` event never arrives and a native file picker opens.
- Playwright 1.64.1 (firefox-1555): 0 of 40 runs fail (change `playwright` in `package.json` to `1.64.1`).
