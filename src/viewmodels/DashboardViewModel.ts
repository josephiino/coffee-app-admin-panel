import { MachineService } from '../services/MachineService';
import { Machine } from '../models/Machine';

export class DashboardViewModel {
    private machineService: MachineService;
    private machines: Machine[] = [];
    private totalSales: number = 0;
    private onlineMachines: number = 0;
    private totalMachines: number = 0;
    private lowStockWarnings: number = 0;

    constructor() {
        this.machineService = MachineService.getInstance();
        this.initialize();
    }

    private async initialize(): Promise<void> {
        await this.loadMachines();
        this.calculateMetrics();
    }

    private async loadMachines(): Promise<void> {
        this.machines = await this.machineService.getAllMachines();
    }

    private calculateMetrics(): void {
        this.totalMachines = this.machines.length;
        this.onlineMachines = this.machines.filter(m => m.status.isOnline).length;
        
        this.totalSales = this.machines.reduce((sum, machine) => 
            sum + machine.metrics.totalCupsServed, 0);

        this.lowStockWarnings = this.machines.filter(machine => 
            machine.inventory.coffeeBeans < 20 || 
            machine.inventory.waterLevel < 20 || 
            machine.inventory.milkLevel < 20
        ).length;
    }

    public getTotalSales(): number {
        return this.totalSales;
    }

    public getOnlineMachines(): number {
        return this.onlineMachines;
    }

    public getTotalMachines(): number {
        return this.totalMachines;
    }

    public getLowStockWarnings(): number {
        return this.lowStockWarnings;
    }

    public async refreshData(): Promise<void> {
        await this.loadMachines();
        this.calculateMetrics();
    }

    public getMachineStatusBreakdown(): { online: number; offline: number } {
        return {
            online: this.onlineMachines,
            offline: this.totalMachines - this.onlineMachines
        };
    }

    public getStockWarnings(): Array<{ machineId: string; type: string }> {
        return this.machines
            .filter(machine => 
                machine.inventory.coffeeBeans < 20 || 
                machine.inventory.waterLevel < 20 || 
                machine.inventory.milkLevel < 20
            )
            .map(machine => ({
                machineId: machine.id,
                type: this.getLowestStockType(machine)
            }));
    }

    private getLowestStockType(machine: Machine): string {
        const stocks = [
            { type: 'coffee', level: machine.inventory.coffeeBeans },
            { type: 'water', level: machine.inventory.waterLevel },
            { type: 'milk', level: machine.inventory.milkLevel }
        ];
        
        return stocks.reduce((lowest, current) => 
            current.level < lowest.level ? current : lowest
        ).type;
    }
} 