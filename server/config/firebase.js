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
const path = require('path');
const fs = require('fs');

// Servis hesabı dosya yolu (iki farklı olası konum kontrol edilir)
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || 
                          path.join(__dirname, '../../firebase-service-account.json');

// Servis hesabı dosyasının varlığını kontrol et
let serviceAccount;
try {
  if (fs.existsSync(serviceAccountPath)) {
    serviceAccount = require(serviceAccountPath);
  } else {
    console.warn('Firebase servis hesabı dosyası bulunamadı:', serviceAccountPath);
    console.warn('Firebase Admin SDK başlatılamıyor.');
    
    // Servis hesabı olmadan devam etme (geliştirme amaçlı)
    module.exports = { 
      admin: null, 
      db: null,
      rtdb: null,
      isConfigured: false,
      errorMessage: `Servis hesabı dosyası bulunamadı: ${serviceAccountPath}`
    };
    return;
  }
} catch (error) {
  console.error('Firebase yapılandırma hatası:', error);
  module.exports = { 
    admin: null, 
    db: null,
    rtdb: null,
    isConfigured: false,
    errorMessage: `Firebase yapılandırma hatası: ${error.message}`
  };
  return;
}

// Firebase Admin SDK'yı başlat
let db, rtdb;
try {
  // .env dosyasından veya Firebase konsolundan alınan databaseURL
  const databaseURL = process.env.FIREBASE_DATABASE_URL;
  if (!databaseURL) {
    console.warn('UYARI: .env dosyasında FIREBASE_DATABASE_URL tanımlı değil. Realtime Database başlatılamayacak.');
  }

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: databaseURL // Realtime DB için URL'yi ekle
  });

  console.log('Firebase Admin SDK başarıyla başlatıldı.');

  // Firestore veritabanı referansını oluştur
  db = admin.firestore();
  console.log('Firestore bağlantısı aktif.');

  // Realtime Database referansını oluştur (sadece databaseURL varsa)
  if (databaseURL) {
    rtdb = admin.database();
    console.log('Realtime Database bağlantısı aktif.');
  } else {
    rtdb = null; // URL yoksa null ata
  }

  // Firebase Admin, Firestore ve Realtime DB referanslarını dışa aktar
  module.exports = {
    admin,
    db,       // Firestore
    rtdb,     // Realtime Database
    isConfigured: true,
    errorMessage: null
  };
} catch (error) {
  console.error('Firebase Admin SDK başlatılırken hata oluştu:', error);
  module.exports = {
    admin: null,
    db: null,
    rtdb: null, // Hata durumunda null ata
    isConfigured: false,
    errorMessage: `Firebase başlatma hatası: ${error.message}`
  };
}