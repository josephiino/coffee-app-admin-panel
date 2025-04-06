export type OrderStatus = 'PENDING' | 'PREPARING' | 'COMPLETED' | 'CANCELLED' | 'FAILED';

export interface OrderItem {
    productId: string;
    quantity: number;
    price: number;
    customization?: Record<string, any>;
}

export class Order {
    constructor(
        public id: string,
        public machineId: string,
        public items: OrderItem[],
        public status: OrderStatus,
        public createdAt: Date,
        public completedAt?: Date,
        public totalAmount: number = 0
    ) {
        this.calculateTotal();
    }

    private calculateTotal(): void {
        this.totalAmount = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }

    public updateStatus(newStatus: OrderStatus): void {
        this.status = newStatus;
        if (newStatus === 'COMPLETED') {
            this.completedAt = new Date();
        }
    }

    public addItem(item: OrderItem): void {
        this.items.push(item);
        this.calculateTotal();
    }

    public removeItem(productId: string): void {
        this.items = this.items.filter(item => item.productId !== productId);
        this.calculateTotal();
    }
} 