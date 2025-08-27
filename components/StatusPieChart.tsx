import React from 'react';
import { IPS, IPStatus } from '../types';

interface StatusPieChartProps {
    title: string;
    ips: IPS[];
}

const statusColors: Record<IPStatus, string> = {
    up: '#4ade80', // tailwind green-400
    down: '#f87171', // tailwind red-400
    pending: '#facc15', // tailwind yellow-400
};

const PieSlice: React.FC<{ percent: number; startPercent: number; color: string; radius: number; }> = ({ percent, startPercent, color, radius }) => {
    const startAngle = 2 * Math.PI * startPercent;
    const endAngle = 2 * Math.PI * (startPercent + percent);
    
    // x = r * cos(angle), y = r * sin(angle)
    const startX = radius * Math.cos(startAngle);
    const startY = radius * Math.sin(startAngle);
    
    const endX = radius * Math.cos(endAngle);
    const endY = radius * Math.sin(endAngle);

    // if the slice is more than 50%, the arc needs to be drawn the "long way"
    const largeArcFlag = percent > 0.5 ? 1 : 0;
    
    const pathData = `M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`;

    return (
        <path
            d={pathData}
            stroke={color}
            strokeWidth="20"
            fill="none"
            // Start the chart from the top (90 degrees)
            transform={`translate(${radius + 10}, ${radius + 10}) rotate(-90)`}
        />
    );
};

const StatusPieChart: React.FC<StatusPieChartProps> = ({ title, ips }) => {
    const counts = {
        up: ips.filter(ip => ip.status === 'up').length,
        down: ips.filter(ip => ip.status === 'down').length,
        pending: ips.filter(ip => ip.status === 'pending').length,
    };
    const total = ips.length;
    if (total === 0) {
        return (
            <div className="bg-gray-800/50 p-4 rounded-lg border border-cyan-500/20 h-full flex flex-col">
                <h3 className="text-lg font-bold text-cyan-400 mb-2">{title}</h3>
                <div className="flex-grow flex items-center justify-center">
                    <p className="text-gray-500 italic text-center py-4">No data to display.</p>
                </div>
            </div>
        )
    }

    const statuses: IPStatus[] = ['up', 'down', 'pending'];
    let cumulativePercent = 0;

    const slices = statuses.map(status => {
        const percent = counts[status] / total;
        if (percent === 0) return null;
        const slice = <PieSlice key={status} percent={percent} startPercent={cumulativePercent} color={statusColors[status]} radius={40} />;
        cumulativePercent += percent;
        return slice;
    });

    return (
        <div className="bg-gray-800/50 p-4 rounded-lg border border-cyan-500/20">
            <h3 className="text-lg font-bold text-cyan-400 mb-2">{title}</h3>
            <div className="flex items-center justify-around">
                <svg viewBox="0 0 100 100" width="100" height="100" aria-label={`Status of ${title}`}>
                    {slices}
                    <text x="50" y="52" textAnchor="middle" dominantBaseline="middle" className="text-2xl font-bold fill-current text-white">{total}</text>
                    <text x="50" y="68" textAnchor="middle" dominantBaseline="middle" className="text-xs fill-current text-gray-400">Total</text>
                </svg>
                <div className="space-y-2 text-sm">
                    {statuses.map(status => (
                        <div key={status} className="flex items-center">
                            <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: statusColors[status] }}></span>
                            <span className="capitalize text-gray-300 w-16">{status}:</span>
                            <span className="font-bold text-white ml-auto">{counts[status]}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default StatusPieChart;
