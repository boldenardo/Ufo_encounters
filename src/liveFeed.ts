import { findLocation } from './gazetteer';

export type LiveFeedSource = 'reddit' | 'bluesky';

export type LiveFeedItem = {
  id: string;
  source: LiveFeedSource;
  author: string;
  title: string;
  excerpt?: string;
  url: string;
  createdAt: number; // unix ms
  thumbnail?: string;
  location?: { name: string; lat: number; lon: number };
};

type RawItem = Omit<LiveFeedItem, 'location'>;

type ApiResponse = {
  items: RawItem[];
  errors: string[];
};

const enrichWithLocation = (item: RawItem): LiveFeedItem => {
  const text = `${item.title} ${item.excerpt ?? ''}`;
  const hit = findLocation(text);
  return { ...item, location: hit ?? undefined };
};

export const fetchLiveFeed = async (): Promise<{
  items: LiveFeedItem[];
  errors: string[];
}> => {
  try {
    const res = await fetch('/api/live-feed');
    if (!res.ok) {
      return {
        items: [],
        errors: [
          `API ${res.status}: live feed needs the /api endpoint (run \`vercel dev\` locally or deploy to Vercel).`,
        ],
      };
    }
    const json = (await res.json()) as ApiResponse;
    return {
      items: json.items.map(enrichWithLocation),
      errors: json.errors,
    };
  } catch (e) {
    return {
      items: [],
      errors: [
        `Live feed unavailable: ${(e as Error).message}. Run \`vercel dev\` locally or deploy to Vercel for the API endpoint.`,
      ],
    };
  }
};

export const formatRelative = (ms: number): string => {
  const diff = Date.now() - ms;
  if (diff < 60_000) return 'just now';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return `${Math.floor(diff / 86_400_000)}d ago`;
};
