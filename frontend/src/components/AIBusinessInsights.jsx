import { useState, useEffect, useCallback, useMemo } from 'react';
import { Sparkles, TrendingUp, Package, Users, Clock, RotateCcw, BarChart3, Lightbulb } from 'lucide-react';
import api from '../services/analyticsApiClient';
import { generateReport, buildFallbackInsights, clearInsightsCache, getCacheTimestamp } from '../services/aiInsightsService';

const isErrorReport = (text = '') =>
  /unable to generate|not configured|could not generate|no report generated/i.test(text);

const toBullets = (insights = []) =>
  insights.flatMap((item) => {
    if (typeof item !== 'string') return [item];
    return item
      .split(/\n{2,}/)
      .map((s) => s.trim())
      .filter(Boolean);
  });

const CATEGORIES = [
  { match: /revenue|sales|income|₱|peso|demand|projected|forecast|rental|active/i, icon: TrendingUp, label: 'Revenue', bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700', iconBg: 'bg-rose-100', iconColor: 'text-rose-600' },
  { match: /inventory|stock|restock|slow-moving|customer|satisfaction|feedback|overdue|return|fulfilment/i, icon: Package, label: 'Operations', bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', iconBg: 'bg-blue-100', iconColor: 'text-blue-600' },
  { match: /.*/, icon: Lightbulb, label: 'Insight', bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-700', iconBg: 'bg-gray-100', iconColor: 'text-gray-600' },
];

const categorizeInsight = (text) => CATEGORIES.find((c) => c.match.test(text)) || CATEGORIES[CATEGORIES.length - 1];

const InsightCard = ({ insight, index }) => {
  const cat = useMemo(() => categorizeInsight(insight), [insight]);
  const Icon = cat.icon;

  return (
    <li
      className={`group flex items-start gap-4 p-4 rounded-xl ${cat.bg} ${cat.border} border hover:shadow-md transition-all duration-200`}
    >
      <span className={`mt-0.5 w-8 h-8 shrink-0 rounded-lg ${cat.iconBg} ${cat.iconColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
        <Icon className="w-4 h-4" />
      </span>
      <div className="min-w-0 flex-1">
        <span className={`text-xs font-semibold uppercase tracking-wider ${cat.text}`}>
          {cat.label}
        </span>
        <p className="mt-1 text-sm text-gray-700 leading-relaxed">{insight}</p>
      </div>
    </li>
  );
};

const LoadingSkeleton = () => (
  <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 space-y-4">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-lg bg-rose-100 animate-pulse" />
      <div className="space-y-2 flex-1">
        <div className="h-5 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="h-3 w-32 bg-gray-100 rounded animate-pulse" />
      </div>
    </div>
    {[1, 2, 3].map((i) => (
      <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
        <div className="w-8 h-8 rounded-lg bg-gray-200 animate-pulse shrink-0" />
        <div className="space-y-2 flex-1">
          <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-full bg-gray-100 rounded animate-pulse" />
          <div className="h-4 w-3/4 bg-gray-100 rounded animate-pulse" />
        </div>
      </div>
    ))}
  </div>
);

const AIBusinessInsights = ({ insights = [] }) => {
  const [internalInsights, setInternalInsights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastGenerated, setLastGenerated] = useState(getCacheTimestamp());

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
        setLastGenerated(Date.now());
      } else if (errorLike) {
        const fallback = buildFallbackInsights({
          kpis: payload.kpis,
          revenue: payload.revenue,
          forecast: payload.forecast,
        });
        setInternalInsights(fallback);
        setLastGenerated(Date.now());
      } else {
        setInternalInsights([]);
      }
    } catch {
      setInternalInsights([]);
    } finally {
      setLoading(false);
    }
  }, [loadAnalyticsPayload]);

  const handleRegenerate = useCallback(async () => {
    clearInsightsCache();
    setInternalInsights([]);
    await fetchAiData();
  }, [fetchAiData]);

  useEffect(() => {
    if ((insights || []).length === 0) {
      fetchAiData();
    }
  }, [insights?.length, fetchAiData]);

  const displayInsights = toBullets((insights || []).length > 0 ? insights : internalInsights);
  const hasData = displayInsights.length > 0;

  if (!hasData && loading) return <LoadingSkeleton />;

  if (!hasData) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8" data-testid="ai-fallback">
        <div className="flex flex-col items-center text-center py-6">
          <span className="p-3 rounded-2xl bg-rose-50 text-rose-400 mb-4">
            <Sparkles className="w-8 h-8" />
          </span>
          <h2 className="text-lg font-bold text-gray-800 mb-1">AI Business Insights</h2>
          <p className="text-sm text-gray-400 max-w-xs">
            No AI business insights available at this time. Analytics data may not be populated yet.
          </p>
        </div>
      </div>
    );
  }

  const formatTime = (ts) => {
    if (!ts) return '';
    const diff = Math.floor((Date.now() - ts) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-rose-500 to-rose-600 px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="p-1.5 rounded-lg bg-white/20 text-white shrink-0">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-white">AI Business Insights</h2>
              <p className="text-xs text-rose-200">
                {lastGenerated ? `Updated ${formatTime(lastGenerated)}` : 'From live analytics data'}
              </p>
            </div>
          </div>
          <button
            onClick={handleRegenerate}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-700 bg-white rounded-lg hover:bg-rose-50 transition-colors disabled:opacity-50 shrink-0 shadow-sm"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Regenerate</span>
          </button>
        </div>
      </div>

      <div className="p-6">
        <ul className="space-y-3" data-testid="insights-list">
          {displayInsights.map((insight, index) => (
            <InsightCard key={index} insight={insight} index={index} />
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AIBusinessInsights;
