import { getAllBrokers, getProductsByBrokerId } from "../models/brokerModel.js";

/**
 * Controller for retrieving the informational broker/platform directory.
 *
 * Endpoint: GET /api/brokers
 */
export const getBrokers = async (req, res) => {
  try {
    const brokers = await getAllBrokers();

    return res.status(200).json({
      success: true,
      brokers,
    });
  } catch (error) {
    console.error("Error fetching brokers directory:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve brokers directory",
    });
  }
};

/**
 * Controller for retrieving verified products for a specific broker.
 *
 * Endpoint: GET /api/brokers/:id/products
 */
export const getBrokerProducts = async (req, res) => {
  try {
    const { id } = req.params;
    const brokerId = parseInt(id, 10);

    if (isNaN(brokerId) || brokerId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid broker ID specified",
      });
    }

    const products = await getProductsByBrokerId(brokerId);

    return res.status(200).json({
      success: true,
      brokerId,
      products,
    });
  } catch (error) {
    console.error(`Error fetching products for broker ${req.params.id}:`, error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve broker products",
    });
  }
};
