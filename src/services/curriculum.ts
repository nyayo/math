import { get } from '@/lib/api';
import type {
  CurriculumLevel,
  CurriculumObjective,
  CurriculumStrand,
  LocalProblem,
  Textbook,
  UNEBFormat,
  WorkedExample,
} from '@/types/pillar1';

export function fetchLevels(): Promise<CurriculumLevel[]> {
  return get<CurriculumLevel[]>('/api/curriculum/levels/');
}

export function fetchLevel(level: string): Promise<CurriculumLevel> {
  return get<CurriculumLevel>(`/api/curriculum/levels/${level}/`);
}

export function fetchObjective(code: string): Promise<CurriculumObjective> {
  return get<CurriculumObjective>(`/api/curriculum/objectives/${code}/`);
}

export function fetchStrand(level: string, code: string): Promise<CurriculumStrand> {
  return get<CurriculumStrand>(`/api/curriculum/strands/${level}/${code}/`);
}

export function fetchTextbooks(level: string): Promise<Textbook[]> {
  return get<Textbook[]>('/api/curriculum/textbooks/', { params: { level } });
}

export function fetchWorkedExamples(code: string): Promise<WorkedExample[]> {
  return get<WorkedExample[]>('/api/curriculum/worked-examples/', { params: { code } });
}

export function fetchLocalProblems(code: string, difficulty?: string): Promise<LocalProblem[]> {
  return get<LocalProblem[]>('/api/curriculum/local-problems/', { params: { code, difficulty } });
}

export function fetchUNEBFormat(exam = 'UCE'): Promise<UNEBFormat> {
  return get<UNEBFormat>('/api/curriculum/uneb-format/', { params: { exam } });
}

export function searchObjectives(q: string): Promise<CurriculumObjective[]> {
  return get<CurriculumObjective[]>('/api/curriculum/search/', { params: { q } });
}
