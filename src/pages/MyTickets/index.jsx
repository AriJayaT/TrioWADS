import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Header } from "../../components/SupportTickets/Header";
import { TicketModal } from "../../components/SupportTickets/TicketModal";
import { ChatWidget } from "../../components/SupportTickets/ChatWidget";
import "./styles.css";

const MOCK_TICKETS = [
  {
    id: "TK-2024-001",
    subject: "Missing Item from Order #JC45692",
    category: "Orders & Shipping",
    status: "Open",
    statusColor: "#FF9ECD",
    priority: "High",
    priorityColor: "#FF4B4B",
    lastUpdate: "2 hours ago",
    description:
      "Order arrived but missing one Bashful Bunny Medium. Order was placed on January 10th and received January 15th.",
    updates: [
      {
        message: "Ticket created",
        time: "2024-01-15 09:15 AM",
      },
      {
        message: "Support team reviewing order details",
        time: "2024-01-15 10:30 AM",
      },
    ],
  },
  {
    id: "TK-2024-002",
    subject: "Washing Instructions for Bashful Dragon",
    category: "Product Care",
    status: "Closed",
    statusColor: "#00C48C",
    priority: "Normal",
    priorityColor: "#FFB800",
    lastUpdate: "3 days ago",
    description:
      "Need specific washing instructions for the Bashful Dragon plush.",
    updates: [
      {
        message: "Ticket created",
        time: "2024-01-12 14:20 PM",
      },
      {
        message: "Care instructions provided",
        time: "2024-01-12 15:45 PM",
      },
    ],
  },
  {
    id: "TK-2024-003",
    subject: "Return Request for Damaged Item",
    category: "Returns",
    status: "In Progress",
    statusColor: "#FFB800",
    priority: "Normal",
    priorityColor: "#FFB800",
    lastUpdate: "1 day ago",
    description: "Received damaged item, requesting return and replacement.",
    updates: [
      {
        message: "Return request submitted",
        time: "2024-01-14 11:30 AM",
      },
      {
        message: "Processing return request",
        time: "2024-01-14 13:15 PM",
      },
    ],
  },
];

const MyTickets = () => {
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [lastFocusedElement, setLastFocusedElement] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");

  const toggleModal = (ticket = null) => {
    if (!showModal) {
      setLastFocusedElement(document.activeElement);
      setSelectedTicket(ticket);
      setShowModal(true);
    } else {
      setSelectedTicket(null);
      setShowModal(false);
      if (lastFocusedElement) {
        lastFocusedElement.focus();
      }
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Escape") {
      toggleModal();
    }
  };

  useEffect(() => {
    if (showModal) {
      document.addEventListener("keydown", handleKeyDown);
      return () => {
        document.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [showModal]);

  return (
    <div className="w-full bg-pink-50 min-h-screen">
      <Header />

      <div className="px-9 py-12 max-sm:px-4 max-sm:py-6">
        <div className="flex justify-between items-center mb-8">
          <div className="text-3xl font-bold leading-10 text-zinc-800 max-sm:text-2xl">
            My Tickets
          </div>
          <Link
            to="/submit-ticket"
            className="px-6 py-3 text-sm font-medium text-white bg-pink-300 rounded-2xl shadow-sm hover:bg-pink-400 transition-colors"
          >
            New Ticket
          </Link>
        </div>

        <div className="p-8 bg-white rounded-3xl shadow-lg max-sm:p-4">
          <div className="flex gap-4 mb-8 max-sm:flex-col">
            <input
              type="text"
              placeholder="Search tickets..."
              className="flex-1 px-4 text-sm rounded-xl border-2 border-pink-100 h-[49px] text-neutral-400"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <select
              className="text-sm text-black rounded-xl bg-zinc-300 h-[49px] w-[131px] max-sm:w-full px-4"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option>All Status</option>
              <option>Open</option>
              <option>In Progress</option>
              <option>Closed</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border border-pink-100">
                  <th className="py-4 text-sm font-medium text-left text-gray-500 px-4">
                    Ticket ID
                  </th>
                  <th className="py-4 text-sm font-medium text-left text-gray-500 px-4">
                    Subject
                  </th>
                  <th className="py-4 text-sm font-medium text-left text-gray-500 px-4">
                    Category
                  </th>
                  <th className="py-4 text-sm font-medium text-left text-gray-500 px-4">
                    Status
                  </th>
                  <th className="py-4 text-sm font-medium text-left text-gray-500 px-4">
                    Priority
                  </th>
                  <th className="py-4 text-sm font-medium text-left text-gray-500 px-4">
                    Last Update
                  </th>
                  <th className="py-4 text-sm font-medium text-left text-gray-500 px-4">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {MOCK_TICKETS.map((ticket) => (
                  <tr key={ticket.id} className="border border-pink-100">
                    <td className="py-6 text-sm text-zinc-800 px-4">
                      {ticket.id}
                    </td>
                    <td className="py-6 text-sm text-zinc-800 px-4">
                      {ticket.subject}
                    </td>
                    <td className="py-6 px-4">
                      <div className="px-3 py-0.5 text-sm text-pink-300 bg-pink-50 rounded-lg inline-block">
                        {ticket.category}
                      </div>
                    </td>
                    <td
                      className="py-6 text-sm font-medium px-4"
                      style={{ color: ticket.statusColor }}
                    >
                      {ticket.status}
                    </td>
                    <td
                      className="py-6 text-sm px-4"
                      style={{ color: ticket.priorityColor }}
                    >
                      {ticket.priority}
                    </td>
                    <td className="py-6 text-sm text-gray-500 px-4">
                      {ticket.lastUpdate}
                    </td>
                    <td className="py-6 px-4">
                      <button
                        className="px-4 py-2 text-sm text-pink-300 bg-pink-50 rounded-lg hover:bg-pink-100 transition-colors"
                        onClick={() => toggleModal(ticket)}
                        aria-controls="ticket-modal"
                        aria-expanded={showModal}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showModal && (
        <TicketModal ticket={selectedTicket} onClose={() => toggleModal()} />
      )}

      <ChatWidget maxMessageLength={500} maxMessages={50} />
    </div>
  );
};

export default MyTickets;
