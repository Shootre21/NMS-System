
import React, { useState, useEffect, useCallback } from 'react';
import { IPS, IPStatus, IPType } from './types';
import SystemInfoPanel from './components/SystemInfoPanel';
import IpList from './components/IpList';
import IpManagement from './components/IpManagement';
import HelpModal from './components/HelpModal';
import TroubleshootingModal from './components/TroubleshootingModal';
import { getTroubleshootingSteps } from './services/geminiService';

const App: React.FC = () => {
    const [internalIps, setInternalIps] = useState<IPS[]>([
        { id: 'int-1', address: '192.168.1.1', status: 'pending', type: 'Internal', lastSuccessfulPing: null },
        { id: 'int-2', address: '10.0.0.5', status: 'pending', type: 'Internal', lastSuccessfulPing: null },
    ]);
    const [externalIps, setExternalIps] = useState<IPS[]>([
        { id: 'ext-1', address: '203.0.113.10', status: 'pending', type: 'External', lastSuccessfulPing: null },
        { id: 'ext-2', address: '198.51.100.22', status: 'pending', type: 'External', lastSuccessfulPing: null },
    ]);
    const [dnsProviders, setDnsProviders] = useState<IPS[]>([
        { id: 'dns-1', address: '1.1.1.1', name: 'Cloudflare DNS', status: 'pending', type: 'External', lastSuccessfulPing: null },
        { id: 'dns-2', address: '8.8.8.8', name: 'Google DNS', status: 'pending', type: 'External', lastSuccessfulPing: null },
        { id: 'dns-3', address: '9.9.9.9', name: 'Quad9 DNS', status: 'pending', type: 'External', lastSuccessfulPing: null },
        { id: 'dns-4', address: '208.67.222.222', name: 'OpenDNS', status: 'pending', type: 'External', lastSuccessfulPing: null },
    ]);
    
    const [monitoringInterval, setMonitoringInterval] = useState<number>(5);
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [isHelpModalOpen, setIsHelpModalOpen] = useState<boolean>(false);
    const [isTroubleshootingModalOpen, setIsTroubleshootingModalOpen] = useState<boolean>(false);
    const [troubleshootingIp, setTroubleshootingIp] = useState<IPS | null>(null);
    const [troubleshootingResult, setTroubleshootingResult] = useState<string>('');
    const [isTroubleshooting, setIsTroubleshooting] = useState<boolean>(false);


    useEffect(() => {
        const timer = setTimeout(() => setNotification(null), 3000);
        return () => clearTimeout(timer);
    }, [notification]);

    const checkIpStatus = useCallback(async (ips: IPS[]): Promise<IPS[]> => {
        return Promise.all(ips.map(async (ip) => {
            try {
                // Use fetch in 'no-cors' mode as a proxy for a ping. A successful request (even opaque) means the host is reachable.
                // A failure (timeout, network error) means it's down. We try HTTPS first, then HTTP.
                await fetch(`https://${ip.address}`, { method: 'HEAD', mode: 'no-cors', signal: AbortSignal.timeout(3000) });
                return { ...ip, status: 'up' as IPStatus, lastSuccessfulPing: new Date() };
            } catch (error) {
                try {
                    await fetch(`http://${ip.address}`, { method: 'HEAD', mode: 'no-cors', signal: AbortSignal.timeout(3000) });
                    return { ...ip, status: 'up' as IPStatus, lastSuccessfulPing: new Date() };
                } catch (httpError) {
                    return { ...ip, status: 'down' as IPStatus };
                }
            }
        }));
    }, []);

    useEffect(() => {
        const runChecks = () => {
            checkIpStatus(internalIps).then(setInternalIps);
            checkIpStatus(externalIps).then(setExternalIps);
            checkIpStatus(dnsProviders).then(setDnsProviders);
        }
        runChecks(); // Initial check
        const intervalId = setInterval(runChecks, monitoringInterval * 1000);

        return () => clearInterval(intervalId);
    }, [internalIps.length, externalIps.length, dnsProviders.length, monitoringInterval, checkIpStatus]);


    const showNotification = (message: string, type: 'success' | 'error') => {
        setNotification({ message, type });
    };

    const addIp = (address: string, type: IPType) => {
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
            status: 'pending',
            type,
            lastSuccessfulPing: null,
        };
        setIpList(prev => [...prev, newIp]);
        showNotification(`${type} IPS '${address}' added successfully.`, 'success');
    };

    const removeIp = (address: string, type: IPType) => {
        const setIpList = type === 'Internal' ? setInternalIps : setExternalIps;
        setIpList(prev => prev.filter(ip => ip.address !== address));
        showNotification(`${type} IPS '${address}' removed successfully.`, 'success');
    };

    const handleTroubleshoot = async (ip: IPS) => {
        setTroubleshootingIp(ip);
        setIsTroubleshootingModalOpen(true);
        setIsTroubleshooting(true);
        setTroubleshootingResult('');
        try {
            const result = await getTroubleshootingSteps(ip.address);
            setTroubleshootingResult(result);
        } catch (error) {
            console.error("Gemini API error:", error);
            setTroubleshootingResult("Failed to get troubleshooting steps. Please check the console and ensure your API key is configured.");
        } finally {
            setIsTroubleshooting(false);
        }
    };

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

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <main className="lg:col-span-2 space-y-6">
                        <IpManagement onAddIp={addIp} onRemoveIp={removeIp} />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <IpList title="Internal IPS" ips={internalIps} onTroubleshoot={handleTroubleshoot} />
                             <IpList title="External IPS" ips={externalIps} onTroubleshoot={handleTroubleshoot} />
                        </div>
                        <IpList title="Major DNS Providers" ips={dnsProviders} onTroubleshoot={handleTroubleshoot} />
                    </main>
                    <aside className="lg:col-span-1">
                        <SystemInfoPanel
                            internalIpsCount={internalIps.length}
                            externalIpsCount={externalIps.length}
                            dnsProvidersCount={dnsProviders.length}
                            monitoringInterval={monitoringInterval}
                            setMonitoringInterval={setMonitoringInterval}
                        />
                    </aside>
                </div>
                {notification && (
                    <div className={`fixed bottom-5 right-5 p-4 rounded-lg shadow-lg text-white ${notification.type === 'success' ? 'bg-green-600/90' : 'bg-red-600/90'} animate-fade-in-out`}>
                        {notification.message}
                    </div>
                )}
            </div>
            <HelpModal isOpen={isHelpModalOpen} onClose={() => setIsHelpModalOpen(false)} />
            <TroubleshootingModal 
                isOpen={isTroubleshootingModalOpen} 
                onClose={() => setIsTroubleshootingModalOpen(false)}
                ip={troubleshootingIp}
                result={troubleshootingResult}
                isLoading={isTroubleshooting}
            />
        </div>
    );
};

export default App;
