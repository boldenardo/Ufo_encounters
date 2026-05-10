import {
  formatRelative,
  type LiveFeedItem,
  type LiveFeedSource,
} from '../liveFeed';

const SOURCE_META: Record<LiveFeedSource, { label: string; color: string }> = {
  reddit: { label: 'Reddit', color: '#ff4500' },
  bluesky: { label: 'Bluesky', color: '#1083fe' },
};

type Props = {
  open: boolean;
  onClose: () => void;
  items: LiveFeedItem[];
  errors: string[];
  loading: boolean;
  lastFetched: number | null;
  onRefresh: () => void;
  enabledSources: Set<LiveFeedSource>;
  onItemHover?: (item: LiveFeedItem) => void;
};

export function LiveFeed({
  open,
  onClose,
  items,
  errors,
  loading,
  lastFetched,
  onRefresh,
  enabledSources,
  onItemHover,
}: Props) {
  if (!open) return null;

  const visible = items.filter((i) => enabledSources.has(i.source));

  return (
    <aside className="fixed top-0 left-0 z-30 flex h-full w-full flex-col border-r border-zinc-800 bg-zinc-950/95 backdrop-blur sm:max-w-sm md:left-72">
      <header className="flex items-center justify-between border-b border-zinc-800 px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold text-zinc-100">Live Feed</h2>
          <p className="text-[10px] text-zinc-500">
            {lastFetched
              ? `Updated ${formatRelative(lastFetched)} · ${visible.length} posts`
              : 'Reddit · Bluesky'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className="rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-[10px] tracking-wide uppercase text-zinc-400 transition hover:text-zinc-100 disabled:opacity-50"
          >
            {loading ? '⟳ Loading' : '↻ Refresh'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="text-2xl leading-none text-zinc-500 hover:text-zinc-200"
            aria-label="Close live feed"
          >
            ×
          </button>
        </div>
      </header>

      {errors.length > 0 && (
        <div className="border-b border-yellow-400/30 bg-yellow-400/10 px-5 py-2 text-[10px] text-yellow-200">
          {errors.map((e, i) => (
            <p key={i}>⚠ {e}</p>
          ))}
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {loading && visible.length === 0 && (
          <p className="p-5 text-xs text-zinc-500">Loading recent posts…</p>
        )}
        {!loading && visible.length === 0 && errors.length === 0 && (
          <p className="p-5 text-xs text-zinc-500">No posts found.</p>
        )}
        <ul className="divide-y divide-zinc-800">
          {visible.map((item) => {
            const meta = SOURCE_META[item.source];
            return (
              <li
                key={item.id}
                onMouseEnter={() => onItemHover?.(item)}
                className="px-5 py-4 transition hover:bg-zinc-900/50"
              >
                <div className="mb-1 flex items-center gap-2 text-[10px]">
                  <span
                    className="rounded px-1.5 py-0.5 font-medium"
                    style={{
                      background: `${meta.color}22`,
                      color: meta.color,
                      border: `1px solid ${meta.color}55`,
                    }}
                  >
                    {meta.label}
                  </span>
                  <span className="text-zinc-500">{item.author}</span>
                  {item.location && (
                    <span
                      className="rounded bg-orange-400/15 px-1.5 py-0.5 text-orange-200"
                      title="Location detected — visible on globe"
                    >
                      📍 {item.location.name}
                    </span>
                  )}
                  <span className="ml-auto text-zinc-600">
                    {formatRelative(item.createdAt)}
                  </span>
                </div>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="block"
                >
                  <h3 className="text-sm font-medium text-zinc-100 hover:text-orange-200">
                    {item.title}
                  </h3>
                  {item.excerpt && (
                    <p className="mt-1 line-clamp-3 text-xs text-zinc-400">
                      {item.excerpt}
                    </p>
                  )}
                  {item.thumbnail && (
                    <img
                      src={item.thumbnail}
                      alt=""
                      loading="lazy"
                      className="mt-2 max-h-32 w-full rounded border border-zinc-800 object-cover"
                    />
                  )}
                </a>
              </li>
            );
          })}
        </ul>
      </div>

      <footer className="border-t border-zinc-800 px-5 py-3 text-[10px] text-zinc-600">
        Live posts from r/UFOs and Bluesky #UAP. Posts shown are from their
        authors and not curated by this project.
      </footer>
    </aside>
  );
}
