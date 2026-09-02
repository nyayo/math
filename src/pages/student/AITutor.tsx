import * as React from 'react';
import { motion } from 'framer-motion';
import { ArrowUp, ChevronRight, History, Mic, Plus, Sparkles, Trash2, MessageSquare } from 'lucide-react';
import { useAIChat } from '@/hooks/useAIChat';
import { useAuthStore } from '@/stores/authStore';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MarkdownRenderer } from '@/components/shared/MarkdownRenderer';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn, formatRelativeTime } from '@/lib/utils';

const QUICK_PROMPTS = [
  'Explain quadratic equations',
  'Help me solve 2x + 5 = 13',
  "What's the Pythagorean theorem?",
  'Walk me through derivatives',
];

const RECENT_TOPICS = ['Algebra', 'Calculus', 'Trigonometry', 'Statistics', 'Geometry'];

function ThinkingDots() {
  return (
    <div className="flex items-center gap-1.5 py-2">
      {[0, 1, 2].map((i) => (
        <motion.span key={i} animate={{ y: [0, -6, 0], opacity: [0.4, 1, 0.4] }} transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }} className="h-2 w-2 rounded-full bg-ink-400" />
      ))}
    </div>
  );
}

export default function AITutor() {
  const user = useAuthStore((s) => s.user);
  const { messages, isStreaming, sessions, isLoadingSessions, sendMessage, loadSession, newChat } = useAIChat();
  const [input, setInput] = React.useState('');
  const [selectedTopic, setSelectedTopic] = React.useState('General Mathematics');
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  React.useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const handleSend = () => {
    if (!input.trim() || isStreaming) return;
    void sendMessage(input, selectedTopic, user?.level ?? undefined);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const hasMessages = messages.length > 0;
  const initials = user?.first_name?.[0]?.toUpperCase() ?? 'M';

  return (
    <AppShell>
      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Chat area */}
        <div className="flex-1">
          {/* Header */}
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h1 className="flex items-center gap-2 text-xl font-bold text-ink-900 dark:text-white"><Sparkles className="h-5 w-5 text-brand-500" /> AI Tutor</h1>
              <p className="mt-0.5 text-sm text-ink-500">Topic: {selectedTopic}</p>
            </div>
            <Button variant="secondary" size="sm" onClick={newChat}><Plus className="h-4 w-4" /> New chat</Button>
          </div>

          {!hasMessages ? (
            // New chat state
            <Card className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand-600 to-accent-600 p-8 text-center sm:p-12">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }} className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
                <Sparkles className="h-8 w-8 text-white" />
              </motion.div>
              <h2 className="mt-6 text-2xl font-bold text-white">Ask any math question</h2>
              <p className="mt-2 text-sm text-brand-100">Your AI tutor is ready to help, step by step.</p>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {RECENT_TOPICS.map((t) => (
                  <button key={t} onClick={() => setSelectedTopic(t)} className={cn('rounded-full px-3 py-1.5 text-xs font-semibold transition-all', selectedTopic === t ? 'bg-white text-brand-700' : 'bg-white/15 text-white hover:bg-white/25')}>{t}</button>
                ))}
              </div>
            </Card>
          ) : (
            // Chat thread
            <div ref={scrollRef} className="max-h-[calc(100vh-260px)] min-h-[300px] space-y-4 overflow-y-auto scrollbar-thin pb-4">
              {messages.map((msg) => (
                <div key={msg.id} className={cn('flex gap-3', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                  {msg.role === 'assistant' && (
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 text-sm font-bold text-white">M</div>
                  )}
                  <div className={cn('max-w-2xl', msg.role === 'user' ? 'rounded-2xl rounded-br-md bg-brand-500 px-4 py-3 text-sm text-white' : 'rounded-2xl rounded-bl-md border border-ink-200 bg-white px-4 py-3 dark:border-ink-700 dark:bg-ink-800')}>
                    {msg.role === 'user' ? <p className="text-sm leading-6">{msg.content}</p> : msg.content === '' ? <ThinkingDots /> : <MarkdownRenderer content={msg.content} className="prose-sm" />}
                  </div>
                  {msg.role === 'user' && <Avatar className="h-9 w-9 shrink-0"><AvatarFallback>{initials}</AvatarFallback></Avatar>}
                </div>
              ))}
              {isStreaming && messages[messages.length - 1]?.content && (
                <div className="flex items-center gap-1 pl-12 text-ink-400">
                  <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 0.8, repeat: Infinity }} className="h-4 w-1 rounded-full bg-brand-500" />
                </div>
              )}
            </div>
          )}

          {/* Quick prompts */}
          {!hasMessages && (
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {QUICK_PROMPTS.map((prompt) => (
                <button key={prompt} onClick={() => { setInput(prompt); }} className="group flex items-center justify-between rounded-2xl border border-ink-200 bg-white p-4 text-left transition-all hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-soft dark:border-ink-700 dark:bg-ink-800 dark:hover:border-brand-700">
                  <span className="text-sm font-medium text-ink-700 dark:text-ink-200">{prompt}</span>
                  <ChevronRight className="h-4 w-4 text-ink-300 transition-transform group-hover:translate-x-1 group-hover:text-brand-500" />
                </button>
              ))}
            </div>
          )}

          {/* Input bar */}
          <div className="sticky bottom-0 mt-4">
            <div className="flex items-end gap-2 rounded-2xl border border-ink-200 bg-white/80 p-2 backdrop-blur-xl dark:border-ink-700 dark:bg-ink-800/80">
              <textarea ref={textareaRef} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} rows={1} placeholder="Ask your AI tutor anything..." className="max-h-[120px] flex-1 resize-none bg-transparent px-3 py-2.5 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none dark:text-ink-100" />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="rounded-xl p-2.5 text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-600 dark:hover:bg-ink-700"><Mic className="h-5 w-5" /></button>
                  </TooltipTrigger>
                  <TooltipContent>Voice input coming soon</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <button onClick={handleSend} disabled={!input.trim() || isStreaming} className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all', input.trim() && !isStreaming ? 'bg-brand-500 text-white hover:bg-brand-600' : 'bg-ink-100 text-ink-300 dark:bg-ink-700')}>
                <ArrowUp className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-72 lg:shrink-0">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink-700 dark:text-ink-300"><History className="h-4 w-4" /> Recent conversations</div>
          <div className="space-y-2">
            {isLoadingSessions ? (
              <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 rounded-xl bg-ink-100 dark:bg-ink-800 animate-pulse" />)}</div>
            ) : sessions.length === 0 ? (
              <p className="text-sm text-ink-400">No conversations yet.</p>
            ) : (
              sessions.map((session) => (
                <button key={session.id} onClick={() => void loadSession(session.id)} className="group w-full rounded-xl border border-ink-200 bg-white p-3 text-left transition-all hover:border-brand-200 hover:shadow-soft dark:border-ink-700 dark:bg-ink-800 dark:hover:border-brand-700">
                  <div className="flex items-center justify-between">
                    <Badge tone="brand" className="text-[10px]">{session.topic}</Badge>
                    <span className="text-[10px] text-ink-400">{formatRelativeTime(session.created_at)}</span>
                  </div>
                  <p className="mt-2 line-clamp-1 text-xs text-ink-600 dark:text-ink-300">{session.preview}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="flex items-center gap-1 text-[10px] text-ink-400"><MessageSquare className="h-3 w-3" />{session.message_count}</span>
                    <Trash2 className="h-3.5 w-3.5 text-ink-300 opacity-0 transition-opacity group-hover:opacity-100 hover:text-rose-500" />
                  </div>
                </button>
              ))
            )}
          </div>
          <Button variant="gradient" className="mt-4 w-full" onClick={newChat}><Plus className="h-4 w-4" /> Start new chat</Button>
        </div>
      </div>
    </AppShell>
  );
}
