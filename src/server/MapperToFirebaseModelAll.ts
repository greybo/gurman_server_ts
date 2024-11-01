import { OrderDatum, OrderResponse, Product } from '../models/OrderResponse';
import { ProductOption,  ShippingMethodOption,ProductSubOption } from '../models/OrderMeta';
import { OrderFirebaseModel, FirebaseProduct, FirebaseShippingData } from '../models/OrderFirebaseModel';

class MapperToFirebaseModelAll {
    private static readonly REVOKED_PRODUCTS = new Set(['14983785304', '14983785305']);
    private orderResponse: OrderResponse | null;
    private shippingOptions: ShippingMethodOption[];
    private metaProducts: ProductOption[];
  
    constructor(orderResponse: OrderResponse | null) {
      this.orderResponse = orderResponse;
      this.shippingOptions = orderResponse?.meta?.fieldsMeta?.shippingMethod?.options?.filter(Boolean) || [];
      this.metaProducts = orderResponse?.meta?.fieldsMeta?.products?.options || [];
    }
  
    public mapper(models: OrderFirebaseModel[]): OrderFirebaseModel[] {
      return this.orderResponse?.data?.map(datum => {
        console.log(`datum:${datum.orderId}`);
        const firebaseModel = models.find(model => model.id === datum.orderId);
        return this.toFirebaseOrderModel(datum, firebaseModel);
      }) || [];
    }
  
    private toFirebaseOrderModel(datum: OrderDatum, model: OrderFirebaseModel | undefined): OrderFirebaseModel {
      return {
        id: datum.orderId,
        fName: datum.primaryContact?.fName || '',
        lName: datum.primaryContact?.lName || '',
        comment: datum.comment || '',
        externalId: datum.externalId || '',
        statusId: datum.statusId || 0,
        updateAt: datum.updateAt || '',
        trackingNumber: datum.orderDeliveryData?.[0]?.trackingNumber || '',
        products: this.processProducts(datum),
        shippingData: this.getShippingMethod(datum),
        idBox: model?.idBox ?? '0',
        syncSalesDrive: model?.syncSalesDrive ?? false,
        forCheck: model?.forCheck ?? false
      };
    }
  
    private processProducts(datum: OrderDatum): FirebaseProduct[] {
        if (!datum.products) return [];
    
        const products = datum.products
          .flatMap(product => this.toFirebaseProducts(product))
          .reduce((acc, product) => {
            const existing = acc.get(product.barcode as string);
            if (existing) {
              acc.set(product.barcode as string, {
                ...existing,
                amount: existing.amount + product.amount
              });
            } else {
              acc.set(product.barcode as string, product);
            }
            return acc;
          }, new Map<string, FirebaseProduct>());
    
        return Array.from(products.values());
      }

      private getShippingMethod(datum: OrderDatum): FirebaseShippingData | undefined {
        const option = this.shippingOptions.find(opt => opt.value === datum.shippingId);
        if (option) {
          return {
            text: option.text,
            value: option.value
          };
        }
        return undefined;
      }

    private toFirebaseProducts(product: Product): FirebaseProduct[] {
      if (MapperToFirebaseModelAll.REVOKED_PRODUCTS.has(product.parameter as string)) {
        return [this.toFirebaseProductDefault(product)];
      }
  
      const metaProduct = this.metaProducts.find(mp => mp.parameter === product.parameter);
      if (metaProduct) {
        const compositeProducts = this.makeCompositeProducts(
          metaProduct,
          typeof product.amount === 'string' ? parseFloat(product.amount) || 1 : product.amount
        );
        if (compositeProducts && compositeProducts.length > 0) {
          return compositeProducts;
        }
      }
      
      return [this.toFirebaseProductDefault(product)];
    }
  
    private toFirebaseProductDefault(product: Product): FirebaseProduct {
      return {
        amount: typeof product.amount === 'string' ? parseFloat(product.amount) || 0 : product.amount,
        restCount: 0,
        parameterProductId: product.parameter,
        text: product.text || '',
        barcode: product.barcode || '',
        sku: product.sku || ''
      };
    }
  
    private makeCompositeProducts(metaProduct: ProductOption, amount: number): FirebaseProduct[] {
      const products: FirebaseProduct[] = [];
  
      for (const complectItem of metaProduct.complect) {
        const option = metaProduct.options.find(opt => opt.value === complectItem.productId);
        if (option) {
          const count = amount * complectItem.count;
          products.push(this.toFirebaseProduct(option, count));
        }
      }
  
      return products;
    }
  
    private toFirebaseProduct(option: ProductSubOption, count: number): FirebaseProduct {
      return {
        amount: count,
        restCount: option.restCount,
        parameterProductId: option.parameter,
        text: option.text,
        barcode: option.barcode,
        sku: option.sku
      };
    }
  }
  
  export default MapperToFirebaseModelAll;
