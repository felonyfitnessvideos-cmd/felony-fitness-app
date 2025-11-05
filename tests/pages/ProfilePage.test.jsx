/**
 * @file ProfilePage.test.jsx
 * @description Comprehensive test suite for ProfilePage component
 * Tests profile management, metrics logging, height conversion, and database operations
 * @author Felony Fitness Development Team
 * @date November 4, 2025
 */

import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ProfilePage from '../../src/pages/ProfilePage.jsx';

// Mock the AuthContext
const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com'
};

const mockAuthContext = {
  user: mockUser,
  loading: false
};

vi.mock('../../src/AuthContext.jsx', () => ({
  useAuth: () => mockAuthContext
}));

// Mock Supabase client
const mockSupabase = {
  from: vi.fn(() => mockSupabase),
  select: vi.fn(() => mockSupabase),
  eq: vi.fn(() => mockSupabase),
  single: vi.fn(() => mockSupabase),
  upsert: vi.fn(() => mockSupabase),
  insert: vi.fn(() => mockSupabase),
  order: vi.fn(() => mockSupabase),
  limit: vi.fn(() => mockSupabase)
};

vi.mock('../../src/supabaseClient.js', () => ({
  default: mockSupabase
}));

// Mock react-router-dom navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  User: () => <div data-testid="user-icon">User Icon</div>,
  Calendar: () => <div data-testid="calendar-icon">Calendar Icon</div>,
  HeartPulse: () => <div data-testid="heart-pulse-icon">HeartPulse Icon</div>,
  Edit: () => <div data-testid="edit-icon">Edit Icon</div>,
  Save: () => <div data-testid="save-icon">Save Icon</div>,
  Weight: () => <div data-testid="weight-icon">Weight Icon</div>,
  Activity: () => <div data-testid="activity-icon">Activity Icon</div>
}));

// Mock SubPageHeader component
vi.mock('../../src/components/SubPageHeader.jsx', () => ({
  default: ({ title, backTo }) => (
    <div data-testid="sub-page-header">
      <h1>{title}</h1>
      <span data-testid="back-to">{backTo}</span>
    </div>
  )
}));

// Test wrapper component
const TestWrapper = ({ children }) => (
  <BrowserRouter>
    {children}
  </BrowserRouter>
);

describe('ProfilePage Component', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();
    
    // Default successful responses
    mockSupabase.single.mockResolvedValue({
      data: null,
      error: { code: 'PGRST116', message: 'No profile found' }
    });
    
    mockSupabase.limit.mockResolvedValue({
      data: [],
      error: null
    });
  });

  afterEach(() => {
    cleanup();
  });

  describe('Component Rendering', () => {
    it('renders ProfilePage with correct title and header', async () => {
      render(
        <TestWrapper>
          <ProfilePage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('sub-page-header')).toBeInTheDocument();
        expect(screen.getByText('Profile & Metrics')).toBeInTheDocument();
        expect(screen.getByTestId('back-to')).toHaveTextContent('/dashboard');
      });
    });

    it('shows loading state initially', () => {
      // Mock loading state
      vi.mocked(mockAuthContext).loading = true;
      
      render(
        <TestWrapper>
          <ProfilePage />
        </TestWrapper>
      );

      expect(screen.getByText('Loading Profile...')).toBeInTheDocument();
      
      // Reset loading state
      vi.mocked(mockAuthContext).loading = false;
    });

    it('renders profile form sections', async () => {
      render(
        <TestWrapper>
          <ProfilePage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Your Information')).toBeInTheDocument();
        expect(screen.getByText('Log Today\'s Measurements')).toBeInTheDocument();
        expect(screen.getByText('Recent History')).toBeInTheDocument();
      });
    });
  });

  describe('Profile Form Management', () => {
    it('renders profile form in edit mode by default when no profile exists', async () => {
      render(
        <TestWrapper>
          <ProfilePage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByLabelText(/Date of Birth/)).toBeInTheDocument();
        expect(screen.getByLabelText(/Sex/)).toBeInTheDocument();
        expect(screen.getByLabelText(/Height/)).toBeInTheDocument();
        expect(screen.getByLabelText(/Diet Preference/)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Save Profile/ })).toBeInTheDocument();
      });
    });

    it('shows profile in display mode when data exists', async () => {
      // Mock existing profile data
      mockSupabase.single.mockResolvedValue({
        data: {
          date_of_birth: '1990-05-15',
          sex: 'male',
          diet_preference: 'Vegetarian',
          height_cm: 175
        },
        error: null
      });

      render(
        <TestWrapper>
          <ProfilePage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('35')).toBeInTheDocument(); // Age calculation
        expect(screen.getByText('male')).toBeInTheDocument();
        expect(screen.getByText('5\'9"')).toBeInTheDocument(); // Height conversion
        expect(screen.getByText('Vegetarian')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Edit/ })).toBeInTheDocument();
      });
    });

    it('switches to edit mode when edit button is clicked', async () => {
      // Mock existing profile data
      mockSupabase.single.mockResolvedValue({
        data: {
          date_of_birth: '1990-05-15',
          sex: 'male',
          diet_preference: 'Vegetarian',
          height_cm: 175
        },
        error: null
      });

      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <ProfilePage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Edit/ })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /Edit/ }));

      await waitFor(() => {
        expect(screen.getByLabelText(/Date of Birth/)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Save Profile/ })).toBeInTheDocument();
      });
    });
  });

  describe('Height Conversion Logic', () => {
    it('converts cm to feet and inches correctly', async () => {
      // Mock profile with height in cm
      mockSupabase.single.mockResolvedValue({
        data: {
          date_of_birth: '1990-05-15',
          sex: 'male',
          height_cm: 183 // 6 feet
        },
        error: null
      });

      render(
        <TestWrapper>
          <ProfilePage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('6\'0"')).toBeInTheDocument();
      });
    });

    it('handles feet and inches input correctly', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <ProfilePage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByLabelText(/Date of Birth/)).toBeInTheDocument();
      });

      // Find height inputs
      const feetInput = screen.getByPlaceholderText('5');
      const inchesInput = screen.getByPlaceholderText('9');

      await user.type(feetInput, '6');
      await user.type(inchesInput, '2');

      expect(feetInput).toHaveValue(6);
      expect(inchesInput).toHaveValue(2);
    });
  });

  describe('Profile Form Validation', () => {
    it('validates date of birth format', async () => {
      const user = userEvent.setup();
      mockSupabase.upsert.mockResolvedValue({ error: null });

      render(
        <TestWrapper>
          <ProfilePage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByLabelText(/Date of Birth/)).toBeInTheDocument();
      });

      const dobInput = screen.getByLabelText(/Date of Birth/);
      const saveButton = screen.getByRole('button', { name: /Save Profile/ });

      // Test invalid date format (future date)
      await user.type(dobInput, '2030-01-01');
      await user.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText(/Please enter a valid date of birth that is not in the future/)).toBeInTheDocument();
      });
    });

    it('validates height range', async () => {
      const user = userEvent.setup();
      mockSupabase.upsert.mockResolvedValue({ error: null });

      render(
        <TestWrapper>
          <ProfilePage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByPlaceholderText('5')).toBeInTheDocument();
      });

      const feetInput = screen.getByPlaceholderText('5');
      const saveButton = screen.getByRole('button', { name: /Save Profile/ });

      // Test invalid height (too tall)
      await user.clear(feetInput);
      await user.type(feetInput, '9');
      await user.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText(/Please enter a valid height/)).toBeInTheDocument();
      });
    });

    it('handles sex constraint validation', async () => {
      const user = userEvent.setup();
      mockSupabase.upsert.mockResolvedValue({ error: null });

      render(
        <TestWrapper>
          <ProfilePage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByLabelText(/Sex/)).toBeInTheDocument();
      });

      const sexSelect = screen.getByLabelText(/Sex/);
      
      await user.selectOptions(sexSelect, 'male');
      expect(sexSelect).toHaveValue('male');
    });
  });

  describe('Profile Form Submission', () => {
    it('successfully saves profile data', async () => {
      const user = userEvent.setup();
      mockSupabase.upsert.mockResolvedValue({ error: null });

      render(
        <TestWrapper>
          <ProfilePage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByLabelText(/Date of Birth/)).toBeInTheDocument();
      });

      // Fill out form
      await user.type(screen.getByLabelText(/Date of Birth/), '1990-05-15');
      await user.selectOptions(screen.getByLabelText(/Sex/), 'male');
      await user.type(screen.getByPlaceholderText('5'), '5');
      await user.type(screen.getByPlaceholderText('9'), '9');
      
      await user.click(screen.getByRole('button', { name: /Save Profile/ }));

      await waitFor(() => {
        expect(mockSupabase.upsert).toHaveBeenCalledWith({
          id: 'test-user-id',
          user_id: 'test-user-id',
          date_of_birth: '1990-05-15',
          sex: 'male',
          diet_preference: '',
          height_cm: 175 // 5'9" converted to cm
        });
      });

      await waitFor(() => {
        expect(screen.getByText('Profile saved!')).toBeInTheDocument();
      });
    });

    it('handles profile save errors', async () => {
      const user = userEvent.setup();
      mockSupabase.upsert.mockResolvedValue({
        error: { message: 'Database error' }
      });

      render(
        <TestWrapper>
          <ProfilePage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Save Profile/ })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /Save Profile/ }));

      await waitFor(() => {
        expect(screen.getByText('Database error')).toBeInTheDocument();
      });
    });
  });

  describe('Metrics Logging', () => {
    it('renders metrics logging form', async () => {
      render(
        <TestWrapper>
          <ProfilePage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByLabelText(/Weight \(lbs\)/)).toBeInTheDocument();
        expect(screen.getByLabelText(/Body Fat %/)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Log Measurement/ })).toBeInTheDocument();
      });
    });

    it('successfully logs weight and body fat measurements', async () => {
      const user = userEvent.setup();
      const mockMetricData = {
        id: 'metric-id',
        user_id: 'test-user-id',
        weight_lbs: 175.5,
        body_fat_percentage: 15.2,
        created_at: '2025-11-04T10:30:00Z'
      };

      mockSupabase.insert.mockResolvedValue({
        data: mockMetricData,
        error: null
      });

      render(
        <TestWrapper>
          <ProfilePage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByLabelText(/Weight \(lbs\)/)).toBeInTheDocument();
      });

      // Fill out metrics form
      await user.type(screen.getByLabelText(/Weight \(lbs\)/), '175.5');
      await user.type(screen.getByLabelText(/Body Fat %/), '15.2');
      
      await user.click(screen.getByRole('button', { name: /Log Measurement/ }));

      await waitFor(() => {
        expect(mockSupabase.insert).toHaveBeenCalledWith({
          user_id: 'test-user-id',
          weight_lbs: 175.5,
          body_fat_percentage: 15.2
        });
      });

      await waitFor(() => {
        expect(screen.getByText('Measurement saved!')).toBeInTheDocument();
      });
    });

    it('validates metrics form requires at least one measurement', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <ProfilePage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Log Measurement/ })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /Log Measurement/ }));

      await waitFor(() => {
        expect(screen.getByText('Please enter at least one measurement.')).toBeInTheDocument();
      });
    });

    it('allows logging weight only', async () => {
      const user = userEvent.setup();
      mockSupabase.insert.mockResolvedValue({
        data: { id: 'metric-id', weight_lbs: 180, body_fat_percentage: null },
        error: null
      });

      render(
        <TestWrapper>
          <ProfilePage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByLabelText(/Weight \(lbs\)/)).toBeInTheDocument();
      });

      await user.type(screen.getByLabelText(/Weight \(lbs\)/), '180');
      await user.click(screen.getByRole('button', { name: /Log Measurement/ }));

      await waitFor(() => {
        expect(mockSupabase.insert).toHaveBeenCalledWith({
          user_id: 'test-user-id',
          weight_lbs: 180,
          body_fat_percentage: null
        });
      });
    });

    it('allows logging body fat only', async () => {
      const user = userEvent.setup();
      mockSupabase.insert.mockResolvedValue({
        data: { id: 'metric-id', weight_lbs: null, body_fat_percentage: 18.5 },
        error: null
      });

      render(
        <TestWrapper>
          <ProfilePage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByLabelText(/Body Fat %/)).toBeInTheDocument();
      });

      await user.type(screen.getByLabelText(/Body Fat %/), '18.5');
      await user.click(screen.getByRole('button', { name: /Log Measurement/ }));

      await waitFor(() => {
        expect(mockSupabase.insert).toHaveBeenCalledWith({
          user_id: 'test-user-id',
          weight_lbs: null,
          body_fat_percentage: 18.5
        });
      });
    });
  });

  describe('Metrics History Display', () => {
    it('displays metrics history when data exists', async () => {
      const mockHistory = [
        {
          id: '1',
          weight_lbs: 175.5,
          body_fat_percentage: 15.2,
          created_at: '2025-11-04T10:30:00Z'
        },
        {
          id: '2',
          weight_lbs: 176.0,
          body_fat_percentage: null,
          created_at: '2025-11-03T10:30:00Z'
        }
      ];

      mockSupabase.limit.mockResolvedValue({
        data: mockHistory,
        error: null
      });

      render(
        <TestWrapper>
          <ProfilePage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('175.5 lbs')).toBeInTheDocument();
        expect(screen.getByText('15.2% fat')).toBeInTheDocument();
        expect(screen.getByText('176 lbs')).toBeInTheDocument();
      });
    });

    it('shows empty state when no metrics history exists', async () => {
      mockSupabase.limit.mockResolvedValue({
        data: [],
        error: null
      });

      render(
        <TestWrapper>
          <ProfilePage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('No measurements yet. Start logging to see your progress!')).toBeInTheDocument();
      });
    });
  });

  describe('Age Calculation', () => {
    it('calculates age correctly from date of birth', async () => {
      // Mock profile with known birth date
      mockSupabase.single.mockResolvedValue({
        data: {
          date_of_birth: '1990-05-15',
          sex: 'male'
        },
        error: null
      });

      render(
        <TestWrapper>
          <ProfilePage />
        </TestWrapper>
      );

      await waitFor(() => {
        // Age should be calculated as current year - 1990
        expect(screen.getByText('35')).toBeInTheDocument();
      });
    });

    it('handles null date of birth gracefully', async () => {
      mockSupabase.single.mockResolvedValue({
        data: {
          date_of_birth: null,
          sex: 'male'
        },
        error: null
      });

      render(
        <TestWrapper>
          <ProfilePage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('N/A')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('handles database fetch errors gracefully', async () => {
      mockSupabase.single.mockResolvedValue({
        data: null,
        error: { code: 'ERROR', message: 'Database connection failed' }
      });

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <TestWrapper>
          <ProfilePage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Error fetching profile data:', expect.any(Object));
      });

      consoleSpy.mockRestore();
    });

    it('handles unauthenticated user state', async () => {
      // Mock no user
      vi.mocked(mockAuthContext).user = null;

      render(
        <TestWrapper>
          <ProfilePage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Save Profile/ })).toBeInTheDocument();
      });

      const user = userEvent.setup();
      await user.click(screen.getByRole('button', { name: /Save Profile/ }));

      await waitFor(() => {
        expect(screen.getByText(/Could not save profile. Please refresh and try again/)).toBeInTheDocument();
      });

      // Reset user
      vi.mocked(mockAuthContext).user = mockUser;
    });
  });

  describe('Body Fat Reference Images', () => {
    it('shows body fat images for male', async () => {
      mockSupabase.single.mockResolvedValue({
        data: {
          sex: 'male',
          date_of_birth: '1990-05-15'
        },
        error: null
      });

      render(
        <TestWrapper>
          <ProfilePage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Body Fat Reference (Male)')).toBeInTheDocument();
      });
    });

    it('shows body fat images for female', async () => {
      mockSupabase.single.mockResolvedValue({
        data: {
          sex: 'female',
          date_of_birth: '1990-05-15'
        },
        error: null
      });

      render(
        <TestWrapper>
          <ProfilePage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Body Fat Reference (Female)')).toBeInTheDocument();
      });
    });

    it('hides body fat images for other/unspecified gender', async () => {
      mockSupabase.single.mockResolvedValue({
        data: {
          sex: 'other',
          date_of_birth: '1990-05-15'
        },
        error: null
      });

      render(
        <TestWrapper>
          <ProfilePage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.queryByText(/Body Fat Reference/)).not.toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper form labels and ARIA attributes', async () => {
      render(
        <TestWrapper>
          <ProfilePage />
        </TestWrapper>
      );

      await waitFor(() => {
        // Check form labels
        expect(screen.getByLabelText(/Date of Birth/)).toBeInTheDocument();
        expect(screen.getByLabelText(/Sex/)).toBeInTheDocument();
        expect(screen.getByLabelText(/Height/)).toBeInTheDocument();
        expect(screen.getByLabelText(/Diet Preference/)).toBeInTheDocument();
        expect(screen.getByLabelText(/Weight \(lbs\)/)).toBeInTheDocument();
        expect(screen.getByLabelText(/Body Fat %/)).toBeInTheDocument();

        // Check ARIA attributes
        expect(screen.getByRole('status')).toBeInTheDocument(); // Message container
      });
    });

    it('provides feedback through live regions', async () => {
      const user = userEvent.setup();
      mockSupabase.upsert.mockResolvedValue({ error: null });

      render(
        <TestWrapper>
          <ProfilePage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Save Profile/ })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /Save Profile/ }));

      await waitFor(() => {
        const statusElement = screen.getByRole('status');
        expect(statusElement).toHaveAttribute('aria-live', 'polite');
        expect(statusElement).toHaveAttribute('aria-atomic', 'true');
      });
    });
  });
});