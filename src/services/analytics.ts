import type { AnalyticsSummary, WeeklyActivity, TopicPerformance, ScoreTrend, Recommendation, Attempt } from '@/types/learning';
import { mockAnalyticsSummary, mockWeeklyActivity, mockTopicPerformance, mockScoreTrend, mockRecommendations, mockAttempts } from '@/mocks/analytics';

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';
const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function getSummary(period: string = '30d'): Promise<AnalyticsSummary> {
  if (USE_MOCKS) {
    await delay(300);
    return mockAnalyticsSummary;
  }
  const res = await fetch(`${API_BASE}/api/analytics/summary/?period=${period}`);
  if (!res.ok) throw new Error('Failed to load summary');
  return res.json();
}

export async function getWeeklyActivity(): Promise<WeeklyActivity[]> {
  if (USE_MOCKS) {
    await delay(300);
    return mockWeeklyActivity;
  }
  const res = await fetch(`${API_BASE}/api/analytics/weekly/`);
  if (!res.ok) throw new Error('Failed to load weekly activity');
  return res.json();
}

export async function getTopicPerformance(): Promise<TopicPerformance[]> {
  if (USE_MOCKS) {
    await delay(300);
    return mockTopicPerformance;
  }
  const res = await fetch(`${API_BASE}/api/analytics/topics/`);
  if (!res.ok) throw new Error('Failed to load topic performance');
  return res.json();
}

export async function getScoreTrend(): Promise<ScoreTrend[]> {
  if (USE_MOCKS) {
    await delay(300);
    return mockScoreTrend;
  }
  const res = await fetch(`${API_BASE}/api/analytics/trend/`);
  if (!res.ok) throw new Error('Failed to load score trend');
  return res.json();
}

export async function getRecommendations(): Promise<Recommendation[]> {
  if (USE_MOCKS) {
    await delay(300);
    return mockRecommendations;
  }
  const res = await fetch(`${API_BASE}/api/analytics/recommendations/`);
  if (!res.ok) throw new Error('Failed to load recommendations');
  return res.json();
}

export async function getRecentAttempts(): Promise<Attempt[]> {
  if (USE_MOCKS) {
    await delay(300);
    return mockAttempts;
  }
  const res = await fetch(`${API_BASE}/api/analytics/attempts/`);
  if (!res.ok) throw new Error('Failed to load attempts');
  return res.json();
}

export async function trackEvent(eventType: string, metadata?: Record<string, unknown>): Promise<void> {
  if (USE_MOCKS) return;
  await fetch(`${API_BASE}/api/analytics/track/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event_type: eventType, metadata }),
  }).catch(() => {});
}
