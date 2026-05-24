import { fetchAnsHomepageHtml } from './events.fetch';
import { parsePublicEvents } from './events.parse';
import type { PublicEvent } from './events.types';

export class PublicEventsService {
  async getEvents(): Promise<PublicEvent[]> {
    const html = await fetchAnsHomepageHtml();
    return parsePublicEvents(html);
  }
}

export type { PublicEvent } from './events.types';
