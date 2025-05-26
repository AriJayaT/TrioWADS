import React, { useEffect, useState } from "react";
import axios from "axios";

const TopAgents = () => {
  const [agents, setAgents] = useState([]);
  const [error, setError] = useState(null);

  const fetchAgents = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/users/agents", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const processed = (res.data?.agents || [])
        .map((agent) => {
          const initials = agent.name
            .split(" ")
            .map((n) => n[0])
            .join("");

          const closedTickets = agent.assignedTickets.filter(
            (t) => t.status === "closed"
          ).length;

          return {
            name: agent.name,
            initials,
            ticketsResolved: closedTickets,
            avgResolution: "1h 20m", // placeholder
            rating: 4.5, // placeholder
          };
        })
        .sort((a, b) => b.ticketsResolved - a.ticketsResolved)
        .slice(0, 3); // Top 3

      setAgents(processed);
    } catch (err) {
      console.error("Failed to load top agents:", err.response?.data || err.message);
      setError("Could not load top agents");
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="bg-white p-6 rounded-2xl shadow w-full h-full min-h-[420px]">
      <h2 className="text-lg font-semibold mb-4">Top Performing Agents</h2>
      {agents.map((agent, idx) => (
        <div
          key={idx}
          className="flex items-center justify-between p-4 mb-2 border rounded-xl border-pink-100"
        >
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-pink-100 text-pink-600 font-bold flex items-center justify-center mr-4">
              {agent.initials}
            </div>
            <div>
              <div className="font-semibold">{agent.name}</div>
              <div className="text-sm text-gray-400">
                {agent.ticketsResolved} tickets resolved
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium">{agent.avgResolution}</div>
            <div className="text-xs text-gray-400">Avg Resolution</div>
          </div>
          <div className="text-pink-500 font-semibold ml-4">
            {agent.rating} ★
          </div>
        </div>
      ))}
    </div>
  );
};

export default TopAgents;
