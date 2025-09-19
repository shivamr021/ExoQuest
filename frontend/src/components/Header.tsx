import React, { useState } from 'react';
import './Header.css';
import { Link } from 'react-router-dom';

// === Configure your contact settings here ===
const SUPPORT_EMAIL = "someone@example.com";
const SUBJECT = "Inquiry from Stellar Transformation";
const BODY = "Hello,%0D%0A%0D%0AI'd like to know more about your services.";
// Gmail compose (guaranteed new tab)
const GMAIL_URL = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
  SUPPORT_EMAIL
)}&su=${encodeURIComponent(SUBJECT)}&body=${BODY}`;
// If you prefer Outlook Web, use this instead:
// const OUTLOOK_URL = `https://outlook.office.com/mail/deeplink/compose?to=${encodeURIComponent(SUPPORT_EMAIL)}&subject=${encodeURIComponent(SUBJECT)}&body=${BODY}`;
// If you prefer mailto (respects user’s default handler, may open app instead of tab):
// const MAILTO_URL = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(SUBJECT)}&body=${BODY}`;

const Header: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="header">
      <div className="container">
        <div className="logo">
          <span className="team-name">Stellar Transformation</span>
        </div>

        {/* Desktop Navigation */}
        <nav className="navigation">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/result" className="nav-link">Services</Link>
        </nav>

        {/* Contact: opens Gmail compose in a new tab */}
        <a
          href={GMAIL_URL}
          className="contact-btn"
          target="_blank"
          rel="noopener noreferrer"
        >
          Contact
        </a>

        <div
          className={`hamburger ${menuOpen ? 'open' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="mobile-menu">
          <a href="#home" className="nav-link" onClick={() => setMenuOpen(false)}>Home</a>
          <a href="#about" className="nav-link" onClick={() => setMenuOpen(false)}>About Us</a>
          <a href="#services" className="nav-link" onClick={() => setMenuOpen(false)}>Services</a>

          {/* Mobile Contact: also opens in new tab; close the menu afterward */}
          <a
            href={GMAIL_URL}
            className="contact-btn"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setMenuOpen(false)}
          >
            Contact
          </a>
        </div>
      )}
    </header>
  );
};

export default Header;
