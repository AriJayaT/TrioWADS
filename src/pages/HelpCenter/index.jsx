"use client";
import * as React from "react";
import { useState } from "react";
import "./styles.css";

function HelpCenterPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [articles, setArticles] = useState([
    {
      id: 1,
      title: "How to Clean Your Jellycat Plush",
      category: "Care",
      views: 2341,
    },
    {
      id: 2,
      title: "Return Policy Overview",
      category: "Policy",
      views: 1567,
    },
    {
      id: 3,
      title: "Password Reset Guide",
      category: "Account",
      views: 987,
    },
    {
      id: 4,
      title: "Shipping Information",
      category: "Shipping",
      views: 1234,
    },
  ]);

  const filteredArticles = () => {
    return articles.filter((article) => {
      const matchesSearch = article.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === "All" || article.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  };

  return (
    <div className="help-center">
      <div className="help-center-container">
        <header className="header">
          <div className="header-left">
            <div className="logo-container">
              <div className="logo" />
              <div>Jellycat Support</div>
            </div>
            <nav className="nav-links">
              <div>Home</div>
              <div>Help Center</div>
            </nav>
          </div>
          <div className="auth-buttons">
            <button className="sign-in-btn">Sign In</button>
            <button className="get-started-btn">Get Started</button>
          </div>
        </header>

        <section className="hero-section">
          {/* Local image placeholder */}
          <div className="hero-image" alt="Help Center Banner" />
          <h1 className="hero-title">Help Center</h1>
          <p className="hero-description">
            Find answers to common questions about your Jellycat plush companions.
            Browse our comprehensive guides or search for specific topics.
          </p>
          <input
            type="text"
            className="search-input"
            placeholder="Search for help articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="category-filters">
            {["All", "Care", "Shipping", "Policy", "Account"].map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className="category-btn"
                style={{
                  backgroundColor:
                    selectedCategory === category
                      ? "rgba(255, 158, 205, 1)"
                      : "rgba(255, 245, 249, 1)",
                  color:
                    selectedCategory === category
                      ? "white"
                      : "rgba(255, 158, 205, 1)",
                }}
              >
                {category}
              </button>
            ))}
          </div>
        </section>

        <section className="articles-section">
          <div className="articles-grid">
            <div className="articles-row">
              {filteredArticles()
                .slice(0, 2)
                .map((article) => (
                  <div key={article.id} className="article-card">
                    <div className="article-meta">
                      <div className="article-category">{article.category}</div>
                      <div className="article-views">{article.views} views</div>
                    </div>
                    <h2 className="article-title">{article.title}</h2>
                    <div className="article-link">
                      <div>Read More</div>
                      <div>→</div>
                    </div>
                  </div>
                ))}
            </div>
            {filteredArticles().slice(2).map((article) => (
              <div key={article.id} className="article-card" style={{ marginTop: '24px' }}>
                <div className="article-meta">
                  <div className="article-category">{article.category}</div>
                  <div className="article-views">{article.views} views</div>
                </div>
                <h2 className="article-title">{article.title}</h2>
                <div className="article-link">
                  <div>Read More</div>
                  <div>→</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="divider" />

        <section className="contact-section">
          <div className="contact-container">
            <h2 className="contact-title">Still Need Help?</h2>
            <p className="contact-description">
              Can't find what you're looking for? Our support team is here to help.
            </p>
            <div className="contact-buttons">
              <button className="contact-support-btn">Contact Support</button>
              <button className="submit-ticket-btn">Submit Ticket</button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default HelpCenterPage;