import React from 'react';
import type { Client } from '../types';

/**
 * Props for SmartScheduling component
 */
interface SmartSchedulingProps {
  selectedClient?: Client | null;
}

/**
 * Smart Scheduling component for trainer workspace
 * Allows trainers to intelligently schedule client workouts
 */
export const SmartScheduling: React.FC<SmartSchedulingProps> = (props) => {
  return (
    <div className="smart-scheduling">
      <h2>Smart Scheduling</h2>
      {props.selectedClient && <p>Selected client: {props.selectedClient.first_name}</p>}
      <p>Smart Scheduling functionality coming soon...</p>
    </div>
  );
};

export default SmartScheduling;