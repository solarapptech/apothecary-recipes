export function normalizeSearchText(input: string): string {
  const raw = input ?? '';

  const withoutAccents = raw
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  const punctuationAsSpace = withoutAccents.replace(/[^\p{L}\p{N}]+/gu, ' ');

  return punctuationAsSpace.trim().replace(/\s+/g, ' ').toLowerCase();
}

type UsageInput = {
  summary: string;
  dosage: string;
  frequency: string;
  maxDuration: string;
  applicationAreas: string;
  bestPractices: string;
} | string;

export function buildUsageSearchText(input: UsageInput): string {
  if (typeof input === 'string') {
    return input;
  }

  return [
    input.summary,
    input.dosage,
    input.frequency,
    input.maxDuration,
    input.applicationAreas,
    input.bestPractices,
  ]
    .filter((value) => value?.trim())
    .join(' ');
}

export function buildRecipeSearchTextNormalized(input: {
  title: string;
  description: string;
  ingredients: string;
  preparationSteps: string;
  usedFor: string;
  usage: UsageInput;
  region: string;
  alternativeNames?: string | null;
}): string {
  const usageText = buildUsageSearchText(input.usage);
  return normalizeSearchText(
    [
      input.title,
      input.description,
      input.ingredients,
      input.preparationSteps,
      input.usedFor,
      usageText,
      input.region,
      input.alternativeNames ?? '',
    ].join(' ')
  );
}

export function parseSearchQueryParts(searchQuery: string): string[] {
  const trimmed = searchQuery.trim();
  if (!trimmed) {
    return [];
  }

  const parts: string[] = [];
  const regex = /"([^\"]+)"|(\S+)/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(trimmed))) {
    const phrase = match[1];
    const token = match[2];
    const value = (phrase ?? token ?? '').trim();
    if (!value) {
      continue;
    }
    parts.push(value);
  }

  return parts;
}
