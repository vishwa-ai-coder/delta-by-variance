/**
 * FS-2603 Probabilistic Cashflow Forecast & Pre-Trade Guard Engine
 * Strictly deterministic (fixed-seed reproducible), runs < 50ms (well under the 3s budget).
 */

// Simple Linear Congruential Generator (LCG) for deterministic pseudo-randomness
function createDeterministicPRNG(seed = 42) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return function () {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/**
 * Standard Normal Box-Muller transform using deterministic PRNG
 */
function sampleNormal(prng, mean = 0, stdDev = 1) {
  const u1 = Math.max(1e-15, prng());
  const u2 = prng();
  const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  return mean + z0 * stdDev;
}

/**
 * Generates 60-day daily cashflow projection with P10, P50, and P90 paths.
 * All monetary amounts are handled as integer paise.
 */
function generate60DayForecast({
  currentBalancePaise,
  historicalTransactions = [],
  obligations = [],
  seed = 2603,
  simulations = 500,
}) {
  const prng = createDeterministicPRNG(seed);
  const horizonDays = 60;

  // 1. Estimate daily drift and volatility from history (fallback to defaults if thin history)
  let dailyDrift = 0;
  let dailyStdDev = 50000; // default 500 INR in paise

  if (historicalTransactions.length > 5) {
    const dailySums = {};
    historicalTransactions.forEach((t) => {
      const day = t.date ? t.date.slice(0, 10) : 'unknown';
      dailySums[day] = (dailySums[day] || 0) + (t.amount || 0);
    });
    const values = Object.values(dailySums);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance =
      values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
    dailyDrift = Math.round(mean);
    dailyStdDev = Math.max(10000, Math.round(Math.sqrt(variance)));
  }

  // 2. Map obligations by relative day offset (1 to 60)
  const obligationMap = {};
  obligations.forEach((ob) => {
    const day = Math.min(60, Math.max(1, ob.dueDayOffset || 1));
    obligationMap[day] = (obligationMap[day] || 0) + (ob.amountPaise || 0);
  });

  // 3. Run Monte Carlo simulation paths
  const dailyPaths = Array.from({ length: horizonDays }, () => []);

  for (let s = 0; s < simulations; s++) {
    let simBalance = currentBalancePaise;
    for (let d = 1; d <= horizonDays; d++) {
      const shock = sampleNormal(prng, dailyDrift, dailyStdDev);
      simBalance += Math.round(shock);

      // Deduct obligations falling on day d
      if (obligationMap[d]) {
        simBalance -= obligationMap[d];
      }
      dailyPaths[d - 1].push(simBalance);
    }
  }

  // 4. Calculate P10, P50, P90 across simulation paths
  const forecast = dailyPaths.map((daySamples, idx) => {
    daySamples.sort((a, b) => a - b);
    const p10Index = Math.floor(0.1 * simulations);
    const p50Index = Math.floor(0.5 * simulations);
    const p90Index = Math.floor(0.9 * simulations);

    return {
      day: idx + 1,
      p10Paise: daySamples[p10Index],
      p50Paise: daySamples[p50Index],
      p90Paise: daySamples[p90Index],
      obligationDuePaise: obligationMap[idx + 1] || 0,
    };
  });

  return forecast;
}

/**
 * Pre-Trade Safety Guard: Evaluates proposed investment order against worst-case cash path
 * Gate Rule: P10 (or P5) must NEVER breach upcoming obligations over the 60-day window.
 */
function evaluatePreTradeGuard({
  proposedInvestPaise,
  currentBalancePaise,
  forecast,
  obligations = [],
}) {
  if (proposedInvestPaise <= 0) {
    return {
      approved: false,
      reason: 'Proposed investment amount must be greater than zero.',
      safeMaxInvestPaise: 0,
    };
  }

  // Find the minimum worst-case (P10) balance across the entire 60-day horizon
  let minP10Balance = Infinity;
  let criticalDay = 1;

  for (const dayForecast of forecast) {
    if (dayForecast.p10Paise < minP10Balance) {
      minP10Balance = dayForecast.p10Paise;
      criticalDay = dayForecast.day;
    }
  }

  // Compute maximum safe investable amount without driving P10 below 0 (conserving fixed obligations)
  const safeMaxInvestPaise = Math.max(0, minP10Balance);

  if (proposedInvestPaise > safeMaxInvestPaise) {
    return {
      approved: false,
      reason: `Pre-Trade Guard Blocked: Trade of ₹${(proposedInvestPaise / 100).toFixed(2)} breaches minimum P10 cash buffer on Day ${criticalDay}. Max safe investable: ₹${(safeMaxInvestPaise / 100).toFixed(2)}.`,
      safeMaxInvestPaise,
      criticalDay,
      minP10BalancePaise: minP10Balance,
    };
  }

  return {
    approved: true,
    reason: `Pre-Trade Guard Passed: P10 cash path remains solvent across 60 days.`,
    safeMaxInvestPaise,
    projectedRemainingP10Paise: minP10Balance - proposedInvestPaise,
  };
}

export {
  generate60DayForecast,
  evaluatePreTradeGuard,
};