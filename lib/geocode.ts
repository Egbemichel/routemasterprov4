// lib/geocode.ts

export const getCountryFromAddress = async (address: string): Promise<string | null> => {
    const apiKey = '7d09c3a21f4746d2a447fe2fdcd6bf66'
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(address)}&key=${apiKey}`;

    try {
        const res = await fetch(url);
        const data = await res.json();

        if (data?.results?.length > 0) {
            return data.results[0].components.country || null;
        }

        return null;
    } catch (err) {
        console.error("OpenCage Error:", err);
        return null;
    }
};
