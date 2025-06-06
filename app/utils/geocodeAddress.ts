import axios from 'axios';


export const geocodeAddress = async (address:string) => {

    const endpoint = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(address)}&apiKey=bdb042532b5145e38b6f6c3f7c9db544`;

    try {
        const response = await axios.get(endpoint);
        const data = response.data;

        if (data.features.length > 0) {
            const { lat, lon } = data.features[0].properties;
            return { lat, lng: lon };
        } else {
            throw new Error('Address not found');
        }
    } catch (error) {
        console.error(error);
        return null;
    }
};