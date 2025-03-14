import React from 'react';
import { Link } from 'react-router-dom';
import './styles.css';

function LandingPage() {
  return (
    <div className="landing-page">
      <div className="landing-page__hero-section">
        <nav className="navbar">
          <div className="navbar__left">
            <div className="navbar__brand">
              <div className="navbar__logo" />
              <div className="navbar__title">Jellycat Support</div>
            </div>
            <div className="navbar__links">
              <div className="navbar__link">Home</div>
              <Link to="/help-center" className="navbar__link">Help Center</Link>
            </div>
          </div>
          <div className="navbar__actions">
            <button className="button button--outline">Sign In</button>
            <button className="button button--primary">Get Started</button>
          </div>
        </nav>

        <div className="hero">
          {/* Local image placeholder */}
          <div className="hero__image" alt="Hero decoration" />
          <div className="hero__content">
            <h1 className="hero__title">Welcome to Jellycat</h1>
            <h1 className="hero__subtitle">Customer Support</h1>
            <p className="hero__description text-center mx-auto max-w-2xl">
              Get the help you need with your favorite plush companions. Our support team is here to assist you with any questions or concerns.
            </p>
            <div className="hero__actions">
              <Link to="/submit-ticket" className="button button--primary">Create Support Ticket</Link>
              <Link to="/help-center" className="button button--outline">Browse Help Center</Link>
            </div>
            <div className="hero__images">
              <div className="hero__image-box" />
              <div className="hero__image-box" />
              <div className="hero__image-box" />
            </div>
          </div>
        </div>

        <h2 className="section-title">How Can We Help You?</h2>

        <div className="help-categories">
          <div className="help-category">
            <div className="help-category__card">
              <div className="help-category__emoji">📝</div>
              <h3 className="help-category__title">Submit a Ticket</h3>
              <p className="help-category__description">
                Need help with your Jellycat? Create a support ticket and our team will assist you promptly.
              </p>
              <Link to="/submit-ticket" className="help-category__link">Get Support →</Link>
            </div>
          </div>
          <div className="help-category">
            <div className="help-category__card">
              <div className="help-category__emoji">📚</div>
              <h3 className="help-category__title">Knowledge Base</h3>
              <p className="help-category__description">
                Browse our comprehensive guides and articles to find answers to common questions.
              </p>
              <Link to="/help-center" className="help-category__link">Learn More →</Link>
            </div>
          </div>
          <div className="help-category">
            <div className="help-category__card">
              <div className="help-category__emoji">💭</div>
              <h3 className="help-category__title">FAQ</h3>
              <p className="help-category__description">
                Find quick answers to frequently asked questions about our products and services.
              </p>
              <Link to="/help-center" className="help-category__link">View FAQs →</Link>
            </div>
          </div>
        </div>

        <div className="contact-section">
          <div className="contact-section__content">
            <div className="contact-section__info">
              <h2 className="contact-section__title">Need Immediate Assistance?</h2>
              <p className="contact-section__description">
                Our support team is available to help you with any questions or concerns about your Jellycat products.
              </p>
              <div className="contact-section__actions">
                <Link to="/submit-ticket" className="button button--primary">Contact Support</Link>
                <button className="button button--outline">Live Chat</button>
              </div>
            </div>
            <div className="contact-section__image" />
          </div>
        </div>

        <footer className="footer">
          <div className="footer__content">
            <div className="footer__main">
              <div className="footer__brand">
                <div className="footer__logo" />
                <div className="footer__brand-title">Jellycat Support</div>
                <p className="footer__brand-description">
                  We're here to help you with your cuddly companions.
                </p>
              </div>
              <div className="footer__links">
                <div className="footer__column">
                  <h4 className="footer__column-title">Support</h4>
                  <Link to="/help-center" className="footer__link">Help Center</Link>
                  <Link to="/submit-ticket" className="footer__link">Submit Ticket</Link>
                  <Link to="/submit-ticket" className="footer__link">Contact Us</Link>
                </div>
                <div className="footer__column">
                  <h4 className="footer__column-title">Resources</h4>
                  <Link to="/help-center" className="footer__link">Knowledge Base</Link>
                  <Link to="/help-center" className="footer__link">FAQ</Link>
                  <a className="footer__link">Blog</a>
                </div>
                <div className="footer__column">
                  <h4 className="footer__column-title">Connect</h4>
                  <a className="footer__link">Twitter</a>
                  <a className="footer__link">Instagram</a>
                  <a className="footer__link">Facebook</a>
                </div>
              </div>
            </div>
            <div className="footer__divider" />
            <div className="footer__bottom">
              <div className="footer__copyright">
                © 2024 Jellycat Support. All rights reserved.
              </div>
              <div className="footer__legal">
                <a className="footer__legal-link">Privacy Policy</a>
                <a className="footer__legal-link">Terms of Service</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default LandingPage;