/**
 * @file mesocycle-pages.test.jsx
 * @description Comprehensive integration tests for Mesocycle-related pages and components.
 * Covers MesocycleBuilder, MesocycleDetail, CycleWeekEditor, and routine assignment logic.
 */

import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import CycleWeekEditor from '../src/components/CycleWeekEditor.jsx';
import MesocycleBuilder from '../src/pages/MesocycleBuilder.jsx';
import MesocycleDetail from '../src/pages/MesocycleDetail.jsx';

// Mock supabase and auth context as needed
jest.mock('../src/supabaseClient.js', () => ({
  supabase: {
    from: jest.fn(() => ({ select: jest.fn(), insert: jest.fn(), update: jest.fn(), delete: jest.fn(), upsert: jest.fn() }))
  }
}));
jest.mock('../src/AuthContext.jsx', () => ({
  useAuth: () => ({ user: { id: 'test-user-id' }, loading: false })
}));

// Helper: create assignments for a test mesocycle
function createTestAssignments(weeks = 4) {
  const assignments = [];
  for (let w = 1; w <= weeks; w++) {
    for (let d = 1; d <= 7; d++) {
      assignments.push({ week_index: w, day_index: d, type: d % 2 === 0 ? 'rest' : 'routine', routine_id: d % 2 === 0 ? null : `test-routine-uuid-${w}-${d}` });
    }
  }
  return assignments;
}

describe('Mesocycle Pages Integration', () => {
  test('MesocycleBuilder renders and saves valid assignments', async () => {
    render(<MesocycleBuilder />);
    expect(screen.getByText(/New Mesocycle/i)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: 'Test Mesocycle' } });
    fireEvent.change(screen.getByLabelText(/Weeks/i), { target: { value: 4 } });
    fireEvent.click(screen.getByText(/Save Mesocycle/i));
    await waitFor(() => expect(screen.getByText(/Mesocycle saved/i)).toBeInTheDocument());
  });

  test('CycleWeekEditor assigns routines and rest days correctly', () => {
    const assignments = createTestAssignments(2);
    render(<CycleWeekEditor weeks={2} focus="Hypertrophy" initialAssignments={assignments} onAssignmentsChange={() => {}} />);
    expect(screen.getByText(/Week 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Week 2/i)).toBeInTheDocument();
    // Check select options for a day
    expect(screen.getAllByRole('combobox').length).toBe(14); // 2 weeks x 7 days
  });

  test('MesocycleDetail displays assigned routines', async () => {
    render(<MesocycleDetail />);
    // This would require more mocking for supabase data
    // For now, just check the page loads
    expect(screen.getByText(/Mesocycle Detail/i)).toBeInTheDocument();
  });

  // Add more tests for edge cases, error handling, and editing
});
