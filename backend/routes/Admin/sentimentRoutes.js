import express from "express";
import { analyzeOrders } from "../../controllers/Admin/sentimentController.js"; // Import Controller

const router = express.Router();

// Route for Order Sentiment Analysis
router.post("/analyze", analyzeOrders);

export default router;
