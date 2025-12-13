export function getApiBase(): string {
  const base = process.env.NEXT_PUBLIC_API_BASE;

  if (!base) {
    throw new Error(
      'NEXT_PUBLIC_API_BASE is missing at runtime. ' +
      'Check CloudBase environment variables.'
    );
  }

  return base;
}
