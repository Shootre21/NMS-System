
import React from 'react';

interface HelpModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-2xl border border-cyan-500/30" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-cyan-400">Help & Information</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
                </div>
                <div className="text-gray-300 space-y-4">
                    <p>This NMS dashboard provides real-time monitoring of Internal and External Intrusion Prevention Systems (IPS) and major DNS providers.</p>
                    
                    <h3 className="text-lg font-semibold text-cyan-500 pt-2">IPS Management</h3>
                    <ul className="list-disc list-inside space-y-2 pl-2">
                        <li><strong>Add IPS:</strong> Use the '+' button, select the IPS type (Internal/External), enter a valid IP address, optionally provide a name for classification, and click "Add IPS".</li>
                        <li><strong>Remove IPS:</strong> Use the '-' button, select the type, enter the exact IP address to remove, and click "Remove IPS".</li>
                        <li>Duplicate IP addresses are not allowed. The list of Major DNS Providers is not manageable.</li>
                    </ul>

                    <h3 className="text-lg font-semibold text-cyan-500 pt-2">Monitoring</h3>
                    <ul className="list-disc list-inside space-y-2 pl-2">
                        <li><span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-2"></span> <strong className="text-green-400">UP:</strong> The IPS is responsive to a web request.</li>
                        <li><span className="inline-block w-3 h-3 rounded-full bg-red-500 mr-2"></span> <strong className="text-red-400">DOWN:</strong> The IPS is not responding.</li>
                        <li><span className="inline-block w-3 h-3 rounded-full bg-yellow-500 mr-2"></span> <strong className="text-yellow-400">PENDING:</strong> The initial status before the first check.</li>
                        <li>The monitoring frequency can be adjusted in the "System Information" panel.</li>
                    </ul>

                     <div className="mt-2 p-3 bg-gray-700/50 rounded-lg text-sm">
                        <p><strong className="text-yellow-400">Note:</strong> Status is checked using an HTTP/S request, not a traditional ICMP ping, due to browser security limitations. An 'UP' status indicates the host is reachable over the web. IPs without a web server may show as 'DOWN'.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HelpModal;