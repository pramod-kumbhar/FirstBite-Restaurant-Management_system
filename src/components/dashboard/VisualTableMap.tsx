'use client';

import React from 'react';
import { Users, Clock, CheckCircle2, AlertCircle, Bookmark } from 'lucide-react';
import { Table } from '@/types/restaurant';

interface VisualTableMapProps {
  tables: Table[];
  selectedTableNumber: string;
  onSelectTable: (tableNumber: string) => void;
  branch: string;
}

export function VisualTableMap({
  tables,
  selectedTableNumber,
  onSelectTable,
  branch
}: VisualTableMapProps) {
  const branchTables = tables.filter(
    (t) => (t.branch || 'Ichalkaranji').toLowerCase() === (branch || 'Ichalkaranji').toLowerCase()
  );

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-4 shadow-xl space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
        <div>
          <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
            <Users className="h-4 w-4 text-rose-400" /> Interactive Dine-In Table Layout ({branch})
          </h3>
          <p className="text-[11px] text-slate-400">Select a table to place your dine-in order or check real-time availability.</p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[10px] font-bold text-slate-300">
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Available</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-rose-500" /> Occupied</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> Reserved</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-indigo-500" /> Selected</span>
        </div>
      </div>

      {/* Grid of Tables */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {branchTables.map((table) => {
          const isSelected = selectedTableNumber === table.tableNumber;
          const isAvailable = table.status === 'available';
          const isOccupied = table.status === 'occupied';
          const isReserved = table.status === 'reserved';

          let statusBg = 'bg-slate-950/60 border-white/10 hover:border-slate-700';
          let badgeColor = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';

          if (isSelected) {
            statusBg = 'bg-indigo-950/80 border-indigo-500 shadow-lg shadow-indigo-500/20 ring-2 ring-indigo-500/50';
            badgeColor = 'bg-indigo-500/30 text-indigo-200 border-indigo-400/40';
          } else if (isOccupied) {
            statusBg = 'bg-rose-950/40 border-rose-500/40 text-slate-300';
            badgeColor = 'bg-rose-500/20 text-rose-300 border-rose-500/30';
          } else if (isReserved) {
            statusBg = 'bg-amber-950/40 border-amber-500/40 text-slate-300';
            badgeColor = 'bg-amber-500/20 text-amber-300 border-amber-500/30';
          } else if (isAvailable) {
            statusBg = 'bg-slate-900/90 border-emerald-500/30 hover:border-emerald-400 cursor-pointer hover:bg-slate-800/80';
          }

          return (
            <button
              key={table.id}
              type="button"
              onClick={() => onSelectTable(table.tableNumber)}
              className={`p-3 rounded-2xl border transition-all text-left relative flex flex-col justify-between h-24 ${statusBg}`}
            >
              <div className="flex justify-between items-start">
                <span className="text-sm font-black text-white">Table {table.tableNumber}</span>
                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${badgeColor}`}>
                  {isSelected ? 'Selected' : table.status}
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold mt-auto">
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3 text-slate-400" /> {table.capacity} Seats
                </span>
                {isOccupied && <span className="text-[9px] text-rose-400 font-bold flex items-center gap-0.5"><Clock className="h-2.5 w-2.5" /> ~20m wait</span>}
                {isAvailable && <span className="text-[9px] text-emerald-400 font-bold">Ready</span>}
              </div>
            </button>
          );
        })}

        {branchTables.length === 0 && (
          <div className="col-span-full py-6 text-center text-slate-500 text-xs font-semibold">
            No tables configured for {branch} branch yet.
          </div>
        )}
      </div>
    </div>
  );
}
