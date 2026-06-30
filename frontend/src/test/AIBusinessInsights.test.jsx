import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import AIBusinessInsights from '../components/AIBusinessInsights';

describe('AIBusinessInsights Component', () => {

  it('renders a fallback UI when data is completely empty or null', () => {
    render(<AIBusinessInsights insights={[]} suggestions={[]} />);
    expect(screen.getByTestId('ai-fallback')).toHaveTextContent(
      'No AI insights or suggestions available'
    );
  });

  it('correctly renders mock AI-generated text/suggestions', () => {
    const mockInsights = ['Rental demand for winter coats is up 20% this week.'];
    const mockSuggestions = ['Recommend styling scarves to customers renting coats.'];

    render(<AIBusinessInsights insights={mockInsights} suggestions={mockSuggestions} />);

    expect(screen.getByText(mockInsights[0])).toBeInTheDocument();
    expect(screen.getByText(mockSuggestions[0])).toBeInTheDocument();
  });

  it('properly updates the UI when new mock prop values are passed', () => {
    const { rerender } = render(
      <AIBusinessInsights insights={['Initial insight']} suggestions={[]} />
    );

    expect(screen.getByText('Initial insight')).toBeInTheDocument();

    rerender(
      <AIBusinessInsights
        insights={['Updated insight']}
        suggestions={['New suggestion']}
      />
    );

    expect(screen.queryByText('Initial insight')).not.toBeInTheDocument();
    expect(screen.getByText('Updated insight')).toBeInTheDocument();
    expect(screen.getByText('New suggestion')).toBeInTheDocument();
  });

  it('displays insights but shows fallback for empty suggestions', () => {
    render(
      <AIBusinessInsights
        insights={['Stock moving quickly.']}
        suggestions={[]}
      />
    );

    expect(screen.queryByTestId('ai-fallback')).not.toBeInTheDocument();

    expect(screen.getByTestId('insights-list')).toBeInTheDocument();
    expect(screen.getByText('Stock moving quickly.')).toBeInTheDocument();

    expect(screen.queryByTestId('suggestions-list')).not.toBeInTheDocument();
    expect(screen.getByText('No suggestions available.')).toBeInTheDocument();
  });

  it('displays suggestions but shows fallback for empty insights', () => {
    render(
      <AIBusinessInsights
        insights={null}
        suggestions={['Bundle items for discount.']}
      />
    );

    expect(screen.queryByTestId('ai-fallback')).not.toBeInTheDocument();

    expect(screen.queryByTestId('insights-list')).not.toBeInTheDocument();
    expect(screen.getByText('No insights available.')).toBeInTheDocument();

    expect(screen.getByTestId('suggestions-list')).toBeInTheDocument();
    expect(screen.getByText('Bundle items for discount.')).toBeInTheDocument();
  });

  // Chatbox interaction tests

  it('renders AI chatbot with initial assistant message', () => {
    render(<AIBusinessInsights insights={[]} suggestions={[]} />);

    // Updated to match the current greeting text (includes "RenTech")
    expect(
      screen.getByText(/Hi! I’m your RenTech AI business assistant/i)
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText('Ask your AI assistant...')
    ).toBeInTheDocument();
  });

  it('allows user to send a message and displays it in chat', async () => {
    const user = userEvent.setup();

    render(<AIBusinessInsights insights={[]} suggestions={[]} />);

    const input = screen.getByPlaceholderText('Ask your AI assistant...');
    const button = screen.getByRole('button', { name: /send/i });

    await user.type(input, 'Tell me about insights');
    await user.click(button);

    expect(screen.getByText('Tell me about insights')).toBeInTheDocument();
  });

  it('shows AI response after user sends message', async () => {
    const user = userEvent.setup();

    render(
      <AIBusinessInsights
        insights={['Test insight']}
        suggestions={[]}
      />
    );

    const input = screen.getByPlaceholderText('Ask your AI assistant...');
    const button = screen.getByRole('button', { name: /send/i });

    await user.type(input, 'insight');
    await user.click(button);

    expect(screen.getByText('insight')).toBeInTheDocument();

    await waitFor(() => {
      expect(
        screen.getByText(/Here are key insights|No insights available/i)
      ).toBeInTheDocument();
    });
  });

  it('sends message when Enter key is pressed', async () => {
    const user = userEvent.setup();

    render(<AIBusinessInsights insights={[]} suggestions={[]} />);

    const input = screen.getByPlaceholderText('Ask your AI assistant...');

    await user.type(input, 'Hello AI{enter}');

    expect(screen.getByText('Hello AI')).toBeInTheDocument();
  });

  it('does not send empty messages when send is clicked', async () => {
    const user = userEvent.setup();

    render(<AIBusinessInsights insights={[]} suggestions={[]} />);

    const button = screen.getByRole('button', { name: /send/i });
    await user.click(button);

    // Verify that no extra message was added – only the initial assistant message exists
    const messagesContainer = screen.getByTestId('chat-messages');
    expect(messagesContainer.children).toHaveLength(1);
    // Updated to match the current greeting text
    expect(messagesContainer.children[0]).toHaveTextContent(
      /Hi! I’m your RenTech AI business assistant/i
    );
  });
});