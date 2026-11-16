// Waits for the file chooser twice in a row on one <input type=file>, each time on a freshly
// launched Firefox (as upstream's page-filechooser.spec.ts "should be able to reset selected
// files with empty file list" does). Exits 1 if any run times out.
const { firefox } = require('playwright');
const fs = require('fs');
const os = require('os');
const path = require('path');

const asset = path.join(os.tmpdir(), 'fc-race-file.txt');
fs.writeFileSync(asset, 'contents of the file');

(async () => {
  const runs = Number(process.env.RUNS || 20);
  let fails = 0;
  for (let i = 0; i < runs; i++) {
    const browser = await firefox.launch();
    const page = await browser.newPage();
    page.setDefaultTimeout(5000);
    try {
      await page.setContent('<input type=file>');
      const [, length1] = await Promise.all([
        page.waitForEvent('filechooser').then(chooser => chooser.setFiles(asset)),
        page.$eval('input', async input => { input.click(); await new Promise(x => input.oninput = x); return input.files.length; }),
      ]);
      if (length1 !== 1) throw new Error(`first files.length ${length1}`);
      const [, length2] = await Promise.all([
        page.waitForEvent('filechooser').then(chooser => chooser.setFiles([])),
        page.$eval('input', async input => { input.click(); await new Promise(x => input.oninput = x); return input.files.length; }),
      ]);
      if (length2 !== 0) throw new Error(`second files.length ${length2}`);
      console.log(`run ${i}: ok`);
    } catch (e) {
      fails++;
      console.log(`run ${i}: FAIL ${e.message.split('\n')[0]}`);
    }
    await browser.close().catch(() => {});
  }
  console.log(`${fails} of ${runs} runs failed`);
  process.exit(fails ? 1 : 0);
})();
