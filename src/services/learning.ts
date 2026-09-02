import type { Topic, Lesson, Quiz, Question, Attempt } from '@/types/learning';
import { mockTopics } from '@/mocks/topics';
import { mockLessons } from '@/mocks/lessons';
import { mockQuizzes, mockQuestions } from '@/mocks/quizzes';
import { mockAttempts } from '@/mocks/analytics';

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';
const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function getTopics(filters?: { level?: string; search?: string; page?: number }): Promise<{ results: Topic[]; hasMore: boolean }> {
  if (USE_MOCKS) {
    await delay(400);
    let results = [...mockTopics];
    if (filters?.level && filters.level !== 'All') {
      results = results.filter((t) => t.level === filters.level);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      results = results.filter((t) => t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q));
    }
    const page = filters?.page ?? 1;
    const perPage = 6;
    const start = (page - 1) * perPage;
    const pageResults = results.slice(start, start + perPage);
    return { results: pageResults, hasMore: start + perPage < results.length };
  }
  const res = await fetch(`${API_BASE}/api/learning/topics/?${new URLSearchParams(filters as Record<string, string>)}`);
  if (!res.ok) throw new Error('Failed to load topics');
  return res.json();
}

export async function getTopic(id: string): Promise<Topic> {
  if (USE_MOCKS) {
    await delay(300);
    const topic = mockTopics.find((t) => t.id === id);
    if (!topic) throw new Error('Topic not found');
    return topic;
  }
  const res = await fetch(`${API_BASE}/api/learning/topics/${id}/`);
  if (!res.ok) throw new Error('Failed to load topic');
  return res.json();
}

export async function getLessonsByTopic(topicId: string): Promise<Lesson[]> {
  if (USE_MOCKS) {
    await delay(300);
    return mockLessons.filter((l) => l.topic_id === topicId).sort((a, b) => a.order - b.order);
  }
  const res = await fetch(`${API_BASE}/api/learning/topics/${topicId}/lessons/`);
  if (!res.ok) throw new Error('Failed to load lessons');
  return res.json();
}

export async function getLesson(id: string): Promise<Lesson> {
  if (USE_MOCKS) {
    await delay(300);
    const lesson = mockLessons.find((l) => l.id === id);
    if (!lesson) throw new Error('Lesson not found');
    return lesson;
  }
  const res = await fetch(`${API_BASE}/api/learning/lessons/${id}/`);
  if (!res.ok) throw new Error('Failed to load lesson');
  return res.json();
}

export async function getQuizzesByLesson(lessonId: string): Promise<Quiz[]> {
  if (USE_MOCKS) {
    await delay(300);
    return mockQuizzes.filter((q) => q.lesson_id === lessonId);
  }
  const res = await fetch(`${API_BASE}/api/learning/lessons/${lessonId}/quizzes/`);
  if (!res.ok) throw new Error('Failed to load quizzes');
  return res.json();
}

export async function getQuiz(id: string): Promise<Quiz> {
  if (USE_MOCKS) {
    await delay(300);
    const quiz = mockQuizzes.find((q) => q.id === id);
    if (!quiz) throw new Error('Quiz not found');
    return quiz;
  }
  const res = await fetch(`${API_BASE}/api/learning/quizzes/${id}/`);
  if (!res.ok) throw new Error('Failed to load quiz');
  return res.json();
}

export async function getQuestions(quizId: string): Promise<Question[]> {
  if (USE_MOCKS) {
    await delay(400);
    return mockQuestions.filter((q) => q.quiz_id === quizId).sort((a, b) => a.order - b.order);
  }
  const res = await fetch(`${API_BASE}/api/learning/quizzes/${quizId}/questions/`);
  if (!res.ok) throw new Error('Failed to load questions');
  return res.json();
}

export async function submitAttempt(quizId: string, answers: Record<string, string>): Promise<Attempt> {
  if (USE_MOCKS) {
    await delay(600);
    const questions = mockQuestions.filter((q) => q.quiz_id === quizId);
    const attemptAnswers = questions.map((q) => ({
      question_id: q.id,
      question_text: q.text,
      user_answer: answers[q.id] ?? '',
      correct_answer: q.correct_answer,
      is_correct: (answers[q.id] ?? '').trim().toLowerCase() === q.correct_answer.trim().toLowerCase(),
      explanation: q.explanation,
    }));
    const score = attemptAnswers.filter((a) => a.is_correct).length;
    const total = questions.length;
    const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
    const quiz = mockQuizzes.find((q) => q.id === quizId);
    return {
      id: `attempt-${Date.now()}`,
      quiz_id: quizId,
      quiz_title: quiz?.title ?? 'Quiz',
      score,
      total,
      percentage,
      xp_earned: percentage,
      answers: attemptAnswers,
      created_at: new Date().toISOString(),
    };
  }
  const res = await fetch(`${API_BASE}/api/learning/quizzes/${quizId}/attempts/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ answers }),
  });
  if (!res.ok) throw new Error('Failed to submit attempt');
  return res.json();
}

export async function getAttempt(quizId: string, attemptId: string): Promise<Attempt> {
  if (USE_MOCKS) {
    await delay(300);
    const attempt = mockAttempts.find((a) => a.id === attemptId);
    if (attempt) return attempt;
    const quiz = mockQuizzes.find((q) => q.id === quizId);
    return {
      id: attemptId,
      quiz_id: quizId,
      quiz_title: quiz?.title ?? 'Quiz',
      score: 4,
      total: 5,
      percentage: 80,
      xp_earned: 80,
      answers: [],
      created_at: new Date().toISOString(),
    };
  }
  const res = await fetch(`${API_BASE}/api/learning/quizzes/${quizId}/attempts/${attemptId}/`);
  if (!res.ok) throw new Error('Failed to load attempt');
  return res.json();
}
