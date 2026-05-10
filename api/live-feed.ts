// Vercel Serverless Function — proxies Reddit r/UFOs + Bluesky #UAP
// to bypass browser CORS restrictions.
//
// Deployed automatically when project is on Vercel. Run locally with `vercel dev`.

const REDDIT_URL =
  'https://www.reddit.com/r/UFOs/new.json?limit=15&raw_json=1';

const BLUESKY_URL =
  'https://public.api.bsky.app/xrpc/app.bsky.feed.searchPosts?q=%23UAP&limit=15&sort=latest';

const USER_AGENT =
  'ufo-encounters/1.0 (https://github.com; open-source UAP map)';

type RedditChild = {
  kind: string;
  data: {
    id: string;
    author: string;
    title: string;
    selftext?: string;
    permalink: string;
    created_utc: number;
    thumbnail?: string;
    over_18?: boolean;
    stickied?: boolean;
  };
};

type BlueskyPost = {
  uri: string;
  cid: string;
  author: { handle: string; displayName?: string };
  record: { text: string; createdAt: string };
  embed?: {
    images?: { thumb: string }[];
    external?: { thumb?: string };
  };
};

type FeedItem = {
  id: string;
  source: 'reddit' | 'bluesky';
  author: string;
  title: string;
  excerpt?: string;
  url: string;
  createdAt: number;
  thumbnail?: string;
};

const fetchWithTimeout = async (url: string, ms: number) => {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, {
      headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
      signal: ctrl.signal,
    });
  } finally {
    clearTimeout(timer);
  }
};

const fetchReddit = async (): Promise<FeedItem[]> => {
  const res = await fetchWithTimeout(REDDIT_URL, 4000);
  if (!res.ok) throw new Error(`Reddit ${res.status}`);
  const json = await res.json();
  const children: RedditChild[] = json?.data?.children ?? [];
  return children
    .filter((c) => !c.data.stickied && !c.data.over_18)
    .map((c) => ({
      id: `reddit-${c.data.id}`,
      source: 'reddit' as const,
      author: `u/${c.data.author}`,
      title: c.data.title,
      excerpt: c.data.selftext?.slice(0, 220) || undefined,
      url: `https://www.reddit.com${c.data.permalink}`,
      createdAt: c.data.created_utc * 1000,
      thumbnail:
        c.data.thumbnail && c.data.thumbnail.startsWith('http')
          ? c.data.thumbnail
          : undefined,
    }));
};

const fetchBluesky = async (): Promise<FeedItem[]> => {
  const res = await fetchWithTimeout(BLUESKY_URL, 4000);
  if (!res.ok) throw new Error(`Bluesky ${res.status}`);
  const json = await res.json();
  const posts: BlueskyPost[] = json?.posts ?? [];
  return posts.map((p) => {
    const rkey = p.uri.split('/').pop() ?? '';
    return {
      id: `bsky-${p.cid}`,
      source: 'bluesky' as const,
      author: `@${p.author.handle}`,
      title: p.record.text.slice(0, 140),
      excerpt:
        p.record.text.length > 140 ? p.record.text.slice(140, 360) : undefined,
      url: `https://bsky.app/profile/${p.author.handle}/post/${rkey}`,
      createdAt: new Date(p.record.createdAt).getTime(),
      thumbnail:
        p.embed?.images?.[0]?.thumb || p.embed?.external?.thumb || undefined,
    };
  });
};

// Hard ceiling so we always respond before Vercel's maxDuration kills us
const HARD_DEADLINE_MS = 8000;

const withDeadline = <T,>(p: Promise<T>, label: string): Promise<T> =>
  Promise.race([
    p,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`${label} hard-deadline ${HARD_DEADLINE_MS}ms`)), HARD_DEADLINE_MS)
    ),
  ]);

export default async function handler(_req: Request): Promise<Response> {
  const errors: string[] = [];
  const items: FeedItem[] = [];
  const tasks = [
    { label: 'Reddit', fn: fetchReddit },
    { label: 'Bluesky', fn: fetchBluesky },
  ];

  const results = await Promise.allSettled(
    tasks.map((t) => withDeadline(t.fn(), t.label))
  );

  for (const [i, r] of results.entries()) {
    if (r.status === 'fulfilled') items.push(...r.value);
    else errors.push(`${tasks[i].label}: ${(r.reason as Error)?.message ?? 'failed'}`);
  }

  items.sort((a, b) => b.createdAt - a.createdAt);

  return new Response(JSON.stringify({ items, errors }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
    },
  });
}
