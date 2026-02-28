import { Router } from "express";
import { identifyContact } from "../services/identify.service";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const { email, phoneNumber } = req.body;
    if (!email && !phoneNumber) {
      return res.status(400).json({
        error: "Either email or phoneNumber must be provided",
      });
    }

    const result = await identifyContact(email, phoneNumber);

    return res.status(200).json({ contact: result });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
