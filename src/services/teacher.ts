import type { Topic, Lesson, Quiz, Question } from '@/types/learning';
import type { TeacherOverview, TeacherStudent, StudentDetail, ContentActivity, NotificationItem, SearchResult } from '@/types/teacher';
import { mockTopics } from '@/mocks/topics';
import { mockLessons } from '@/mocks/lessons';
import { mockQuizzes, mockQuestions } from '@/mocks/quizzes';
import { mockTeacherOverview, mockTeacherStudents, mockStudentDetail, mockContentActivity, mockNotifications } from '@/mocks/teacher';

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';
const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ─── Overview & Students ───────────────────────────────────────

export async function getTeacherOverview(): Promise<TeacherOverview> {
  if (USE_MOCKS) { await delay(300); return mockTeacherOverview; }
  const res = await fetch(`${API_BASE}/api/analytics/teacher/overview/`);
  if (!res.ok) throw new Error('Failed to load overview');
  return res.json();
}

export async function getTeacherStudents(filters?: { search?: string; sort?: string; page?: number }): Promise<{ results: TeacherStudent[]; hasMore: boolean }> {
  if (USE_MOCKS) {
    await delay(400);
    let results = [...mockTeacherStudents];
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      results = results.filter((s) => s.first_name.toLowerCase().includes(q) || s.username.toLowerCase().includes(q) || s.email.toLowerCase().includes(q));
    }
    if (filters?.sort === 'Name') results.sort((a, b) => a.first_name.localeCompare(b.first_name));
    else if (filters?.sort === 'Average score') results.sort((a, b) => b.avg_score - a.avg_score);
    else results.sort((a, b) => new Date(b.last_active).getTime() - new Date(a.last_active).getTime());
    const page = filters?.page ?? 1;
    const perPage = 8;
    const start = (page - 1) * perPage;
    return { results: results.slice(start, start + perPage), hasMore: start + perPage < results.length };
  }
  const res = await fetch(`${API_BASE}/api/analytics/teacher/students/?${new URLSearchParams(filters as Record<string, string>)}`);
  if (!res.ok) throw new Error('Failed to load students');
  return res.json();
}

export async function getTeacherStudent(id: string): Promise<StudentDetail> {
  if (USE_MOCKS) { await delay(300); return { ...mockStudentDetail, ...mockTeacherStudents.find((s) => s.id === id) ?? mockTeacherStudents[0] }; }
  const res = await fetch(`${API_BASE}/api/analytics/teacher/students/${id}/`);
  if (!res.ok) throw new Error('Failed to load student');
  return res.json();
}

// ─── Content CRUD ───────────────────────────────────────────────

export async function createTopic(data: Partial<Topic>): Promise<Topic> {
  if (USE_MOCKS) { await delay(500); return { ...data, id: `topic-${Date.now()}`, lessons_count: 0, quizzes_count: 0, progress: 0, lessons_completed: 0, created_at: new Date().toISOString() } as Topic; }
  const res = await fetch(`${API_BASE}/api/learning/topics/`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  if (!res.ok) throw new Error('Failed to create topic');
  return res.json();
}

export async function updateTopic(id: string, data: Partial<Topic>): Promise<Topic> {
  if (USE_MOCKS) { await delay(400); return { ...mockTopics.find((t) => t.id === id)!, ...data }; }
  const res = await fetch(`${API_BASE}/api/learning/topics/${id}/`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  if (!res.ok) throw new Error('Failed to update topic');
  return res.json();
}

export async function deleteTopic(id: string): Promise<void> {
  if (USE_MOCKS) { await delay(300); return; }
  const res = await fetch(`${API_BASE}/api/learning/topics/${id}/`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete topic');
}

export async function createLesson(topicId: string, data: Partial<Lesson>): Promise<Lesson> {
  if (USE_MOCKS) { await delay(500); return { ...data, id: `lesson-${Date.now()}`, topic_id: topicId, completed: false } as Lesson; }
  const res = await fetch(`${API_BASE}/api/learning/topics/${topicId}/lessons/`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  if (!res.ok) throw new Error('Failed to create lesson');
  return res.json();
}

export async function updateLesson(id: string, data: Partial<Lesson>): Promise<Lesson> {
  if (USE_MOCKS) { await delay(400); return { ...mockLessons.find((l) => l.id === id)!, ...data }; }
  const res = await fetch(`${API_BASE}/api/learning/lessons/${id}/`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  if (!res.ok) throw new Error('Failed to update lesson');
  return res.json();
}

export async function deleteLesson(id: string): Promise<void> {
  if (USE_MOCKS) { await delay(300); return; }
  const res = await fetch(`${API_BASE}/api/learning/lessons/${id}/`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete lesson');
}

export async function createQuiz(lessonId: string, data: Partial<Quiz>): Promise<Quiz> {
  if (USE_MOCKS) { await delay(500); return { ...data, id: `quiz-${Date.now()}`, lesson_id: lessonId, questions_count: 0, best_score: null, attempted: false } as Quiz; }
  const res = await fetch(`${API_BASE}/api/learning/lessons/${lessonId}/quizzes/`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  if (!res.ok) throw new Error('Failed to create quiz');
  return res.json();
}

export async function updateQuiz(id: string, data: Partial<Quiz>): Promise<Quiz> {
  if (USE_MOCKS) { await delay(400); return { ...mockQuizzes.find((q) => q.id === id)!, ...data }; }
  const res = await fetch(`${API_BASE}/api/learning/quizzes/${id}/`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  if (!res.ok) throw new Error('Failed to update quiz');
  return res.json();
}

export async function deleteQuiz(id: string): Promise<void> {
  if (USE_MOCKS) { await delay(300); return; }
  const res = await fetch(`${API_BASE}/api/learning/quizzes/${id}/`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete quiz');
}

export async function createQuestion(quizId: string, data: Partial<Question>): Promise<Question> {
  if (USE_MOCKS) { await delay(400); return { ...data, id: `q-${Date.now()}`, quiz_id: quizId, order: data.order ?? 1 } as Question; }
  const res = await fetch(`${API_BASE}/api/learning/quizzes/${quizId}/questions/`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  if (!res.ok) throw new Error('Failed to create question');
  return res.json();
}

export async function bulkCreateQuestions(quizId: string, questions: Partial<Question>[]): Promise<Question[]> {
  if (USE_MOCKS) { await delay(600); return questions.map((q, i) => ({ ...q, id: `q-bulk-${Date.now()}-${i}`, quiz_id: quizId, order: i + 1 } as Question)); }
  const res = await fetch(`${API_BASE}/api/learning/quizzes/${quizId}/questions/bulk/`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ questions }) });
  if (!res.ok) throw new Error('Failed to bulk create questions');
  return res.json();
}

// ─── Content Activity ──────────────────────────────────────────

export async function getContentActivity(): Promise<ContentActivity[]> {
  if (USE_MOCKS) { await delay(300); return mockContentActivity; }
  const res = await fetch(`${API_BASE}/api/learning/activity/`);
  if (!res.ok) throw new Error('Failed to load activity');
  return res.json();
}

// ─── Notifications ──────────────────────────────────────────────

export async function getNotifications(): Promise<NotificationItem[]> {
  if (USE_MOCKS) { await delay(300); return mockNotifications; }
  const res = await fetch(`${API_BASE}/api/notifications/`);
  if (!res.ok) throw new Error('Failed to load notifications');
  return res.json();
}

// ─── Search ─────────────────────────────────────────────────────

export async function search(query: string, role: 'student' | 'teacher'): Promise<SearchResult[]> {
  if (USE_MOCKS) {
    await delay(200);
    const q = query.toLowerCase();
    const results: SearchResult[] = [];
    mockTopics.filter((t) => t.name.toLowerCase().includes(q)).slice(0, 3).forEach((t) => results.push({ id: t.id, type: 'topic', title: t.name, subtitle: `${t.level} · ${t.subject}`, href: role === 'teacher' ? `/teacher/curriculum/${t.id}` : `/topics/${t.id}` }));
    mockLessons.filter((l) => l.title.toLowerCase().includes(q)).slice(0, 2).forEach((l) => results.push({ id: l.id, type: 'lesson', title: l.title, subtitle: 'Lesson', href: `/lessons/${l.id}` }));
    mockQuizzes.filter((quiz) => quiz.title.toLowerCase().includes(q)).slice(0, 1).forEach((quiz) => results.push({ id: quiz.id, type: 'quiz', title: quiz.title, subtitle: 'Quiz', href: `/quizzes/${quiz.id}` }));
    if (role === 'teacher') {
      mockTeacherStudents.filter((s) => s.first_name.toLowerCase().includes(q) || s.username.toLowerCase().includes(q)).slice(0, 2).forEach((s) => results.push({ id: s.id, type: 'student', title: s.first_name, subtitle: `${s.level} · @${s.username}`, href: `/teacher/students/${s.id}` }));
    }
    return results;
  }
  const res = await fetch(`${API_BASE}/api/search/?q=${encodeURIComponent(query)}&role=${role}`);
  if (!res.ok) throw new Error('Search failed');
  return res.json();
}
