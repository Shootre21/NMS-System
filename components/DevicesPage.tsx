import React from 'react';
import { Device } from '../types';
import DeviceList from './DeviceList';

interface DevicesPageProps {
    firewalls: Device[];
    switches: Device[];
}

const DevicesPage: React.FC<DevicesPageProps> = ({ firewalls, switches }) => {
    return (
        <div className="space-y-6">
            <DeviceList title="Firewalls" devices={firewalls} />
            <DeviceList title="Switches" devices={switches} />
        </div>
    );
};

export default DevicesPage;
