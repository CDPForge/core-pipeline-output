import { GoogleTopicsMap } from "./gTopics";
export interface Product {
    id: string;
    price: number;
    brand?: string;
    category?: string;
    quantity: number;
    currency?: string;
}

export interface Log {
    client: number;
    date: string;
    device: {
        browser?: string;
        id: string;
        ip?: string;
        os?: string;
        type?: string;
        userAgent?: string;
    };
    event: string;
    geo?: {
        city?: string;
        country?: string;
        point?: {
            type: string;
            coordinates: number[];
        };
        region?: string;
    };
    googleTopics?: GoogleTopic[];
    instance: number;
    page: {
        description?: string;
        href?: string;
        image?: string;
        title: string;
        type?: string;
    };
    product?: Product[];
    referrer?: string;
    session: string;
    target?: string;
    order?: string;
}

export interface GoogleTopic {
    id: keyof typeof GoogleTopicsMap;
    name: (typeof GoogleTopicsMap)[keyof typeof GoogleTopicsMap];
}