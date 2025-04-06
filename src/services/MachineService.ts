import { Machine } from '../models/Machine';

export class MachineService {
    private machines: Map<string, Machine> = new Map();
    private static instance: MachineService;

    private constructor() {}

    public static getInstance(): MachineService {
        if (!MachineService.instance) {
            MachineService.instance = new MachineService();
        }
        return MachineService.instance;
    }

    public async getAllMachines(): Promise<Machine[]> {
        return Array.from(this.machines.values());
    }

    public async getMachineById(id: string): Promise<Machine | undefined> {
        return this.machines.get(id);
    }

    public async updateMachineStatus(id: string, status: Partial<Machine['status']>): Promise<void> {
        const machine = this.machines.get(id);
        if (machine) {
            machine.updateStatus(status);
            this.machines.set(id, machine);
        }
    }

    public async updateMachineMetrics(id: string, metrics: Partial<Machine['metrics']>): Promise<void> {
        const machine = this.machines.get(id);
        if (machine) {
            machine.updateMetrics(metrics);
            this.machines.set(id, machine);
        }
    }

    public async updateMachineInventory(id: string, inventory: Partial<Machine['inventory']>): Promise<void> {
        const machine = this.machines.get(id);
        if (machine) {
            machine.updateInventory(inventory);
            this.machines.set(id, machine);
        }
    }

    public async addMachine(machine: Machine): Promise<void> {
        this.machines.set(machine.id, machine);
    }

    public async removeMachine(id: string): Promise<void> {
        this.machines.delete(id);
    }
} 