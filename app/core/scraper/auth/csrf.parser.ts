export function extractVerificationToken(html: string): string | null {
  const patterns = [
    /name="__RequestVerificationToken"\s+type="hidden"\s+value="([^"]+)"/i,
    /type="hidden"\s+name="__RequestVerificationToken"\s+value="([^"]+)"/i,
    /name="__RequestVerificationToken"[^>]*value="([^"]+)"/i,
    /name="__RequestVerificationToken"[^>]*value='([^']+)'/i,
  ];
  for (const re of patterns) {
    const match = html.match(re);
    if (match?.[1]) return match[1];
  }
  return null;
}

export function hasRequiredSessionCookies(jar: string): boolean {
  return (
    jar.length > 0 &&
    /\bASP\.NET_SessionId=/i.test(jar) &&
    /(^|; )__RequestVerificationToken=/i.test(jar)
  );
}
