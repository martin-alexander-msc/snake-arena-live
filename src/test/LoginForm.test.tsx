import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LoginForm } from '@/components/auth/LoginForm';
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from 'sonner';

// Mock the AuthContext login function if needed, but since we have a mock API client, 
// we can also just wrap it in the real AuthProvider to test the integration.

describe('LoginForm', () => {
    const mockOnSuccess = vi.fn();
    const mockOnSwitchToSignUp = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    const renderLoginForm = () => {
        return render(
            <AuthProvider>
                <Toaster />
                <LoginForm
                    onSuccess={mockOnSuccess}
                    onSwitchToSignUp={mockOnSwitchToSignUp}
                />
            </AuthProvider>
        );
    };

    it('renders all form elements', () => {
        renderLoginForm();

        expect(screen.getByLabelText(/email/i)).toBeDefined();
        expect(screen.getByLabelText(/password/i)).toBeDefined();
        expect(screen.getByRole('button', { name: /sign in/i })).toBeDefined();
        expect(screen.getByRole('button', { name: /sign up/i })).toBeDefined();
    });

    it('shows error toast when fields are empty', async () => {
        renderLoginForm();

        const submitButton = screen.getByRole('button', { name: /sign in/i });
        fireEvent.click(submitButton);

        // Using findByText for async timing of toast
        expect(await screen.findByText(/please fill in all fields/i)).toBeDefined();
    });

    it('calls onSwitchToSignUp when link is clicked', () => {
        renderLoginForm();

        const signUpLink = screen.getByRole('button', { name: /sign up/i });
        fireEvent.click(signUpLink);

        expect(mockOnSwitchToSignUp).toHaveBeenCalled();
    });

    it('successfully logs in with valid credentials', async () => {
        renderLoginForm();

        fireEvent.change(screen.getByLabelText(/email/i), {
            target: { value: 'snakemaster@game.com' },
        });
        fireEvent.change(screen.getByLabelText(/password/i), {
            target: { value: 'password123' },
        });

        const submitButton = screen.getByRole('button', { name: /sign in/i });
        fireEvent.click(submitButton);

        // Wait for the success toast and callback
        await waitFor(() => {
            expect(mockOnSuccess).toHaveBeenCalled();
        }, { timeout: 3000 });
    });
});
