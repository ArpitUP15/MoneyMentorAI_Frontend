import { useEffect, useRef, useState } from 'react';
import './Chatbot.css';

const QUICK_PROMPTS = [
  'How do I build a budget?',
  'What is compound interest?',
  'How does diversification work?',
];

function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: 'Hi! I’m your MoneyMentor guide. Ask me about budgeting, saving, or investing basics.',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const toggleButtonRef = useRef(null);
  const inputRef = useRef(null);
  const chatBodyRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages, isThinking]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        toggleButtonRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const sendMessage = async (message) => {
    const userText = message.trim();
    if (!userText || isThinking) return;

    setMessages((current) => [...current, { role: 'user', text: userText }]);
    setInputValue('');
    setIsThinking(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            ...messages.slice(-11).map(({ role, text }) => ({ role, text })),
            { role: 'user', text: userText },
          ],
        }),
      });
      const responseText = await response.text();
      let result;

      try {
        result = JSON.parse(responseText);
      } catch {
        throw new Error(
          response.ok
            ? 'The chat service returned an unreadable response. Please try again.'
            : `Chat service error (${response.status}). Check that the chat server is running and your Groq settings are correct.`,
        );
      }

      if (!result || typeof result !== 'object') {
        throw new Error('The chat service returned an invalid response. Please try again.');
      }
      if (!response.ok) {
        throw new Error(
          result.error || `Chat service error (${response.status}). Please try again.`,
        );
      }
      if (typeof result.reply !== 'string' || !result.reply.trim()) {
        throw new Error('The assistant returned an invalid response. Please try again.');
      }

      setMessages((current) => [
        ...current,
        { role: 'assistant', text: result.reply },
      ]);
    } catch (error) {
      console.error('Chat request failed:', error);
      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          text: error instanceof TypeError
            ? 'Could not connect to the chat server. Start it with `npm run server` and try again.'
            : error instanceof Error
              ? error.message
              : 'Could not reach the assistant. Please check the server and try again.',
        },
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    sendMessage(inputValue);
  };

  const handleInputKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage(inputValue);
    }
  };

  const closeChat = () => {
    setIsOpen(false);
    toggleButtonRef.current?.focus();
  };

  return (
    <div className="chatbot-widget">
      <section
        id="chatbot-panel"
        className="chatbot-panel"
        aria-label="MoneyMentor financial assistant"
        hidden={!isOpen}
      >
        <header className="chatbot-header">
          <div className="chatbot-brand">
            <span className="chatbot-brand-icon" aria-hidden="true">$</span>
            <div>
              <h2>MoneyMentor</h2>
              <p>Financial learning assistant</p>
            </div>
          </div>
          <button
            type="button"
            className="chatbot-close"
            onClick={closeChat}
            aria-label="Close chat"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="m6 6 12 12M18 6 6 18" />
            </svg>
          </button>
        </header>

        <div
          className="chatbot-messages"
          ref={chatBodyRef}
          role="log"
          aria-label="Chat messages"
          aria-live="polite"
          aria-relevant="additions"
        >
          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={`chatbot-message chatbot-message-${message.role}`}
              aria-label={message.role === 'assistant' ? 'MoneyMentor' : 'You'}
            >
              {message.role === 'assistant' && (
                <span className="chatbot-message-avatar" aria-hidden="true">M</span>
              )}
              <p>{message.text}</p>
            </div>
          ))}

          {messages.length === 1 && !isThinking && (
            <div className="chatbot-prompts" aria-label="Suggested questions">
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  type="button"
                  key={prompt}
                  onClick={() => sendMessage(prompt)}
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {isThinking && (
            <p className="chatbot-status" role="status">
              MoneyMentor is preparing a response…
            </p>
          )}
        </div>

        <form className="chatbot-form" onSubmit={handleSubmit}>
          <label className="chatbot-sr-only" htmlFor="chatbot-message">
            Your message
          </label>
          <textarea
            id="chatbot-message"
            ref={inputRef}
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder="Ask a financial question…"
            rows={1}
            maxLength={1000}
            disabled={isThinking}
          />
          <button
            type="submit"
            className="chatbot-send"
            disabled={!inputValue.trim() || isThinking}
            aria-label="Send message"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7Z" />
            </svg>
          </button>
        </form>
        <p className="chatbot-disclaimer">
          Educational information only—not personalized financial advice.
        </p>
      </section>

      <button
        ref={toggleButtonRef}
        type="button"
        className="chatbot-toggle"
        onClick={() => setIsOpen((open) => !open)}
        aria-label={isOpen ? 'Close MoneyMentor chat' : 'Open MoneyMentor chat'}
        aria-expanded={isOpen}
        aria-controls="chatbot-panel"
      >
        {isOpen ? (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="m6 6 12 12M18 6 6 18" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8A8.5 8.5 0 0 1 8.7 3.9a8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5Z" />
          </svg>
        )}
      </button>
    </div>
  );
}

export default Chatbot;
