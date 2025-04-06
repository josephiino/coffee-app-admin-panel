import { MachineService } from '../services/MachineService';
import { Machine } from '../models/Machine';
import { Order } from '../models/Order';

export class RealTimeDataViewModel {
    private machineService: MachineService;
    private machines: Machine[] = [];
    private activeOrders: Order[] = [];
    private updateInterval: number = 5000; // 5 seconds
    private intervalId: number | null = null;

    constructor() {
        this.machineService = MachineService.getInstance();
        this.initialize();
    }

    private async initialize(): Promise<void> {
        await this.loadInitialData();
        this.startRealTimeUpdates();
    }

    private async loadInitialData(): Promise<void> {
        this.machines = await this.machineService.getAllMachines();
        this.activeOrders = this.getActiveOrders();
    }

    private startRealTimeUpdates(): void {
        this.intervalId = window.setInterval(async () => {
            await this.updateRealTimeData();
        }, this.updateInterval);
    }

    public stopRealTimeUpdates(): void {
        if (this.intervalId !== null) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    private async updateRealTimeData(): Promise<void> {
        await this.loadInitialData();
    }

    public getSystemMetrics(): {
        temperature: number;
        humidity: number;
        waterPressure: number;
    } {
        // Bu değerler gerçek sensör verilerinden gelecek
        return {
            temperature: 24,
            humidity: 45,
            waterPressure: 2.4
        };
    }

    public getActiveOrders(): Order[] {
        return this.activeOrders;
    }

    public getStockLevels(): Array<{
        machineId: string;
        coffeeLevel: number;
        milkLevel: number;
        waterLevel: number;
    }> {
        return this.machines.map(machine => ({
            machineId: machine.id,
            coffeeLevel: machine.inventory.coffeeBeans,
            milkLevel: machine.inventory.milkLevel,
            waterLevel: machine.inventory.waterLevel
        }));
    }

    public getMachineStatus(): Array<{
        machineId: string;
        isOnline: boolean;
        currentState: string;
        lastHeartbeat: Date;
    }> {
        return this.machines.map(machine => ({
            machineId: machine.id,
            isOnline: machine.status.isOnline,
            currentState: machine.status.currentState,
            lastHeartbeat: machine.status.lastHeartbeat
        }));
    }

    public getAlerts(): Array<{
        type: 'warning' | 'error';
        message: string;
        machineId: string;
        timestamp: Date;
    }> {
        const alerts: Array<{
            type: 'warning' | 'error';
            message: string;
            machineId: string;
            timestamp: Date;
        }> = [];

        this.machines.forEach(machine => {
            if (machine.inventory.coffeeBeans < 20) {
                alerts.push({
                    type: 'warning',
                    message: 'Kahve stoku düşük',
                    machineId: machine.id,
                    timestamp: new Date()
                });
            }

            if (machine.inventory.waterLevel < 20) {
                alerts.push({
                    type: 'error',
                    message: 'Su seviyesi kritik',
                    machineId: machine.id,
                    timestamp: new Date()
                });
            }

            if (!machine.status.isOnline) {
                alerts.push({
                    type: 'error',
                    message: 'Cihaz çevrimdışı',
                    machineId: machine.id,
                    timestamp: new Date()
                });
            }
        });

        return alerts;
    }
} 