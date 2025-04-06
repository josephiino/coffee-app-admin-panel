export interface MachineStatus {
    isOnline: boolean;
    lastHeartbeat: Date;
    currentState: 'IDLE' | 'BREWING' | 'MAINTENANCE' | 'ERROR';
}

export interface MachineMetrics {
    totalCupsServed: number;
    dailyCupsServed: number;
    averageBrewTime: number;
    errorCount: number;
}

export interface MachineInventory {
    coffeeBeans: number;
    waterLevel: number;
    milkLevel: number;
    sugarLevel: number;
}

export class Machine {
    constructor(
        public id: string,
        public name: string,
        public location: string,
        public status: MachineStatus,
        public metrics: MachineMetrics,
        public inventory: MachineInventory,
        public lastMaintenance: Date
    ) {}

    public updateStatus(newStatus: Partial<MachineStatus>): void {
        this.status = { ...this.status, ...newStatus };
    }

    public updateMetrics(newMetrics: Partial<MachineMetrics>): void {
        this.metrics = { ...this.metrics, ...newMetrics };
    }

    public updateInventory(newInventory: Partial<MachineInventory>): void {
        this.inventory = { ...this.inventory, ...newInventory };
    }
} 