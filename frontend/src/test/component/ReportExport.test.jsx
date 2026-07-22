import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const store = vi.hoisted(() => ({
  saveSpy: vi.fn(),
  textSpy: vi.fn(),
  addImageSpy: vi.fn(),
}));

vi.mock('jspdf', () => {
  function MockJsPDF() {
    return {
      internal: {
        pageSize: { getWidth: () => 297, getHeight: () => 210 },
      },
      setFontSize: vi.fn(),
      setFont: vi.fn(),
      addPage: vi.fn(),
      text: store.textSpy,
      addImage: store.addImageSpy,
      save: store.saveSpy,
    };
  }
  return { jsPDF: MockJsPDF };
});

vi.mock('html2canvas', () => ({
  default: vi.fn(() =>
    Promise.resolve({
      toDataURL: () => 'data:image/png;base64,AAAA',
      width: 100,
      height: 100,
    })
  ),
}));

import ReportExport from '../../components/ReportExport';

const REVENUE = [
  { month: 'Jan', revenue: 1000 },
  { month: 'Feb', revenue: 2000 },
];
const FORECAST = [
  { month: 'Mar', actualDemand: 5, projectedSMA: 6 },
];

describe('ReportExport Component', () => {
  let createObjectURL;

  beforeEach(() => {
    vi.clearAllMocks();
    createObjectURL = vi.fn(() => 'blob:mock-url');
    globalThis.URL.createObjectURL = createObjectURL;
    globalThis.URL.revokeObjectURL = vi.fn();
    // jsdom can't perform the <a>.click() navigation used for downloads.
    HTMLAnchorElement.prototype.click = vi.fn();
  });

  afterEach(() => {
    delete globalThis.URL.createObjectURL;
    delete globalThis.URL.revokeObjectURL;
    delete HTMLAnchorElement.prototype.click;
  });

  it('renders both export buttons', () => {
    render(<ReportExport revenueData={REVENUE} forecastData={FORECAST} />);
    expect(screen.getByRole('button', { name: /Export CSV/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Export PDF/i })).toBeInTheDocument();
  });

  it('Export CSV downloads a file with proper column titles and current data', async () => {
    const user = userEvent.setup();
    render(<ReportExport revenueData={REVENUE} forecastData={FORECAST} />);

    await user.click(screen.getByRole('button', { name: /Export CSV/i }));

    expect(createObjectURL).toHaveBeenCalled();
    const blob = createObjectURL.mock.calls[0][0];
    const content = await blob.text();
    expect(content).toContain('Month,Revenue (PHP)');
    expect(content).toContain('Jan,"1,000"');
    expect(content).toContain('Feb,"2,000"');
    expect(content).toContain('Month,Actual Demand,Projected Demand (SMA)');
    expect(content).toContain('Mar,5,6');
  });

  it('Export PDF generates a document with a summary table reflecting the dashboard', async () => {
    const user = userEvent.setup();
    render(<ReportExport revenueData={REVENUE} forecastData={FORECAST} />);

    await user.click(screen.getByRole('button', { name: /Export PDF/i }));

    await waitFor(() => expect(store.saveSpy).toHaveBeenCalled());
    expect(store.saveSpy).toHaveBeenCalledWith('analytics-report.pdf');

    const printed = store.textSpy.mock.calls.map((c) => c[0]).join('\n');
    expect(printed).toContain('Analytics Report');
    expect(printed).toContain('Revenue Summary');
    expect(printed).toContain('Jan');
    expect(printed).toContain('Feb');
    expect(printed).toContain('Demand Forecast Summary');
  });
});
