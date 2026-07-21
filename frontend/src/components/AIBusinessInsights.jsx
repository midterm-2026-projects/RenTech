import { useState, useEffect, useCallback } from 'react';
import { Sparkles, Lightbulb, RefreshCw } from 'lucide-react';
import api from '../services/analyticsApiClient';
import { generateReport, buildFallbackInsights } from '../services/aiInsightsService';

// Matches the backend's error/configuration failure messages so we can fall
// back to locally-generated insights instead of surfacing the raw message.
const isErrorReport = (text = '') =>
  /unable to generate|not configured|could not generate|no report generated/i.test(text);

// Splits a long AI report (or any multi-line insight) into discrete,
// scannable bullets so the panel renders cleanly instead of one giant block.
const toBullets = (insights = []) =>
  insights.flatMap((item) => {
    if (typeof item !== 'string') return [item];
    return item
      .split(/\n{2,}/)
      .map((s) => s.trim())
      .filter(Boolean);
  });

const AIBusinessInsights = ({ insights = [] }) => {
  const [internalInsights, setInternalInsights] = useState([]);
  const [loading, setLoading] = useState(false);

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

      const rawInsights = Array.isArray(result.insights)
        ? result.insights
        : result.insights
          ? [result.insights]
          : [];

      const errorLike =
        rawInsights.some((t) => isErrorReport(t)) ||
        isErrorReport(result.report || '');

      if (rawInsights.length && !errorLike) {
        setInternalInsights(rawInsights);
      } else if (errorLike) {
        // Generative AI failed/unavailable — fall back to locally built,
        // properly formatted insights instead of surfacing the raw error.
        setInternalInsights(
          buildFallbackInsights({
            kpis: payload.kpis,
            revenue: payload.revenue,
            forecast: payload.forecast,
          })
        );
      } else {
        setInternalInsights([]);
      }
    } catch {
      setInternalInsights([]);
    } finally {
      setLoading(false);
    }
  }, [loadAnalyticsPayload]);

  useEffect(() => {
    if ((insights || []).length === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchAiData();
    }
    // Depend on length (not array identity) so the default `[]` prop doesn't
    // trigger a refetch on every render.
  }, [insights?.length, fetchAiData]);

  const displayInsights = toBullets((insights || []).length > 0 ? insights : internalInsights);
  const hasData = displayInsights.length > 0;

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
      <div className="flex items-center space-x-2">
        <span className="p-2 rounded-lg bg-indigo-50 text-indigo-500">
          <Sparkles className="w-5 h-5" />
        </span>
        <div>
          <h2 className="text-xl font-bold text-gray-800">AI Business Insights</h2>
          <p className="text-xs text-gray-400">Generated from live analytics data</p>
        </div>
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
