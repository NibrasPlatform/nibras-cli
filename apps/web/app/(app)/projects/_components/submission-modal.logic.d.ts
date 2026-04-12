export function normalizeGitHubRepositoryCandidate(value: string): string;
export function isValidAbsoluteHttpUrl(value: string): boolean;
export function shouldClearVerifiedRepo(previousInput: string, nextInput: string): boolean;
export function getSubmissionSubmitLabel(submissionType: 'github' | 'link' | 'text'): string;
export function canSubmitSubmission(args: {
  submissionType: 'github' | 'link' | 'text';
  submissionValue: string;
  isSubmitting?: boolean;
  isVerifyingRepo?: boolean;
  githubLinked?: boolean;
  githubAppInstalled?: boolean;
  repoValidationState?: 'idle' | 'checking' | 'valid' | 'invalid' | 'unavailable';
}): boolean;
