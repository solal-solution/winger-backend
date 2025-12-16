const crypto = require('crypto');
const { ProfileAide, GdprAide, User, GdprConsent, ProfileAidant } = require('../models');
const { Op } = require('sequelize');
const { sendAideConsentRequestEmail, sendAidantConsentConfirmationEmail, sendAidantConsentRejectionEmail } = require('../utils/mail');

/**
 * Request consent from Aidé
 */
const requestAideConsent = async (aidantId, emailAide) => {
  try {
    // Check if email exists in ProfileAides (already accepted)
    const existingProfileAide = await ProfileAide.findOne({
      where: { email: emailAide }
    });

    if (existingProfileAide) {
      return {
        success: false,
        message: 'Cette adresse email est déjà utilisée comme Aidé(e)',
        error_code: 'PROFILE_EXISTS'
      };
    }

    // Check if email exists in GdprAides (pending)
    const existingGdprAide = await GdprAide.findOne({
      where: {
        email_aide: emailAide,
        aidant_id: aidantId
      }
    });

    if (existingGdprAide) {
      return {
        success: false,
        message: 'Une demande de consentement a déjà été envoyée à cette adresse email',
        error_code: 'PENDING_CONSENT',
        existing_request_id: existingGdprAide.id
      };
    }

    // Get Aidant
    const aidant = await User.findByPk(aidantId, {
      include: [{ model: ProfileAidant, as: 'ProfileAidant' }]
    });

    if (!aidant) {
      return {
        success: false,
        message: 'Aidant introuvable'
      };
    }

    //Check 3 Aide limit for Particulier (active + pending)
    if (aidant.ProfileAidant && aidant.ProfileAidant.profile_type_id === 1) {
      // Count active ProfileAides
      const activeCount = await ProfileAide.count({
        where: { aidant_id: aidantId }
      });

      // Count pending GdprAides (not yet converted to ProfileAide)
      const pendingCount = await GdprAide.count({
        where: { 
          aidant_id: aidantId,
          profile_aide_id: null
        }
      });

      const totalCount = activeCount + pendingCount;

      if (totalCount >= 3) {
        return {
          success: false,
          message: `Vous avez atteint la limite de 3 Aidé(e)s (${activeCount} actif${activeCount > 1 ? 's' : ''} + ${pendingCount} en attente). Veuillez supprimer un aidé existant avant d'en ajouter un nouveau.`
        };
      }
    }

    // Generate token
    const consentToken = crypto.randomBytes(32).toString('hex');

    // Create GdprAide (no ProfileAide yet)
    const gdprAide = await GdprAide.create({
      aidant_id: aidantId,
      profile_aide_id: null, // NULL - ProfileAide created later
      email_aide: emailAide,
      consent_token: consentToken,
      consent: null
    });

    // Send email
    await sendAideConsentRequestEmail(
      emailAide,
      aidant.first_name,
      aidant.last_name,
      consentToken
    );

    return {
      success: true,
      data: {
        id: gdprAide.id,
        email_aide: emailAide,
        consent: null
      }
    };
  } catch (error) {
    console.error('Error requesting aide consent:', error);
    throw error;
  }
};

/**
 * Resend consent request (delete old, create new)
 */
const resendConsentRequest = async (aidantId, emailAide, oldRequestId) => {
  try {
    // Hard delete old request
    await GdprAide.destroy({
      where: {
        id: oldRequestId,
        aidant_id: aidantId
      }
    });

    // Create new request
    return await requestAideConsent(aidantId, emailAide);
  } catch (error) {
    console.error('Error resending consent request:', error);
    throw error;
  }
};

/**
 * Get consent request by token
 */
const getConsentRequestByToken = async (token) => {
  try {
    const consentRequest = await GdprAide.findOne({
      where: { consent_token: token },
      include: [
        {
          model: User,
          as: 'Aidant',
          attributes: ['first_name', 'last_name', 'email']
        }
      ]
    });

    // Record not found (deleted or invalid token)
    if (!consentRequest) {
      return {
        success: false,
        message: 'Demande introuvable ou expirée',
        status_type: 'not_found'
      };
    }

    // Check if expired (7 days)
    const createdAt = new Date(consentRequest.created_at);
    const now = new Date();
    const daysDiff = (now - createdAt) / (1000 * 60 * 60 * 24);

    if (daysDiff > 7) {
      // Delete expired request
      await consentRequest.destroy();

      return {
        success: false,
        message: 'Cette demande a expiré (plus de 7 jours)',
        status_type: 'expired'
      };
    }

    // Check if already processed (has consent)
    if (consentRequest.consent !== null) {
      const wasAccepted = consentRequest.consent.cgv?.status === true;
      
      return {
        success: false,
        message: wasAccepted 
          ? 'Ce consentement a déjà été accepté' 
          : 'Ce consentement a déjà été traité',
        status_type: wasAccepted ? 'accepted' : 'processed'
      };
    }

    // Valid pending request
    return {
      success: true,
      data: {
        id: consentRequest.id,
        email_aide: consentRequest.email_aide,
        aidant: {
          first_name: consentRequest.Aidant.first_name,
          last_name: consentRequest.Aidant.last_name
        },
        created_at: consentRequest.created_at
      }
    };
  } catch (error) {
    console.error('Error getting consent request:', error);
    throw error;
  }
};

/**
 * Accept consent
 * UPDATED: Only updates GdprAide and creates GdprConsent
 * Does NOT create ProfileAide (created later in registration flow)
 */
const acceptConsent = async (token, gdprConsents) => {
  try {
    if (!gdprConsents.cgv || !gdprConsents.privacy_policy || !gdprConsents.age_18) {
      return {
        success: false,
        message: 'Les consentements obligatoires doivent être acceptés'
      };
    }

    const consentRequest = await GdprAide.findOne({
      where: { consent_token: token },
      include: [
        {
          model: User,
          as: 'Aidant',
          attributes: ['first_name', 'last_name', 'email']
        }
      ]
    });

    if (!consentRequest) {
      return {
        success: false,
        message: 'Demande de consentement introuvable ou expirée'
      };
    }

    if (consentRequest.consent !== null) {
      return {
        success: false,
        message: 'Cette demande a déjà été acceptée'
      };
    }

    const timestamp = new Date().toISOString();
    const consentData = {
      cgv: {
        status: gdprConsents.cgv,
        timestamp: gdprConsents.cgv ? timestamp : null
      },
      privacy_policy: {
        status: gdprConsents.privacy_policy,
        timestamp: gdprConsents.privacy_policy ? timestamp : null
      },
      age_18: {
        status: gdprConsents.age_18,
        timestamp: gdprConsents.age_18 ? timestamp : null
      },
      newsletter: {
        status: gdprConsents.newsletter || false,
        timestamp: gdprConsents.newsletter ? timestamp : null
      }
    };

    // Update GdprAide with consent data
    // profile_aide_id stays NULL (ProfileAide created later)
    await consentRequest.update({
      consent: consentData
    });

    // Create GdprConsent record
    // Use GdprAide.id as entity_id since ProfileAide doesn't exist yet
    await GdprConsent.create({
      entity_id: consentRequest.id,
      entity_type: 'aide_pending', // New type for pending Aide
      consent: consentData,
      source: 'web',
      status: true
    });

    // Send confirmation to Aidant
    await sendAidantConsentConfirmationEmail(
      consentRequest.Aidant.email,
      consentRequest.Aidant.first_name,
      consentRequest.email_aide
    );

    return {
      success: true,
      message: 'Consentement accepté avec succès',
      data: {
        gdpr_aide_id: consentRequest.id,
        email: consentRequest.email_aide
      }
    };
  } catch (error) {
    console.error('Error accepting consent:', error);
    throw error;
  }
};

/**
 * Reject consent
 * Hard deletes the GdprAide record
 */
const rejectConsent = async (token) => {
  try {
    const consentRequest = await GdprAide.findOne({
      where: { consent_token: token },
      include: [
        {
          model: User,
          as: 'Aidant',
          attributes: ['first_name', 'last_name', 'email']
        }
      ]
    });

    if (!consentRequest) {
      return {
        success: false,
        message: 'Demande de consentement introuvable'
      };
    }

    const aidantEmail = consentRequest.Aidant.email;
    const aidantFirstName = consentRequest.Aidant.first_name;
    const emailAide = consentRequest.email_aide;

    // Hard delete
    await consentRequest.destroy();

    // Send rejection email
    await sendAidantConsentRejectionEmail(
      aidantEmail,
      aidantFirstName,
      emailAide
    );

    return {
      success: true,
      message: 'Consentement refusé'
    };
  } catch (error) {
    console.error('Error rejecting consent:', error);
    throw error;
  }
};

/**
 * Get all consent requests for an Aidant
 */
const getAidantConsentRequests = async (aidantId) => {
  try {
    const requests = await GdprAide.findAll({
      where: { aidant_id: aidantId },
      include: [
        {
          model: ProfileAide,
          as: 'ProfileAide',
          required: false,
          attributes: ['id', 'email', 'active', 'name']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    return {
      success: true,
      data: requests
    };
  } catch (error) {
    console.error('Error getting aidant consent requests:', error);
    throw error;
  }
};

/**
 * Check if Aidant has reached the maximum number of Aides (pending + active)
 * Particuliers (profile_type_id = 1) can have max 3 Aides total
 * Pros (profile_type_id = 2) have no limit
 */
const checkAidantAideLimit = async (aidantId, transaction = null) => {
  // Get the Aidant to check their profile type
  const aidant = await ProfileAidant.findByPk(aidantId, { transaction });
  
  if (!aidant) {
    throw new Error('Aidant not found');
  }
  
  // Only Particuliers have a limit
  if (aidant.profile_type_id !== 1) {
    return { canAdd: true, currentCount: 0, limit: null };
  }
  
  // Count active ProfileAides
  const activeCount = await ProfileAide.count({
    where: { aidant_id: aidantId },
    transaction
  });
  
  // Count pending GdprAides (consent not yet completed)
  const pendingCount = await GdprAide.count({
    where: { 
      aidant_id: aidantId,
      profile_aide_id: null  // Only count pending (not yet converted to ProfileAide)
    },
    transaction
  });
  
  const totalCount = activeCount + pendingCount;
  const limit = 3;
  const canAdd = totalCount < limit;
  
  return { 
    canAdd, 
    currentCount: totalCount, 
    limit,
    activeCount,
    pendingCount
  };
};

module.exports = {
  requestAideConsent,
  resendConsentRequest,
  getConsentRequestByToken,
  acceptConsent,
  rejectConsent,
  getAidantConsentRequests,
  checkAidantAideLimit
};