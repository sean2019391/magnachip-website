export function getCategoryBySlug(slug: string): string {
  return slug.includes('sic') ? 'Power Solutions' : 'Investors';
}
