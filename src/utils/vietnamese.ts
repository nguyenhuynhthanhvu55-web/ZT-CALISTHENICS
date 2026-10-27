/**
 * Utility to strip Vietnamese diacritics / tones for accent-insensitive search.
 * e.g. "Phở bò tái" -> "pho bo tai"
 */
export function removeVietnameseAccents(str: string): string {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();
}

/**
 * Checks if search query matches source text without requiring accents.
 */
export function matchesVietnameseSearch(sourceText: string, searchInput: string): boolean {
  if (!searchInput.trim()) return true;
  const cleanSource = removeVietnameseAccents(sourceText);
  const cleanSearch = removeVietnameseAccents(searchInput);
  return cleanSource.includes(cleanSearch);
}
