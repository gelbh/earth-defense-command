import nasaService from '../services/nasaService.js';

export const getExoplanets = async (req, res) => {
  try {
    const { where, order, limit = 50, offset = 0 } = req.query;
    const params = {
      limit: parseInt(limit),
      offset: parseInt(offset)
    };

    if (where) {
      params.where = where;
    }

    if (order) {
      params.order = order;
    }

    const [exoplanets, total] = await Promise.all([
      nasaService.getExoplanets(params),
      nasaService.getExoplanetCount({ where })
    ]);

    res.json({
      success: true,
      count: exoplanets.length,
      total,
      offset: params.offset,
      limit: params.limit,
      hasMore: params.offset + exoplanets.length < total,
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
    const { q, limit = 50, offset = 0 } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search term is required'
      });
    }

    const params = {
      limit: parseInt(limit),
      offset: parseInt(offset)
    };

    const [exoplanets, total] = await Promise.all([
      nasaService.searchExoplanets(q, params),
      nasaService.getSearchCount(q)
    ]);

    res.json({
      success: true,
      count: exoplanets.length,
      total,
      offset: params.offset,
      limit: params.limit,
      hasMore: params.offset + exoplanets.length < total,
      data: exoplanets
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
