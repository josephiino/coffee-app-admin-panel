/**
 * Firebase Admin SDK yapılandırması
 * 
 * Bu dosya Firebase Admin SDK'yı yapılandırır ve Firestore veritabanına
 * erişim için gerekli referansları sağlar.
 * 
 * NOT: Bu dosyayı kullanmadan önce:
 * 1. Firebase Konsol'dan bir servis hesabı anahtarı indirmeniz gerekir
 * 2. İndirilen anahtar dosyasını 'firebase-service-account.json' olarak
 *    bu projenin kök dizinine yerleştirin
 * 3. Bu dosyayı .gitignore dosyanıza ekleyin (güvenlik için)
 */

const admin = require('firebase-admin');
// const path = require('path'); // path modülü artık gereksiz
// const fs = require('fs'); // fs modülü artık gereksiz

// Servis hesabı dosya yolu ve okuma mantığı kaldırıldı.

// Firebase Admin SDK'yı başlat (Application Default Credentials ile)
let db, rtdb;
let isConfigured = false;
let errorMessage = null;

try {
  // .env dosyasından veya Firebase konsolundan alınan databaseURL
  // Ortam değişkeninden okumak iyi bir pratik
  const databaseURL = process.env.FIREBASE_DATABASE_URL;
  if (!databaseURL) {
    // Uyarı vermek yerine, hatayı kaydedip devam edelim.
    // Realtime DB kullanmaya çalışınca hata verecektir.
    console.warn('UYARI: FIREBASE_DATABASE_URL ortam değişkeni tanımlı değil. Realtime Database kullanılamayabilir.');
  }

  // Sadece initializeApp çağır. Otomatik olarak ortam kimlik bilgilerini kullanacak.
  admin.initializeApp({
    // credential kısmı kaldırıldı.
    databaseURL: databaseURL // RTDB URL hala gerekli olabilir (projeye bağlı)
  });

  console.log('Firebase Admin SDK başarıyla başlatıldı (ADC ile).');

  // Firestore veritabanı referansını oluştur
  db = admin.firestore();
  console.log('Firestore bağlantısı aktif.');

  // Realtime Database referansını oluştur (sadece databaseURL varsa)
  if (databaseURL) {
    try {
      rtdb = admin.database();
      console.log('Realtime Database bağlantısı aktif.');
      isConfigured = true; // Hem Firestore hem RTDB (varsa) başarılıysa true yap
    } catch (rtdbError) {
       console.error("Realtime Database başlatılırken hata (URL doğru mu?):", rtdbError);
       rtdb = null;
       // isConfigured false kalır veya sadece Firestore için true yapılabilir.
       // Şimdilik genel bir hata mesajı ayarlayalım.
       errorMessage = `Realtime Database başlatılamadı: ${rtdbError.message}`;
    }
  } else {
    rtdb = null; // URL yoksa null ata
    isConfigured = true; // Sadece Firestore başarılıysa da true kabul edelim
  }

} catch (error) {
  console.error('Firebase Admin SDK başlatılırken hata oluştu (ADC):', error);
  db = null;
  rtdb = null;
  isConfigured = false;
  errorMessage = `Firebase başlatma hatası (ADC): ${error.message}`;
}

// Firebase Admin, Firestore ve Realtime DB referanslarını dışa aktar
module.exports = {
  admin, // admin objesi hala dışa aktarılabilir
  db,       // Firestore
  rtdb,     // Realtime Database
  isConfigured, // Genel yapılandırma durumu
  errorMessage
};