import { MachineService } from '../services/MachineService';
import { Machine } from '../models/Machine';

export class MachineListViewModel {
    private machineService: MachineService;
    private machines: Machine[] = [];
    private filteredMachines: Machine[] = [];
    private searchTerm: string = '';
    private statusFilter: 'all' | 'online' | 'offline' = 'all';

    constructor() {
        this.machineService = MachineService.getInstance();
        this.initialize();
    }

    private async initialize(): Promise<void> {
        await this.loadMachines();
        this.applyFilters();
    }

    private async loadMachines(): Promise<void> {
        this.machines = await this.machineService.getAllMachines();
    }

    public getMachines(): Machine[] {
        return this.filteredMachines;
    }

    public setSearchTerm(term: string): void {
        this.searchTerm = term.toLowerCase();
        this.applyFilters();
    }

    public setStatusFilter(status: 'all' | 'online' | 'offline'): void {
        this.statusFilter = status;
        this.applyFilters();
    }

    private applyFilters(): void {
        this.filteredMachines = this.machines.filter(machine => {
            const matchesSearch = machine.name.toLowerCase().includes(this.searchTerm) ||
                                machine.location.toLowerCase().includes(this.searchTerm);
            
            const matchesStatus = this.statusFilter === 'all' ||
                                (this.statusFilter === 'online' && machine.status.isOnline) ||
                                (this.statusFilter === 'offline' && !machine.status.isOnline);

            return matchesSearch && matchesStatus;
        });
    }

    public async refreshData(): Promise<void> {
        await this.loadMachines();
        this.applyFilters();
    }

    public getMachineStatusCount(): { online: number; offline: number } {
        return {
            online: this.machines.filter(m => m.status.isOnline).length,
            offline: this.machines.filter(m => !m.status.isOnline).length
        };
    }

    public getLowStockMachines(): Machine[] {
        return this.machines.filter(machine => 
            machine.inventory.coffeeBeans < 20 || 
            machine.inventory.waterLevel < 20 || 
            machine.inventory.milkLevel < 20
        );
    }

    public async updateMachineStatus(id: string, status: Partial<Machine['status']>): Promise<void> {
        await this.machineService.updateMachineStatus(id, status);
        await this.refreshData();
    }
} 