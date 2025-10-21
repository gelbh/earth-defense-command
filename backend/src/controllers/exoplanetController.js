import nasaService from '../services/nasaService.js';

export const getExoplanets = async (req, res) => {
  try {
    const { where, order } = req.query;
    const params = {};

    if (where) {
      params.where = where;
    }

    if (order) {
      params.order = order;
    }

    const exoplanets = await nasaService.getExoplanets(params);

    res.json({
      success: true,
      count: exoplanets.length,
      data: exoplanets
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const searchExoplanets = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search term is required'
      });
    }

    const exoplanets = await nasaService.searchExoplanets(q);

    res.json({
      success: true,
      count: exoplanets.length,
      data: exoplanets
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
