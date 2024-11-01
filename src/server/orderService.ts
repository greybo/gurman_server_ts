import { getDatabase, ref, onValue, Database, remove, set } from 'firebase/database';
import { myApp } from '../firebase/initFirebase';
import axios from 'axios';
import { OrderStatusType } from '../models/OrderStatusType'; // Adjust the path as necessary
import { OrderFirebaseModel } from '../models/OrderFirebaseModel';
import MapperToFirebaseModelAll from './MapperToFirebaseModelAll';
import { OrderDatum, OrderResponse, Product } from '../models/OrderResponse';
import { OrderUpdateBody } from '../models/OrderUpdateBody';

export class OrderService {
    
    private firebaseDB: Database =  getDatabase(myApp);

    private allFirebaseModel: OrderFirebaseModel[] = [];
    private readonly ids: number[];

    private updateAtLast: string;
    private orderDBPath = 'debug2/orders';

    constructor(
        private apiClient = axios.create({
            baseURL: process.env.SALES_DRIVE_BASE_URL
        })
    ) {
        this.ids = [
            OrderStatusType.ForDispatch,
            OrderStatusType.Collect,
            OrderStatusType.CollectDone,
            OrderStatusType.Salle
        ];
        
        this.updateAtLast = "0";
    }

    // async startService(): Promise<void> {
    //     // Setup Firebase listener
    //     const ordersRef = ref(this.firebaseDB, `${this.orderDBPath}`);
        
    //     onValue(ordersRef, async (snapshot) => {
    //         const data = snapshot.val() as Record<string, OrderFirebaseModel>;
    //         const models = Object.values(data) as OrderFirebaseModel[];
    //         if (!data) return;
    //         this.allFirebaseModel = models
    //         this.allFirebaseModel = (Object.values(data) as OrderFirebaseModel[])
    //             .filter((model: OrderFirebaseModel) => {
    //                 if (!this.ids.includes(model.statusId)) {
    //                     remove(ref(this.firebaseDB, `${this.orderDBPath}/${model.id}`));
    //                     return false;
    //                 }
    //                 return true;
    //             });

    //         const syncList = this.allFirebaseModel.filter(model => model.syncSalesDrive);
    //         await this.handleUpdateSalesDrive(syncList);
    //     });

    //     // Start periodic fetching
    //     setInterval(async () => {
    //         await this.fetchOrdersAll();
    //     }, 62000);
    // }

    async startService(): Promise<void> {
        // Setup Firebase listener
        const ordersRef = ref(this.firebaseDB, `${this.orderDBPath}`);
        
        onValue(ordersRef, async (snapshot) => {
            const data = snapshot.val();
            if (!data) return;

            this.allFirebaseModel = (Object.values(data) as OrderFirebaseModel[])
                .filter((model: OrderFirebaseModel) => {
                    if (!this.ids.includes(model.statusId)) {
                        remove(ref(this.firebaseDB, `${this.orderDBPath}/${model.id}`));
                        return false;
                    }
                    return true;
                });

            const syncList = this.allFirebaseModel.filter(model => model.syncSalesDrive);
            await this.handleUpdateSalesDrive(syncList);
        });

        // Start periodic fetching
        setInterval(async () => {
            await this.fetchOrdersAll();
        }, 62000);
    }

    private async fetchOrdersAll(): Promise<OrderFirebaseModel[] | null> {
        if (process.env.NODE_ENV !== 'development') return null;

        try {
            let results: OrderResponse[];
            
            if (this.updateAtLast === "0") {
                console.log(`Fetching from salesDrive by status=${this.ids.join(", ")}`);
                results = await Promise.all(
                    this.ids.map(id => this.getOrderByStatus(id))
                ) as OrderResponse[];
            } else {
                console.log(`Fetching from salesDrive by updateAtLast=${this.updateAtLast}`);
                const response = await this.getOrderByStatusUpdateAt(this.updateAtLast) as OrderResponse;
                results = [response];
            }

            const convertedModels = this.convertToFirebaseModel(results);
            if (!convertedModels) return null;

            for (const model of convertedModels) {
                if ((model.updateAt ?? '') > this.updateAtLast) {
                    if (this.ids.includes(model.statusId)) {
                        console.log(`Adding to Firebase id=${model.id}, status=${model.statusId}`);
                        await set(ref(this.firebaseDB, `${this.orderDBPath}/${model.id}`), model);
                    } else {
                        const existingModel = this.allFirebaseModel.find(m => m.id === model.id);
                        if (existingModel) {
                            console.log(`Removing from Firebase: id=${model.id}, status=${model.statusId}`);
                            await remove(ref(this.firebaseDB,`${this.orderDBPath}/${model.id}`));
                        }
                    }
                }
            }

            this.saveLastUpdateAt(convertedModels);
            return convertedModels;

        } catch (error) {
            console.error('Error in fetchOrdersAll:', error);
            return null;
        }
    }

    private async handleUpdateSalesDrive(list: OrderFirebaseModel[]): Promise<void> {
        for (const firebaseOrder of list) {
            try {
                await this.postUpdateOrderRemote(this.makeOrderBody(firebaseOrder));

                await set(ref(this.firebaseDB, `${this.orderDBPath}/${firebaseOrder.id}`), {
                    syncSalesDrive: false
                });
                console.log('Updated status to salesDrive');
            } catch (error) {
                console.error('Error updating salesDrive:', error);
            }
        }
    }

    private async getOrderByStatus(statusId: number): Promise<OrderResponse | null> {
        try {
            const response = await this.apiClient.get('/list', {
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

    private async getOrderByStatusUpdateAt(updateFrom: string): Promise<OrderResponse | null> {
        try {
            const response = await this.apiClient.get('/list', {
                params: {
                    'filter[updateAt][from]': updateFrom
                },
                headers: this.getHeaderWithApiKey()
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching orders by updateAt:', error);
            return null;
        }
    }

    private convertToFirebaseModel(responses: OrderResponse[]): OrderFirebaseModel[] {
        // Implementation of MapperToFirebaseModelAll logic here
        // This would need to be adapted based on your specific needs

        return responses
            .filter(Boolean)
            .flatMap(response => {
               const existingModels =  this.allFirebaseModel

                const mapper = new MapperToFirebaseModelAll(response);
                return mapper.mapper(existingModels);

                // return response.data?.map((datum: any) => this.mapDatumToFirebaseModel(datum));
            })
            .filter(Boolean);
    }

    private makeOrderBody(order: OrderFirebaseModel): OrderUpdateBody {
        return {
            data: {
                statusId: order.statusId.toString()
            },
            externalId: order.externalId || '',
            form: process.env.SALES_DRIVE_ORDER_UPDATE_FROM as string,
            id: (order.id ?? '').toString()
        };
    }

    private async postUpdateOrderRemote(body: any): Promise<any> {
        const response = await this.apiClient.post('/update/', body, {
            headers: this.getBaseHeader()
        });
        return response.data;
    }

    private getHeaderWithApiKey(): Record<string, string> {
        return {
            'Authorization': `Bearer ${process.env.API_KEY_SALES_DRIVE}`,
            'Content-Type': 'application/json'
        };
    }

    private getBaseHeader(): Record<string, string> {
        return {
            'Content-Type': 'application/json'
        };
    }

    private saveLastUpdateAt(models: OrderFirebaseModel[]): void {
        const maxUpdateAt = models.reduce((max, model) => {
            return (model.updateAt ?? '') > max ? (model.updateAt ?? '') : max;
        }, this.updateAtLast);

        if (maxUpdateAt > this.updateAtLast) {
            this.updateAtLast = maxUpdateAt;
            // Save to persistent storage if needed
        }
    }
}
