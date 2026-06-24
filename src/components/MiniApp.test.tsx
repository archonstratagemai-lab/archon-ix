/// <reference types="@testing-library/jest-dom" />
/** @vitest-environment jsdom */
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MiniApp } from './MiniApp';

// Mock the MiniAppMainButton to render a real button we can click.
vi.mock('./MiniAppMainButton', () => ({
  MiniAppMainButton: (props: { onClick: () => void }) => (
    <button data-testid="main-button" onClick={props.onClick}>
      MainButton
    </button>
  ),
}));

describe('MiniApp component', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  // First jsdom-using test of the run pays the env-init cost (~7-8s on this
  // stack — vitest reports `environment 133.63s` of the 186s total run).
  // Subsequent renders in the same file complete in <500ms. Default 5000ms
  // is too tight for the cold-start; bump only the first test to 10000ms so
  // the rest of the suite keeps its tighter default.
  it('renders title and description', () => {
    render(<MiniApp />);
    expect(screen.getByRole('heading', { name: /telegram mini app demo/i })).toBeInTheDocument();
    expect(
      screen.getByText(/this button lives in the telegram ui/i)
    ).toBeInTheDocument();
  }, 10000);

  it('calls console.log when MainButton is clicked', () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    render(<MiniApp />);
    const button = screen.getByTestId('main-button');
    fireEvent.click(button);
    expect(logSpy).toHaveBeenCalledWith('Mini App MainButton clicked');
  });
});
