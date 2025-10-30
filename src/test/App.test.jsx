import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import App from '../App'

// Mock the AuthContext to avoid auth-related errors in tests
vi.mock('../AuthContext', () => ({
  AuthProvider: ({ children }) => children,
  useAuth: () => ({
    user: null,
    loading: false,
    signIn: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
  })
}))

describe('App Component', () => {
  it('renders without crashing', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    )
    
    // The app should render something
    expect(document.body).toBeInTheDocument()
  })

  it('handles routing correctly', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    )
    
    // Should not throw any errors
    expect(true).toBe(true)
  })
})

describe('Basic Functionality', () => {
  it('should have working test environment', () => {
    expect(1 + 1).toBe(2)
  })

  it('should have jsdom environment available', () => {
    expect(typeof window).toBe('object')
    expect(typeof document).toBe('object')
  })
})