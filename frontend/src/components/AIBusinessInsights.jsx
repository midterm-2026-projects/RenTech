import { useState, useEffect, useCallback } from 'react';
import { jsPDF } from 'jspdf';
import { Sparkles, Lightbulb, FileDown, RefreshCw } from 'lucide-react';
import api from '../services/analyticsApiClient';
import { generateReport } from '../services/aiInsightsService';

const AIBusinessInsights = ({ insights = [], onReportGenerated }) => {
  const [internalInsights, setInternalInsights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);

  const loadAnalyticsPayload = useCallback(async () => {
    const kpisRes = await api.get('/api/analytics/kpis');
    const kpis = kpisRes.data || [];
    const summariesRes = await api.get('/api/analytics/summaries');
    const summaries = summariesRes.data || [];
    const forecastsRes = await api.get('/api/analytics/forecasts');
    const forecasts = forecastsRes.data || [];

    const kpiMap = {};
    kpis.forEach(k => {
      kpiMap[k.kpi_name] = k.kpi_value;
    });

    const revenueData = summaries.filter(s => s.metric_name === 'revenue').map(s => ({
      period: s.period,
      value: s.metric_value
    }));

    const forecastData = forecasts.map(f => ({
      month: f.forecast_date,
      forecast: f.forecast_value,
      actual: f.actual_value
    }));

    return { kpis: kpiMap, revenue: revenueData, forecast: forecastData };
  }, []);

  const fetchAiData = useCallback(async () => {
    setLoading(true);
    try {
      const payload = await loadAnalyticsPayload();
      const result = await generateReport(payload);

      if (result.insights) {
        setInternalInsights(Array.isArray(result.insights) ? result.insights : [result.insights]);
      }
    } catch {
      setInternalInsights([]);
    } finally {
      setLoading(false);
    }
  }, [loadAnalyticsPayload]);

  useEffect(() => {
    if ((insights || []).length === 0) {
      fetchAiData();
    }
    // Depend on length (not array identity) so the default `[]` prop doesn't
    // trigger a refetch on every render.
  }, [insights?.length, fetchAiData]);

  const displayInsights = (insights || []).length > 0 ? insights : internalInsights;
  const hasData = displayInsights.length > 0;

  const handleGenerateReport = async () => {
    setReportLoading(true);
    try {
      const payload = await loadAnalyticsPayload();
      const result = await generateReport(payload);
      const reportText = result.insights?.[0] || result.report || 'No report generated';

      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      let y = 20;

      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('RenTech Analytics Report', pageWidth / 2, y, { align: 'center' });
      y += 15;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, y, { align: 'center' });
      y += 10;

      const addSection = (title, content) => {
        if (y > 270) { doc.addPage(); y = 20; }
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(title, 15, y);
        y += 8;
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');

        const lines = doc.splitTextToSize(content, 180);
        doc.text(lines, 15, y);
        y += lines.length * 6 + 5;
      };

      const sections = reportText.split('\n\n').filter(s => s.trim());
      sections.forEach((section, i) => {
        const lines = section.split('\n');
        const header = lines[0];
        const content = lines.slice(1).join('\n') || lines[0];
        if (header && header.length < 50 && !header.includes('.')) {
          addSection(header, content);
        } else {
          addSection(`Section ${i + 1}`, section);
        }
      });

      doc.save('rentech-analytics-report.pdf');

      if (onReportGenerated) {
        onReportGenerated();
      }
    } catch {
      alert('Failed to generate report. Please try again.');
    } finally {
      setReportLoading(false);
    }
  };

  if (!hasData && loading) {
    return (
      <div className="p-6 bg-white border border-indigo-100 rounded-2xl shadow-sm">
        <div className="flex items-center space-x-3 text-indigo-500">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <p className="text-sm font-medium">Loading AI insights...</p>
        </div>
      </div>
    );
  }

  if (!hasData) {
    return (
      <div className="p-6 bg-white border border-indigo-100 rounded-2xl shadow-sm" data-testid="ai-fallback">
        <div className="flex items-center space-x-2 text-indigo-500 mb-2">
          <Sparkles className="w-5 h-5" />
          <h2 className="text-lg font-bold text-gray-800">AI Business Insights</h2>
        </div>
        <p className="text-gray-500 italic">
          No AI business insights available at this time.
        </p>
      </div>
    );
  }

  return (
    <div className="ai-insights-container bg-white border border-indigo-100 rounded-2xl shadow-sm p-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <span className="p-2 rounded-lg bg-indigo-50 text-indigo-500">
            <Sparkles className="w-5 h-5" />
          </span>
          <div>
            <h2 className="text-xl font-bold text-gray-800">AI Business Insights</h2>
            <p className="text-xs text-gray-400">Generated from live analytics data</p>
          </div>
        </div>
        <button
          onClick={handleGenerateReport}
          disabled={reportLoading}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50"
        >
          <FileDown className="w-4 h-4" />
          <span>{reportLoading ? 'Generating...' : 'Generate AI Report'}</span>
        </button>
      </div>

      <section>
        <div className="flex items-center space-x-2 mb-3">
          <Lightbulb className="w-4 h-4 text-amber-500" />
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Business Insights</h3>
        </div>
        <ul className="space-y-3" data-testid="insights-list">
          {displayInsights.map((insight, index) => (
            <li
              key={index}
              className="flex items-start space-x-3 p-4 rounded-xl bg-amber-50/60 border border-amber-100"
            >
              <span className="mt-0.5 w-6 h-6 shrink-0 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-xs font-bold">
                {index + 1}
              </span>
              <p className="text-sm text-gray-700 leading-relaxed">{insight}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default AIBusinessInsights;
