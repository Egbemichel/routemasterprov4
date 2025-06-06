import type { NextApiRequest, NextApiResponse } from 'next';
import FormData from 'form-data';
import fetch from 'node-fetch'; // if using Node 18+, fetch is global; else install node-fetch

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { imageBase64 } = req.body;
        if (!imageBase64) {
            return res.status(400).json({ error: 'Missing imageBase64 in request body' });
        }

        const apiKey = process.env.NEXT_PUBLIC_FREE_IMAGE_HOST_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: 'Missing API key' });
        }

        const formData = new FormData();
        formData.append('key', apiKey);
        formData.append('source', imageBase64);
        formData.append('format', 'json');

        const uploadRes = await fetch('https://freeimage.host/api/1/upload', {
            method: 'POST',
            body: formData as any, // casting because types can mismatch
            headers: formData.getHeaders(),
        });

        if (!uploadRes.ok) {
            const text = await uploadRes.text();
            return res.status(500).json({ error: `Upload failed: ${text}` });
        }

        const uploadData:any = await uploadRes.json();

        if (!uploadData || !uploadData.image || !uploadData.image.display_url) {
            return res.status(500).json({ error: 'Invalid upload response' });
        }

        return res.status(200).json({ url: uploadData.image.display_url });
    } catch (error) {
        console.error('Upload API error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
