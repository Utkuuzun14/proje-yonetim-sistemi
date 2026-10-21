import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import axe from 'axe-core';
import App from './App';

vi.mock('./workspace/files', () => ({ listFiles: vi.fn().mockResolvedValue([]), saveFile: vi.fn(), downloadBlob: vi.fn() }));

describe('Erişilebilirlik: semantik ve erişilebilir isimler', () => {
  it.each(['/giris', '/kayit', '/onizleme/projeler', '/onizleme/raporlar'])('%s ekranı temel denetimi geçer', async (path) => {
    localStorage.clear();
    const { container } = render(<MemoryRouter initialEntries={[path]}><App/></MemoryRouter>);
    const results = await axe.run(container, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] },
      // jsdom has no layout/canvas; actual contrast and focus need browser QA.
      rules: { 'color-contrast': { enabled: false } },
    });
    expect(results.violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => n.target) }))).toEqual([]);
  });
});
