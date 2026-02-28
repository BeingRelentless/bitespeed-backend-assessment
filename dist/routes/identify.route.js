"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const identify_service_1 = require("../services/identify.service");
const router = (0, express_1.Router)();
router.post("/", async (req, res) => {
    try {
        const { email, phoneNumber } = req.body;
        if (!email && !phoneNumber) {
            return res.status(400).json({
                error: "Either email or phoneNumber must be provided",
            });
        }
        const result = await (0, identify_service_1.identifyContact)(email, phoneNumber);
        return res.status(200).json({ contact: result });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error" });
    }
});
exports.default = router;
