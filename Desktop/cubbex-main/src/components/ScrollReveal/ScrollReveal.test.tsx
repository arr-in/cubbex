import { render, screen, fireEvent } from '@testing-library/react';
import ScrollReveal from './ScrollReveal';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    })),
});

describe('ScrollReveal Component', () => {
    test('renders split words correctly', () => {
        const text = "A man dies when he is forgotten!";
        render(<ScrollReveal>{text}</ScrollReveal>);

        const words = text.split(' ');
        words.forEach(word => {
            expect(screen.getByText(word)).toBeInTheDocument();
            expect(screen.getByText(word)).toHaveClass('word');
        });
    });

    test('dispatches cubex:playMicro event when CTA is clicked', () => {
        const dispatchSpy = jest.spyOn(window, 'dispatchEvent');
        render(
            <ScrollReveal ctaText="Launch App">
                Test Content
            </ScrollReveal>
        );

        // Simulate reveal finished to show CTA (or mock state)
        // Note: In a real test, you'd trigger scroll or mock GSAP ScrollTrigger
        const ctaButton = screen.getByText('Launch App');
        fireEvent.click(ctaButton);

        expect(dispatchSpy).toHaveBeenCalledWith(
            expect.objectContaining({ type: 'cubex:playMicro' })
        );
    });
});
