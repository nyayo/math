import { get, post, patch, del, uploadFile } from '@/lib/api';
import type { School, Membership, PlanInfo, Subscription, UsageMetric, Invoice, AuditLog, Invitation, SchoolClass } from '@/types/school';

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function fetchMySchools(): Promise<School[]> {
  if (USE_MOCKS) { await delay(300); return [((await import('@/mocks/schoolMocks')).mockSchool)]; }
  return get<School[]>('/api/schools/me/');
}

export async function fetchSchool(id: string): Promise<School> {
  if (USE_MOCKS) { await delay(200); return (await import('@/mocks/schoolMocks')).mockSchool; }
  return get<School>(`/api/schools/${id}/`);
}

export async function updateSchool(id: string, data: Partial<School>): Promise<School> {
  if (USE_MOCKS) { await delay(400); return { ...(await import('@/mocks/schoolMocks')).mockSchool, ...data }; }
  return patch<School>(`/api/schools/${id}/`, data);
}

export async function fetchSchoolMembers(schoolId: string, params?: { role?: string; search?: string; page?: number }): Promise<{ count: number; results: Membership[] }> {
  if (USE_MOCKS) {
    await delay(300);
    let results = [...(await import('@/mocks/schoolMocks')).mockMemberships];
    if (params?.role && params.role !== 'all') results = results.filter((m) => m.role === params.role);
    if (params?.search) {
      const q = params.search.toLowerCase();
      results = results.filter((m) => m.user.first_name.toLowerCase().includes(q) || m.user.last_name.toLowerCase().includes(q) || m.user.email.toLowerCase().includes(q));
    }
    return { count: results.length, results };
  }
  return get<{ count: number; results: Membership[] }>(`/api/schools/${schoolId}/members/`, { params });
}

export async function updateMember(schoolId: string, memberId: string, data: Partial<Membership>): Promise<Membership> {
  if (USE_MOCKS) { await delay(300); const m = (await import('@/mocks/schoolMocks')).mockMemberships.find((x) => x.id === memberId)!; return { ...m, ...data }; }
  return patch<Membership>(`/api/schools/${schoolId}/members/${memberId}/`, data);
}

export async function removeMember(schoolId: string, memberId: string): Promise<void> {
  if (USE_MOCKS) { await delay(300); return; }
  await del(`/api/schools/${schoolId}/members/${memberId}/`);
}

export async function fetchMember(schoolId: string, memberId: string): Promise<Membership> {
  if (USE_MOCKS) { await delay(200); return (await import('@/mocks/schoolMocks')).mockMemberships.find((m) => m.id === memberId) ?? (await import('@/mocks/schoolMocks')).mockMemberships[0]; }
  return get<Membership>(`/api/schools/${schoolId}/members/${memberId}/`);
}

export async function sendInvitations(schoolId: string, invitations: Array<{ email: string; role: string; class_level?: string; metadata?: Record<string, unknown> }>): Promise<Invitation[]> {
  if (USE_MOCKS) {
    await delay(500);
    const mock = await import('@/mocks/schoolMocks');
    return invitations.map((inv, i) => ({
      id: `inv-new-${Date.now()}-${i}`,
      school: schoolId,
      email: inv.email,
      role: inv.role as Invitation['role'],
      class_level: inv.class_level ?? null,
      token: `tok-${Math.random().toString(36).slice(2)}`,
      status: 'pending',
      invited_by_name: 'Sarah Nakimuli',
      expires_at: new Date(Date.now() + 7 * 86400000).toISOString(),
      accepted_at: null,
      created_at: new Date().toISOString(),
    }));
  }
  return post<Invitation[]>(`/api/schools/${schoolId}/invitations/bulk/`, { invitations });
}

export async function fetchInvitations(schoolId: string, params?: { status?: string }): Promise<{ count: number; results: Invitation[] }> {
  if (USE_MOCKS) {
    await delay(200);
    let results = [...(await import('@/mocks/schoolMocks')).mockInvitations];
    if (params?.status && params.status !== 'all') results = results.filter((i) => i.status === params.status);
    return { count: results.length, results };
  }
  return get<{ count: number; results: Invitation[] }>(`/api/schools/${schoolId}/invitations/`, { params });
}

export async function revokeInvitation(schoolId: string, invitationId: string): Promise<void> {
  if (USE_MOCKS) { await delay(200); return; }
  await del(`/api/schools/${schoolId}/invitations/${invitationId}/`);
}

export async function resendInvitation(schoolId: string, invitationId: string): Promise<Invitation> {
  if (USE_MOCKS) { await delay(300); return (await import('@/mocks/schoolMocks')).mockInvitations[0]; }
  return post<Invitation>(`/api/schools/${schoolId}/invitations/${invitationId}/resend/`);
}

export async function fetchClasses(schoolId: string): Promise<SchoolClass[]> {
  if (USE_MOCKS) { await delay(300); return (await import('@/mocks/schoolMocks')).mockClasses; }
  return get<SchoolClass[]>(`/api/schools/${schoolId}/classes/`);
}

export async function createClass(schoolId: string, data: Partial<SchoolClass>): Promise<SchoolClass> {
  if (USE_MOCKS) { await delay(400); return { id: `c-${Date.now()}`, school: schoolId, name: data.name ?? 'New Class', level: data.level ?? 'S1', class_teacher_name: null, academic_year: '2026', student_count: 0, created_at: new Date().toISOString() }; }
  return post<SchoolClass>(`/api/schools/${schoolId}/classes/`, data);
}

export async function updateClass(schoolId: string, classId: string, data: Partial<SchoolClass>): Promise<SchoolClass> {
  if (USE_MOCKS) { await delay(300); const c = (await import('@/mocks/schoolMocks')).mockClasses.find((x) => x.id === classId)!; return { ...c, ...data }; }
  return patch<SchoolClass>(`/api/schools/${schoolId}/classes/${classId}/`, data);
}

export async function deleteClass(schoolId: string, classId: string): Promise<void> {
  if (USE_MOCKS) { await delay(300); return; }
  await del(`/api/schools/${schoolId}/classes/${classId}/`);
}

export async function assignClassTeacher(schoolId: string, classId: string, teacherId: string): Promise<SchoolClass> {
  if (USE_MOCKS) { await delay(300); return (await import('@/mocks/schoolMocks')).mockClasses[0]; }
  return post<SchoolClass>(`/api/schools/${schoolId}/classes/${classId}/assign-teacher/`, { teacher_id: teacherId });
}

export async function bulkImportStudents(schoolId: string, file: File): Promise<{ created: number; errors: Array<{ row: number; message: string }> }> {
  if (USE_MOCKS) { await delay(1500); return { created: 12, errors: [{ row: 5, message: 'Invalid email format' }] }; }
  return uploadFile(`/api/schools/${schoolId}/members/bulk-import/`, file, {}) as Promise<{ created: number; errors: Array<{ row: number; message: string }> }>;
}

export async function generateClassCode(schoolId: string): Promise<{ code: string; url: string }> {
  if (USE_MOCKS) { await delay(300); return { code: 'KSS-2026-ABC123', url: `https://mathmaster.app/join?code=KSS-2026-ABC123` }; }
  return post<{ code: string; url: string }>(`/api/schools/${schoolId}/class-code/generate/`);
}

export async function fetchClassCode(schoolId: string): Promise<{ code: string; url: string; active: boolean }> {
  if (USE_MOCKS) { await delay(200); return { code: 'KSS-2026-ABC123', url: `https://mathmaster.app/join?code=KSS-2026-ABC123`, active: true }; }
  return get<{ code: string; url: string; active: boolean }>(`/api/schools/${schoolId}/class-code/`);
}

export async function fetchSubscription(schoolId: string): Promise<Subscription> {
  if (USE_MOCKS) { await delay(200); return (await import('@/mocks/schoolMocks')).mockSubscription; }
  return get<Subscription>(`/api/schools/${schoolId}/subscription/`);
}

export async function fetchInvoices(schoolId: string): Promise<Invoice[]> {
  if (USE_MOCKS) { await delay(200); return (await import('@/mocks/schoolMocks')).mockInvoices; }
  return get<Invoice[]>(`/api/schools/${schoolId}/invoices/`);
}

export async function fetchUsage(schoolId: string): Promise<UsageMetric[]> {
  if (USE_MOCKS) { await delay(200); return (await import('@/mocks/schoolMocks')).mockUsage; }
  return get<UsageMetric[]>(`/api/schools/${schoolId}/usage/`);
}

export async function fetchPlans(): Promise<PlanInfo[]> {
  if (USE_MOCKS) { await delay(200); return (await import('@/mocks/schoolMocks')).mockPlans; }
  return get<PlanInfo[]>('/api/billing/plans/');
}

export async function createCheckoutSession(schoolId: string, planId: string, cycle: 'monthly' | 'annual'): Promise<{ url: string }> {
  if (USE_MOCKS) { await delay(500); return { url: 'https://billing.stripe.com/mock-checkout' }; }
  return post<{ url: string }>('/api/billing/checkout/', { school_id: schoolId, plan_id: planId, billing_cycle: cycle });
}

export async function openBillingPortal(schoolId: string): Promise<{ url: string }> {
  if (USE_MOCKS) { await delay(300); return { url: 'https://billing.stripe.com/mock-portal' }; }
  return post<{ url: string }>('/api/billing/portal/', { school_id: schoolId });
}

export async function cancelSubscription(schoolId: string): Promise<{ status: string }> {
  if (USE_MOCKS) { await delay(400); return { status: 'canceled' }; }
  return post<{ status: string }>(`/api/schools/${schoolId}/subscription/cancel/`);
}

export async function fetchAuditLogs(schoolId: string, params?: { page?: number; actor?: string; action?: string }): Promise<{ count: number; results: AuditLog[] }> {
  if (USE_MOCKS) {
    await delay(300);
    let results = [...(await import('@/mocks/schoolMocks')).mockAuditLogs];
    if (params?.action) results = results.filter((l) => l.action.includes(params.action!));
    return { count: results.length, results };
  }
  return get<{ count: number; results: AuditLog[] }>(`/api/schools/${schoolId}/audit-logs/`, { params });
}

export async function joinSchoolByCode(code: string): Promise<Membership> {
  if (USE_MOCKS) { await delay(500); return (await import('@/mocks/schoolMocks')).mockMemberships[0]; }
  return post<Membership>('/api/schools/join-by-code/', { code });
}

export async function switchSchoolContext(schoolId: string): Promise<{ school: School; membership: Membership }> {
  if (USE_MOCKS) { await delay(300); const m = await import('@/mocks/schoolMocks'); return { school: m.mockSchool, membership: m.mockMemberships[0] }; }
  return post<{ school: School; membership: Membership }>('/api/auth/switch-school/', { school_id: schoolId });
}
