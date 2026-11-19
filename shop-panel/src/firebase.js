import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';

// 🏪 షాప్ టోకెన్‌ను బ్యాక్‌ఎండ్‌కు పంపే ఫంక్షన్
const sendShopTokenToBackend = async (shopMobile, token) => {
  try {
    await fetch('https://api.foodiee.shop/api/shop/update-fcm-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile: shopMobile, fcmToken: token })
    });
    console.log("Shop FCM Token successfully sent to backend!");
  } catch (error) {
    console.error("Error sending shop token to backend:", error);
  }
};

// 🔔 షాప్ నోటిఫికేషన్ పర్మిషన్ మరియు నేటివ్ టోకెన్ తెచ్చుకోవడం
export const requestShopNotificationPermission = async (shopMobile) => {
  try {
    if (Capacitor.isNativePlatform()) {
      let permResult = await PushNotifications.checkPermissions();
      if (permResult.receive === 'prompt') {
        permResult = await PushNotifications.requestPermissions();
      }
      
      if (permResult.receive === 'granted') {
        await PushNotifications.register();
        
        // నేటివ్ టోకెన్ రిజిస్ట్రేషన్ లిసనర్
        PushNotifications.addListener('registration', async (token) => {
          console.log('Shop Native Push Registration Token:', token.value);
          if (shopMobile && token.value) {
            await sendShopTokenToBackend(shopMobile, token.value);
          }
        });

        // కొత్త ఆర్డర్ వచ్చినప్పుడు (లాక్ స్క్రీన్/హోమ్ స్క్రీన్ కోసం)
        PushNotifications.addListener('pushNotificationReceived', (notification) => {
          console.log('Shop Push notification received: ', notification);
          
          // షాప్ రింగ్‌టోన్ సౌండ్ ప్లే చేయడం
          const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
          audio.play().catch(e => console.log("Audio play blocked", e));
        });

        // నోటిఫికేషన్ మీద క్లిక్ చేసినప్పుడు
        PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
          console.log('Shop Push notification action performed: ', action);
        });
      }
    } else {
      console.log('Running on web platform. Native push skipped for shop app.');
    }
  } catch (error) {
    console.error('Error getting shop notification token:', error);
  }
};