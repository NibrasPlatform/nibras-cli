export type OnboardingOs = 'mac' | 'linux' | 'windows';
export type WindowsShell = 'powershell' | 'gitbash';

export const PINNED_RELEASE_TAG: string;
export const NPM_INSTALL_COMMAND: string;
export const GIT_INSTALL_COMMAND: string;

export function getOnboardingConfigPath(os: OnboardingOs): string;
export function getOnboardingDirExample(os: OnboardingOs, windowsShell?: WindowsShell): string;
export function getInstallTroubleshootingCommand(
  os: OnboardingOs,
  windowsShell?: WindowsShell
): string;
export function buildHostedLoginCommand(apiBaseUrl: string): string;
export function buildStudentQuickStart(apiBaseUrl: string, projectKey?: string): string;
export function discoverOnboardingApiBaseUrl(args: {
  configuredApiBaseUrl: string | null | undefined;
  pageOrigin: string | null | undefined;
  probe: (candidate: string) => Promise<boolean>;
}): Promise<string>;
