export const checkHealth = (req, res) => {
    try {
      return res.status(200).json({ success: true, message: "Healthy" });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  };
  