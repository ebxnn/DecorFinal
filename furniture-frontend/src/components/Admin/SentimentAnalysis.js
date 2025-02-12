import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaBox, FaDollarSign, FaSmile, FaTrophy } from "react-icons/fa";
import AdminSidebar from "./AdminSidebar";

const SentimentAnalysis = () => {
  const [sentimentData, setSentimentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeSection, setActiveSection] = useState("sentiment"); // Track active sidebar section

  useEffect(() => {
    const fetchSentiment = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/sentiment/analyze");
        setSentimentData(response.data);
      } catch (err) {
        setError("Failed to fetch sentiment analysis");
      } finally {
        setLoading(false);
      }
    };

    fetchSentiment();
  }, []);

  return (
    <div className="flex bg-gray-100 min-h-screen">
      {/* Sidebar */}
      <AdminSidebar activeSection={activeSection} setActiveSection={setActiveSection} />

      {/* Main Content */}
      <div className="ml-64 p-8 w-full">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">📊 Order Sentiment Analysis</h2>

        {loading ? (
          <p className="text-gray-700 text-lg">Loading sentiment analysis...</p>
        ) : error ? (
          <p className="text-red-500 text-lg">{error}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Total Orders */}
            <div className="bg-white shadow-md p-6 rounded-lg flex items-center space-x-4">
              <FaBox className="text-blue-500 text-3xl" />
              <div>
                <p className="text-gray-600">Total Orders</p>
                <h3 className="text-xl font-semibold">{sentimentData.totalOrders}</h3>
              </div>
            </div>

            {/* Total Revenue */}
            <div className="bg-white shadow-md p-6 rounded-lg flex items-center space-x-4">
              <FaDollarSign className="text-green-500 text-3xl" />
              <div>
                <p className="text-gray-600">Total Revenue</p>
                <h3 className="text-xl font-semibold">₹{sentimentData.totalRevenue.toFixed(2)}</h3>
              </div>
            </div>

            {/* Most Ordered Product */}
            <div className="bg-white shadow-md p-6 rounded-lg flex items-center space-x-4">
              <FaTrophy className="text-yellow-500 text-3xl" />
              <div>
                <p className="text-gray-600">Most Ordered Product</p>
                <h3 className="text-xl font-semibold">{sentimentData.mostOrderedProduct}</h3>
              </div>
            </div>

            {/* Sentiment Analysis */}
            <div className="bg-white shadow-md p-6 rounded-lg md:col-span-3">
              <div className="flex items-center space-x-4 mb-4">
                <FaSmile className="text-purple-500 text-3xl" />
                <h3 className="text-xl font-semibold text-gray-700">Overall Sentiment</h3>
              </div>
              <ul className="list-disc pl-6 text-gray-700">
                <li><strong>📦 Total Orders:</strong> {sentimentData.totalOrders} - Indicates strong demand and customer satisfaction.</li>
                <li><strong>💰 Total Revenue:</strong> ${sentimentData.totalRevenue.toFixed(2)} - Reflects high customer spending & confidence.</li>
                <li><strong>🏆 Most Ordered Product:</strong> {sentimentData.mostOrderedProduct} - A popular choice among customers.</li>
                <li><strong>📈 Sentiment:</strong> {sentimentData.sentiment} - Business appears to be thriving with strong customer trust.</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SentimentAnalysis;
