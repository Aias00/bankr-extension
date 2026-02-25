import React, { useMemo, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip
} from 'chart.js';
import { Market } from '../../types';
import { formatUsd } from '../../utils/format';
import { useDebouncedValue } from '../../utils/hooks';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip);


interface Props {
  markets: Market[];
}

const Markets: React.FC<Props> = ({ markets }) => {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query, 300);

  const filtered = useMemo(() => {
    if (!debouncedQuery.trim()) return markets;
    return markets.filter((market) =>
      market.title.toLowerCase().includes(debouncedQuery.toLowerCase())
    );
  }, [markets, debouncedQuery]);

  return (
    <section className="rounded-2xl bg-ink-800 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Trending Markets</p>
        <span className="text-xs text-slate-400">{filtered.length}</span>
      </div>
      <input
        className="w-full rounded-lg bg-ink-700 px-3 py-2 text-xs text-white placeholder:text-slate-500"
        placeholder="Search markets"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      <div className="space-y-3 max-h-56 overflow-y-auto scrollbar pr-1">
        {filtered.length === 0 && (
          <div className="text-xs text-slate-500">No markets match your search.</div>
        )}
        {filtered.map((market) => (
          <div key={market.id} className="rounded-xl bg-ink-700 p-3 space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold">{market.title}</p>
                <p className="text-xs text-slate-400">{market.category}</p>
              </div>
              <div className="text-right text-xs">
                <p className="text-emerald-400">UP {market.priceUp.toFixed(2)}</p>
                <p className="text-danger-500">DOWN {market.priceDown.toFixed(2)}</p>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Volume {formatUsd(market.volumeUsd)}</span>
              {market.trend && market.trend.length > 1 && (
                <div className="w-24 h-8">
                  <Line
                    data={{
                      labels: market.trend.map((_, index) => String(index)),
                      datasets: [
                        {
                          data: market.trend,
                          borderColor: '#16a34a',
                          tension: 0.4,
                          borderWidth: 2,
                          pointRadius: 0
                        }
                      ]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { display: false } },
                      scales: { x: { display: false }, y: { display: false } }
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Markets;
