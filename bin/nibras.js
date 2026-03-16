#!/usr/bin/env node

const { run } = require("../src/cli");

run(process.argv).catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err && err.stack ? err.stack : String(err));
  process.exitCode = 1;
});
