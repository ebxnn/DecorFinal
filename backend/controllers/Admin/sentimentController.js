import axios from "axios";
import dotenv from "dotenv";
import Order from "../../models/Order.js"; // Order Model

dotenv.config();

/**
 * @desc Analyze Order Data and Generate Sentiment
 * @route GET /api/sentiment/analyze
 * @access Private (Admin)
 */
export const analyzeOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate("items.product", "name price");

    if (orders.length === 0) {
      return res.status(404).json({ message: "No orders found" });
    }

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const productCounts = {};

    orders.forEach(order => {
      order.items.forEach(item => {
        if (item.product && item.product.name) {
          const productName = item.product.name;
          productCounts[productName] = (productCounts[productName] || 0) + 1;
        }
      });
    });

    const mostOrderedProduct = Object.keys(productCounts).reduce(
      (a, b) => productCounts[a] > productCounts[b] ? a : b,
      "None"
    );

    const prompt = `
      Analyze the sentiment of the following order data:
      - Total Orders: ${totalOrders}
      - Total Revenue: ₹${totalRevenue.toFixed(2)}
      - Most Ordered Product: ${mostOrderedProduct}
      Provide a structured bullet-point analysis of the sentiment based on this data.
    `;

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent`,
      {
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GOOGLE_API_KEY,
        },
      }
    );

    const sentiment = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "Neutral";

    res.json({
      totalOrders,
      totalRevenue,
      mostOrderedProduct,
      sentiment: sentiment.split("\n").map(point => point.trim()).filter(Boolean), // Convert response into bullet points
    });

  } catch (error) {
    console.error("Error analyzing order sentiment:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to analyze orders" });
  }
};
