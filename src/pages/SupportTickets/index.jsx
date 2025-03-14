import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Header } from "../../components/SupportTickets/Header";
import { StatsCard } from "../../components/SupportTickets/StatsCard";
import { TicketsTable } from "../../components/SupportTickets/TicketsTable";
import { TicketModal } from "../../components/SupportTickets/TicketModal";
import { ChatWidget } from "../../components/SupportTickets/ChatWidget";
import "./styles.css";

const MOCK_TICKETS = [
  {
    id: "TK-2024-001",
    subject: "Missing Item from Order",
    category: "Orders & Shipping",
    status: "Open",
    statusColor: "#FF9ECD",
    priority: "High",
    priorityColor: "#FF4B4B",
    lastUpdate: "2 hours ago",
  },
  {
    id: "TK-2024-002",
    subject: "Washing Instructions",
    category: "Product Care",
    status: "Closed",
    statusColor: "#00C48C",
    priority: "Normal",
    priorityColor: "#6C7781",
    lastUpdate: "3 days ago",
  },
  {
    id: "TK-2024-003",
    subject: "Return Request",
    category: "Returns",
    status: "In Progress",
    statusColor: "#FFB800",
    priority: "Normal",
    priorityColor: "#6C7781",
    lastUpdate: "1 day ago",
  },
];

const STATS = [
  { icon: "📫", count: 3, label: "Total Tickets" },
  { icon: "🔔", count: 1, label: "Open Tickets" },
  { icon: "✅", count: 2, label: "Resolved Tickets" },
];

const SupportTickets = () => {
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const toggleModal = (ticket = null) => {
    if (!showModal) {
      setSelectedTicket(ticket);
      setShowModal(true);
    } else {
      setSelectedTicket(null);
      setShowModal(false);
    }
  };

  return (
    <div className="w-full bg-pink-50 min-h-screen">
      <Header />

      <main className="px-9 py-12 max-sm:px-4 max-sm:py-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold leading-10 text-zinc-800 max-sm:text-2xl">
            Support Tickets
          </h1>
          <Link
            to="/submit-ticket"
            className="px-4 py-3 text-sm font-medium leading-5 text-white bg-pink-300 rounded-2xl shadow-sm hover:bg-pink-400 transition-colors"
          >
            New Ticket
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-6 mb-12 max-md:grid-cols-2 max-sm:grid-cols-1">
          {STATS.map((stat, index) => (
            <StatsCard
              key={index}
              icon={stat.icon}
              count={stat.count}
              label={stat.label}
            />
          ))}
        </div>

        <section className="p-8 bg-white rounded-3xl shadow-lg max-sm:p-4">
          <h2 className="mb-6 text-xl font-bold leading-8 text-zinc-800">
            Recent Tickets
          </h2>
          <div className="overflow-x-auto">
            <TicketsTable tickets={MOCK_TICKETS} onViewDetails={toggleModal} />
          </div>
        </section>
      </main>

      {showModal && (
        <TicketModal ticket={selectedTicket} onClose={() => toggleModal()} />
      )}

      <ChatWidget maxMessageLength={500} maxMessages={50} />
    </div>
  );
};

export default SupportTickets;
