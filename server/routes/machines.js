/**
 * Machines API Route
 * Bu dosya, makinelere erişim için API endpoint'lerini tanımlar
 */

const express = require('express');
const router = express.Router();

// Firebase yapılandırmasını içe aktar
const { db, isConfigured, errorMessage } = require('../config/firebase');

/**
 * GET /api/machines
 * Tüm makine listesini döndürür
 */
router.get('/', async (req, res) => {
  // Firebase düzgün yapılandırılmadıysa hata döndür
  if (!isConfigured) {
    console.error("API çağrısı yapılamadı: Firebase yapılandırılmamış.", errorMessage);
    return res.status(500).json({ 
        error: 'Sunucu hatası: Firebase yapılandırması eksik veya hatalı.', 
        details: errorMessage 
    });
  }
  
  try {
    // 'machines' koleksiyonundan tüm dökümanları al
    const snapshot = await db.collection('machines').get();
    const machines = [];

    // Döküman yoksa boş array döndür
    if (snapshot.empty) {
      console.log('Firestore\'da machines koleksiyonunda hiç makine bulunamadı.');
      return res.json(machines);
    }

    // Her dökümanı işle ve frontend'in beklediği formata dönüştür
    snapshot.forEach(doc => {
      const data = doc.data();
      machines.push({
        id: doc.id, // Firestore döküman ID'si
        location: data.location || 'Bilinmiyor', // Firestore'daki 'location' alanı
        status: data.status || 'offline', // Firestore'daki 'status' alanı ('online', 'offline', 'maintenance')
        
        // Envanter verisi: Firestore'daki alan adlarınıza göre burayı düzenlemeniz gerekebilir.
        inventory: {
          coffeeBeans: data.inventory?.coffeeBeans ?? data.coffeeLevel ?? 0, 
          milkLevel: data.inventory?.milkLevel ?? data.milkLevel ?? 0,     
          waterLevel: data.inventory?.waterLevel ?? data.waterLevel ?? 0    
        },
        
        // Son güncelleme zamanı (Firestore timestamp'ini ISO string'e çevir)
        lastUpdated: data.updatedAt?.toDate()?.toISOString() || 
                     data.lastUpdated?.toDate()?.toISOString() || 
                     new Date().toISOString() 
      });
    });

    console.log(`${machines.length} makine Firestore'dan çekildi.`);
    
    // Makineler listesini JSON olarak gönder
    res.json(machines);

  } catch (error) {
    console.error('Firestore\'dan makine verileri alınırken hata:', error);
    res.status(500).json({ error: 'Veritabanından veri alınamadı.' });
  }
});

/**
 * GET /api/machines/:id
 * Belirtilen ID'ye sahip makineyi döndürür
 */
router.get('/:id', async (req, res) => {
  if (!isConfigured) {
    return res.status(500).json({ 
      error: 'Sunucu hatası: Firebase yapılandırması eksik veya hatalı.', 
      details: errorMessage 
    });
  }
  
  try {
    const machineDoc = await db.collection('machines').doc(req.params.id).get();
    
    if (!machineDoc.exists) {
      return res.status(404).json({ error: 'Makine bulunamadı' });
    }
    
    const data = machineDoc.data();
    const machine = {
      id: machineDoc.id,
      location: data.location || 'Bilinmiyor',
      status: data.status || 'offline',
      inventory: {
        coffeeBeans: data.inventory?.coffeeBeans ?? data.coffeeLevel ?? 0,
        milkLevel: data.inventory?.milkLevel ?? data.milkLevel ?? 0,
        waterLevel: data.inventory?.waterLevel ?? data.waterLevel ?? 0
      },
      lastUpdated: data.updatedAt?.toDate()?.toISOString() || 
                   data.lastUpdated?.toDate()?.toISOString() || 
                   new Date().toISOString()
    };
    
    res.json(machine);
  } catch (error) {
    console.error('Makine verisi alınırken hata:', error);
    res.status(500).json({ error: 'Veritabanından veri alınamadı' });
  }
});

module.exports = router;
