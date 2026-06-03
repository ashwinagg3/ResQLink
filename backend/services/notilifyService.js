const axios = require('axios');

/**
 * Sends an emergency SMS using Notilify to a list of contacts.
 * Each contact is notified individually.
 * 
 * @param {Array} contacts - Array of contact objects containing phone numbers and names
 * @param {string} message - The SOS message content to send
 * @returns {Promise<Array>} - Array of results for each contact delivery attempt
 */
const sendEmergencySMS = async (contacts, message) => {
    const apiKey = process.env.NOTILIFY_API_KEY;
    const senderId = process.env.NOTILIFY_SENDER_ID || 'RESQ';

    if (!apiKey) {
        console.warn('Notilify API key is missing in environment variables.');
        return null;
    }

    const validContacts = contacts.filter(contact => contact.phone && contact.phone.trim() !== '');

    if (validContacts.length === 0) {
        console.warn('No valid phone numbers found for emergency contacts.');
        return null;
    }

    console.log(`Sending emergency SMS to ${validContacts.length} contacts individually via Notilify...`);
    const results = [];

    for (const contact of validContacts) {
        const contactName = contact.name || 'Emergency Contact';
        const phoneNumber = contact.phone.trim();

        try {
            const response = await axios.post(
                'https://api.notilify.com/v1/message/demo',
                {
                    phoneNumber: phoneNumber,
                    message: message
                },
                {
                    headers: {
                        'Authorization': `Bearer ${apiKey}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log(`SMS SENT:\n${contactName}\n${phoneNumber}`);
            results.push({
                contactName,
                phoneNumber,
                success: true,
                response: response.data
            });
        }
        catch (error) {
            console.error("========== SMS ERROR ==========");
            console.error("Contact:", phoneNumber);

            if (error.response) {
                console.error("STATUS:", error.response.status);
                console.error("DATA:", JSON.stringify(error.response.data, null, 2));
            } else {
                console.error(error.message);
            }

            throw error;
        }
    }

    return results;
};

module.exports = { sendEmergencySMS };

