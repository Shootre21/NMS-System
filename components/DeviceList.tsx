import React from 'react';
import { Device, IPStatus } from '../types';

interface DeviceListProps {
    title: string;
    devices: Device[];
}

const statusClasses: Record<IPStatus, { dot: string, text: string }> = {
    up: { dot: 'bg-green-500', text: 'text-green-400' },
    down: { dot: 'bg-red-500', text: 'text-red-400' },
    pending: { dot: 'bg-yellow-500', text: 'text-yellow-400' },
};

const DeviceListItem: React.FC<{ device: Device }> = ({ device }) => (
    <li className="flex items-center justify-between p-3 bg-gray-800/40 rounded-md transition-all duration-300 hover:bg-gray-800/80">
        <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${device.status !== 'pending' ? '' : 'animate-pulse'} ${statusClasses[device.status].dot}`}></div>
            <div>
                <p className="font-bold text-gray-100 text-base">{device.name}</p>
                <p className="font-medium text-gray-300">{device.address}</p>
                <p className={`text-xs ${statusClasses[device.status].text}`}>{device.status.toUpperCase()}</p>
            </div>
        </div>
        <div className="text-right">
            <p className="text-sm text-gray-400">{device.model}</p>
            {device.lastSuccessfulPing ? (
                <p className="text-xs text-gray-400">
                    Last up: {device.lastSuccessfulPing.toLocaleTimeString()}
                </p>
            ) : (
                <p className="text-xs text-gray-500">No successful ping yet</p>
            )}
        </div>
    </li>
);

const DeviceList: React.FC<DeviceListProps> = ({ title, devices }) => {
    return (
        <div className="bg-gray-800/50 p-4 rounded-lg border border-cyan-500/20">
            <h2 className="text-xl font-bold text-cyan-400 mb-4 border-b border-cyan-500/20 pb-2">{title}</h2>
            {devices.length > 0 ? (
                <ul className="space-y-2 max-h-96 overflow-y-auto pr-2">
                    {devices.map(device => <DeviceListItem key={device.id} device={device} />)}
                </ul>
            ) : (
                <p className="text-gray-500 italic text-center py-4">No devices configured.</p>
            )}
        </div>
    );
};

export default DeviceList;
