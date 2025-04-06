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
    
    // Örnek verilerle dashboard'u güncelle (geliştirme amaçlı)
    const mockData = {
        sales: {
            total: 4250,
            change: 12,
            previous: 3800
        },
        devices: {
            total: 5,
            online: 4,
            offline: 1
        },
        orders: {
            today: 18,
            change: 5,
            yesterday: 17
        },
        stock: {
            warnings: 2,
            coffee_low: 1,
            milk_low: 1
        },
        system: {
            temperature: 24.5,
            humidity: 65,
            pressure: 1.2
        },
        stock_levels: {
            coffee: 65,
            milk: 42,
            water: 80
        }
    };
    
    updateDashboard(mockData);
    
    // Dashboard verilerini güncelleme fonksiyonu
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
}); 