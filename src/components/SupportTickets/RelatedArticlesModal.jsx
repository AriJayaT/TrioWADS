import React from 'react';
import PropTypes from 'prop-types';
import './SubmitTicket.css';

/**
 * Confirmation modal that displays related articles before finalizing ticket submission
 */
const RelatedArticlesModal = ({ 
  isOpen, 
  ticketSubject, 
  onSubmit, 
  onCancel,
  relatedArticles 
}) => {
  if (!isOpen) return null;

  return (
    <div className="submit-ticket__modal-overlay">
      <div className="submit-ticket__modal submit-ticket__confirmation-modal">
        <div className="submit-ticket__modal-header">
          <h3 className="submit-ticket__modal-title">
            Before You Submit Your Ticket
          </h3>
          <button
            className="submit-ticket__modal-close"
            onClick={onCancel}
            aria-label="Close confirmation modal"
          >
            ×
          </button>
        </div>

        <div className="submit-ticket__modal-content">
          <p className="submit-ticket__confirmation-text">
            We found these articles that might help with your issue about:
          </p>
          <div className="submit-ticket__ticket-subject">"{ticketSubject}"</div>
          
          <div className="submit-ticket__related-articles">
            {relatedArticles.length > 0 ? (
              relatedArticles.map((article, index) => (
                <div key={index} className="submit-ticket__related-article">
                  <div className="submit-ticket__article-category">{article.category}</div>
                  <h4 className="submit-ticket__article-title">{article.title}</h4>
                  <p className="submit-ticket__article-excerpt">{article.excerpt}</p>
                  <a href={article.url} className="submit-ticket__article-link" target="_blank" rel="noopener noreferrer">
                    Read Full Article →
                  </a>
                </div>
              ))
            ) : (
              <p className="submit-ticket__no-articles">No related articles found.</p>
            )}
          </div>
          
          <p className="submit-ticket__confirmation-question">
            Do you still want to submit this ticket?
          </p>
        </div>

        <div className="submit-ticket__modal-actions">
          <button 
            className="submit-ticket__button submit-ticket__button--secondary"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button 
            className="submit-ticket__button submit-ticket__button--primary"
            onClick={onSubmit}
          >
            Submit Ticket
          </button>
        </div>
      </div>
    </div>
  );
};

RelatedArticlesModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  ticketSubject: PropTypes.string.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  relatedArticles: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      category: PropTypes.string.isRequired,
      excerpt: PropTypes.string.isRequired,
      url: PropTypes.string.isRequired,
    })
  ).isRequired,
};

export default RelatedArticlesModal;