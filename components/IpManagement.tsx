
import React, { useState } from 'react';
import { IPType } from '../types';

interface IpManagementProps {
    onAddIp: (address: string, type: IPType, name?: string) => void;
    onRemoveIp: (address: string, type: IPType) => void;
}

const IpManagement: React.FC<IpManagementProps> = ({ onAddIp, onRemoveIp }) => {
    const [address, setAddress] = useState('');
    const [name, setName] = useState('');
    const [managementType, setManagementType] = useState<IPType>('Internal');
    const [action, setAction] = useState<'add' | 'remove'>('add');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!address.trim()) return;
        if (action === 'add') {
            onAddIp(address, managementType, name);
        } else {
            onRemoveIp(address, managementType);
        }
        setAddress('');
        setName('');
    };

    return (
        <div className="bg-gray-800/50 p-4 rounded-lg border border-cyan-500/20">
            <h2 className="text-xl font-bold text-cyan-400 mb-4">Manage IPS</h2>
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-3">
                <div className="flex items-center gap-2">
                    <button type="button" onClick={() => setAction('add')} className={`px-3 py-1.5 rounded-md ${action === 'add' ? 'bg-cyan-500 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>+</button>
                    <button type="button" onClick={() => setAction('remove')} className={`px-3 py-1.5 rounded-md ${action === 'remove' ? 'bg-red-500 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>-</button>
                </div>
                <select 
                    value={managementType} 
                    onChange={(e) => setManagementType(e.target.value as IPType)}
                    className="w-full sm:w-auto bg-gray-900 border border-gray-600 rounded-md px-3 py-1.5 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                >
                    <option value="Internal">Internal</option>
                    <option value="External">External</option>
                </select>
                <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder={action === 'add' ? 'IP Address (e.g., 192.168.1.100)' : 'IP Address to Remove'}
                    className="flex-grow w-full bg-gray-900 border border-gray-600 rounded-md px-3 py-1.5 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    required
                />
                {action === 'add' && (
                     <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Optional: Name (e.g., NAS)"
                        className="flex-grow w-full bg-gray-900 border border-gray-600 rounded-md px-3 py-1.5 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    />
                )}
                <button type="submit" className="w-full sm:w-auto px-4 py-1.5 font-semibold text-white bg-cyan-600 rounded-md hover:bg-cyan-500 transition-colors">
                    {action === 'add' ? 'Add IPS' : 'Remove IPS'}
                </button>
            </form>
        </div>
    );
};

export default IpManagement;