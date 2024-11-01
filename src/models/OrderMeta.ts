interface Meta {
    fieldsMeta: Fields;
  }
  
  // Fields interface
  interface Fields {
    shippingMethod?: ShippingMethod;
    products?: Products;
    statusDatum?: CommonDatum;
    userResponsible?: CommonDatum;
  }
  
  // ShippingMethod and its nested types
  interface ShippingMethod {
    displayMobile?: number;
    editable?: string;
    label?: string;
    name?: string;
    options?: ShippingMethodOption[];
    sortMobile?: number;
    sortable?: boolean;
    system?: number;
    type?: string;
  }
  
  interface ShippingMethodOption {
    active?: number;
    text?: string;
    value?: number;
  }
  
  // Products and its nested types
  interface Products {
    options: ProductOption[];
  }
  
  interface ProductOption {
    parameter: string;
    restCount: number;
    barcode: string;
    sku: string;
    text: string;
    value: number;
    options: ProductSubOption[];
    complect: ComplectItem[];
  }
  
  interface ProductSubOption {
    barcode: string;
    text: string;
    parameter: string;
    restCount: number;
    sku: string;
    value: number;
  }
  
  interface ComplectItem {
    complectId: number;
    count: number;
    formId: string;
    id: string;
    productId: number;
  }
  
  // CommonDatum and its nested types
  interface CommonDatum {
    name?: string;
    options?: CommonDatumOption[];
  }
  
  interface CommonDatumOption {
    value: number;
    text?: string;
    active: number;
  }
  
  // Serialization mapping
  const serializeKeys: Record<string, string> = {
    fieldsMeta: 'fields',
    shippingMethod: 'shipping_method',
    statusDatum: 'statusId',
    userResponsible: 'userResponsible',
    displayMobile: 'displayMobile',
    sortMobile: 'sortMobile',
    complectId: 'complectId',
    formId: 'formId',
    productId: 'productId'
  };
  
  // Helper class for creating properly typed Meta objects
  class MetaBuilder {
    static createMeta(data: Partial<Meta>): Meta {
      return deserialize<Meta>(data);
    }
  
    static createShippingMethod(data: Partial<ShippingMethod>): ShippingMethod {
      return deserialize<ShippingMethod>(data);
    }
  
    static createProducts(data: Partial<Products>): Products {
      return deserialize<Products>(data);
    }
  
    static createCommonDatum(data: Partial<CommonDatum>): CommonDatum {
      return deserialize<CommonDatum>(data);
    }
  }
  
  // Serialization helper functions
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
  
  // Type guard functions
  function isShippingMethodOption(obj: any): obj is ShippingMethodOption {
    return obj && 
      typeof obj === 'object' && 
      ('active' in obj || 'text' in obj || 'value' in obj);
  }
  
  function isProductOption(obj: any): obj is ProductOption {
    return obj && 
      typeof obj === 'object' && 
      'parameter' in obj && 
      'restCount' in obj && 
      'barcode' in obj;
  }
  
  function isCommonDatumOption(obj: any): obj is CommonDatumOption {
    return obj && 
      typeof obj === 'object' && 
      'value' in obj && 
      'active' in obj;
  }
  
  export {
    Meta,
    Fields,
    ShippingMethod,
    ShippingMethodOption,
    Products,
    ProductOption,
    ProductSubOption,
    ComplectItem,
    CommonDatum,
    CommonDatumOption,
    MetaBuilder,
    serialize,
    deserialize,
    isShippingMethodOption,
    isProductOption,
    isCommonDatumOption
  };