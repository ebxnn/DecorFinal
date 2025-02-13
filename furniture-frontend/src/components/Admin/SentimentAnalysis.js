import React, { useState } from "react";
import axios from "axios";
import { FaBox, FaDollarSign, FaSmile, FaTrophy } from "react-icons/fa";
import AdminSidebar from "./AdminSidebar";

const SentimentAnalysis = () => {
  const [sentimentData, setSentimentData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [customPrompts, setCustomPrompts] = useState(""); // Multi-line input

  // Function to fetch sentiment analysis
  const fetchSentiment = async () => {
    setLoading(true);
    setError("");
    
    const promptsArray = customPrompts.split("\n").map((p) => p.trim()).filter(Boolean);
    if (promptsArray.length === 0) {
      setError("Please enter at least one prompt.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/api/sentiment/analyze", {
        prompts: promptsArray, // Send multiple prompts
      });
      setSentimentData(response.data);
    } catch (err) {
      setError("Failed to fetch sentiment analysis");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex bg-gray-100 min-h-screen">
      <AdminSidebar />
      <div className="ml-64 p-8 w-full">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">📊 Order Sentiment Analysis</h2>

        {/* Multi-line Prompt Input */}
        <div className="mb-6">
          <textarea
            className="p-2 border border-gray-300 rounded-md w-full h-32"
            placeholder="Enter multiple prompts, one per line"
            value={customPrompts}
            onChange={(e) => setCustomPrompts(e.target.value)}
          />
        </div>

        <button
          className="bg-blue-500 text-white p-2 rounded-md"
          onClick={fetchSentiment}
          disabled={loading || !customPrompts}
        >
          Analyze
        </button>

        {loading ? (
          <p className="text-gray-700 text-lg">Loading sentiment analysis...</p>
        ) : error ? (
          <p className="text-red-500 text-lg">{error}</p>
        ) : sentimentData ? (
          <div className="mt-6">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">Order Summary</h3>
            <p className="text-gray-600">Total Orders: {sentimentData.totalOrders}</p>
            <p className="text-gray-600">Total Revenue: ₹{sentimentData.totalRevenue.toFixed(2)}</p>
            <p className="text-gray-600">Most Ordered Product: {sentimentData.mostOrderedProduct}</p>
            <p className="text-gray-600">Least Ordered Product: {sentimentData.leastOrderedProduct}</p>

            <h3 className="text-xl font-semibold text-gray-700 mt-6">Sentiment Analysis</h3>
            {sentimentData.analysis.map((result, index) => (
              <div key={index} className="bg-white shadow-md p-6 rounded-lg mt-4">
                <h4 className="text-lg font-semibold text-gray-800">Prompt: {result.prompt}</h4>
                <ul className="list-disc pl-6 text-gray-700 mt-2">
                  {result.sentiment.map((point, i) => (
                    <li key={i}>{point}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default SentimentAnalysis;
