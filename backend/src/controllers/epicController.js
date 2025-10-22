import nasaService from '../services/nasaService.js';
import axios from 'axios';

export const getLatestEarthImage = async (req, res) => {
  try {
    const earthImage = await nasaService.getLatestEarthImage();
    
    if (!earthImage) {
      return res.status(404).json({
        success: false,
        message: 'No Earth images available'
      });
    }

    // Return proxied URL instead of direct NASA URL to avoid CORS
    const proxiedImage = {
      ...earthImage,
      imageUrl: `/api/epic/proxy?url=${encodeURIComponent(earthImage.imageUrl)}`
    };

    res.json({
      success: true,
      image: proxiedImage
    });
  } catch (error) {
    console.error('Error fetching Earth image:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch Earth image',
      error: error.message
    });
  }
};

// CORS proxy for NASA images
export const proxyImage = async (req, res) => {
  try {
    const { url } = req.query;
    
    if (!url) {
      return res.status(400).json({
        success: false,
        message: 'URL parameter is required'
      });
    }

    // Fetch the image from NASA
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      headers: {
        'User-Agent': 'Earth-Defense-Command-Game/1.0'
      }
    });

    // Set appropriate headers
    res.set('Content-Type', response.headers['content-type'] || 'image/png');
    res.set('Cache-Control', 'public, max-age=600'); // Cache for 10 minutes
    res.send(response.data);
  } catch (error) {
    console.error('Error proxying image:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to proxy image'
    });
  }
};

export const getEarthImages = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const epicData = await nasaService.getEPICImages();
    
    if (!epicData || epicData.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No Earth images available'
      });
    }

    // Format and limit the images
    const images = epicData.slice(0, parseInt(limit)).map(image => ({
      id: image.identifier,
      date: image.date,
      caption: image.caption,
      imageUrl: `https://epic.gsfc.nasa.gov/archive/natural/${image.date.split(' ')[0].replace(/-/g, '/')}/png/${image.image}.png`
    }));

    res.json({
      success: true,
      images: images,
      count: images.length
    });
  } catch (error) {
    console.error('Error fetching Earth images:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch Earth images',
      error: error.message
    });
  }
};
