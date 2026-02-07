"use client";

import React from 'react';

type Point = {
  x: number;
  y: number;
  label: string;
};

type InteractiveLayoutProps = {
  title: string;
  points: Point[];
};

export default function InteractiveLayout({ title, points }: InteractiveLayoutProps) {
  return (
    <div className="my-8 p-6 bg-slate-50 border border-slate-200 rounded-xl">
      <h3 className="text-lg font-semibold mb-4 text-slate-800">{title}</h3>
      <div className="relative w-full h-64 bg-white border border-slate-100 rounded-lg shadow-inner overflow-hidden">
        {/* Grid background */}
        <div className="absolute inset-0" 
             style={{ 
               backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', 
               backgroundSize: '20px 20px' 
             }}>
        </div>
        
        {points.map((point, index) => (
          <div 
            key={index}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
            style={{ left: `${point.x}%`, top: `${point.y}%` }}
          >
            <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-md group-hover:scale-125 transition-transform"></div>
            <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
              {point.label}
            </div>
          </div>
        ))}
        
        {/* Connecting lines (simplified visualization) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30">
          <path 
            d={`M ${points.map(p => `${p.x * 10},${p.y * 2.5}`).join(' L ')}`} 
            fill="none" 
            stroke="#3b82f6" 
            strokeWidth="2"
            strokeDasharray="4 4"
          />
        </svg>
      </div>
      <p className="text-xs text-slate-500 mt-2 text-center">
        Hover over points to see station details. This is a simplified layout representation.
      </p>
    </div>
  );
}

