import axios from 'axios';
import { OrderResponse, OrderDatum, ApiResponse } from '../models/OrderResponseClass';
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
            if (response.data && response.data.data) {
                console.log('Fetch by updateDate1 - length =', response.data.data.length);
            } else {
                console.log('Fetch by updateDate1 - data is undefined');
            }
            const list = response.data.data;
            if (list.length > 0) {
              const joinString =  list.map((order) => { order.id }).join(", ");
                console.log('Fetch by updateDate2: orderIds:', joinString);
            } else {
                console.log('Fetch by updateDate2 - data is undefined or empty');
            }
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

    async postUpdateOrderRemote(body: any): Promise<any> {
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

// export class ApiSalesDriveService {
// private async getOrderByStatus(statusId: number): Promise<OrderResponse | null> {
//     try {
//         const response = await this.apiClient.get('/list/', {
//             params: {
//                 'filter[statusId]': statusId.toString()
//             },
//             headers: this.getHeaderWithApiKey()
//         });
//         return response.data;
//     } catch (error) {
//         console.error(`Error fetching orders for status ${statusId}:`, error);
//         return null;
//     }
// }
// private async getOrderByStatusUpdateAt(updateFrom: string): Promise<OrderResponse | null> {
//     try {
//         const response = await this.apiClient.get('/list/', {
//             params: {
//                 'filter[updateAt][from]': updateFrom
//             },
//             headers: this.getHeaderWithApiKey()
//         });
//         return response.data;
//     } catch (error) {
//         console.error('Error fetching orders by updateAt:', error);
//         return null;
//     }
// }
// private makeOrderBody(order: OrderFirebaseModel): OrderUpdateBody {
//     return {
//         data: {
//             statusId: order.statusId.toString()
//         },
//         externalId: order.externalId || '',
//         form: process.env.SALES_DRIVE_ORDER_UPDATE_FROM as string,
//         id: (order.id ?? '').toString()
//     };
// }

// private async postUpdateOrderRemote(body: any): Promise<any> {
//     const response = await this.apiClient.post('/update/', body, {
//         headers: this.getBaseHeader()
//     });
//     return response.data;
// }


// private getHeaderWithApiKey(): Record<string, string> {
//     return {
//         'Form-Api-Key': process.env.SALES_DRIVE_ORDER_FETCH_LIST_KEY as string,
//         'Content-Type': 'application/json'
//     };
// }

// private getBaseHeader(): Record<string, string> {
//     return {
//         'Content-Type': 'application/json'
//     };
// }
// }