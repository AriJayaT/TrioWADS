import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Header } from "../../components/SupportTickets/Header";
import "./styles.css";

function TicketSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const ticketNumber = location.state?.ticketNumber || "TK-2024-089";

  const handleViewTicket = () => {
    navigate(`/support-tickets?ticket=${ticketNumber}`);
  };

  const handleReturnToDashboard = () => {
    navigate("/support-tickets");
  };

  return (
    <div className="flex flex-col bg-pink-50 min-h-screen">
      <Header />

      <div className="flex relative flex-col flex-1 justify-center items-center">
        {/* Decorative background circles */}
        <div className="absolute bg-pink-100 rounded-3xl h-[141px] left-[233px] top-[50px] w-[141px] max-md:hidden" />
        <div className="absolute bg-pink-100 rounded-2xl h-[95px] right-[374px] top-[225px] w-[95px] max-md:hidden" />
        <div className="absolute bg-pink-100 rounded-3xl bottom-[233px] h-[142px] left-[497px] w-[142px] max-md:hidden" />

        <div className="relative">
          {/* Success Animation */}
          <div className="relative bg-white h-[300px] rounded-[33554400px] w-[300px]">
            <div
              className="absolute text-6xl bg-pink-100 shadow-lg h-[120px] leading-[90px] left-[195px] rounded-[33554400px] w-[120px] flex items-center justify-center"
              aria-hidden="true"
            >
              ✨
            </div>
            <div className="absolute top-px w-40 h-10 bg-pink-100 left-[175px] rounded-[33554400px]" />
          </div>

          {/* Success Message */}
          <h1 className="mt-6 text-3xl font-bold leading-10 text-center text-zinc-800">
            Magical Success! ✨
          </h1>
          <p className="mt-4 text-lg leading-7 text-center text-gray-500">
            Your ticket has been whisked away to our support fairies
          </p>

          {/* Ticket Details Card */}
          <div className="p-8 mt-6 bg-white rounded-3xl shadow-lg w-[557px] max-sm:w-[90%]">
            <div className="flex gap-4 items-center">
              <div className="w-12 h-12 text-2xl leading-9 bg-pink-100 rounded-[33554400px] flex items-center justify-center">
                🎫
              </div>
              <div>
                <div className="text-sm leading-5 text-gray-500">
                  Ticket Number
                </div>
                <div className="text-lg font-bold leading-7 text-zinc-800">
                  {ticketNumber}
                </div>
              </div>
            </div>

            {/* Response Time Notice */}
            <div className="p-4 mt-6 w-full text-center bg-pink-50 rounded-2xl">
              <div className="text-sm leading-5 text-gray-500">
                Our support team will sprinkle some magic and get back to you
                within
              </div>
              <div className="mt-1 text-base font-bold leading-6 text-pink-300">
                ✨ 24 magical hours ✨
              </div>
            </div>

            {/* Information Points */}
            <div className="flex flex-col gap-3 items-center mt-6">
              <div className="flex gap-2 items-center">
                <div className="w-1.5 h-1.5 bg-pink-300 rounded-[33554400px]" />
                <div className="text-sm leading-5 text-gray-500">
                  Track your ticket in the dashboard
                </div>
              </div>
              <div className="flex gap-2 items-center">
                <div className="w-1.5 h-1.5 bg-pink-300 rounded-[33554400px]" />
                <div className="text-sm leading-5 text-gray-500">
                  We'll send updates to your email
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-center items-center mt-8">
              <button
                onClick={handleViewTicket}
                className="text-sm leading-5 text-gray-500 bg-white rounded-xl border-2 border-pink-100 h-[49px] w-[129px] hover:bg-pink-50 transition-colors"
              >
                View Ticket
              </button>
              <button
                onClick={handleReturnToDashboard}
                className="text-sm font-medium leading-5 text-white bg-pink-300 rounded-xl shadow-sm h-[49px] w-[185px] hover:bg-pink-400 transition-colors"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TicketSuccess;
