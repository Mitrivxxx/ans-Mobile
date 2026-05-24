/** Minimalny HTML bez formularza logowania WD (assertAuthenticatedHtml). */
export function authenticatedPage(body: string): string {
  return `<!DOCTYPE html><html><head><title>WD</title></head><body>${body}</body></html>`;
}
