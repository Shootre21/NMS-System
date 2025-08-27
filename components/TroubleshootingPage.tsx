import React, { useState } from 'react';
import { getDeviceInfo } from '../services/geminiService';

const TroubleshootingPage: React.FC = () => {
    const [tool, setTool] = useState<'ping' | 'getInfo'>('ping');
    const [ipAddress, setIpAddress] = useState('');
    const [result, setResult] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handlePing = async () => {
        if (!ipAddress) return;
        setIsLoading(true);
        setResult(`Pinging ${ipAddress}...`);
        const startTime = performance.now();
        try {
            await fetch(`https://${ipAddress}`, { method: 'HEAD', mode: 'no-cors', signal: AbortSignal.timeout(3000) });
            const endTime = performance.now();
            setResult(`Reply from ${ipAddress}: time=${(endTime - startTime).toFixed(2)}ms\nProtocol: HTTPS`);
        } catch (e) {
             try {
                await fetch(`http://${ipAddress}`, { method: 'HEAD', mode: 'no-cors', signal: AbortSignal.timeout(3000) });
                const endTime = performance.now();
                setResult(`Reply from ${ipAddress}: time=${(endTime - startTime).toFixed(2)}ms\nProtocol: HTTP`);
             } catch (error) {
                setResult(`Request timed out or host is unreachable.`);
             }
        } finally {
            setIsLoading(false);
        }
    };

    const handleGetInfo = async () => {
        if (!ipAddress) return;
        setIsLoading(true);
        setResult(`Getting device info for ${ipAddress}...`);
        try {
            const info = await getDeviceInfo(ipAddress);
            if (info.error) {
                 setResult(`Error: ${info.error}`);
            } else {
                setResult(JSON.stringify(info, null, 2));
            }
        } catch (error) {
            console.error(error);
            setResult(`Failed to get device info. See console for details.`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (tool === 'ping') {
            handlePing();
        } else {
            handleGetInfo();
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-gray-800/50 p-4 rounded-lg border border-cyan-500/20">
                <h2 className="text-xl font-bold text-cyan-400 mb-4">Troubleshooting Tools</h2>
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-3">
                    <select 
                        value={tool} 
                        onChange={(e) => setTool(e.target.value as 'ping' | 'getInfo')}
                        className="w-full sm:w-auto bg-gray-900 border border-gray-600 rounded-md px-3 py-1.5 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                        aria-label="Select troubleshooting tool"
                    >
                        <option value="ping">Ping</option>
                        <option value="getInfo">Get Device Info (AI)</option>
                    </select>
                    <input
                        type="text"
                        value={ipAddress}
                        onChange={(e) => setIpAddress(e.target.value)}
                        placeholder="Enter IP Address"
                        className="flex-grow w-full bg-gray-900 border border-gray-600 rounded-md px-3 py-1.5 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                        required
                        aria-label="IP Address Input"
                    />
                    <button type="submit" disabled={isLoading} className="w-full sm:w-auto px-4 py-1.5 font-semibold text-white bg-cyan-600 rounded-md hover:bg-cyan-500 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed">
                        {isLoading ? 'Running...' : 'Run Tool'}
                    </button>
                </form>
            </div>
            
            <div className="bg-gray-800/50 p-4 rounded-lg border border-cyan-500/20 min-h-[300px]">
                <h3 className="text-lg font-bold text-cyan-400 mb-2">Result</h3>
                <pre className="bg-gray-900 p-4 rounded-md text-sm text-gray-300 whitespace-pre-wrap overflow-x-auto h-full" aria-live="polite">
                    <code>{result || 'Output will be displayed here...'}</code>
                </pre>
            </div>
        </div>
    );
};

export default TroubleshootingPage;
