const axios = require('axios');

/**
 * Sends a temporary test SMS using Notilify.
 * 
 * @param {string} phoneNumber - The manually specified phone number
 * @returns {Promise<Object>} - The full response from Notilify API
 */
const sendTestSMS = async (phoneNumber) => {
    const apiKey = process.env.NOTILIFY_API_KEY;
    const senderId = process.env.NOTILIFY_SENDER_ID || 'RESQ';

    console.log("Using Sender:", senderId);
    console.log("Sending SMS to:", phoneNumber);

    try {
        console.log("SENDER:", process.env.NOTILIFY_SENDER_ID);
        const response = await axios.post(
            'https://api.notilify.com/v1/message/',
            {
                phoneNumber: phoneNumber,
                message: "🚨 RESQLINK TEST ALERT\n\nIf you received this message, the Notilify integration is working correctly."
            },
            {
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log("Notilify Response:", response.data);
        return response.data;
    } catch (error) {
        if (error.response) {
            console.log("STATUS:", error.response.status);
            console.log("FULL RESPONSE:", JSON.stringify(error.response.data, null, 2));
        } else {
            console.log(error);
        }
        throw error;
    }
};

module.exports = { sendTestSMS };
