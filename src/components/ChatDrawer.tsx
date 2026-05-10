import { useEffect, useRef, useState } from 'react';

type ChatMessage = { role: 'user' | 'assistant'; content: string };

const STARTERS = [
  'What is the PURSUE release?',
  'Tell me about the Tehran F-4 incident.',
  'Which cases have FOIA documents?',
  'O que foi o caso de Varginha?',
];

export function ChatDrawer() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    setError(null);
    const next = [...messages, { role: 'user' as const, content: trimmed }];
    setMessages(next);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error ?? `HTTP ${res.status}`);
      }
      const data = await res.json();
      const reply = (data?.reply ?? '').trim();
      if (!reply) throw new Error('Empty reply');
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Close archive chat' : 'Open archive chat'}
        className={`fixed right-4 bottom-4 z-30 flex h-14 w-14 items-center justify-center rounded-full border text-xl shadow-lg transition sm:h-12 sm:w-12 sm:text-base ${
          open
            ? 'border-orange-400 bg-orange-400 text-black'
            : 'border-zinc-700 bg-zinc-950/90 text-zinc-200 hover:border-orange-400/50 hover:text-orange-300'
        }`}
      >
        {open ? '×' : '🛸'}
      </button>

      {open && (
        <aside className="fixed inset-x-2 bottom-20 z-30 flex h-[min(75vh,560px)] flex-col overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950/95 shadow-2xl backdrop-blur sm:inset-x-auto sm:right-4 sm:w-[min(92vw,380px)]">
          <header className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
            <div>
              <h3 className="text-sm font-semibold text-zinc-100">
                Ask the Archive
              </h3>
              <p className="text-[10px] text-zinc-500">
                AI assistant — answers grounded in this dataset only
              </p>
            </div>
            {messages.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setMessages([]);
                  setError(null);
                }}
                className="text-[10px] tracking-widest text-zinc-500 uppercase hover:text-zinc-200"
              >
                Reset
              </button>
            )}
          </header>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
            {messages.length === 0 && (
              <div className="space-y-2">
                <p className="text-xs text-zinc-400">
                  Ask anything about the 37 cases on the globe — sources, dates,
                  declassified docs, AARO references.
                </p>
                <div className="space-y-1.5 pt-2">
                  {STARTERS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => send(s)}
                      className="block w-full rounded border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-left text-xs text-zinc-300 transition hover:border-orange-400/40 hover:text-orange-200"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[90%] rounded-lg px-3 py-2 text-xs leading-relaxed ${
                  m.role === 'user'
                    ? 'ml-auto bg-orange-400/15 text-orange-100'
                    : 'mr-auto bg-zinc-900 text-zinc-200'
                }`}
              >
                {m.content}
              </div>
            ))}
            {loading && (
              <div className="mr-auto rounded-lg bg-zinc-900 px-3 py-2 text-xs text-zinc-500">
                <span className="inline-flex gap-1">
                  <span className="animate-pulse">●</span>
                  <span className="animate-pulse [animation-delay:150ms]">●</span>
                  <span className="animate-pulse [animation-delay:300ms]">●</span>
                </span>
              </div>
            )}
            {error && (
              <div className="rounded border border-red-400/40 bg-red-400/10 p-2 text-[10px] text-red-200">
                ⚠ {error}
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="border-t border-zinc-800 p-2"
          >
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about a case…"
                disabled={loading}
                className="flex-1 rounded border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-600 focus:border-orange-400/50 focus:outline-none"
                maxLength={500}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="rounded bg-orange-400 px-3 py-2 text-xs font-medium text-black transition hover:bg-orange-300 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Send
              </button>
            </div>
            <p className="mt-1.5 px-1 text-[9px] text-zinc-600">
              Locked to UAP archive context. May make mistakes — verify with
              source links.
            </p>
          </form>
        </aside>
      )}
    </>
  );
}
