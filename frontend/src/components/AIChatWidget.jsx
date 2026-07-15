import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { X, Send, Bot, Loader } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function AIChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [session, setSession] = useState(null); // { token, conversationId }
  const [watermark, setWatermark] = useState(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [initializing, setInitializing] = useState(false);
  const bottomRef = useRef(null);
  const pollRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (open && !session) initConversation();
    if (!open) clearInterval(pollRef.current);
  }, [open]);

  const initConversation = async () => {
    setInitializing(true);
    setError(null);
    try {
      const { data } = await axios.get(`${API_BASE}/chat/token`);
      if (!data.success) throw new Error(data.error);
      setSession({ token: data.token, conversationId: data.conversationId });
      setMessages([{ role: 'bot', text: 'สวัสดีครับ 👋 ฉันเป็น AI Assistant มีอะไรให้ช่วยไหม?' }]);
      startPolling(data.token, data.conversationId, null);
    } catch (err) {
      const msg = err.response?.data?.error || err.message;
      setError(`เชื่อมต่อไม่สำเร็จ: ${msg}`);
      console.error('[AIChatWidget] init error:', msg);
    } finally {
      setInitializing(false);
    }
  };

  const startPolling = useCallback((token, cid, wm) => {
    clearInterval(pollRef.current);
    let currentWm = wm;
    pollRef.current = setInterval(async () => {
      try {
        const { data } = await axios.get(
          `${API_BASE}/chat/conversations/${cid}/messages`,
          { params: { token, watermark: currentWm } }
        );
        if (data.success && data.messages.length > 0) {
          setMessages(prev => [...prev, ...data.messages.map(m => ({ role: 'bot', text: m.text }))]);
        }
        if (data.watermark) currentWm = data.watermark;
        setWatermark(data.watermark);
      } catch { /* silent */ }
    }, 1500);
  }, []);

  const sendMessage = async () => {
    if (!input.trim() || !session || sending) return;
    const text = input.trim();
    setInput('');
    setSending(true);
    setMessages(prev => [...prev, { role: 'user', text }]);
    try {
      const { data } = await axios.post(
        `${API_BASE}/chat/conversations/${session.conversationId}/message`,
        { token: session.token, text }
      );
      if (!data.success) throw new Error(data.error);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'bot', text: '⚠️ ส่งข้อความไม่สำเร็จ กรุณาลองใหม่' }]);
    } finally {
      setSending(false);
    }
  };

  useEffect(() => () => clearInterval(pollRef.current), []);

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#034EA2] to-[#154194] shadow-xl transition hover:scale-110 hover:shadow-2xl active:scale-95"
        title="AI Assistant"
      >
        {open ? <X className="h-6 w-6 text-white" /> : <Bot className="h-6 w-6 text-white" />}
      </button>

      {/* Chat Window */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 flex w-80 flex-col rounded-2xl border border-[#D9E8F7] bg-white shadow-2xl sm:w-96">
          {/* Header */}
          <div className="flex items-center gap-3 rounded-t-2xl bg-gradient-to-r from-[#034EA2] to-[#154194] px-4 py-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">AI Assistant</p>
              <p className="text-xs text-blue-200">Copilot Studio · PDF Knowledge</p>
            </div>
            <button onClick={() => setOpen(false)} className="ml-auto text-white/70 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex h-80 flex-col gap-2 overflow-y-auto p-4">
            {initializing && (
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Loader className="h-4 w-4 animate-spin" /> กำลังเชื่อมต่อ...
              </div>
            )}
            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-xs text-red-600">
                {error}
                <button onClick={initConversation} className="mt-1 block text-[#034EA2] underline">
                  ลองใหม่
                </button>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <span className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'rounded-br-sm bg-[#034EA2] text-white'
                    : 'rounded-bl-sm border border-[#D9E8F7] bg-[#F0F6FD] text-slate-700'
                }`}>
                  {m.text}
                </span>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="flex gap-2 border-t border-[#D9E8F7] p-3">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder="พิมพ์คำถาม..."
              disabled={!session || sending}
              className="flex-1 rounded-xl border border-[#B0CEEE] px-3 py-2 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-[#034EA2] disabled:bg-slate-50"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || !session || sending}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#034EA2] text-white transition hover:bg-[#154194] active:scale-95 disabled:opacity-40"
            >
              {sending ? <Loader className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

