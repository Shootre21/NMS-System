
import React from 'react';
import { IPS } from '../types';

interface TroubleshootingModalProps {
    isOpen: boolean;
    onClose: () => void;
    ip: IPS | null;
    result: string;
    isLoading: boolean;
}

const TroubleshootingModal: React.FC<TroubleshootingModalProps> = ({ isOpen, onClose, ip, result, isLoading }) => {
    if (!isOpen) return null;

    const formattedResult = result.split('\n').map((line, index) => {
        if (line.startsWith('#')) {
            const level = line.lastIndexOf('#') + 1;
            const text = line.substring(level).trim();
            if (level === 1) return <h1 key={index} className="text-2xl font-bold mt-4 mb-2 text-cyan-400">{text}</h1>;
            if (level === 2) return <h2 key={index} className="text-xl font-semibold mt-3 mb-1 text-cyan-500">{text}</h2>;
            if (level === 3) return <h3 key={index} className="text-lg font-medium mt-2 text-cyan-600">{text}</h3>;
        }
        if (line.startsWith('* ') || line.startsWith('- ')) {
            return <li key={index} className="ml-6">{line.substring(2)}</li>;
        }
        if (/^\d+\./.test(line)) {
            return <li key={index} className="ml-6">{line.substring(line.indexOf('.') + 1).trim()}</li>;
        }
        return <p key={index} className="my-1">{line}</p>;
    });


    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-3xl h-[80vh] flex flex-col border border-cyan-500/30" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-cyan-500/20">
                    <div>
                        <h2 className="text-2xl font-bold text-cyan-400">AI Troubleshooting Guide</h2>
                        <p className="text-gray-400">For IPS at <span className="text-cyan-300">{ip?.address}</span></p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl">&times;</button>
                </div>
                <div className="text-gray-300 flex-grow overflow-y-auto pr-4">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-full">
                            <svg className="animate-spin h-10 w-10 text-cyan-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <p className="mt-4 text-lg">Contacting AI consultant...</p>
                        </div>
                    ) : (
                        <div className="prose prose-invert max-w-none prose-p:text-gray-300 prose-li:text-gray-300">
                           {formattedResult}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TroubleshootingModal;
