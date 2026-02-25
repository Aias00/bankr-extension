import React from 'react';
import { Position } from '../../types';
import { formatUsd, formatPct } from '../../utils/format';

const statusMap: Record<Position['status'], { label: string; color: string }> = {
  active: { label: 'Active', color: 'text-emerald-400' },
  settled: { label: 'Settled', color: 'text-warning-500' },
  redeemable: { label: 'Redeemable', color: 'text-emerald-300' }
};


interface Props {
  positions: Position[];
}

const Positions: React.FC<Props> = ({ positions }) => {
  return (
    <section className="rounded-2xl bg-ink-800 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Positions</p>
        <span className="text-xs text-slate-400">{positions.length} total</span>
      </div>
      <div className="space-y-3 max-h-48 overflow-y-auto scrollbar pr-1">
        {positions.length === 0 && (
          <div className="text-xs text-slate-500">No active positions.</div>
        )}
        {positions.map((position) => {
          const status = statusMap[position.status];
          return (
            <div key={position.id} className="rounded-xl bg-ink-700 p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">{position.market}</p>
                  <p className="text-xs text-slate-400">
                    {position.shares} shares · {position.side}
                  </p>
                </div>
                <span className={`text-xs font-semibold ${status.color}`}>{status.label}</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-xs">
                <span className={position.pnlUsd >= 0 ? 'text-emerald-400' : 'text-danger-500'}>
                  {formatUsd(position.pnlUsd)} ({formatPct(position.pnlPct)})
                </span>
                <button
                  className="rounded-full border border-slate-600 px-2 py-1 text-[10px] text-slate-300"
                  disabled={position.status !== 'redeemable'}
                >
                  Redeem
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default Positions;
