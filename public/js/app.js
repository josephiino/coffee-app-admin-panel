document.addEventListener('DOMContentLoaded', function() {
    // Socket.io bağlantısını kur
    const socket = io();
    
    // Avatar kontrolü
    const avatarImages = document.querySelectorAll('.avatar');
    
    // Avatarların yüklenememesi durumunda varsayılan bir harf göster
    avatarImages.forEach(img => {
        img.onerror = function() {
            const userInitial = document.createElement('div');
            userInitial.classList.add('avatar-fallback');
            userInitial.textContent = 'A'; // Admin'in baş harfi
            this.parentNode.replaceChild(userInitial, this);
        };
    });
    
    // Anlık verileri dinle
    socket.on('stats_update', function(data) {
        updateDashboard(data);
    });
    
    // Gerçek verileri çek ve dashboard'u güncelle
    fetchDashboardData();

    function fetchDashboardData() {
        console.log('Dashboard verileri çekiliyor...');
        // Toplam satışı çek
        fetch('/api/orders/stats/total-sales')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Toplam satış alınamadı: ${response.statusText}`);
                }
                return response.json();
            })
            .then(salesData => {
                console.log('Toplam satış verisi:', salesData);
                // Satış kartını güncelle
                updateSalesCard(salesData.totalSales);
            })
            .catch(error => {
                console.error('Toplam satış çekilirken hata:', error);
                // Hata durumunda kartı sıfırla veya bir mesaj göster
                updateSalesCard(0, true, error.message || 'Bilinmeyen bir hata oluştu.'); // Hata mesajını ilet
            });

        // TODO: Diğer dashboard verilerini (cihaz durumu, sipariş sayısı vb.) 
        //       ilgili API endpoint'lerinden çekip updateDashboard fonksiyonunu 
        //       çağıracak kodlar buraya eklenebilir.
        // Şimdilik sadece satış güncelleniyor.
    }
    
    // Sadece satış kartını güncelleyen fonksiyon
    function updateSalesCard(total, hasError = false, errorMessage = 'Veri Alınamadı') {
        console.log(`[updateSalesCard] Çağrıldı. Değer: ${total}, Hata: ${hasError}, Mesaj: ${errorMessage}`);
        const cardElement = document.querySelector('.stat-card:nth-child(1)'); // Ana kart elementi
        const valueElement = cardElement.querySelector('.stat-value');
        const changeContainer = cardElement.querySelector('.stat-change');
        const comparisonContainer = cardElement.querySelector('.stat-comparison');

        if (!cardElement || !valueElement) {
             console.error('[updateSalesCard] Gerekli kart veya değer elementi bulunamadı!');
             return;
        }

        if (hasError) {
            valueElement.textContent = errorMessage; // Spesifik hata mesajını göster
            valueElement.style.fontSize = '1rem'; // Hata mesajı uzun olabileceğinden fontu küçült
            valueElement.style.color = 'var(--color-danger- Muted, #DC2626)'; // Hata rengi
            cardElement.classList.add('error-state'); // Hata durumu için sınıf ekle
             if (changeContainer) changeContainer.style.visibility = 'hidden';
             if (comparisonContainer) comparisonContainer.style.visibility = 'hidden';
        } else {
            valueElement.textContent = `₺${total.toFixed(2)}`;
            valueElement.style.fontSize = ''; // Normal font boyutuna dön
            valueElement.style.color = ''; // Normal renge dön
            cardElement.classList.remove('error-state'); // Hata sınıfını kaldır
            // Mevcut veride değişim/karşılaştırma olmadığı için gizli tutalım
            // if (changeContainer) changeContainer.style.visibility = 'visible'; 
            // if (comparisonContainer) comparisonContainer.style.visibility = 'visible';
             if (changeContainer) changeContainer.style.visibility = 'hidden'; // Geçici olarak gizli
             if (comparisonContainer) comparisonContainer.style.visibility = 'hidden'; // Geçici olarak gizli
        }
    }

    // Mevcut updateDashboard fonksiyonu diğer kartlar için kullanılabilir
    // ancak artık doğrudan mockData ile çağrılmamalı.
    function updateDashboard(data) {
        // Satış verileri güncelleme
        if (data.sales) {
            document.querySelector('.stat-card:nth-child(1) .stat-value').textContent = '₺' + data.sales.total;
            document.querySelector('.stat-card:nth-child(1) .stat-change span').textContent = data.sales.change + '%';
            document.querySelector('.stat-card:nth-child(1) .stat-comparison .value').textContent = '₺' + data.sales.previous;
            
            if (data.sales.change >= 0) {
                document.querySelector('.stat-card:nth-child(1) .stat-change').classList.add('positive');
                document.querySelector('.stat-card:nth-child(1) .stat-change').classList.remove('negative');
            } else {
                document.querySelector('.stat-card:nth-child(1) .stat-change').classList.add('negative');
                document.querySelector('.stat-card:nth-child(1) .stat-change').classList.remove('positive');
            }
        }
        
        // Cihaz durumu güncelleme
        if (data.devices) {
            document.querySelector('.stat-card:nth-child(2) .stat-value').textContent = data.devices.online + '/' + data.devices.total;
            document.querySelector('.stat-card:nth-child(2) .stat-change span').textContent = data.devices.offline + ' çevrimdışı';
            document.querySelector('.stat-card:nth-child(2) .status-breakdown .status-item:nth-child(1) span').textContent = data.devices.online + ' Çevrimiçi';
            document.querySelector('.stat-card:nth-child(2) .status-breakdown .status-item:nth-child(2) span').textContent = data.devices.offline + ' Çevrimdışı';
        }
        
        // Sipariş verileri güncelleme
        if (data.orders) {
            document.querySelector('.stat-card:nth-child(3) .stat-value').textContent = data.orders.today;
            document.querySelector('.stat-card:nth-child(3) .stat-change span').textContent = data.orders.change + '%';
            document.querySelector('.stat-card:nth-child(3) .stat-comparison .value').textContent = data.orders.yesterday;
            
            if (data.orders.change >= 0) {
                document.querySelector('.stat-card:nth-child(3) .stat-change').classList.add('positive');
                document.querySelector('.stat-card:nth-child(3) .stat-change').classList.remove('negative');
            } else {
                document.querySelector('.stat-card:nth-child(3) .stat-change').classList.add('negative');
                document.querySelector('.stat-card:nth-child(3) .stat-change').classList.remove('positive');
            }
        }
        
        // Stok uyarıları güncelleme
        if (data.stock) {
            document.querySelector('.stat-card:nth-child(4) .stat-value').textContent = data.stock.warnings + ' Uyarı';
            document.querySelector('.stat-card:nth-child(4) .warning-item:nth-child(1) span').textContent = data.stock.coffee_low + ' cihazda kahve az';
            document.querySelector('.stat-card:nth-child(4) .warning-item:nth-child(2) span').textContent = data.stock.milk_low + ' cihazda süt az';
        }
        
        // Sistem metrikleri güncelleme
        if (data.system) {
            document.querySelector('.system-metrics .metric-item:nth-child(1) .metric-value').textContent = data.system.temperature + '°C';
            document.querySelector('.system-metrics .metric-item:nth-child(2) .metric-value').textContent = data.system.humidity + '%';
            document.querySelector('.system-metrics .metric-item:nth-child(3) .metric-value').textContent = data.system.pressure + ' bar';
        }
        
        // Stok seviyeleri güncelleme
        if (data.stock_levels) {
            // Kahve
            const coffeeEl = document.querySelector('.stock-levels .stock-item:nth-child(1)');
            coffeeEl.querySelector('.stock-fill').style.width = data.stock_levels.coffee + '%';
            coffeeEl.querySelector('.stock-value').textContent = data.stock_levels.coffee + '%';
            
            // Süt
            const milkEl = document.querySelector('.stock-levels .stock-item:nth-child(2)');
            milkEl.querySelector('.stock-fill').style.width = data.stock_levels.milk + '%';
            milkEl.querySelector('.stock-value').textContent = data.stock_levels.milk + '%';
            
            // Su
            const waterEl = document.querySelector('.stock-levels .stock-item:nth-child(3)');
            waterEl.querySelector('.stock-fill').style.width = data.stock_levels.water + '%';
            waterEl.querySelector('.stock-value').textContent = data.stock_levels.water + '%';
        }
    }
    
    // Makine listesini güncelleme fonksiyonu
    function updateMachineList(machines) {
        const machineItemsContainer = document.querySelector('.machine-items');
        if (!machineItemsContainer) return;
        
        // Mevcut içeriği temizle
        machineItemsContainer.innerHTML = '';
        
        // Her makine için satır oluştur
        machines.forEach(machine => {
            const row = document.createElement('tr');
            row.classList.add(machine.status === 'online' ? 'status-online' : 'status-offline');
            
            // Stok durumuna göre CSS sınıfları
            const coffeeStockClass = getStockClass(machine.stock.coffee);
            const milkStockClass = getStockClass(machine.stock.milk);
            const waterStockClass = getStockClass(machine.stock.water);
            
            row.innerHTML = `
                <td>${machine.id}</td>
                <td>${machine.location}</td>
                <td>
                    <span class="status-badge ${machine.status === 'online' ? 'online' : 'offline'}">
                        ${machine.status === 'online' ? 'Çevrimiçi' : 'Çevrimdışı'}
                    </span>
                </td>
                <td>
                    <div class="stock-indicator">
                        <div class="stock-bar">
                            <div class="stock-fill ${coffeeStockClass}" style="width: ${machine.stock.coffee}%"></div>
                        </div>
                        <span class="stock-percentage">${machine.stock.coffee}%</span>
                    </div>
                </td>
                <td>
                    <div class="stock-indicator">
                        <div class="stock-bar">
                            <div class="stock-fill ${milkStockClass}" style="width: ${machine.stock.milk}%"></div>
                        </div>
                        <span class="stock-percentage">${machine.stock.milk}%</span>
                    </div>
                </td>
                <td>
                    <div class="stock-indicator">
                        <div class="stock-bar">
                            <div class="stock-fill ${waterStockClass}" style="width: ${machine.stock.water}%"></div>
                        </div>
                        <span class="stock-percentage">${machine.stock.water}%</span>
                    </div>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-icon" title="Detaylar">
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                            </svg>
                        </button>
                        <button class="btn btn-icon" title="Düzenle">
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                            </svg>
                        </button>
                        <button class="btn btn-icon text-danger" title="Yeniden Başlat">
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                            </svg>
                        </button>
                    </div>
                </td>
            `;
            
            machineItemsContainer.appendChild(row);
        });
    }
    
    // Stok yüzdesine göre uygun CSS sınıfını döndür
    function getStockClass(percentage) {
        if (percentage <= 20) return 'stock-critical';
        if (percentage <= 40) return 'stock-warning';
        return 'stock-good';
    }

    // --- Socket.IO Entegrasyonu Başlangıç ---
    console.log('Socket.IO bağlantısı kuruluyor (app.js)...');

    // Mevcut socket değişkenini kullanarak olayları dinle
    socket.on('connect', () => {
        console.log('Socket.IO sunucusuna başarıyla bağlandı (app.js). ID:', socket.id);
    });

    socket.on('disconnect', (reason) => {
        console.log('Socket.IO bağlantısı kesildi (app.js). Neden:', reason);
    });

    socket.on('connect_error', (error) => {
        console.error('Socket.IO bağlantı hatası (app.js):', error);
    });

    // Toplam satış güncelleme olayını dinle
    socket.on('total_sales_updated', (data) => {
        console.log("[Socket.IO] 'total_sales_updated' sinyali alındı:", data);
        if (data && typeof data.totalSales === 'number') {
            updateSalesCard(data.totalSales); // Satış kartını yeni değerle güncelle
        } else {
            console.warn('Alınan total_sales_updated verisi geçersiz.');
        }
    });
    console.log("[Socket.IO] 'total_sales_updated' olayı dinleniyor...");
    // --- Socket.IO Entegrasyonu Bitiş ---
}); 