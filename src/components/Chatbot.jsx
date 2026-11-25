import { useEffect, useRef, useState } from 'react';
import './Chatbot.css';

const QUICK_PROMPTS = [
  'How do I build a budget?',
  'What is compound interest?',
  'How does diversification work?',
];

function getFinancialReply(question) {
  const text = question.toLowerCase();

  if (/^\s*(hi|hello|hey|good morning|good afternoon|good evening)\b/.test(text)) {
    return 'Hi! I can explain budgeting, saving, investing basics, and common financial terms. What would you like to know?';
  }

  if (/\b(budget|budgeting|spending|expenses)\b/.test(text)) {
    return 'Start by listing your monthly take-home income and essential expenses, then set limits for flexible spending and savings. A common starting point is the 50/30/20 guideline, but adjust it to fit your costs and goals.';
  }

  if (/\b(emergency fund|rainy day)\b/.test(text)) {
    return 'An emergency fund is money set aside for unexpected costs. Many people work toward three to six months of essential expenses, building it gradually in an accessible, low-risk account.';
  }

  if (/\b(compound interest|compounding)\b/.test(text)) {
    return 'Compound growth means returns can earn returns over time. The effect depends on how much you contribute, the rate of return, fees, and time; investment returns are not guaranteed.';
  }

  if (/\b(diversif|asset allocation|portfolio|risk)\b/.test(text)) {
    return 'Diversification spreads investments across different assets so one holding has less influence on the overall portfolio. It can reduce some risks, but it cannot prevent losses. The right mix depends on your goals and time horizon.';
  }

  if (/\b(sip|mutual fund|index fund|etf)\b/.test(text)) {
    return 'A fund pools money to invest in a group of assets. An SIP is a way to invest a fixed amount at regular intervals. Compare fees, holdings, risks, and the fund documents; neither regular investing nor diversification guarantees a profit.';
  }

  if (/\b(credit card|credit score|debt|loan|interest rate)\b/.test(text)) {
    return 'Review the interest rate, fees, minimum payment, and total repayment cost. For multiple debts, keep required payments current and consider directing extra payments toward the highest-rate balance, while keeping enough cash for essential expenses.';
  }

  if (/\b(retirement|pension)\b/.test(text)) {
    return 'Retirement planning usually starts with an estimated target date and expenses, then considers regular saving, investment risk, fees, and applicable local tax rules. A qualified adviser can help with your personal circumstances.';
  }

  if (/\b(crypto|cryptocurrency|bitcoin|ethereum)\b/.test(text)) {
    return 'Crypto assets can be highly volatile and may lose substantial value. Before considering them, understand custody, fees, fraud risks, and local regulations, and avoid investing money you cannot afford to lose.';
  }

  if (/\b(price|quote|live market|stock price|share price)\b/.test(text)) {
    return 'I can explain market terms, but I do not have live price data in this chat. Check the dashboard or your broker for current quotes and verify the market and timestamp.';
  }

  if (/\b(inflat|saving|save money|savings)\b/.test(text)) {
    return 'A practical first step is to set a specific savings goal, automate a manageable contribution, and keep short-term funds accessible. Consider how inflation, account fees, and withdrawal rules affect the goal.';
  }

  if (/\b(invest|stock|share|market)\b/.test(text)) {
    return 'I can help with investing concepts, but I cannot choose investments for you. Start by clarifying your goal and time horizon, understanding the risks and fees, and comparing diversified options rather than relying on a single stock tip.';
  }

  return 'I can help explain budgeting, saving, debt, investing basics, diversification, and financial terms. Ask a specific question and I’ll give you an educational overview. I can’t provide personalized financial advice or live market data.';
}

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

  const sendMessage = (message) => {
    const userText = message.trim();
    if (!userText || isThinking) return;

    setMessages((current) => [...current, { role: 'user', text: userText }]);
    setInputValue('');
    setIsThinking(true);

    window.setTimeout(() => {
      setMessages((current) => [
        ...current,
        { role: 'assistant', text: getFinancialReply(userText) },
      ]);
      setIsThinking(false);
    }, 250);
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
