import { parseHTML } from 'linkedom';

/** Bez pełnego dokumentu linkedom zostawia `<body>` puste — treść ląduje obok. */
const WD_ORIGIN = 'https://wd.ans-ns.edu.pl';

export type AnnouncementContentSegment =
  | { type: 'text'; value: string }
  | { type: 'link'; value: string; url: string };

const URL_IN_TEXT_REGEX = /(https?:\/\/[^\s<>"']+|www\.[^\s<>"']+)/gi;

const BLOCK_TAGS = new Set([
  'P',
  'DIV',
  'LI',
  'TR',
  'H1',
  'H2',
  'H3',
  'H4',
  'H5',
  'H6',
]);

/** Dzieli HTML treści ogłoszenia na fragmenty tekstu i klikalnych linków. */
export function parseAnnouncementContentSegments(
  html: string
): AnnouncementContentSegment[] {
  const trimmed = html.trim();
  if (!trimmed) {
    return [];
  }

  const { document } = parseHTML(
    `<!DOCTYPE html><html><head></head><body>${trimmed}</body></html>`
  );
  const body = document.body;
  if (!body) {
    return fallbackPlainSegments(trimmed);
  }

  const segments: AnnouncementContentSegment[] = [];
  body.childNodes.forEach((node) => walkNode(node, segments));
  const compacted = compactSegments(segments);
  if (compacted.length > 0) {
    return compacted;
  }

  const plain = body.textContent?.trim() ?? '';
  return plain ? fallbackPlainSegments(plain) : [];
}

function walkNode(node: Node, segments: AnnouncementContentSegment[]): void {
  if (node.nodeType === 3) {
    appendTextWithUrlDetection(segments, node.textContent ?? '');
    return;
  }

  if (node.nodeType !== 1) {
    return;
  }

  const element = node as Element;
  const tag = element.tagName.toUpperCase();

  if (tag === 'BR') {
    appendText(segments, '\n');
    return;
  }

  if (tag === 'A') {
    const href = element.getAttribute('href') ?? '';
    const label = (element.textContent ?? '').trim();
    if (href) {
      segments.push({
        type: 'link',
        value: label || href,
        url: resolveAnnouncementUrl(href),
      });
    } else if (label) {
      appendTextWithUrlDetection(segments, label);
    }
    return;
  }

  const isBlock = BLOCK_TAGS.has(tag);
  element.childNodes.forEach((child) => walkNode(child, segments));
  if (isBlock) {
    appendText(segments, '\n');
  }
}

function appendTextWithUrlDetection(
  segments: AnnouncementContentSegment[],
  text: string
): void {
  if (!text) {
    return;
  }

  let lastIndex = 0;
  for (const match of text.matchAll(URL_IN_TEXT_REGEX)) {
    const index = match.index ?? 0;
    if (index > lastIndex) {
      appendText(segments, text.slice(lastIndex, index));
    }

    const raw = match[0];
    segments.push({
      type: 'link',
      value: raw,
      url: raw.startsWith('www.') ? `https://${raw}` : raw,
    });
    lastIndex = index + raw.length;
  }

  if (lastIndex < text.length) {
    appendText(segments, text.slice(lastIndex));
  }
}

function appendText(segments: AnnouncementContentSegment[], text: string): void {
  if (!text) {
    return;
  }

  const last = segments[segments.length - 1];
  if (last?.type === 'text') {
    last.value += text;
    return;
  }

  segments.push({ type: 'text', value: text });
}

function compactSegments(
  segments: AnnouncementContentSegment[]
): AnnouncementContentSegment[] {
  const merged: AnnouncementContentSegment[] = [];

  for (const segment of segments) {
    const last = merged[merged.length - 1];
    if (segment.type === 'text' && last?.type === 'text') {
      last.value += segment.value;
      continue;
    }
    if (segment.type === 'text' && !segment.value) {
      continue;
    }
    merged.push(segment);
  }

  return merged.map((segment) => {
    if (segment.type !== 'text') {
      return segment;
    }
    return {
      type: 'text',
      value: segment.value.replace(/\n{3,}/g, '\n\n'),
    };
  });
}

function resolveAnnouncementUrl(href: string): string {
  const trimmed = href.trim();
  if (!trimmed) {
    return trimmed;
  }
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  if (trimmed.startsWith('//')) {
    return `https:${trimmed}`;
  }
  if (trimmed.startsWith('/')) {
    return `${WD_ORIGIN}${trimmed}`;
  }
  if (/^www\./i.test(trimmed)) {
    return `https://${trimmed}`;
  }
  return `https://${trimmed}`;
}

function fallbackPlainSegments(text: string): AnnouncementContentSegment[] {
  const segments: AnnouncementContentSegment[] = [];
  appendTextWithUrlDetection(segments, text);
  return compactSegments(segments);
}
