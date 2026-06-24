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

  it('renders title and description', () => {
    render(<MiniApp />);
    expect(screen.getByRole('heading', { name: /telegram mini app demo/i })).toBeInTheDocument();
    expect(
      screen.getByText(/this button lives in the telegram ui/i)
    ).toBeInTheDocument();
  });

  it('calls console.log when MainButton is clicked', () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    render(<MiniApp />);
    const button = screen.getByTestId('main-button');
    fireEvent.click(button);
    expect(logSpy).toHaveBeenCalledWith('Mini App MainButton clicked');
  });
});
