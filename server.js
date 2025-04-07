require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const compression = require('compression');
const dotenv = require('dotenv');

// Çevre değişkenlerini yükle
dotenv.config();

// Firebase yapılandırmasını içe aktar
const firebase = require('./server/config/firebase');

// Express uygulamasını oluştur
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

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

app.get('/machines', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'machines.html'));
});

app.get('/live-data', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'live-data.html'));
});

app.get('/stock', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'stock.html'));
});

app.get('/orders', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'orders.html'));
});

// API rotaları
// Tüm makineleri getir
app.get('/api/machines', (req, res) => {
  // Gerçek bir veritabanı yerine örnek veri
  const machines = [
    {
      id: "M001",
      location: "Kadıköy Şubesi",
      status: { isOnline: true },
      metrics: { 
        totalCupsServed: 4500, 
        dailyOrders: 120, 
        temperature: 85, 
        humidity: 45, 
        waterPressure: 2.5 
      },
      inventory: { 
        coffeeBeans: 65, 
        waterLevel: 80, 
        milkLevel: 45 
      },
      capacities: {
        coffeeBeans: 1000,
        waterLevel: 5000,
        milkLevel: 2000
      },
      lastUpdated: new Date(Date.now() - 1000 * 60 * 30).toISOString()
    },
    {
      id: "M002",
      location: "Beşiktaş Şubesi",
      status: { isOnline: true },
      metrics: { 
        totalCupsServed: 3800, 
        dailyOrders: 95, 
        temperature: 82, 
        humidity: 48, 
        waterPressure: 2.3 
      },
      inventory: { 
        coffeeBeans: 30, 
        waterLevel: 60, 
        milkLevel: 25 
      },
      capacities: {
        coffeeBeans: 1000,
        waterLevel: 5000,
        milkLevel: 2000
      },
      lastUpdated: new Date(Date.now() - 1000 * 60 * 10).toISOString()
    },
    {
      id: "M003",
      location: "Taksim Şubesi",
      status: { isOnline: false, maintenance: true },
      metrics: { 
        totalCupsServed: 2900, 
        dailyOrders: 0, 
        temperature: 0, 
        humidity: 0, 
        waterPressure: 0 
      },
      inventory: { 
        coffeeBeans: 10, 
        waterLevel: 15, 
        milkLevel: 5 
      },
      capacities: {
        coffeeBeans: 1000,
        waterLevel: 5000,
        milkLevel: 2000
      },
      lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString()
    },
    {
      id: "M004",
      location: "Şişli Şubesi",
      status: { isOnline: true },
      metrics: { 
        totalCupsServed: 5200, 
        dailyOrders: 140, 
        temperature: 87, 
        humidity: 42, 
        waterPressure: 2.6 
      },
      inventory: { 
        coffeeBeans: 75, 
        waterLevel: 85, 
        milkLevel: 60 
      },
      capacities: {
        coffeeBeans: 1000,
        waterLevel: 5000,
        milkLevel: 2000
      },
      lastUpdated: new Date(Date.now() - 1000 * 60 * 5).toISOString()
    }
  ];
  
  res.json(machines);
});

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

// Siparişleri getir
app.get('/api/orders', (req, res) => {
  const { page = 1, limit = 10, date } = req.query;
  
  // Gerçek bir veritabanı yerine örnek siparişler
  const statuses = ['pending', 'preparing', 'ready', 'completed', 'cancelled'];
  const locations = ['Kadıköy Şubesi', 'Beşiktaş Şubesi', 'Taksim Şubesi', 'Şişli Şubesi'];
  const products = ['Espresso', 'Americano', 'Cappuccino', 'Latte', 'Mocha'];
  
  // 20 örnek sipariş oluştur
  const orders = Array.from({ length: 20 }, (_, i) => {
    const orderDate = new Date();
    orderDate.setHours(orderDate.getHours() - Math.floor(Math.random() * 24));
    
    const productIndex = Math.floor(Math.random() * products.length);
    const quantity = Math.floor(Math.random() * 3) + 1;
    
    return {
      id: `ORD${10000 + i}`,
      location: locations[Math.floor(Math.random() * locations.length)],
      machineId: `M00${Math.floor(Math.random() * 4) + 1}`,
      products: [{
        name: products[productIndex],
        quantity,
        price: (Math.floor(Math.random() * 20) + 10) * quantity
      }],
      date: orderDate.toISOString(),
      status: statuses[Math.floor(Math.random() * statuses.length)]
    };
  });
  
  res.json({
    orders,
    page: Number(page),
    totalPages: 2,
    totalOrders: orders.length
  });
});

// Sipariş detayını getir
app.get('/api/orders/:orderId', (req, res) => {
  const { orderId } = req.params;
  
  // Örnek sipariş detayı
  const orderDetail = {
    id: orderId,
    location: "Kadıköy Şubesi",
    machineId: "M001",
    date: new Date().toISOString(),
    status: "preparing",
    products: [
      {
        name: 'Espresso',
        quantity: 2,
        price: 15.00,
        total: 30.00
      },
      {
        name: 'Cappuccino',
        quantity: 1,
        price: 25.00,
        total: 25.00
      }
    ],
    total: 55.00
  };
  
  res.json(orderDetail);
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
    if (!firebase.isConfigured) {
      return res.status(500).json({ 
        error: 'Firebase yapılandırılmamış', 
        details: firebase.errorMessage 
      });
    }

    const productsRef = firebase.db.collection('products');
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
    if (!firebase.isConfigured) {
      return res.status(500).json({ 
        error: 'Firebase yapılandırılmamış', 
        details: firebase.errorMessage 
      });
    }

    const productsRef = firebase.db.collection('products');
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
    if (!firebase.isConfigured) {
      return res.status(500).json({ 
        error: 'Firebase yapılandırılmamış', 
        details: firebase.errorMessage 
      });
    }

    const { id } = req.params;
    const productsRef = firebase.db.collection('products').doc(id);
    
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
    if (!firebase.isConfigured) {
      return res.status(500).json({ 
        error: 'Firebase yapılandırılmamış', 
        details: firebase.errorMessage 
      });
    }

    const { id } = req.params;
    await firebase.db.collection('products').doc(id).delete();
    
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
  if (firebase.isConfigured) {
    console.log('Firebase Firestore bağlantısı aktif');
  } else {
    console.log('Firebase Firestore bağlantısı yapılandırılmamış:', firebase.errorMessage);
  }
});