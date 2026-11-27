'use strict';
const { createReportsService, completionRate } = require('../../src/modules/reports/reports.service');
const { rangeQuery } = require('../../src/modules/reports/reports.schemas');

const member = { id: 7, permissions: {} };
const manager = { id: 1, permissions: { 'project:update': true } };

function fakeRepos({ exists = true, isMember = true } = {}) {
  const reports = {
    projectTotals: jest.fn().mockResolvedValue({ total: 3, todo: 1, in_progress: 1, done: 1, overdue: 1, unassigned: 0 }),
    memberBreakdown: jest.fn().mockResolvedValue([
      { user_id: 7, name: 'Üye', assigned: 3, todo: 1, in_progress: 1, done: 1, overdue: 1 },
      { user_id: 8, name: 'Görevsiz', assigned: 0, todo: 0, in_progress: 0, done: 0, overdue: 0 },
    ]),
    rangeCounts: jest.fn().mockResolvedValue({ created: 2, completed: 1 }),
  };
  const projects = {
    findById: jest.fn().mockResolvedValue(exists ? { id: 5 } : null),
    isMember: jest.fn().mockResolvedValue(isMember),
  };
  return { reports, projects, service: createReportsService(reports, projects) };
}

describe('completionRate', () => {
  test.each([
    [0, 0, 0],
    [4, 10, 40],
    [1, 3, 33.3],
    [2, 3, 66.7],
    [5, 5, 100],
  ])('%d / %d → %d', (done, total, expected) => {
    expect(completionRate(done, total)).toBe(expected);
  });
});

describe('reports.service', () => {
  test('progress: yanıt sözleşmesi; görevsiz kişi %0 (NaN değil)', async () => {
    const { service } = fakeRepos();
    const data = await service.progress(member, 5);
    expect(data).toEqual({
      total: 3,
      status_counts: { 'To Do': 1, 'In Progress': 1, Done: 1 },
      overdue: 1,
      completion_rate: 33.3,
      unassigned: 0,
      members: [
        { user_id: 7, name: 'Üye', assigned: 3, todo: 1, in_progress: 1, done: 1, overdue: 1, completion_rate: 33.3 },
        { user_id: 8, name: 'Görevsiz', assigned: 0, todo: 0, in_progress: 0, done: 0, overdue: 0, completion_rate: 0 },
      ],
    });
  });

  test('range: from/to yanıtta geri döner', async () => {
    const { service, reports } = fakeRepos();
    await expect(service.range(member, 5, { from: '2026-11-01', to: '2026-11-15' })).resolves.toEqual({
      from: '2026-11-01',
      to: '2026-11-15',
      created: 2,
      completed: 1,
    });
    expect(reports.rangeCounts).toHaveBeenCalledWith(5, '2026-11-01', '2026-11-15');
  });

  test.each([
    ['olmayan proje', { exists: false }],
    ['üye olmayan', { isMember: false }],
  ])('%s → 404, rapor sorgusu çalışmaz', async (_ad, opts) => {
    const { service, reports } = fakeRepos(opts);
    await expect(service.progress(member, 5)).rejects.toMatchObject({ status: 404, code: 'NOT_FOUND' });
    await expect(service.range(member, 5, { from: '2026-11-01', to: '2026-11-02' })).rejects.toMatchObject({ status: 404 });
    expect(reports.projectTotals).not.toHaveBeenCalled();
    expect(reports.rangeCounts).not.toHaveBeenCalled();
  });

  test('Yönetici üye olmasa da görür', async () => {
    const { service, projects } = fakeRepos({ isMember: false });
    await expect(service.progress(manager, 5)).resolves.toHaveProperty('total', 3);
    expect(projects.isMember).not.toHaveBeenCalled();
  });
});

describe('rangeQuery', () => {
  test.each([
    [{ from: '2026-11-01', to: '2026-11-15' }],
    [{ from: '2026-11-15', to: '2026-11-15' }],
    [{ from: '2028-02-29', to: '2028-03-01' }], // artık yıl
  ])('geçerli: %o', (q) => {
    expect(rangeQuery.safeParse(q).success).toBe(true);
  });

  test.each([
    [{ from: '2026-11-15', to: '2026-11-01' }, 'to'],
    [{ from: '2026-02-29', to: '2026-03-01' }, 'from'], // 2026 artık yıl değil
    [{ from: '2026-13-01', to: '2026-12-01' }, 'from'],
    [{ from: '2026-1-1', to: '2026-12-01' }, 'from'],
    [{ to: '2026-12-01' }, 'from'],
    [{ from: '2026-12-01' }, 'to'],
    [{ from: ['2026-11-01', '2026-11-02'], to: '2026-12-01' }, 'from'], // ?from=..&from=..
  ])('geçersiz: %o → %s alanında hata', (q, field) => {
    const result = rangeQuery.safeParse(q);
    expect(result.success).toBe(false);
    expect(result.error.issues.map((i) => i.path.join('.'))).toContain(field);
  });
});
