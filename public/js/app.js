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
        },
        machines: [
            {
                id: 'CM-001',
                location: 'İstanbul / Kadıköy',
                status: 'online',
                stock: {
                    coffee: 78,
                    milk: 65,
                    water: 90
                }
            },
            {
                id: 'CM-002',
                location: 'İstanbul / Beşiktaş',
                status: 'online',
                stock: {
                    coffee: 45,
                    milk: 30,
                    water: 82
                }
            },
            {
                id: 'CM-003',
                location: 'Ankara / Çankaya',
                status: 'online',
                stock: {
                    coffee: 92,
                    milk: 88,
                    water: 95
                }
            },
            {
                id: 'CM-004',
                location: 'İzmir / Karşıyaka',
                status: 'offline',
                stock: {
                    coffee: 20,
                    milk: 15,
                    water: 35
                }
            },
            {
                id: 'CM-005',
                location: 'İstanbul / Ataşehir',
                status: 'online',
                stock: {
                    coffee: 67,
                    milk: 59,
                    water: 75
                }
            }
        ]
    };
    
    updateDashboard(mockData);
    updateMachineList(mockData.machines);
    
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
}); 