const MAX_PROMPT_LENGTH = 2000;
const PRIVATE_DATA_PATTERNS = [
  /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/,
  /\b\d{3}-\d{2}-\d{4}\b/,
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/,
  /\b\d{10,}\b/,
];

const KPI_LABELS = {
  revenue: 'Revenue',
  rentals: 'Rentals',
  bookings: 'Bookings',
  customers: 'Customers',
  occupancyRate: 'Occupancy Rate',
  avgOrderValue: 'Average Order Value',
  cancellationRate: 'Cancellation Rate',
  repeatCustomerRate: 'Repeat Customer Rate',
  inventoryTurnover: 'Inventory Turnover',
  profitMargin: 'Profit Margin',
};

function formatKpiValue(key, value) {
  if (value === undefined || value === null || value === '') {
    return `${KPI_LABELS[key] || key}: Data not available`;
  }
  
  if (value === 0) {
    return `${KPI_LABELS[key] || key}: No data available (zero value)`;
  }

  const numValue = Number(value);
  if (Number.isNaN(numValue)) {
    return `${KPI_LABELS[key] || key}: ${String(value).slice(0, 100)}`;
  }

  if (key.includes('Rate') || key.includes('Margin')) {
    return `${KPI_LABELS[key] || key}: ${numValue.toFixed(2)}%`;
  }

  if (key.includes('Revenue') || key.includes('Value') || key.includes('Profit')) {
    return `${KPI_LABELS[key] || key}: $${numValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  return `${KPI_LABELS[key] || key}: ${numValue.toLocaleString()}`;
}

function sanitizeInput(text) {
  if (typeof text !== 'string') return '';
  return text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .slice(0, 500);
}

function containsPrivateData(text) {
  return PRIVATE_DATA_PATTERNS.some(pattern => pattern.test(text));
}

export function buildKpiPrompt(kpis, options = {}) {
  const {
    context = 'business performance',
    includeRecommendations = true,
    maxLength = MAX_PROMPT_LENGTH,
  } = options;

  const sanitizedKpis = {};
  for (const [key, value] of Object.entries(kpis || {})) {
    sanitizedKpis[key] = typeof value === 'string' ? sanitizeInput(value) : value;
  }

  const kpiLines = Object.entries(sanitizedKpis).map(([key, value]) => 
    formatKpiValue(key, value)
  );

  let prompt = `As a business analyst, provide a concise summary of ${context} based on the following KPIs:\n\n`;
  prompt += kpiLines.join('\n');
  
  if (includeRecommendations) {
    prompt += '\n\nProvide 2-3 actionable recommendations for improvement.';
  }
  
  prompt += '\n\nKeep the response under 200 words. Do not include any private customer data, code, or scripts.';

  if (prompt.length > maxLength) {
    prompt = prompt.slice(0, maxLength - 50) + '\n[Truncated for length]';
  }

  if (containsPrivateData(prompt)) {
    throw new Error('Prompt contains potential private data');
  }

  return prompt;
}

export function buildAssistantPrompt(question, context = {}) {
  const sanitizedQuestion = sanitizeInput(question);
  const sanitizedContext = {};
  
  for (const [key, value] of Object.entries(context || {})) {
    sanitizedContext[key] = typeof value === 'string' ? sanitizeInput(value) : value;
  }

  let prompt = `User question: ${sanitizedQuestion}\n\n`;
  
  if (Object.keys(sanitizedContext).length > 0) {
    prompt += 'Business context:\n';
    for (const [key, value] of Object.entries(sanitizedContext)) {
      prompt += `- ${key}: ${formatKpiValue(key, value)}\n`;
    }
  }

  prompt += '\nProvide a helpful, concise business response. Do not include code, scripts, or private data.';

  if (prompt.length > MAX_PROMPT_LENGTH) {
    prompt = prompt.slice(0, MAX_PROMPT_LENGTH - 50) + '\n[Truncated]';
  }

  if (containsPrivateData(prompt)) {
    throw new Error('Prompt contains potential private data');
  }

  return prompt;
}

export function validatePrompt(prompt) {
  if (!prompt || typeof prompt !== 'string') {
    return { valid: false, error: 'Prompt must be a non-empty string' };
  }

  if (prompt.length > MAX_PROMPT_LENGTH) {
    return { valid: false, error: `Prompt exceeds maximum length of ${MAX_PROMPT_LENGTH} characters` };
  }

  if (containsPrivateData(prompt)) {
    return { valid: false, error: 'Prompt contains potential private data' };
  }

  const suspiciousPatterns = [
    /<script\b/i,
    /<\/script>/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /eval\s*\(/i,
    /Function\s*\(/i,
    /setTimeout\s*\(/i,
    /setInterval\s*\(/i,
  ];

  if (suspiciousPatterns.some(pattern => pattern.test(prompt))) {
    return { valid: false, error: 'Prompt contains suspicious content' };
  }

  return { valid: true };
}

export { MAX_PROMPT_LENGTH, sanitizeInput, containsPrivateData };