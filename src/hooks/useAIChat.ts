import * as React from 'react';
import { toast } from 'react-hot-toast';
import type { ChatMessage } from '@/types/learning';
import { askAIStream, getSession, getSessions } from '@/services/aiTutor';

export function useAIChat() {
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = React.useState(false);
  const [currentSessionId, setCurrentSessionId] = React.useState<string | null>(null);
  const [sessions, setSessions] = React.useState<Awaited<ReturnType<typeof getSessions>>>([]);
  const [isLoadingSessions, setIsLoadingSessions] = React.useState(true);

  const loadSessions = React.useCallback(async () => {
    try {
      setIsLoadingSessions(true);
      setSessions(await getSessions());
    } catch {
      toast.error('Could not load conversations');
    } finally {
      setIsLoadingSessions(false);
    }
  }, []);

  React.useEffect(() => { void loadSessions(); }, [loadSessions]);

  const sendMessage = React.useCallback(async (question: string, topic = 'General Mathematics', level?: string) => {
    const trimmed = question.trim();
    if (!trimmed || isStreaming) return;
    const sessionId = currentSessionId ?? `session-${Date.now()}`;
    const now = new Date().toISOString();
    const userMessage: ChatMessage = { id: `msg-user-${Date.now()}`, session_id: sessionId, role: 'user', content: trimmed, created_at: now };
    const assistantId = `msg-assistant-${Date.now()}`;
    setCurrentSessionId(sessionId);
    setMessages((current) => [...current, userMessage, { id: assistantId, session_id: sessionId, role: 'assistant', content: '', created_at: now }]);
    setIsStreaming(true);
    await askAIStream(
      { session_id: currentSessionId ?? undefined, topic, question: trimmed, level },
      (token) => setMessages((current) => current.map((message) => message.id === assistantId ? { ...message, content: message.content + token } : message)),
      () => { setIsStreaming(false); void loadSessions(); },
      (error) => { setIsStreaming(false); setMessages((current) => current.filter((message) => message.id !== assistantId)); toast.error(error.message || 'The tutor could not respond'); },
    );
  }, [currentSessionId, isStreaming, loadSessions]);

  const loadSession = React.useCallback(async (id: string) => {
    try {
      const result = await getSession(id);
      setCurrentSessionId(id);
      setMessages(result.messages);
    } catch {
      toast.error('Could not load this conversation');
    }
  }, []);

  const newChat = React.useCallback(() => { setCurrentSessionId(null); setMessages([]); }, []);

  return { messages, isStreaming, currentSessionId, sessions, isLoadingSessions, sendMessage, loadSession, newChat };
}
