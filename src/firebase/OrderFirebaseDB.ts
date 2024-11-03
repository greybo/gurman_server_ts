import { getDatabase, ref, onValue, Database, remove, set } from 'firebase/database';
import { OrderStatusType } from '../models/OrderStatusType'; // This is a custom enum
import { OrderFirebaseModel } from '../models/OrderFirebaseModel';
// import MapperToFirebaseModelAll from './MapperToFirebaseModelAll';
import { OrderResponse } from '../models/OrderResponse';
import serviceAccount from '../../serviceAccountKey_warehouse.json';
import { ApiSalesDriveService } from '../rest/ApiSalesDrive';
var admin = require("firebase-admin");

export class OrderFirebaseDB {

    private updateAtLast: string;
    private orderDBPath = 'DEBUG/orders';

    constructor() {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            databaseURL: "https://warehouse-bc3d6-default-rtdb.europe-west1.firebasedatabase.app"
        });
        this.updateAtLast = "2024-11-03 20:52:33";
        // this.updateAtLast = "2024-10-02 20:24:40";
    }
    
    listenerOrder(callback: (allModel: OrderFirebaseModel[]) => unknown) {
        // Setup Firebase listener
        const ordersRef = ref(admin.database(), `${this.orderDBPath}`);
        console.log(`Start fetching from firebase`);
        onValue(ordersRef, async (snapshot) => {
            const data = snapshot.val();
            if (!data) return;

            console.log(data)
            const allModel = (Object.values(data) as OrderFirebaseModel[])

            callback(allModel);
        });
    }

    async removeOrder(id: number,): Promise<void> {
        return admin.database().ref(`${this.orderDBPath}/${id}`).remove()
    }
}

