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
    isConfigured: false,
    errorMessage: `Firebase yapılandırma hatası: ${error.message}`
  };
  return;
}

// Firebase Admin SDK'yı başlat
try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  
  console.log('Firebase Admin SDK başarıyla başlatıldı.');
  
  // Firestore veritabanı referansını oluştur
  const db = admin.firestore();
  
  // Firebase Admin ve Firestore referanslarını dışa aktar
  module.exports = { 
    admin, 
    db,
    isConfigured: true,
    errorMessage: null
  };
} catch (error) {
  console.error('Firebase Admin SDK başlatılırken hata oluştu:', error);
  module.exports = { 
    admin: null, 
    db: null,
    isConfigured: false,
    errorMessage: `Firebase başlatma hatası: ${error.message}`
  };
}

// Firebase yapılandırmasını içe aktar
const { db } = require('./server/config/firebase');

// ... mevcut kod ...

// Firestore'dan veri çekme örneği
app.get('/api/firebase-test', async (req, res) => {
  try {
    const snapshot = await db.collection('kahve-makineleri').get();
    const makineler = [];
    
    snapshot.forEach(doc => {
      makineler.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    res.json(makineler);
  } catch (error) {
    console.error('Firestore hatası:', error);
    res.status(500).json({ error: 'Veritabanı hatası' });
  }
});