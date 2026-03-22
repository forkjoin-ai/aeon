import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export type Ch17ManuscriptVariant = 'current' | 'flagship';

const __dirname = dirname(fileURLToPath(import.meta.url));

export const CH17_CHAPTER_ROOT = join(__dirname, '..', '..');

export function normalizeCh17ManuscriptVariant(
  value: string | undefined
): Ch17ManuscriptVariant {
  return value === 'flagship' ? 'flagship' : 'current';
}

export function getCh17ManuscriptVariantFromEnv(): Ch17ManuscriptVariant {
  return normalizeCh17ManuscriptVariant(process.env.CH17_MANUSCRIPT_VARIANT);
}

export function resolveCh17ManuscriptPath(
  variant = getCh17ManuscriptVariantFromEnv()
): string {
  return join(
    CH17_CHAPTER_ROOT,
    variant === 'flagship'
      ? 'ch17-arxiv-manuscript-flagship.md'
      : 'ch17-arxiv-manuscript.md'
  );
}

export function resolveCh17ArxivSubmissionDir(
  variant = getCh17ManuscriptVariantFromEnv()
): string {
  return join(
    CH17_CHAPTER_ROOT,
    variant === 'flagship' ? 'arxiv-submission-flagship' : 'arxiv-submission'
  );
}
