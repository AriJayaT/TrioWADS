import React from "react";
import PropTypes from "prop-types";
import "./StatsCard.css";

/**
 * StatsCard component displays a statistic with an icon and label
 * @component
 * @param {Object} props
 * @param {string} props.icon - Emoji or icon to display
 * @param {number} props.count - The statistic value to display
 * @param {string} props.label - Description of the statistic
 * @returns {React.ReactElement}
 */
export function StatsCard({ icon, count, label }) {
  return (
    <div className="stats-card">
      <div className="stats-header">
        <div className="stats-icon">{icon}</div>
        <div className="stats-count">{count}</div>
      </div>
      <div className="stats-label">{label}</div>
    </div>
  );
}

StatsCard.propTypes = {
  /** Emoji or icon to display */
  icon: PropTypes.string.isRequired,
  /** The statistic value to display */
  count: PropTypes.number.isRequired,
  /** Description of the statistic */
  label: PropTypes.string.isRequired,
};
