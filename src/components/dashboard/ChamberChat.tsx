"use client";

import { useState, useEffect, useRef } from "react";
import { MessageSquare, Send, Loader2 } from "lucide-react";
import { fetchJson } from "@/lib/fetch-json";

export function ChamberChat({ chamberId }: { chamberId: string }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [content, setContent] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    try {
      const res = await fetchJson<{ success: boolean; data: any[] }>("/api/chambers/messages");
      if (res?.success) setMessages(res.data);
    } catch {} finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000); // Polling for MVP
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setSending(true);
    const optimisticMessage = {
      id: "temp-" + Date.now(),
      content,
      user: { name: "You" },
      createdAt: new Date().toISOString()
    };
    setMessages(prev => [...prev, optimisticMessage]);
    setContent("");
    
    try {
      await fetch("/api/chambers/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: optimisticMessage.content })
      });
      fetchMessages();
    } catch {
      // Revert optimistic on fail
      fetchMessages();
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-[500px] rounded-[3rem] bg-[var(--surface)] border border-[var(--border)] overflow-hidden shadow-sm">
      <div className="px-8 py-6 border-b border-[var(--border)] flex items-center gap-4 bg-[var(--surface-2)]">
        <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500">
          <MessageSquare className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-xl font-black uppercase tracking-tight text-[var(--foreground)]">Chamber Chat</h3>
          <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--muted)]">Secure Real-time Communication</p>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4">
        {loading && messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-[var(--muted)]" />
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-[var(--muted)]">
            No secure messages yet.
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-[var(--foreground)]">{msg.user.name}</span>
                <span className="text-[8px] font-bold text-[var(--muted)]">
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-[var(--surface-2)] border border-[var(--border)] w-fit max-w-[85%] text-sm font-medium text-[var(--foreground)]">
                {msg.content}
              </div>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSend} className="p-4 border-t border-[var(--border)] bg-[var(--surface-2)] pt-5">
        <div className="relative flex items-center">
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Transmit secure message..."
            className="w-full h-14 pl-6 pr-16 bg-[var(--surface)] border border-[var(--border)] rounded-2xl text-sm focus:outline-none focus:border-blue-500/50"
          />
          <button 
            type="submit" 
            disabled={sending || !content.trim()}
            className="absolute right-2 p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-500 disabled:opacity-50 transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
