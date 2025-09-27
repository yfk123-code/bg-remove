const axios = require('axios');

exports.handler = async (event) => {
    try {
        if (event.httpMethod !== 'POST') {
            return { statusCode: 405, body: 'Method Not Allowed' };
        }

        const body = JSON.parse(event.body);
        const base64Image = body.image;

        // 🔐 API KEY FROM ENVIRONMENT VARIABLE
        const apiKey = process.env.REMOVE_BG_API_KEY;

        if (!apiKey) {
            return {
                statusCode: 500,
                body: JSON.stringify({ success: false, error: 'API Key not configured' })
            };
        }

        const response = await axios.post(
            'https://api.remove.bg/v1.0/removebg',
            {
                image_file_b64: base64Image,
                size: 'auto'
            },
            {
                headers: {
                    'X-Api-Key': apiKey, // ✅ Now from env!
                    'Content-Type': 'application/json'
                },
                responseType: 'arraybuffer'
            }
        );

        const bufferToBase64 = Buffer.from(response.data, 'binary').toString('base64');

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                success: true,
                image: bufferToBase64
            })
        };

    } catch (error) {
        console.error('Server Error:', error.message);
        return {
            statusCode: 500,
            body: JSON.stringify({ success: false, error: error.message })
        };
    }
};
