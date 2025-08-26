
import React from 'react';
import { IPS, IPStatus } from '../types';

interface IpListProps {
    title: string;
    ips: IPS[];
    onTroubleshoot: (ip: IPS) => void;
}

const statusClasses: Record<IPStatus, { dot: string, text: string }> = {
    up: { dot: 'bg-green-500', text: 'text-green-400' },
    down: { dot: 'bg-red-500', text: 'text-red-400' },
    pending: { dot: 'bg-yellow-500', text: 'text-yellow-400' },
};

const IpListItem: React.FC<{ ip: IPS; onTroubleshoot: (ip: IPS) => void; }> = ({ ip, onTroubleshoot }) => (
    <li className="flex items-center justify-between p-3 bg-gray-800/40 rounded-md transition-all duration-300 hover:bg-gray-800/80">
        <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${ip.status !== 'pending' ? '' : 'animate-pulse'} ${statusClasses[ip.status].dot}`}></div>
            <div>
                {ip.name && <p className="font-bold text-gray-100 text-base">{ip.name}</p>}
                <p className="font-medium text-gray-300">{ip.address}</p>
                <p className={`text-xs ${statusClasses[ip.status].text}`}>{ip.status.toUpperCase()}</p>
            </div>
        </div>
        <div className="text-right">
            {ip.lastSuccessfulPing ? (
                <p className="text-xs text-gray-400">
                    Last up: {ip.lastSuccessfulPing.toLocaleTimeString()}
                </p>
            ) : (
                <p className="text-xs text-gray-500">No successful ping yet</p>
            )}
            {ip.status === 'down' && (
                <button
                    onClick={() => onTroubleshoot(ip)}
                    className="mt-1 text-xs text-cyan-400 hover:text-cyan-300 hover:underline"
                >
                    Troubleshoot
                </button>
            )}
        </div>
    </li>
);

const IpList: React.FC<IpListProps> = ({ title, ips, onTroubleshoot }) => {
    return (
        <div className="bg-gray-800/50 p-4 rounded-lg border border-cyan-500/20">
            <h2 className="text-xl font-bold text-cyan-400 mb-4 border-b border-cyan-500/20 pb-2">{title}</h2>
            {ips.length > 0 ? (
                <ul className="space-y-2 max-h-96 overflow-y-auto pr-2">
                    {ips.map(ip => <IpListItem key={ip.id} ip={ip} onTroubleshoot={onTroubleshoot} />)}
                </ul>
            ) : (
                <p className="text-gray-500 italic text-center py-4">No IPS addresses configured.</p>
            )}
        </div>
    );
};

export default IpList;
