export interface ProductMetrics {
    totalSales: number;
    dailySales: number;
    averageRating: number;
    popularityRank: number;
}

export class Product {
    constructor(
        public id: string,
        public name: string,
        public description: string,
        public price: number,
        public ingredients: string[],
        public preparationTime: number,
        public metrics: ProductMetrics
    ) {}

    public updateMetrics(newMetrics: Partial<ProductMetrics>): void {
        this.metrics = { ...this.metrics, ...newMetrics };
    }

    public calculatePopularity(): number {
        return (this.metrics.dailySales * 0.6) + (this.metrics.averageRating * 0.4);
    }
} 