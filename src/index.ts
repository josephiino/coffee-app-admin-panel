import { DashboardViewModel } from './viewmodels/DashboardViewModel';
import { MachineListViewModel } from './viewmodels/MachineListViewModel';
import { RealTimeDataViewModel } from './viewmodels/RealTimeDataViewModel';

class App {
    private dashboardViewModel: DashboardViewModel;
    private machineListViewModel: MachineListViewModel;
    private realTimeDataViewModel: RealTimeDataViewModel;

    constructor() {
        this.dashboardViewModel = new DashboardViewModel();
        this.machineListViewModel = new MachineListViewModel();
        this.realTimeDataViewModel = new RealTimeDataViewModel();
        this.initialize();
    }

    private async initialize(): Promise<void> {
        await this.setupEventListeners();
        await this.updateDashboard();
        await this.updateMachineList();
        await this.updateRealTimeData();
    }

    private async setupEventListeners(): Promise<void> {
        // Dashboard güncelleme butonu
        const refreshDashboardBtn = document.getElementById('refresh-dashboard');
        if (refreshDashboardBtn) {
            refreshDashboardBtn.addEventListener('click', async () => {
                await this.updateDashboard();
            });
        }

        // Makine listesi arama kutusu
        const searchInput = document.getElementById('machine-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const target = e.target as HTMLInputElement;
                this.machineListViewModel.setSearchTerm(target.value);
                this.updateMachineList();
            });
        }

        // Durum filtreleme butonları
        const statusFilters = document.querySelectorAll('.status-filter');
        statusFilters.forEach(filter => {
            filter.addEventListener('click', (e) => {
                const target = e.target as HTMLElement;
                const status = target.dataset.status as 'all' | 'online' | 'offline';
                this.machineListViewModel.setStatusFilter(status);
                this.updateMachineList();
            });
        });
    }

    private async updateDashboard(): Promise<void> {
        await this.dashboardViewModel.refreshData();
        
        // Toplam satış
        const totalSalesElement = document.getElementById('total-sales');
        if (totalSalesElement) {
            totalSalesElement.textContent = this.dashboardViewModel.getTotalSales().toString();
        }

        // Çevrimiçi makine sayısı
        const onlineMachinesElement = document.getElementById('online-machines');
        if (onlineMachinesElement) {
            onlineMachinesElement.textContent = this.dashboardViewModel.getOnlineMachines().toString();
        }

        // Toplam makine sayısı
        const totalMachinesElement = document.getElementById('total-machines');
        if (totalMachinesElement) {
            totalMachinesElement.textContent = this.dashboardViewModel.getTotalMachines().toString();
        }

        // Düşük stok uyarıları
        const lowStockWarningsElement = document.getElementById('low-stock-warnings');
        if (lowStockWarningsElement) {
            lowStockWarningsElement.textContent = this.dashboardViewModel.getLowStockWarnings().toString();
        }
    }

    private async updateMachineList(): Promise<void> {
        await this.machineListViewModel.refreshData();
        const machines = this.machineListViewModel.getMachines();
        
        // Makine listesi container'ı
        const machineListContainer = document.getElementById('machine-list');
        if (machineListContainer) {
            machineListContainer.innerHTML = machines.map(machine => `
                <div class="machine-item">
                    <div class="machine-info">
                        <div class="machine-id">${machine.id}</div>
                        <div class="machine-location">${machine.location}</div>
                    </div>
                    <div class="status-badge ${machine.status.isOnline ? 'status-online' : 'status-offline'}">
                        <span class="status-dot ${machine.status.isOnline ? 'dot-online' : 'dot-offline'}"></span>
                        <span>${machine.status.isOnline ? 'Online' : 'Offline'}</span>
                    </div>
                </div>
            `).join('');
        }
    }

    private async updateRealTimeData(): Promise<void> {
        const systemMetrics = this.realTimeDataViewModel.getSystemMetrics();
        
        // Sistem metrikleri
        const temperatureElement = document.getElementById('system-temperature');
        if (temperatureElement) {
            temperatureElement.textContent = `${systemMetrics.temperature}°C`;
        }

        const humidityElement = document.getElementById('system-humidity');
        if (humidityElement) {
            humidityElement.textContent = `${systemMetrics.humidity}%`;
        }

        const waterPressureElement = document.getElementById('system-water-pressure');
        if (waterPressureElement) {
            waterPressureElement.textContent = `${systemMetrics.waterPressure} bar`;
        }

        // Aktif siparişler
        const activeOrders = this.realTimeDataViewModel.getActiveOrders();
        const ordersContainer = document.getElementById('active-orders');
        if (ordersContainer) {
            ordersContainer.innerHTML = activeOrders.map(order => `
                <div class="order-item">
                    <div class="order-info">
                        <div class="order-id">${order.id}</div>
                        <div class="order-location">${order.machineId}</div>
                    </div>
                    <div class="order-status ${order.status.toLowerCase()}">${order.status}</div>
                </div>
            `).join('');
        }

        // Stok seviyeleri
        const stockLevels = this.realTimeDataViewModel.getStockLevels();
        const stockContainer = document.getElementById('stock-levels');
        if (stockContainer) {
            stockContainer.innerHTML = stockLevels.map(stock => `
                <div class="stock-item">
                    <div class="stock-label">${stock.machineId}</div>
                    <div class="stock-bar">
                        <div class="stock-fill" style="width: ${stock.coffeeLevel}%"></div>
                    </div>
                    <div class="stock-value">${stock.coffeeLevel}%</div>
                </div>
            `).join('');
        }

        // Uyarılar
        const alerts = this.realTimeDataViewModel.getAlerts();
        const alertsContainer = document.getElementById('alerts-container');
        if (alertsContainer) {
            alertsContainer.innerHTML = alerts.map(alert => `
                <div class="alert alert-${alert.type}">
                    <div class="alert-icon">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path d="M10 6V10M10 14H10.01M19 10C19 14.9706 14.9706 19 10 19C5.02944 19 1 14.9706 1 10C1 5.02944 5.02944 1 10 1C14.9706 1 19 5.02944 19 10Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </div>
                    <div class="alert-content">
                        <div class="alert-title">${alert.machineId}</div>
                        <div class="alert-message">${alert.message}</div>
                    </div>
                    <div class="alert-action">Detaylar</div>
                </div>
            `).join('');
        }
    }
}

// Uygulamayı başlat
document.addEventListener('DOMContentLoaded', () => {
    new App();
}); 