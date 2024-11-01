import { Meta } from "./OrderMeta";

interface OrderResponse {
    data?: OrderDatum[];
    meta?: Meta;
  }
  
  interface OrderDatum {
    orderId?: number;
    primaryContact?: PrimaryContact;
    products?: Product[];
    statusId?: number;
    orderTime?: string;
    updateAt?: string;
    externalId?: string;
    comment?: string;
    shippingId?: number;
    orderDeliveryData?: DeliveryData[];
  
    // Computed properties converted to methods
    getFullName(): string;
    getShippingName(): string;
  }
  
  interface DeliveryData {
    trackingNumber?: string;
    provider?: string;
  }
  
  interface PrimaryContact {
    id?: number;
    fName?: string;
    lName?: string;
  }
  
  interface Product {
    productId?: number;
    amount: number;
    parameter?: string;
    text?: string;
    barcode?: string;
    sku?: string;
  }
  
  // Implementation class for OrderDatum to handle computed properties
  class OrderDatumImpl implements OrderDatum {
    orderId?: number;
    primaryContact?: PrimaryContact;
    products?: Product[];
    statusId?: number;
    orderTime?: string;
    updateAt?: string;
    externalId?: string;
    comment?: string;
    shippingId?: number;
    orderDeliveryData?: DeliveryData[];
  
    constructor(data: Partial<OrderDatum>) {
      Object.assign(this, data);
    }
  
    getFullName(): string {
      const names = [
        this.primaryContact?.fName,
        this.primaryContact?.lName
      ].filter(Boolean);
      return names.join(', ');
    }
  
    getShippingName(): string {
      return this.orderDeliveryData?.[0]?.provider || '';
    }
  }
  
  // Helper function to create OrderResponse with proper typing
  function createOrderResponse(data: Partial<OrderResponse>): OrderResponse {
    return {
      data: data.data?.map(datum => new OrderDatumImpl(datum)),
      meta: data.meta
    };
  }
  
  // Example of serialization helpers if needed
  const serializeKeys: Record<string, string> = {
    orderId: 'id',
    shippingId: 'shipping_method',
    orderDeliveryData: 'ord_delivery_data'
  };
  
  // Helper function to serialize data according to SerializedName annotations
  function serialize<T>(data: T): any {
    if (Array.isArray(data)) {
      return data.map(item => serialize(item));
    }
  
    if (data && typeof data === 'object') {
      const result: Record<string, any> = {};
      
      for (const [key, value] of Object.entries(data)) {
        const serializedKey = serializeKeys[key] || key;
        result[serializedKey] = serialize(value);
      }
      
      return result;
    }
  
    return data;
  }
  
  // Helper function to deserialize data according to SerializedName annotations
  function deserialize<T>(data: any): T {
    if (Array.isArray(data)) {
      return data.map(item => deserialize(item)) as unknown as T;
    }
  
    if (data && typeof data === 'object') {
      const result: Record<string, any> = {};
      
      for (const [key, value] of Object.entries(data)) {
        const deserializedKey = Object.entries(serializeKeys)
          .find(([_, serialized]) => serialized === key)?.[0] || key;
        result[deserializedKey] = deserialize(value);
      }
      
      return result as T;
    }
  
    return data as T;
  }
  
  export {
    OrderResponse,
    OrderDatum,
    DeliveryData,
    PrimaryContact,
    Product,
    OrderDatumImpl,
    createOrderResponse,
    serialize,
    deserialize
  };