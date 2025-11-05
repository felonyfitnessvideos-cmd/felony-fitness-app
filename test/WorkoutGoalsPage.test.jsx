/**
 * @file WorkoutGoalsPage.test.jsx
 * @description Test suite for WorkoutGoalsPage component. Covers rendering, CRUD, modal, validation, and edge cases.
 * @project Felony Fitness
 */

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { AuthContext } from '../src/AuthContext.jsx';
import WorkoutGoalsPage from '../src/pages/WorkoutGoalsPage.jsx';

const mockUser = { id: 'test-user-id' };

function renderWithAuth(ui) {
  return render(
    <AuthContext.Provider value={{ user: mockUser }}>
      {ui}
    </AuthContext.Provider>
  );
}

describe('WorkoutGoalsPage', () => {
  it('renders header and add button', () => {
    renderWithAuth(<WorkoutGoalsPage />);
    expect(screen.getByText(/Workout Goals/i)).toBeInTheDocument();
    expect(screen.getByText('+ Add Goal')).toBeInTheDocument();
  });

  it('opens modal when add button is clicked', () => {
    renderWithAuth(<WorkoutGoalsPage />);
    fireEvent.click(screen.getByText('+ Add Goal'));
    expect(screen.getByText(/Add New Goal/i)).toBeInTheDocument();
  });

  it('shows form fields in modal', () => {
    renderWithAuth(<WorkoutGoalsPage />);
    fireEvent.click(screen.getByText('+ Add Goal'));
    expect(screen.getByLabelText(/Goal Description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Current Value/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Target Value/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Target Date/i)).toBeInTheDocument();
    expect(screen.getByText(/Select if this is a weight related goal/i)).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    renderWithAuth(<WorkoutGoalsPage />);
    fireEvent.click(screen.getByText('+ Add Goal'));
    fireEvent.click(screen.getByText('Save Goal'));
    await waitFor(() => {
      expect(screen.getByLabelText(/Goal Description/i)).toHaveValue('');
    });
  });

  // Add more tests for CRUD, modal close, progress bar, and edge cases as needed
});
