export function formatValue(
  value: number,
  suffix: string = '',
  singularSuffix: string = '',
  hasSpace: boolean = true,
): string {
  if (value === null || value === undefined) return '';
  if (isNaN(value)) return '';
  let formatted = value.toString();
  const isSingular = value === 1 && singularSuffix;
  const displaySuffix = isSingular ? singularSuffix : suffix;
  if (!displaySuffix.length) return formatted;
  if (hasSpace) formatted += ' ';
  formatted += displaySuffix;
  return formatted;
}

// remove suffix and parse to integer
// returns 0 if parsing fails
export function parseValue(input: string): number {
  const raw = parseInt(input.replace(/\D/g, ''), 10);
  return isNaN(raw) ? 0 : raw;
}
