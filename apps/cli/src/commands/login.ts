import { DevicePollResponseSchema, DeviceStartResponseSchema } from '@nibras/contracts';
import { apiRequest, readCliConfig, writeCliConfig } from '@nibras/core';
import { createSpinner } from '../ui/spinner';
import { printBox } from '../ui/box';
import { tryOpenBrowser } from './login-browser';

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseOption(args: string[], name: string): string | null {
  const index = args.indexOf(name);
  if (index === -1) return null;
  return args[index + 1] || null;
}

function hasFlag(args: string[], flag: string): boolean {
  return args.includes(flag);
}

export async function commandLogin(args: string[], plain: boolean): Promise<void> {
  const config = readCliConfig();
  const apiBaseUrl = parseOption(args, '--api-base-url') || config.apiBaseUrl;

  const start = DeviceStartResponseSchema.parse(
    await apiRequest('/v1/device/start', { method: 'POST' }, apiBaseUrl)
  );

  printBox(
    'Authorize this device',
    [
      `Open in browser: ${start.verificationUriComplete}`,
      `Code:            ${start.userCode}`,
      hasFlag(args, '--no-open') ? 'Browser launch: disabled' : 'Browser launch: automatic',
    ],
    'info',
    plain
  );

  if (!hasFlag(args, '--no-open')) {
    void tryOpenBrowser(start.verificationUriComplete);
  }

  const spinner = createSpinner('Waiting for browser authorization', plain);

  const deadline = Date.now() + start.expiresInSeconds * 1000;
  while (Date.now() < deadline) {
    await sleep(start.intervalSeconds * 1000);
    const polled = DevicePollResponseSchema.parse(
      await apiRequest(
        '/v1/device/poll',
        { method: 'POST', body: JSON.stringify({ deviceCode: start.deviceCode }) },
        apiBaseUrl
      )
    );

    if (polled.status === 'authorized') {
      writeCliConfig({
        apiBaseUrl,
        activeUserId: polled.user.id,
        accessToken: polled.accessToken,
        refreshToken: polled.refreshToken,
        tokenCreatedAt: new Date().toISOString(),
      });

      spinner.succeed('Authorized');
      printBox(
        `Authenticated as ${polled.user.username}`,
        [
          `User:    ${polled.user.username}`,
          `GitHub:  ${polled.user.githubLogin}`,
          `API:     ${apiBaseUrl}`,
        ],
        'success',
        plain
      );
      return;
    }
  }

  spinner.fail('Authorization timed out');
  throw new Error('Device login timed out before approval.');
}
