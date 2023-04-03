const { exec } = require('child_process');

module.exports = function (options, context) {
  const command = `npx nest ${options.command} ${options.file}`;

  exec(command, (err, stdout, stderr) => {
    if (err) {
      context.logger.error(stderr);
      process.exit(1);
    } else {
      context.logger.info(stdout);
    }
  });

  if (options.watch) {
    context.logger.info(`Watching for changes to ${options.file}...`);
  }

  return {
    success: true,
  };
};
