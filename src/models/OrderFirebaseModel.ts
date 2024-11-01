interface OrderFirebaseModel {
    id?: number;
    products?: Array<FirebaseProduct>;
    fName?: string;
    lName?: string;
    comment?: string;
    shippingData?: FirebaseShippingData;
    trackingNumber?: string;
    updateAt?: string;
    idBox?: string;
    forCheck: boolean;
    statusId: number;
    externalId?: string;
    syncSalesDrive: boolean;
}

interface FirebaseProduct { 
    parameterProductId?: string;
    amount: number;
    text?: string;
    barcode?: string;
    restCount?: number;
    sku?: string;
}

interface FirebaseShippingData { 
    text?: string;
    value?: number;
}

export {
    FirebaseShippingData,
    FirebaseProduct,
    OrderFirebaseModel,
  };