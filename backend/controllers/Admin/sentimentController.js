import axios from "axios";
import dotenv from "dotenv";
import Order from "../../models/Order.js";

dotenv.config();

export const analyzeOrders = async (req, res) => {
  try {
    const { prompts } = req.body; // Accept an array of prompts
    if (!Array.isArray(prompts) || prompts.length === 0) {
      return res.status(400).json({ error: "Invalid prompts array" });
    }

    const orders = await Order.find().populate("items.product", "name price");
    if (orders.length === 0) {
      return res.status(404).json({ message: "No orders found" });
    }

    // Order Data Calculations
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

    // Most and Least Ordered Products
    const mostOrderedProduct = Object.keys(productCounts).reduce(
      (a, b) => (productCounts[a] > productCounts[b] ? a : b),
      "None"
    );
    const leastOrderedProduct = Object.keys(productCounts).reduce(
      (a, b) => (productCounts[a] < productCounts[b] ? a : b),
      "None"
    );

    // Prepare responses for all prompts
    const responses = await Promise.all(
      prompts.map(async (prompt) => {
        const aiPrompt = `
          ${prompt}
          Here is the data:
          - Total Orders: ${totalOrders}
          - Total Revenue: ₹${totalRevenue.toFixed(2)}
          - Most Ordered Product: ${mostOrderedProduct}
          - Least Ordered Product: ${leastOrderedProduct}
        `;

        try {
          const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent`,
            {
              contents: [{ role: "user", parts: [{ text: aiPrompt }] }],
            },
            {
              headers: {
                "Content-Type": "application/json",
                "x-goog-api-key": process.env.GOOGLE_API_KEY,
              },
            }
          );

          const sentiment = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "Neutral";

          return {
            prompt,
            sentiment: sentiment.split("\n").map(point => point.trim()).filter(Boolean),
          };
        } catch (error) {
          console.error("Error analyzing sentiment for prompt:", prompt, error.response?.data || error.message);
          return { prompt, sentiment: ["Error processing this prompt"] };
        }
      })
    );

    res.json({
      totalOrders,
      totalRevenue,
      mostOrderedProduct,
      leastOrderedProduct,
      analysis: responses, // Array of results for each prompt
    });

  } catch (error) {
    console.error("Error analyzing order sentiment:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to analyze orders" });
  }
};

