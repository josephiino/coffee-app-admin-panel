const express = require('express');
const router = express.Router();
// const Order = require('../models/Order'); // Mongoose modelini kaldır/yorumla
const { rtdb, isConfigured, errorMessage, admin } = require('../config/firebase'); // rtdb'yi içe aktar

// Tüm siparişleri getir (Realtime Database kullanarak)
router.get('/', async (req, res) => {
  if (!isConfigured || !rtdb) {
    const message = "API çağrısı yapılamadı: Firebase Realtime DB yapılandırılmamış veya bağlantı hatası.";
    console.error(message, errorMessage);
    return res.status(500).json({
        error: 'Sunucu hatası: Firebase yapılandırması eksik veya hatalı.',
        details: errorMessage || "Realtime DB referansı alınamadı.",
        orders: [], page: 1, totalPages: 1
    });
  }

  try {
    console.log("Realtime DB'den /orders yolu okunuyor...");
    const ordersRef = rtdb.ref('orders');
    const snapshot = await ordersRef.once('value');
    
    // Snapshot'ın var olup olmadığını kontrol et
    if (!snapshot.exists()) {
        console.log("Realtime Database'de /orders altında snapshot bulunamadı (yol boş olabilir).");
        return res.json({ orders: [], page: 1, totalPages: 1 }); // Boş veri döndür
    }

    const ordersData = snapshot.val();
    console.log("Realtime DB'den alınan ham veri:", JSON.stringify(ordersData, null, 2));

    const orders = [];
    if (ordersData && typeof ordersData === 'object') { // ordersData null değil ve bir nesne ise işle
      Object.keys(ordersData).forEach(key => {
        const data = ordersData[key];
        if (data && typeof data === 'object') {
            // Tarihi doğru alandan oku (önce timestamp, sonra createdAt, sonra date)
            let orderDateStr;
            if (data.timestamp) {
                orderDateStr = new Date(data.timestamp).toISOString();
            } else if (data.createdAt) {
                orderDateStr = new Date(data.createdAt).toISOString();
            } else if (data.date) {
                orderDateStr = new Date(data.date).toISOString();
            } else {
                orderDateStr = new Date().toISOString(); // Fallback
            }

            // RTDB'deki üst seviye alanlardan ürün bilgilerini al
            const productInfo = {
                id: data.id || null, // Ürünün kendi ID'si varsa (yoksa null)
                name: data.name || 'Bilinmeyen Ürün',
                price: typeof data.price === 'number' ? data.price : 0,
                quantity: typeof data.quantity === 'number' ? data.quantity : 1,
                size: data.size || null // Varsa size bilgisini de ekle
                // Gerekirse başka ürün detayları eklenebilir
            };

            orders.push({
              id: key, // Siparişin RTDB anahtarı
              location: data.machineLocation || 'Bilinmiyor',
              machineId: data.machineId || 'N/A',
              // Frontend'in beklediği format: Tek elemanlı bir products dizisi oluştur
              products: [productInfo],
              date: orderDateStr, 
              status: data.status || 'pending'
            });
        } else {
             console.warn(`Geçersiz veri yapısı bulundu, key: ${key}, data:`, data);
        }
      });
      orders.reverse();
    } else if (ordersData) {
        // ordersData bir nesne değilse (belki bir array veya basit değer?)
        console.warn("/orders altındaki veri beklenildiği gibi bir nesne değil:", ordersData);
    } else {
        console.log("Snapshot değeri (ordersData) null veya undefined.");
    }

    console.log("Frontend'e gönderilecek işlenmiş siparişler:", JSON.stringify(orders, null, 2));
    res.json({
        orders: orders,
        page: 1,
        totalPages: 1
    });

  } catch (error) {
    console.error("API /orders endpoint'inde HATA:", error);
    console.error("Hata Mesajı:", error.message);
    console.error("Hata Stack:", error.stack);
    res.status(500).json({ error: 'Veritabanından veri alınamadı.', orders: [], page: 1, totalPages: 1, details: error.message });
  }
});

// Yeni sipariş oluştur (Realtime Database kullanarak)
router.post('/', async (req, res) => {
  if (!isConfigured || !rtdb) {
      return res.status(500).json({ error: 'Sunucu hatası: Realtime DB yapılandırılmamış.' });
  }
  try {
      const { machineId, location, products, status } = req.body;
      if (!machineId || !products || !Array.isArray(products) || products.length === 0) {
          return res.status(400).json({ message: 'machineId ve products (array formatında) alanları gereklidir.' });
      }
      const newOrderData = {
          machineId: machineId,
          location: location || 'Bilinmiyor',
          products: products,
          status: status || 'pending',
          createdAt: admin.database.ServerValue.TIMESTAMP
      };
      const newOrderRef = await rtdb.ref('orders').push(newOrderData);
      res.status(201).json({
          id: newOrderRef.key,
          ...req.body,
          status: status || 'pending',
          date: new Date().toISOString()
      });

  } catch (error) {
      console.error("Realtime Database'e sipariş eklenirken hata:", error);
      res.status(400).json({ message: 'Sipariş oluşturulamadı.', error: error.message });
  }
});

// Sipariş detaylarını getir (Realtime Database kullanarak)
router.get('/:id', async (req, res) => {
    if (!isConfigured || !rtdb) {
        return res.status(500).json({ error: 'Sunucu hatası: Realtime DB yapılandırılmamış.' });
    }
    try {
        const orderId = req.params.id;
        const snapshot = await rtdb.ref(`orders/${orderId}`).once('value');
        const data = snapshot.val();
        if (!data) {
            return res.status(404).json({ message: 'Sipariş bulunamadı' });
        }
        const orderDetails = {
             id: orderId,
             location: data.location || 'Bilinmiyor',
             machineId: data.machineId || 'N/A',
             products: data.products || [],
             date: data.createdAt ? new Date(data.createdAt).toISOString() : new Date().toISOString(),
             status: data.status || 'pending'
        };
        res.json(orderDetails);

    } catch (error) {
        console.error("Sipariş detayı (" + req.params.id + ") alınırken hata:", error);
        res.status(500).json({ message: 'Veritabanından veri alınamadı.', error: error.message });
    }
});

// Sipariş güncelleme (Realtime DB)
router.patch('/:id', async (req, res) => {
    if (!isConfigured || !rtdb) {
        return res.status(500).json({ error: 'Sunucu hatası: Realtime DB yapılandırılmamış.' });
    }
    try {
        const orderId = req.params.id;
        const updates = req.body; // Güncellenecek alanları al (örn: {status: 'completed'})
        updates.updatedAt = admin.database.ServerValue.TIMESTAMP;
        await rtdb.ref(`orders/${orderId}`).update(updates);
        const snapshot = await rtdb.ref(`orders/${orderId}`).once('value');
        const updatedData = snapshot.val();
        res.json({ 
            id: orderId, 
            ...updatedData,
            date: updatedData.createdAt ? new Date(updatedData.createdAt).toISOString() : null,
            updatedAt: updatedData.updatedAt ? new Date(updatedData.updatedAt).toISOString() : null
        });
    } catch (error) {
        console.error("Sipariş (" + req.params.id + ") güncellenirken hata:", error);
        res.status(400).json({ message: 'Sipariş güncellenemedi.', error: error.message });
    }
});


// Sipariş silme (Realtime DB)
router.delete('/:id', async (req, res) => {
     if (!isConfigured || !rtdb) {
        return res.status(500).json({ error: 'Sunucu hatası: Realtime DB yapılandırılmamış.' });
    }
    try {
        const orderId = req.params.id;
        await rtdb.ref(`orders/${orderId}`).remove();
        res.json({ message: 'Sipariş başarıyla silindi', id: orderId });
    } catch (error) {
        console.error("Sipariş (" + req.params.id + ") silinirken hata:", error);
        res.status(500).json({ message: 'Sipariş silinemedi.', error: error.message });
    }
});

// Yeni Endpoint: Toplam Satış Tutarını Hesapla
router.get('/stats/total-sales', async (req, res) => {
    // Başlangıç kontrolü ve loglama
    if (!isConfigured || !rtdb) {
        const errorMsg = 'Sunucu hatası: Realtime DB yapılandırılmamış veya başlatılamamış (rtdb objesi null).';
        console.error('[Stats Endpoint Error - Config]', errorMsg, { isConfigured, rtdbExists: !!rtdb });
        return res.status(500).json({ error: errorMsg, totalSales: 0 });
    }

    try {
        console.log('[Stats Endpoint] /orders verisi çekiliyor...'); // Başlangıç logu
        const snapshot = await rtdb.ref('orders').once('value');
        console.log('[Stats Endpoint] /orders verisi çekildi, snapshot var mı:', snapshot.exists()); // Snapshot durumu logu
        const ordersData = snapshot.val();
        let totalSales = 0;

        if (ordersData && typeof ordersData === 'object') {
            Object.keys(ordersData).forEach(key => {
                const data = ordersData[key];

                // Daha sağlam kontrol: Eğer veri geçerli bir nesne değilse atla
                if (!data || typeof data !== 'object' || data === null) {
                    console.warn(`Geçersiz sipariş verisi atlanıyor (key: ${key}):`, data);
                    return; // Sonraki iterasyona geç
                }

                try { // Her siparişin işlenmesini try-catch içine al
                    if (typeof data.price === 'number') {
                        // Doğrudan fiyat alanı varsa
                        totalSales += data.price;
                    } else if (data.products && Array.isArray(data.products)) {
                        // products dizisi varsa
                        data.products.forEach((product, index) => {
                            // Ürünün geçerli bir nesne ve fiyatın sayı olup olmadığını kontrol et
                            if (product && typeof product === 'object' && typeof product.price === 'number') {
                                // Miktar geçerli bir sayı ise kullan, değilse 1 varsay
                                const quantity = (product.quantity && typeof product.quantity === 'number' && product.quantity > 0) ? product.quantity : 1;
                                totalSales += product.price * quantity;
                            } else {
                                console.warn(`Sipariş ${key} içindeki geçersiz ürün atlanıyor (index ${index}):`, product);
                            }
                        });
                    } else if (typeof data.totalPrice === 'number') {
                        // totalPrice alanı varsa
                        totalSales += data.totalPrice;
                    }
                    // else { 
                    //     // İsteğe bağlı: Fiyat bilgisi bulunamayan siparişleri logla
                    //     console.warn(`Sipariş ${key} için tanınan bir fiyat alanı bulunamadı (price, products array, veya totalPrice).`);
                    // }
                } catch (orderError) {
                    // Tek bir siparişteki hata tüm hesaplamayı durdurmasın
                    console.error(`Sipariş işlenirken hata oluştu (key: ${key}):`, orderError, "Sipariş Verisi:", data);
                }
            });
        }

        console.log('Hesaplanan Toplam Satış:', totalSales);
        res.json({ totalSales: totalSales });

    } catch (error) {
        // Daha detaylı hata loglaması
        console.error('[Stats Endpoint Error - Main Catch]', 'Toplam satış hesaplanırken ana try-catch bloğunda hata oluştu:', error); // error objesi stack trace içermeli
        res.status(500).json({ 
            error: 'Toplam satış hesaplanırken sunucu hatası.', 
            totalSales: 0, 
            // Güvenlik nedeniyle error.message'ı doğrudan kullanıcıya göstermemek daha iyi olabilir.
            // details: error.message 
        });
    }
});

module.exports = router;