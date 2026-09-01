export interface User {
    id: string;
    name?: string;
    username?: string;
}

export interface BomItem {
    id: string;
    childPartNumber: string;
    childPartName: string;
    quantityRequired: number;
    unit: string;
}

export interface Bom {
    _id?: string;
    id: string;
    kingPartNumber: string;
    kingPartName?: string;
    items: BomItem[];
}

export interface TransactionItem {
    id: string;
    partNumber: string;
    partName?: string;
    name?: string;
    quantity: number;
    unit: string;
}

export interface Transaction {
    _id?: string;
    id: string;
    transactionId?: string;
    workOrder?: string;
    kingPartNumber?: string;
    quantity?: number;
    project?: string;
    notes?: string;
    status?: string;
    type?: string;
    details?: string;
    operator?: User;
    createdBy?: User;
    performedBy?: User;
    checkoutDate?: string | Date;
    createdAt: string | Date;
    items: TransactionItem[];
}

export interface MasterItem {
    id: string;
    partNumber: string;
    partName: string;
    unit: string;
}

export interface PreviewItem {
    partNumber: string;
    partName: string;
    quantity: number;
    unit: string;
}
