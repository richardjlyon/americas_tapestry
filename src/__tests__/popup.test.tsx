import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { PopupModal } from '@/components/features/popup/popup-modal';
import { getPopupContent, shouldShowPopup } from '@/lib/popup';
import type { PopupContent } from '@/lib/popup';

// Mock the dependencies
jest.mock('@/app/actions/popup-actions', () => ({
  dismissPopup: jest.fn(),
}));

jest.mock('@/lib/markdown', () => ({
  markdownToHtml: jest.fn().mockResolvedValue('<p>Test content</p>'),
}));

jest.mock('@/lib/content-core', () => ({
  getAllContent: jest.fn(),
}));

jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}));

describe('Popup System Tests', () => {
  const mockPopupContent: PopupContent = {
    title: 'Test Popup',
    version: '2025-01-15',
    enabled: true,
    showDuration: 30,
    content: 'Test **markdown** content',
    slug: 'test-popup',
  };

  describe('PopupModal Component', () => {
    it('renders popup modal with content', async () => {
      await act(async () => {
        render(<PopupModal content={mockPopupContent} initialOpen={true} />);
      });

      await waitFor(() => {
        expect(screen.getByText('Test Popup')).toBeInTheDocument();
        expect(screen.getByText("Don't show again")).toBeInTheDocument();
      });
    });

    it('closes popup when close button is clicked', async () => {
      await act(async () => {
        render(<PopupModal content={mockPopupContent} initialOpen={true} />);
      });

      await waitFor(() => {
        expect(screen.getByText('Test Popup')).toBeInTheDocument();
      });

      // Find the "Close" button that's explicitly in our component (not the Radix auto-generated one)
      const buttons = screen.getAllByRole('button');
      const closeButton = buttons.find(button => button.textContent === 'Close');
      expect(closeButton).toBeDefined();

      await act(async () => {
        fireEvent.click(closeButton!);
      });

      // After clicking close, the modal should be hidden
      await waitFor(() => {
        expect(screen.queryByText('Test Popup')).not.toBeInTheDocument();
      });
    });

    it('does not render when initialOpen is false', () => {
      render(<PopupModal content={mockPopupContent} initialOpen={false} />);

      expect(screen.queryByText('Test Popup')).not.toBeInTheDocument();
    });
  });

  describe('Popup Content Loading', () => {
    it('returns null when no content exists', async () => {
      const { getAllContent } = require('@/lib/content-core');
      getAllContent.mockResolvedValue([]);

      const result = await getPopupContent();
      expect(result).toBeNull();
    });

    it('returns null when popup is disabled', async () => {
      const { getAllContent } = require('@/lib/content-core');
      getAllContent.mockResolvedValue([{
        frontmatter: { enabled: false, title: 'Test', version: '1.0' },
        content: 'Test content',
        slug: 'test'
      }]);

      const result = await getPopupContent();
      expect(result).toBeNull();
    });

    it('returns popup content when enabled', async () => {
      const { getAllContent } = require('@/lib/content-core');
      getAllContent.mockResolvedValue([{
        frontmatter: {
          enabled: true,
          title: 'Test Popup',
          version: '2025-01-15',
          showDuration: 30
        },
        content: 'Test content',
        slug: 'test-popup'
      }]);

      const result = await getPopupContent();
      expect(result).toEqual({
        title: 'Test Popup',
        version: '2025-01-15',
        enabled: true,
        showDuration: 30,
        content: 'Test content',
        slug: 'test-popup'
      });
    });
  });

  describe('Popup Display Logic', () => {
    it('shows popup when no cookie exists', async () => {
      const { cookies } = require('next/headers');
      cookies.mockResolvedValue({
        get: jest.fn().mockReturnValue(undefined)
      });

      const result = await shouldShowPopup(mockPopupContent);
      expect(result).toBe(true);
    });

    it('shows popup when version has changed', async () => {
      const { cookies } = require('next/headers');
      const mockCookieValue = JSON.stringify({
        dismissed: true,
        version: '2025-01-01', // Different version
        timestamp: Date.now()
      });

      cookies.mockResolvedValue({
        get: jest.fn().mockReturnValue({ value: mockCookieValue })
      });

      const result = await shouldShowPopup(mockPopupContent);
      expect(result).toBe(true);
    });

    it('hides popup when same version and within duration', async () => {
      const { cookies } = require('next/headers');
      const mockCookieValue = JSON.stringify({
        dismissed: true,
        version: '2025-01-15', // Same version
        timestamp: Date.now() - (1000 * 60 * 60 * 24 * 10) // 10 days ago
      });

      cookies.mockResolvedValue({
        get: jest.fn().mockReturnValue({ value: mockCookieValue })
      });

      const result = await shouldShowPopup(mockPopupContent);
      expect(result).toBe(false);
    });

    it('shows popup when duration has expired', async () => {
      const { cookies } = require('next/headers');
      const mockCookieValue = JSON.stringify({
        dismissed: true,
        version: '2025-01-15', // Same version
        timestamp: Date.now() - (1000 * 60 * 60 * 24 * 40) // 40 days ago (> 30 day duration)
      });

      cookies.mockResolvedValue({
        get: jest.fn().mockReturnValue({ value: mockCookieValue })
      });

      const result = await shouldShowPopup(mockPopupContent);
      expect(result).toBe(true);
    });
  });
});