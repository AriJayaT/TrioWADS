import React from 'react';
import PropTypes from 'prop-types';

export const TicketsTable = ({ tickets = [], onViewDetails }) => {
  return (
    <div className="table-container">
      <table className="tickets-table">
        <thead>
          <tr className="table-header">
            <th>Ticket ID</th>
            <th>Subject</th>
            <th>Category</th>
            <th>Status</th>
            <th>Priority</th>
            <th>Last Update</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((ticket) => (
            <tr key={ticket.id} className="table-row">
              <td className="table-cell">{ticket.id}</td>
              <td className="table-cell">{ticket.subject}</td>
              <td className="table-cell">
                <div className="category-badge">{ticket.category}</div>
              </td>
              <td className="table-cell">
                <div className={`status-${ticket.status.toLowerCase()}`}>
                  {ticket.status}
                </div>
              </td>
              <td className="table-cell">
                <div className={`priority-${ticket.priority.toLowerCase()}`}>
                  {ticket.priority}
                </div>
              </td>
              <td className="table-cell">{ticket.lastUpdate}</td>
              <td className="table-cell">
                <button
                  className="view-details-btn"
                  onClick={() => onViewDetails(ticket)}
                  aria-controls="ticket-modal"
                  aria-expanded="false"
                >
                  View Details
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

TicketsTable.propTypes = {
  tickets: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      subject: PropTypes.string.isRequired,
      category: PropTypes.string.isRequired,
      status: PropTypes.string.isRequired,
      priority: PropTypes.string.isRequired,
      lastUpdate: PropTypes.string.isRequired,
    })
  ),
  onViewDetails: PropTypes.func.isRequired,
};