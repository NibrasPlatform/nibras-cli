const { runCommand } = require('./exec');

async function runCommandCheck({ cwd, command, previous }) {
  const env = { ...process.env };
  if (previous) {
    env.NIBRAS_PREVIOUS = '1';
  }

  return runCommand('sh', ['-lc', command], {
    cwd,
    env,
  });
}

module.exports = {
  runCommandCheck,
};
