import React, { useState, useEffect } from 'react';

interface SystemInfoPanelProps {
    internalIpsCount: number;
    externalIpsCount: number;
    dnsProvidersCount: number;
    monitoringInterval: number;
    setMonitoringInterval: (interval: number) => void;
}

// Extend the Performance interface to include the non-standard 'memory' property
interface PerformanceWithMemory extends Performance {
    memory?: {
        jsHeapSizeLimit: number;
        totalJSHeapSize: number;
        usedJSHeapSize: number;
    }
}

const SystemInfoPanel: React.FC<SystemInfoPanelProps> = ({ internalIpsCount, externalIpsCount, dnsProvidersCount, monitoringInterval, setMonitoringInterval }) => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [uptime, setUptime] = useState(0);
    const [memoryInfo, setMemoryInfo] = useState<{ used: number; limit: number } | null>(null);
    const [startTime] = useState(Date.now());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
            setUptime(Date.now() - startTime);

            const perf = window.performance as PerformanceWithMemory;
            if (perf.memory) {
                setMemoryInfo({
                    used: perf.memory.usedJSHeapSize,
                    limit: perf.memory.jsHeapSizeLimit,
                });
            }
        }, 1000);
        return () => clearInterval(timer);
    }, [startTime]);

    const formatUptime = (ms: number) => {
        const totalSeconds = Math.floor(ms / 1000);
        const days = Math.floor(totalSeconds / 86400);
        const hours = Math.floor((totalSeconds % 86400) / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return `${days}d ${hours}h ${minutes}m ${seconds}s`;
    };

    const handleIntervalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value, 10);
        if (value > 0) {
            setMonitoringInterval(value);
        }
    };

    const memoryPercent = memoryInfo ? (memoryInfo.used / memoryInfo.limit) * 100 : 0;
    const usedMB = memoryInfo ? (memoryInfo.used / 1024 / 1024).toFixed(1) : '0';


    return (
        <div className="bg-gray-800/50 p-4 rounded-lg border border-cyan-500/20 h-full">
            <h2 className="text-xl font-bold text-cyan-400 mb-4 border-b border-cyan-500/20 pb-2">System Information</h2>
            <div className="space-y-4 text-sm">
                <InfoRow label="Current Time" value={currentTime.toLocaleTimeString()} />
                <InfoRow label="System Uptime" value={formatUptime(uptime)} />
                <InfoRow label="Monitored Internal IPS" value={internalIpsCount.toString()} />
                <InfoRow label="Monitored External IPS" value={externalIpsCount.toString()} />
                <InfoRow label="Monitored DNS Providers" value={dnsProvidersCount.toString()} />

                <div className="pt-2">
                    <label htmlFor="monitoringInterval" className="block text-gray-400 mb-1">Monitoring Frequency (sec)</label>
                    <input
                        id="monitoringInterval"
                        type="number"
                        value={monitoringInterval}
                        onChange={handleIntervalChange}
                        min="1"
                        className="w-full bg-gray-900 border border-gray-600 rounded-md px-3 py-1.5 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    />
                </div>

                <div className="pt-2">
                    <h3 className="text-gray-400 mb-2">Browser Tab Resource Usage</h3>
                    {(window.performance as PerformanceWithMemory).memory ? (
                         <ResourceBar label={`Memory (${usedMB} MB)`} value={memoryPercent} />
                    ) : (
                        <p className="text-xs text-gray-500 p-2 bg-gray-700/50 rounded">
                            Real memory monitoring is not supported by this browser.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

interface InfoRowProps {
    label: string;
    value: string;
}
const InfoRow: React.FC<InfoRowProps> = ({ label, value }) => (
    <div className="flex justify-between items-center">
        <span className="text-gray-400">{label}:</span>
        <span className="text-cyan-300 font-medium">{value}</span>
    </div>
);

interface ResourceBarProps {
    label: string;
    value: number;
}
const ResourceBar: React.FC<ResourceBarProps> = ({ label, value }) => (
    <div className="mb-2">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>{label}</span>
            <span>{value.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2.5">
            <div className="bg-cyan-500 h-2.5 rounded-full" style={{ width: `${value}%` }}></div>
        </div>
    </div>
);


export default SystemInfoPanel;