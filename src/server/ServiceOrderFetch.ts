import { getDatabase, ref, onValue, Database, remove, set } from 'firebase/database';
import { OrderStatusType } from '../models/OrderStatusType'; // This is a custom enum
import { OrderFirebaseModel } from '../models/OrderFirebaseModel';
import MapperToFirebaseModelAll from './MapperToFirebaseModelAll';
import { OrderResponse } from '../models/OrderResponse';
import serviceAccount from '../../serviceAccountKey_prod.json';
import { ApiSalesDriveService } from '../rest/ApiSalesDrive';
var admin = require("firebase-admin");

export class OrderService {

    // private firebaseDB;//=  getDatabase(myApp);
    private api: ApiSalesDriveService;
    private allFirebaseModel: OrderFirebaseModel[] = [];
    private readonly ids: number[];

    private updateAtLast: string;
    private orderDBPath = 'DEBUG/orders';

    constructor() {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            databaseURL: "https://warehouse-bc3d6-default-rtdb.europe-west1.firebasedatabase.app"
        });
        this.api = new ApiSalesDriveService()
        // this.firebaseDB = admin.database();

        this.ids = [
            OrderStatusType.ForDispatch,
            OrderStatusType.Collect,
            OrderStatusType.CollectDone,
            OrderStatusType.Salle
        ];

        this.updateAtLast = "2024-10-02 20:24:40";
    }

    async startService(): Promise<void> {
        // Setup Firebase listener
        const ordersRef = ref(admin.database(), `${this.orderDBPath}`);
        console.log(`Start fetching from firebase`);
        onValue(ordersRef, async (snapshot) => {
            const data = snapshot.val();
            if (!data) return;

            this.allFirebaseModel = (Object.values(data) as OrderFirebaseModel[])
                .filter((model: OrderFirebaseModel) => {
                    if (!this.ids.includes(model.statusId)) {
                        console.log(`Firebase remove: status=${model.statusId}`);
                        admin.database().ref(`${this.orderDBPath}/${model.id}`).remove();
                        return false;
                    }
                    return true;
                });

            const syncList = this.allFirebaseModel.filter(model => model.syncSalesDrive);
            console.log(`Firebase change data event: size=${syncList.length}`);
            await this.handleUpdateSalesDrive(syncList);
        });

        console.log(`Start fetching from salesDrive`);

        await this.fetchOrdersSalesDrive();

        //TODO Uncomment this to enable periodic fetching
        // Start periodic fetching
        setInterval(async () => {
            await this.fetchOrdersSalesDrive();
        }, 62000);
    }

    private async fetchOrdersSalesDrive(): Promise<OrderFirebaseModel[] | null> {
        // if (process.env.NODE_ENV !== 'development') return null;

        try {
            let results: OrderResponse[];

            if (this.updateAtLast === "0") {
                console.log(`Fetching from salesDrive by status=${this.ids.join(", ")}`);
                results = await Promise.all(
                    this.ids.map(id => this.api.getOrderByStatus(id))
                ) as OrderResponse[];
            } else {
                console.log(`Fetching from salesDrive by updateAtLast=${this.updateAtLast}`);
                const response = await this.api.getOrderByStatusUpdateAt(this.updateAtLast) as OrderResponse;
                results = [response];
            }

            const convertedModels = this.convertToFirebaseModel(results);

            if (!convertedModels) return null;
            console.log(`result firebaseModels size=${convertedModels.length}`);
            let i = 0;
            for (const model of convertedModels) {
                console.log(`FirebaseModel  index=${++i}, id=${model.id}, status=${model.statusId}`);
                if ((model.updateAt ?? '') > this.updateAtLast) {
                    if (this.ids.includes(model.statusId)) {
                        console.log(`   Adding to Firebase  index=${i}, id=${model.id}, status=${model.statusId}`);
                        await admin.database().ref(`${this.orderDBPath}/${model.id}`).set(model);
                    } else {
                        const existingModel = this.allFirebaseModel.find(m => m.id === model.id);
                        if (existingModel) {
                            console.log(`   Removing from Firebase: index=${i}, status=${model.statusId}`);
                            await admin.database().ref(`${this.orderDBPath}/${model.id}`).remove();
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
                await this.api.postUpdateOrder(this.api.makeOrderBody(firebaseOrder));

                // await set(ref(this.firebaseDB, `${this.orderDBPath}/${firebaseOrder.id}`), 
                await admin.database()
                    .ref(`${this.orderDBPath}/${firebaseOrder.id}/syncSalesDrive`)
                    .set(false);
                console.log('Updated status to salesDrive');
            } catch (error) {
                console.error('Error updating salesDrive:', error);
            }
        }
    }

    private convertToFirebaseModel(responses: OrderResponse[]): OrderFirebaseModel[] {
        // Implementation of MapperToFirebaseModelAll logic here
        // This would need to be adapted based on your specific needs

        return responses
            .filter(Boolean)
            .flatMap(response => {
                const existingModels = this.allFirebaseModel

                const mapper = new MapperToFirebaseModelAll(response);
                return mapper.mapper(existingModels);

                // return response.data?.map((datum: any) => this.mapDatumToFirebaseModel(datum));
            })
            .filter(Boolean);
    }

    private saveLastUpdateAt(models: OrderFirebaseModel[]): void {
        const maxUpdateAt = models.reduce((max, model) => {
            return (model.updateAt ?? '') > max ? (model.updateAt ?? '') : max;
        }, this.updateAtLast);
        console.log(`maxUpdateAt=${maxUpdateAt}, this.updateAtLast=${this.updateAtLast}`);
        if (maxUpdateAt > this.updateAtLast) {
            this.updateAtLast = maxUpdateAt;
            // Save to persistent storage if needed
        }
    }
}
