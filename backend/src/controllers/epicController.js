import nasaService from '../services/nasaService.js';

export const getLatestEarthImage = async (req, res) => {
  try {
    const earthImage = await nasaService.getLatestEarthImage();
    
    if (!earthImage) {
      return res.status(404).json({
        success: false,
        message: 'No Earth images available'
      });
    }

    res.json({
      success: true,
      image: earthImage
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
