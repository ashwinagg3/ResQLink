const express = require('express');
const router = express.Router();
const { sendTestSMS } = require('../services/testSmsService');

router.post('/', async (req, res) => {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
        return res.status(400).json({
            success: false,
            error: "phoneNumber is required"
        });
    }

    try {
        const responseData = await sendTestSMS(phoneNumber);
        return res.status(200).json({
            success: true,
            response: responseData
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
