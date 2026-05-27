import { fetchAnsPageHtml } from './events.fetch';
import { parsePublicEvents } from './events.parse';
import type { PublicEvent } from './events.types';

export class PublicEventsService {
  async getEvents(path: string): Promise<PublicEvent[]> {
    const html = await fetchAnsPageHtml(path);
    return parsePublicEvents(html, path);
  }
}

export type { PublicEvent } from './events.types';
