require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const compression = require('compression');
const dotenv = require('dotenv');
const { db, rtdb, isConfigured, errorMessage } = require('./server/config/firebase');

// Çevre değişkenlerini yükle
dotenv.config();

// Express uygulamasını oluştur
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: [
      "http://localhost:3000", // Yerel geliştirme
      "https://coffee-app-admin-panel--robobrewbetaapp.europe-west4.hosted.app/", // App Hosting URL
      "https://admin.robobrew.co" // Custom Domain eklendi
    ],
    methods: ["GET", "POST"]
  }
});

// Port tanımla
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(compression());

// Statik dosyaları servis et
app.use(express.static(path.join(__dirname, 'public')));

// Ana rotalar
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/loginview', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'loginview.html'));
});

app.get('/machines', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'views', 'machines.html'));
});

app.get('/orders', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'views', 'orders.html'));
});

app.get('/products', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'views', 'products.html'));
});

// API rotaları
// Makine rotasını içe aktar
const machinesRoutes = require('./server/routes/machines');
// Sipariş rotasını içe aktar (Realtime DB kullanacak)
const orderRoutes = require('./server/routes/orderRoutes');

// API rotalarını kullan
app.use('/api/machines', machinesRoutes);
app.use('/api/orders', orderRoutes);

// Realtime Database'deki sipariş değişikliklerini dinle ve istemcilere bildir
if (isConfigured && rtdb) {
  const ordersDbRef = rtdb.ref('orders'); 

  // 'value' olayını dinle
  ordersDbRef.on('value', 
    (snapshot) => { // Artık async değil
      console.log("[RTDB Listener] /orders değişti. 'orders_updated' eventi gönderiliyor.");
      io.emit('orders_updated'); // Sipariş listesi güncelleme sinyali

      let currentTotalSales = 0; // Hesaplama için başlangıç değeri
      try {
        console.log("[RTDB Listener] Anlık toplam satış hesaplanıyor...");
        if (snapshot.exists()) { // Dinleyiciden gelen snapshot verisi var mı?
            const ordersData = snapshot.val(); // Snapshot'tan veriyi al
            // console.log("[RTDB Listener] Anlık Snapshot verisi:", JSON.stringify(ordersData, null, 0)); // Gerekirse logla

            if (ordersData && typeof ordersData === 'object') {
                Object.keys(ordersData).forEach(key => {
                    const data = ordersData[key];
                    if (data && typeof data.price === 'number') {
                        currentTotalSales += data.price;
                    } else if (data && data.products && Array.isArray(data.products)) {
                         data.products.forEach(product => {
                             if (product && typeof product.price === 'number') {
                                currentTotalSales += product.price * (product.quantity || 1);
                             }
                         });
                     } else if (data && typeof data.totalPrice === 'number') {
                          currentTotalSales += data.totalPrice;
                     }
                    // Başka fiyat alanları için kontroller buraya eklenebilir
                });
                console.log("[RTDB Listener] Anlık hesaplama bitti, toplam:", currentTotalSales);
            } else {
                console.log("[RTDB Listener] Anlık snapshot verisi obje formatında değil veya boş.");
            }
        } else {
             console.log("[RTDB Listener] Anlık snapshot mevcut değil (veri yok).");
        }
      } catch (error) {
          console.error("[RTDB Listener] Anlık toplam satış hesaplanırken HATA oluştu:", error);
          currentTotalSales = 0; // Hata durumunda sıfırla
      }
      
      // Hesaplanan (veya hata durumunda 0 olan) değeri gönder
      console.log("[RTDB Listener] 'total_sales_updated' eventi gönderiliyor, değer:", currentTotalSales);
      io.emit('total_sales_updated', { totalSales: currentTotalSales }); 

    }, 
    (error) => { 
      console.error("[RTDB Listener] /orders dinlenirken HATA:", error);
    } 
  ); 

  console.log('[RTDB Listener] /orders yolu dinleniyor...');
} else {
  console.warn('[RTDB Listener] Realtime Database yapılandırılmadığı için /orders dinlenemiyor.');
}

// NOT: Eski '/api/machines' route'u kaldırıldı çünkü artık machinesRoutes modülü kullanılıyor.
// NOT: Eski '/api/orders' GET ve '/api/orders/:orderId' GET route'ları kaldırıldı.
//       Bunlar artık orderRoutes modülü tarafından yönetiliyor.

// Makine stok güncelleme
app.post('/api/machines/:machineId/stock', (req, res) => {
  const { machineId } = req.params;
  const { stockType, amount } = req.body;
  
  // Gerçek bir uygulamada, burada stok veritabanına kaydedilir
  console.log(`Stok güncellendi: Makine ${machineId}, Tür: ${stockType}, Miktar: ${amount}`);
  
  // Tüm bağlı istemcilere stok güncellemesi gönder
  io.emit('stockUpdate', {
    machineId,
    stockType,
    amount,
    timestamp: new Date().toISOString()
  });
  
  res.json({
    success: true,
    message: "Stok başarıyla güncellendi",
    updatedMachine: {
      id: machineId,
      stockType,
      amount
    }
  });
});

// Sipariş durumunu güncelle
app.put('/api/orders/:orderId/status', (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;
  
  // Gerçek bir uygulamada, burada sipariş durumu veritabanında güncellenir
  console.log(`Sipariş durumu güncellendi: ${orderId}, Yeni durum: ${status}`);
  
  // Tüm bağlı istemcilere sipariş güncellemesi gönder
  io.emit('orderUpdate', {
    orderId,
    status,
    timestamp: new Date().toISOString()
  });
  
  res.json({
    success: true,
    message: "Sipariş durumu başarıyla güncellendi",
    order: {
      id: orderId,
      status
    }
  });
});

// Firestore ürün API'leri
app.get('/api/firestore/products', async (req, res) => {
  try {
    if (!isConfigured) {
      return res.status(500).json({ 
        error: 'Firebase yapılandırılmamış', 
        details: errorMessage 
      });
    }

    const productsRef = db.collection('products');
    const snapshot = await productsRef.get();
    
    if (snapshot.empty) {
      return res.json([]);
    }
    
    const products = [];
    snapshot.forEach(doc => {
      products.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    res.json(products);
  } catch (error) {
    console.error('Firestore ürünleri alınırken hata:', error);
    res.status(500).json({ error: 'Sunucu hatası', details: error.message });
  }
});

app.post('/api/firestore/products', async (req, res) => {
  try {
    if (!isConfigured) {
      return res.status(500).json({ 
        error: 'Firebase yapılandırılmamış', 
        details: errorMessage 
      });
    }

    const productsRef = db.collection('products');
    const productData = {
      ...req.body,
      createdAt: firebase.admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.admin.firestore.FieldValue.serverTimestamp()
    };
    
    const docRef = await productsRef.add(productData);
    
    res.status(201).json({
      id: docRef.id,
      ...productData
    });
  } catch (error) {
    console.error('Firestore ürün eklenirken hata:', error);
    res.status(500).json({ error: 'Sunucu hatası', details: error.message });
  }
});

app.put('/api/firestore/products/:id', async (req, res) => {
  try {
    if (!isConfigured) {
      return res.status(500).json({ 
        error: 'Firebase yapılandırılmamış', 
        details: errorMessage 
      });
    }

    const { id } = req.params;
    const productsRef = db.collection('products').doc(id);
    
    const productData = {
      ...req.body,
      updatedAt: firebase.admin.firestore.FieldValue.serverTimestamp()
    };
    
    await productsRef.update(productData);
    
    res.json({
      id,
      ...productData
    });
  } catch (error) {
    console.error('Firestore ürün güncellenirken hata:', error);
    res.status(500).json({ error: 'Sunucu hatası', details: error.message });
  }
});

app.delete('/api/firestore/products/:id', async (req, res) => {
  try {
    if (!isConfigured) {
      return res.status(500).json({ 
        error: 'Firebase yapılandırılmamış', 
        details: errorMessage 
      });
    }

    const { id } = req.params;
    await db.collection('products').doc(id).delete();
    
    res.json({ id, deleted: true });
  } catch (error) {
    console.error('Firestore ürün silinirken hata:', error);
    res.status(500).json({ error: 'Sunucu hatası', details: error.message });
  }
});

// 404 sayfası
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Socket.IO bağlantıları
io.on('connection', (socket) => {
  console.log('Bir istemci bağlandı');
  
  // Simüle edilmiş veriler için periyodik gönderim
  const statsInterval = setInterval(() => {
    // Rastgele istatistikler oluştur
    const statsUpdate = {
      sales: {
        current: 5000 + Math.floor(Math.random() * 500),
        previous: 4500
      },
      devices: {
        online: 3 + Math.floor(Math.random() * 2),
        total: 4,
        offline: 1 - Math.floor(Math.random() * 2),
      },
      orders: {
        current: 350 + Math.floor(Math.random() * 30),
        previous: 320
      },
      stock: {
        warnings: 1 + Math.floor(Math.random() * 3),
        coffeeLow: Math.floor(Math.random() * 3),
        milkLow: Math.floor(Math.random() * 2)
      },
      systemMetrics: {
        temperature: 83 + Math.random() * 5,
        humidity: 45 + Math.random() * 8,
        waterPressure: 2.3 + Math.random() * 0.5
      },
      stockLevels: {
        coffee: 55 + Math.floor(Math.random() * 20),
        milk: 40 + Math.floor(Math.random() * 30),
        water: 65 + Math.floor(Math.random() * 25)
      }
    };
    
    socket.emit('statsUpdate', statsUpdate);
  }, 5000);
  
  // Simüle edilmiş siparişler için periyodik gönderim
  const ordersInterval = setInterval(() => {
    const statuses = ['Hazırlanıyor', 'Hazır', 'Tamamlandı'];
    const orders = [
      { 
        id: '12345', 
        time: `${Math.floor(Math.random() * 10) + 1} dk`, 
        status: statuses[Math.floor(Math.random() * statuses.length)] 
      },
      { 
        id: '12344', 
        time: `${Math.floor(Math.random() * 15) + 1} dk`, 
        status: statuses[Math.floor(Math.random() * statuses.length)] 
      },
      { 
        id: '12343', 
        time: `${Math.floor(Math.random() * 20) + 1} dk`, 
        status: statuses[Math.floor(Math.random() * statuses.length)] 
      }
    ];
    
    socket.emit('ordersUpdate', orders);
  }, 8000);
  
  // Bağlantı kesildiğinde interval temizleme
  socket.on('disconnect', () => {
    console.log('Bir istemci ayrıldı');
    clearInterval(statsInterval);
    clearInterval(ordersInterval);
  });
});

// Sunucuyu başlat
server.listen(PORT, () => {
  console.log(`Sunucu http://localhost:${PORT} adresinde çalışıyor`);
  
  // Firebase durumunu kontrol et
  if (isConfigured) {
    console.log('Firebase Firestore bağlantısı aktif');
  } else {
    console.log('Firebase Firestore bağlantısı yapılandırılmamış:', errorMessage);
  }
});