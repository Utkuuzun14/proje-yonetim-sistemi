'use strict';
const { createTasksService } = require('../../src/modules/tasks/tasks.service');
const { createTaskSchema, updateTaskSchema, listTasksQuery } = require('../../src/modules/tasks/tasks.schemas');

const ADMIN = { id: 1, permissions: { 'project:update': true, 'task:update': true, 'task:assign': true, 'task:delete': true } };
const MEMBER = { id: 7, permissions: { 'task:read': true, 'task:update_status': true } };
const OTHER = 3; // aynı projede başka bir Ekip Üyesi

function setup(task = { id: 10, project_id: 5, assignee_id: OTHER, start_date: '2026-11-05', end_date: '2026-11-10' }) {
  const tasks = {
    findById: jest.fn(async (id) => (id === task.id ? task : null)),
    create: jest.fn(async (projectId, input) => ({ id: 11, project_id: projectId, ...input })),
    update: jest.fn(async (id, changes) => ({ ...task, ...changes })),
  };
  const projects = {
    findById: jest.fn(async (id) => (id === 5 ? { id: 5 } : null)),
    isMember: jest.fn(async (projectId, userId) => projectId === 5 && [1, 3, 7].includes(userId)),
  };
  return { service: createTasksService(tasks, projects), tasks };
}

describe('tasks.service yetki kuralları (Karar 9–10, birim)', () => {
  test('Ekip Üyesi atamasız görev oluşturursa görev kendisine atanır', async () => {
    const { service, tasks } = setup();
    await service.create(MEMBER, 5, { title: 'x' });
    expect(tasks.create).toHaveBeenCalledWith(5, expect.objectContaining({ assignee_id: MEMBER.id }), MEMBER.id);
  });

  test('Yönetici atamasız görev oluşturabilir', async () => {
    const { service, tasks } = setup();
    await service.create(ADMIN, 5, { title: 'x' });
    expect(tasks.create.mock.calls[0][1].assignee_id).toBeUndefined();
  });

  test('Ekip Üyesi başkasının görevinde yalnız durumu değiştirebilir', async () => {
    const { service, tasks } = setup();
    await expect(service.update(MEMBER, 10, { status: 'Done' })).resolves.toMatchObject({ status: 'Done' });
    await expect(service.update(MEMBER, 10, { status: 'Done', title: 'y' })).rejects.toMatchObject({ status: 403 });
    expect(tasks.update).toHaveBeenCalledTimes(1);
  });

  test('aynı atamayı geri göndermek atama değişikliği sayılmaz', async () => {
    const { service } = setup({ id: 10, project_id: 5, assignee_id: MEMBER.id });
    await expect(service.update(MEMBER, 10, { title: 'y', assignee_id: MEMBER.id })).resolves.toBeDefined();
  });

  test('güncellemede tarih sırası mevcut değerlerle birlikte denetlenir', async () => {
    const { service } = setup();
    await expect(service.update(ADMIN, 10, { start_date: '2026-11-20' })).rejects.toMatchObject({
      status: 400,
      details: [{ field: 'end_date', message: expect.any(String) }],
    });
  });

  test('olmayan görev ve üye olunmayan projedeki görev 404', async () => {
    const { service } = setup({ id: 10, project_id: 6, assignee_id: null });
    await expect(service.update(ADMIN, 99, { status: 'Done' })).rejects.toMatchObject({ status: 404 });
    await expect(service.history(MEMBER, 10)).rejects.toMatchObject({ status: 404 });
  });
});

describe('tasks.schemas (birim)', () => {
  test('oluşturma varsayılanları: To Do, Medium, Task', () => {
    expect(createTaskSchema.parse({ title: '  Başlık  ' })).toMatchObject({ title: 'Başlık', status: 'To Do', priority: 'Medium', type: 'Task' });
  });

  test('boş metin tarih ve atama null sayılır', () => {
    expect(updateTaskSchema.parse({ start_date: '', assignee_id: '' })).toEqual({ start_date: null, assignee_id: null });
  });

  test('liste filtresi: assigneeId sayıya çevrilir, from > to reddedilir', () => {
    expect(listTasksQuery.parse({ assigneeId: '7' })).toEqual({ assigneeId: 7 });
    expect(listTasksQuery.safeParse({ assigneeId: 'abc' }).success).toBe(false);
    expect(listTasksQuery.safeParse({ from: '2026-12-01', to: '2026-11-01' }).success).toBe(false);
  });
});
