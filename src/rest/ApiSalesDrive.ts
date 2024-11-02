import axios from 'axios';
import { OrderResponse, OrderDatum, ApiResponse } from '../models/OrderResponse';
import { OrderFirebaseModel } from '../models/OrderFirebaseModel';
import { OrderUpdateBody } from '../models/OrderUpdateBody';


export class ApiSalesDriveService {

    private apiClient;

    constructor() {
        console.log(`Base URL: ${process.env.SALES_DRIVE_BASE_URL}`)

        this.apiClient = axios.create({
            baseURL: process.env.SALES_DRIVE_BASE_URL
        });
    }

    async getOrderByStatus(statusId: number): Promise<OrderResponse | null> {

        try {
            const response = await this.apiClient.get<ApiResponse<OrderDatum[]>>('/list/', {
                params: {
                    'filter[statusId]': statusId.toString()
                },
                headers: this.getHeaderWithApiKey()
            });

            // console.log('Fetch by status - success:', response.data.data.length);

            return response.data;
        } catch (error) {
            console.error(`Error fetching orders for status ${statusId}:`, error);
            return null;
        }
    }

    async getOrderByStatusUpdateAt(updateFrom: string): Promise<OrderResponse | null> {
        try {
            const response = await this.apiClient.get<OrderResponse>('/list/', {
                params: {
                    'filter[updateAt][from]': updateFrom
                },
                headers: this.getHeaderWithApiKey()
            });
        
            // console.log('Fetch by updateDate - success:', response.data.data.length);
            return response.data;
        } catch (error) {
            console.error('Error fetching orders by updateAt:', error);
            return null;
        }
    }

    makeOrderBody(order: OrderFirebaseModel): OrderUpdateBody {
        return {
            data: {
                statusId: order.statusId.toString()
            },
            externalId: order.externalId || '',
            form: process.env.SALES_DRIVE_ORDER_UPDATE_FROM as string,
            id: (order.id ?? '').toString()
        };
    }

    async postUpdateOrderRemote(body: OrderUpdateBody): Promise<any> {
        const response = await this.apiClient.post('/update/', body, {
            headers: this.getBaseHeader()
        });
        return response.data;
    }

    private getHeaderWithApiKey(): Record<string, string> {
        return {
            'Form-Api-Key': process.env.SALES_DRIVE_ORDER_FETCH_LIST_KEY as string,
            'Content-Type': 'application/json'
        };
    }

    private getBaseHeader(): Record<string, string> {
        return {
            'Content-Type': 'application/json'
        };
    }
}