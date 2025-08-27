import React from 'react';
import { IPS, IPType } from '../types';
import SystemInfoPanel from './SystemInfoPanel';
import IpList from './IpList';
import IpManagement from './IpManagement';
import StatusPieChart from './StatusPieChart';

interface DashboardPageProps {
    internalIps: IPS[];
    externalIps: IPS[];
    dnsProviders: IPS[];
    onAddIp: (address: string, type: IPType, name?: string) => void;
    onRemoveIp: (address: string, type: IPType) => void;
    internalIpsCount: number;
    externalIpsCount: number;
    dnsProvidersCount: number;
    monitoringInterval: number;
    setMonitoringInterval: (interval: number) => void;
}

const DashboardPage: React.FC<DashboardPageProps> = (props) => {
    const { 
        internalIps, externalIps, dnsProviders, onAddIp, onRemoveIp,
        internalIpsCount, externalIpsCount, dnsProvidersCount, monitoringInterval, setMonitoringInterval
    } = props;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <main className="lg:col-span-2 space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <StatusPieChart title="Internal IPS Status" ips={internalIps} />
                    <StatusPieChart title="External IPS Status" ips={externalIps} />
                </div>
                <IpManagement onAddIp={onAddIp} onRemoveIp={onRemoveIp} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <IpList title="Internal IPS" ips={internalIps} />
                     <IpList title="External IPS" ips={externalIps} />
                </div>
                <IpList title="Major DNS Providers" ips={dnsProviders} />
            </main>
            <aside className="lg:col-span-1">
                <SystemInfoPanel
                    internalIpsCount={internalIpsCount}
                    externalIpsCount={externalIpsCount}
                    dnsProvidersCount={dnsProvidersCount}
                    monitoringInterval={monitoringInterval}
                    setMonitoringInterval={setMonitoringInterval}
                />
            </aside>
        </div>
    );
};

export default DashboardPage;