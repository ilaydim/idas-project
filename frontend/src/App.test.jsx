import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App Component', () => {
  it('renders the Landing Page by default', () => {
    render(<App />);
    
    // LandingPage'deki spesifik bir metni arıyoruz
    const headingText = screen.getByText(/LLM-Powered Requirement Perfection/i);
    expect(headingText).toBeInTheDocument();
    
    // Butonun ekranda olduğunu doğrulayalım
    const startButton = screen.getByText(/Start for Free/i);
    expect(startButton).toBeInTheDocument();
  });
});
