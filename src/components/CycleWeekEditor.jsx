/**
 * @file CycleWeekEditor.jsx
 * @description Small UI to show a grid of weeks and allow assigning routines per week.
 * This is a lightweight placeholder used by the MesocycleBuilder scaffold.
 */

import React from 'react';
import './CycleWeekEditor.css';

function CycleWeekEditor({ weeks = 4 }) {
  const weekArray = Array.from({ length: weeks }, (_, i) => i + 1);

  return (
    <div className="cycle-week-editor">
      <div className="weeks-grid">
        {weekArray.map((w) => (
          <div key={w} className="week-card">
            <strong>Week {w}</strong>
            <div className="assignments">Assign routine (placeholder)</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CycleWeekEditor;
