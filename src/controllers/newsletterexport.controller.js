const newsletterExportService = require('../services/newsletterExport.Service');

/**
 * Export newsletter subscribers (ADMIN ONLY)
 * GET /api/gdpr/export/newsletter
 */
const exportNewsletterSubscribers = async (req, res) => {
  try {
    // TODO: Add admin check middleware
    // if (!req.user.is_admin) {
    //   return res.status(403).json({
    //     success: false,
    //     message: 'Accès refusé - Administrateur uniquement'
    //   });
    // }

    const result = await newsletterExportService.exportNewsletterSubscribers();

    res.status(200).json({
      success: true,
      message: `${result.count} abonné(s) à la newsletter`,
      data: result.data
    });
  } catch (error) {
    console.error('Error exporting newsletter subscribers:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de l\'export des abonnés'
    });
  }
};

/**
 * Get newsletter subscription statistics
 * GET /api/gdpr/export/newsletter/stats
 */
const getNewsletterStats = async (req, res) => {
  try {
    // TODO: Add admin check middleware

    const result = await newsletterExportService.getNewsletterStats();

    res.status(200).json({
      success: true,
      data: result.data
    });
  } catch (error) {
    console.error('Error getting newsletter stats:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la récupération des statistiques'
    });
  }
};

module.exports = {
  exportNewsletterSubscribers,
  getNewsletterStats
};