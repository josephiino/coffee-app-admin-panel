# RoboBrew Kahve Makineleri Yönetim Paneli

Bu proje, RoboBrew kahve makinelerinin yönetimi için geliştirilmiş bir web uygulamasıdır.

## Özellikler

- Makine durumu takibi
- Sipariş yönetimi
- Ürün yönetimi
- Gerçek zamanlı veri izleme
- Bakım takibi

## Kurulum

1. Projeyi klonlayın:

```bash
git clone https://github.com/yourusername/coffee-machine-admin.git
cd coffee-machine-admin
```

2. Bağımlılıkları yükleyin:

```bash
npm install
```

3. `.env` dosyasını oluşturun:

```
MONGO_URI=mongodb://localhost:27017/coffee-machine-admin
PORT=5000
NODE_ENV=development
```

4. MongoDB'yi başlatın

5. Uygulamayı başlatın:

```bash
npm start
```

## API Endpoints

### Makineler

- GET /api/machines - Tüm makineleri getir
- POST /api/machines - Yeni makine ekle
- PATCH /api/machines/:id - Makine güncelle
- DELETE /api/machines/:id - Makine sil

### Siparişler

- GET /api/orders - Tüm siparişleri getir
- POST /api/orders - Yeni sipariş oluştur
- PATCH /api/orders/:id - Sipariş güncelle
- DELETE /api/orders/:id - Sipariş sil

### Ürünler

- GET /api/products - Tüm ürünleri getir
- POST /api/products - Yeni ürün ekle
- PATCH /api/products/:id - Ürün güncelle
- DELETE /api/products/:id - Ürün sil

## Teknolojiler

- Node.js
- Express.js
- MongoDB
- Socket.IO
- HTML/CSS/JavaScript

## Lisans

MIT
