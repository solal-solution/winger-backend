// backend/src/services/pushNotificationService.js
const admin = require('firebase-admin');
const { NotificationLog } = require("../models");

// Initialize Firebase Admin SDK
const serviceAccount = require('../../firebase-service-account.json');



if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: 'winger-13'
  });
}

// Send notification via Expo's push service
const sendExpoNotification = async (expoPushToken, title, body, data = {}) => {
  try {
    const message = {
      to: expoPushToken,
      sound: 'default',
      title: title,
      body: body.length > 100 ? body.substring(0, 100) + '...' : body,
      data: {
        type: data.type || 'message',
        chatId: data.chatId?.toString() || '',
        senderId: data.senderId?.toString() || '',
        conversationId: data.conversationId?.toString() || ''
      },
      priority: 'high',
      badge: 1,
    };

    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    const result = await response.json();
    console.log(' Expo push notification sent:', result);
    await NotificationLog.create({
      recipient_id: data.senderId,
      sender_id: data.senderId,
      status: result?.data?.id ? 'sent' : 'failed',
      token: expoPushToken,
      message_title: title,
      message_text: body,
      notification_type: 'expo',
      error_message: JSON.stringify(result.data)
    });
    return result;
  } catch (error) {
    console.error(' Error sending Expo push notification:', error);
    throw error;
  }
};

// Send notification via Firebase Admin SDK (for native FCM tokens)
const sendFirebaseNotification = async (fcmToken, title, body, data = {}) => {
  try {
    const message = {
      token: fcmToken,
      notification: {
        title: title,
        body: body.length > 100 ? body.substring(0, 100) + '...' : body,
      },
      data: {
        type: data.type || 'message',
        chatId: data.chatId?.toString() || '',
        senderId: data.senderId?.toString() || '',
        conversationId: data.conversationId?.toString() || ''
      },
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          channelId: 'default',
          priority:'max'
        }
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1
          }
        }
      }
    };

    const response = await admin.messaging().send(message);
    console.log(' Firebase push notification sent:', response);


    return response;
  } catch (error) {
    console.error(' Error sending Firebase push notification:', error);
    throw error;
  }
};

// Main function - automatically detects token type
const sendPushNotification = async (token, title, body, data = {}) => {
  if (!token) {
    console.log('No push token provided');
    return null;
  }

  console.log(` Sending push notification to token: ${token.substring(0, 20)}...`);

  // Determine token type and use appropriate service
  if (token.startsWith('ExponentPushToken')) {
    console.log(' Using Expo push service');
    return await sendExpoNotification(token, title, body, data);
  } else {
    console.log(' Using Firebase Admin SDK');
    return await sendFirebaseNotification(token, title, body, data);
  }
};

const sendBulkPushNotifications = async (tokens, title, body, data = {}) => {
  if (!tokens || tokens.length === 0) {
    console.log('No push tokens provided for bulk send');
    return null;
  }

  // Separate tokens by type
  const expoTokens = tokens.filter(token => token.startsWith('ExponentPushToken'));
  const fcmTokens = tokens.filter(token => !token.startsWith('ExponentPushToken'));

  const results = [];

  // Send Expo notifications
  if (expoTokens.length > 0) {
    console.log(` Sending ${expoTokens.length} Expo notifications`);
    for (const token of expoTokens) {
      try {
        const result = await sendExpoNotification(token, title, body, data);
        results.push(result);
      } catch (error) {
        console.error(`Failed to send to Expo token: ${token}`, error);
      }
    }
  }

  // Send Firebase notifications
  if (fcmTokens.length > 0) {
    console.log(` Sending ${fcmTokens.length} Firebase notifications`);
    try {
      const message = {
        tokens: fcmTokens,
        notification: { title, body },
        data: {
          type: data.type || 'message',
          chatId: data.chatId?.toString() || '',
          senderId: data.senderId?.toString() || ''
        }
      };
      const result = await admin.messaging().sendMulticast(message);
      results.push(result);
    } catch (error) {
      console.error('Failed to send Firebase bulk notifications:', error);
    }
  }

  return results;
};

module.exports = { 
  sendPushNotification, 
  sendBulkPushNotifications 
};