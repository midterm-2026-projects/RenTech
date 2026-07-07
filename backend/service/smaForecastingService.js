export function calculateSMA(data, windowSize) {
  if (!data || data.length < windowSize || windowSize < 1) return [];

  const result = [];

  for (let i = windowSize - 1; i < data.length; i++) {
    let sum = 0;

    for (let j = i - windowSize + 1; j <= i; j++) {
      sum += data[j].value;
    }

    const avg = sum / windowSize;

    result.push({
      date: data[i].date,
      forecast: Math.round(avg * 100) / 100,
    });
  }

  return result;
}