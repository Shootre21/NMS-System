import React, { useState, useEffect, useCallback } from 'react';
import { IPS, IPStatus, IPType, Device } from './types';
import HelpModal from './components/HelpModal';
import Navigation from './components/Navigation';
import DashboardPage from './components/DashboardPage';
import TroubleshootingPage from './components/TroubleshootingPage';
import DevicesPage from './components/DevicesPage';

const App: React.FC = () => {
    const [currentPage, setCurrentPage] = useState<'dashboard' | 'troubleshooting' | 'devices'>('dashboard');

    const [internalIps, setInternalIps] = useState<IPS[]>([
        { id: 'int-1', address: '192.168.1.1', name: 'Main Router', status: 'pending', type: 'Internal', lastSuccessfulPing: null, history: [] },
        { id: 'int-2', address: '10.0.0.5', name: 'NAS', status: 'pending', type: 'Internal', lastSuccessfulPing: null, history: [] },
    ]);
    const [externalIps, setExternalIps] = useState<IPS[]>([
        { id: 'ext-1', address: '203.0.113.10', name: 'Primary WAN', status: 'pending', type: 'External', lastSuccessfulPing: null, history: [] },
        { id: 'ext-2', address: '198.51.100.22', name: 'Backup WAN', status: 'pending', type: 'External', lastSuccessfulPing: null, history: [] },
    ]);
    const [dnsProviders, setDnsProviders] = useState<IPS[]>([
        { id: 'dns-1', address: '1.1.1.1', name: 'Cloudflare DNS', status: 'pending', type: 'External', lastSuccessfulPing: null, history: [] },
        { id: 'dns-2', address: '8.8.8.8', name: 'Google DNS', status: 'pending', type: 'External', lastSuccessfulPing: null, history: [] },
        { id: 'dns-3', address: '9.9.9.9', name: 'Quad9 DNS', status: 'pending', type: 'External', lastSuccessfulPing: null, history: [] },
        { id: 'dns-4', address: '208.67.222.222', name: 'OpenDNS', status: 'pending', type: 'External', lastSuccessfulPing: null, history: [] },
    ]);
    const [firewalls, setFirewalls] = useState<Device[]>([
        { id: 'fw-1', address: '10.0.0.1', name: 'Main Office Firewall', status: 'pending', type: 'Firewall', lastSuccessfulPing: null, model: 'Palo Alto PA-460' },
        { id: 'fw-2', address: '192.168.1.254', name: 'Branch Office Firewall', status: 'pending', type: 'Firewall', lastSuccessfulPing: null, model: 'Cisco Firepower 1010' },
    ]);
    const [switches, setSwitches] = useState<Device[]>([
        { id: 'sw-1', address: '10.0.0.2', name: 'Core Switch A', status: 'pending', type: 'Switch', lastSuccessfulPing: null, model: 'Arista 7050SX' },
        { id: 'sw-2', address: '10.0.0.3', name: 'Core Switch B', status: 'pending', type: 'Switch', lastSuccessfulPing: null, model: 'Arista 7050SX' },
        { id: 'sw-3', address: '192.168.1.253', name: 'Branch Access Switch', status: 'pending', type: 'Switch', lastSuccessfulPing: null, model: 'Cisco Catalyst 9200' },
    ]);
    
    const [monitoringInterval, setMonitoringInterval] = useState<number>(5);
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [isHelpModalOpen, setIsHelpModalOpen] = useState<boolean>(false);

    useEffect(() => {
        const timer = setTimeout(() => setNotification(null), 3000);
        return () => clearTimeout(timer);
    }, [notification]);

    const checkIpStatus = useCallback(async (ips: IPS[]): Promise<IPS[]> => {
        return Promise.all(ips.map(async (ip) => {
            const updateIpWithStatus = (newStatus: IPStatus): IPS => {
                const newHistory = [...ip.history];
                if (newStatus !== ip.status) {
                    newHistory.push({ status: newStatus, timestamp: new Date() });
                }
                const newLastSuccessfulPing = newStatus === 'up' ? new Date() : ip.lastSuccessfulPing;
                return { ...ip, status: newStatus, lastSuccessfulPing: newLastSuccessfulPing, history: newHistory };
            };

            try {
                await fetch(`https://${ip.address}`, { method: 'HEAD', mode: 'no-cors', signal: AbortSignal.timeout(3000) });
                return updateIpWithStatus('up');
            } catch (error) {
                try {
                    await fetch(`http://${ip.address}`, { method: 'HEAD', mode: 'no-cors', signal: AbortSignal.timeout(3000) });
                    return updateIpWithStatus('up');
                } catch (httpError) {
                    return updateIpWithStatus('down');
                }
            }
        }));
    }, []);
    
    const checkDeviceStatus = useCallback(async (devices: Device[]): Promise<Device[]> => {
        return Promise.all(devices.map(async (device) => {
            const updateDeviceWithStatus = (newStatus: IPStatus): Device => {
                const newLastSuccessfulPing = newStatus === 'up' ? new Date() : device.lastSuccessfulPing;
                return { ...device, status: newStatus, lastSuccessfulPing: newLastSuccessfulPing };
            };

            try {
                await fetch(`https://${device.address}`, { method: 'HEAD', mode: 'no-cors', signal: AbortSignal.timeout(3000) });
                return updateDeviceWithStatus('up');
            } catch (error) {
                return updateDeviceWithStatus('down');
            }
        }));
    }, []);

    useEffect(() => {
        const runChecks = () => {
            checkIpStatus(internalIps).then(setInternalIps);
            checkIpStatus(externalIps).then(setExternalIps);
            checkIpStatus(dnsProviders).then(setDnsProviders);
            checkDeviceStatus(firewalls).then(setFirewalls);
            checkDeviceStatus(switches).then(setSwitches);
        }
        runChecks(); 
        const intervalId = setInterval(runChecks, monitoringInterval * 1000);

        return () => clearInterval(intervalId);
    }, [internalIps.length, externalIps.length, dnsProviders.length, firewalls.length, switches.length, monitoringInterval, checkIpStatus, checkDeviceStatus]);

    const showNotification = (message: string, type: 'success' | 'error') => {
        setNotification({ message, type });
    };

    const addIp = (address: string, type: IPType, name?: string) => {
        const allIps = [...internalIps, ...externalIps, ...dnsProviders];
        const setIpList = type === 'Internal' ? setInternalIps : setExternalIps;

        if (!/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(address)) {
            showNotification(`Invalid IP address format: ${address}`, 'error');
            return;
        }

        if (allIps.some(ip => ip.address === address)) {
            showNotification(`IPS '${address}' already exists.`, 'error');
            return;
        }

        const newIp: IPS = {
            id: `${type.toLowerCase()}-${Date.now()}`,
            address,
            name: name?.trim() ? name.trim() : undefined,
            status: 'pending',
            type,
            lastSuccessfulPing: null,
            history: [],
        };
        setIpList(prev => [...prev, newIp]);
        showNotification(`${type} IPS '${name || address}' added successfully.`, 'success');
    };

    const removeIp = (address: string, type: IPType) => {
        const setIpList = type === 'Internal' ? setInternalIps : setExternalIps;
        setIpList(prev => prev.filter(ip => ip.address !== address));
        showNotification(`${type} IPS '${address}' removed successfully.`, 'success');
    };

    const renderPage = () => {
        switch (currentPage) {
            case 'dashboard':
                return <DashboardPage
                    internalIps={internalIps}
                    externalIps={externalIps}
                    dnsProviders={dnsProviders}
                    onAddIp={addIp}
                    onRemoveIp={removeIp}
                    internalIpsCount={internalIps.length}
                    externalIpsCount={externalIps.length}
                    dnsProvidersCount={dnsProviders.length}
                    monitoringInterval={monitoringInterval}
                    setMonitoringInterval={setMonitoringInterval}
                />;
            case 'troubleshooting':
                return <TroubleshootingPage />;
            case 'devices':
                return <DevicesPage firewalls={firewalls} switches={switches} />;
            default:
                return <DashboardPage
                    internalIps={internalIps}
                    externalIps={externalIps}
                    dnsProviders={dnsProviders}
                    onAddIp={addIp}
                    onRemoveIp={removeIp}
                    internalIpsCount={internalIps.length}
                    externalIpsCount={externalIps.length}
                    dnsProvidersCount={dnsProviders.length}
                    monitoringInterval={monitoringInterval}
                    setMonitoringInterval={setMonitoringInterval}
                />;
        }
    }

    return (
        <div className="min-h-screen bg-gray-900 text-gray-200 p-4 sm:p-6 lg:p-8 font-fira">
            <div className="max-w-7xl mx-auto">
                <header className="flex justify-between items-center mb-6 pb-4 border-b border-cyan-500/30">
                    <div>
                        <h1 className="text-3xl font-bold text-cyan-400">NMS IPS Monitor</h1>
                        <p className="text-gray-400">Network Management System for Intrusion Prevention Systems</p>
                    </div>
                    <button
                        onClick={() => setIsHelpModalOpen(true)}
                        className="p-2 rounded-full hover:bg-gray-700 transition-colors"
                        aria-label="Help"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.546-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </button>
                </header>

                <Navigation currentPage={currentPage} setCurrentPage={setCurrentPage} />

                <main className="mt-6">
                    {renderPage()}
                </main>

                {notification && (
                    <div className={`fixed bottom-5 right-5 p-4 rounded-lg shadow-lg text-white ${notification.type === 'success' ? 'bg-green-600/90' : 'bg-red-600/90'} animate-fade-in-out`}>
                        {notification.message}
                    </div>
                )}
            </div>
            <HelpModal isOpen={isHelpModalOpen} onClose={() => setIsHelpModalOpen(false)} />
        </div>
    );
};

export default App;