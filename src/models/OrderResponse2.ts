// import axios from 'axios';

// Base interfaces for API response
interface ApiResponse<T> {
  data: T;
  meta: Meta;
  pagination: Pagination;
  totals: Totals;
  status: string;
}

interface OrderResponse {
  data: OrderDatum[];
  meta: Meta;
}

// Order related interfaces
interface OrderDatum {
  id: number;
  formId: number;
  version: number;
  ordDeliveryData: DeliveryData[];
  primaryContact: PrimaryContact;
  contacts: PrimaryContact[];
  products: Product[];
  organizationId: number;
  // shippingMethod: number;
  shipping_method: number;
  paymentMethod: number;
  comment: string;
  orderTime: string;
  updateAt: string;
  statusId: number;
  paymentAmount: number;
  externalId: string;
}

interface DeliveryData {
  senderId: number;
  backDelivery: number;
  cityName: string;
  provider: string;
  payForDelivery: string;
  type: string;
  trackingNumber: string;
  statusCode: number;
  deliveryDateAndTime: string;
  idEntity: number;
  branchNumber: number;
  address: string;
}

interface PrimaryContact {
  id: number;
  formId: number;
  version: number;
  active: number;
  fName: string;
  lName: string;
  phone: string[];
  email: string[];
  createTime: string;
  userId: number;
}

interface Product {
  amount: number;
  percentCommission: number;
  preSale: number;
  productId: number;
  price: number;
  stockId: number;
  costPrice: number;
  discount: number;
  parameter: string;
  text: string;
  barcode: string;
  sku: string;
}

// Meta interfaces
interface Meta {
  fields: {
    shippingMethod: ShippingMethodMeta;
    products: ProductsMeta;
    statusId: StatusMeta;
    userId: UserMeta;
  };
}

interface ShippingMethodMeta {
  type: string;
  name: string;
  label: string;
  options: ShippingMethodOption[];
}

interface ShippingMethodOption {
  value: number;
  text: string;
  active: number;
}

interface ProductsMeta {
  options: ProductOption[];
}

interface ProductOption {
  value: number;
  parameter: string;
  text: string;
  restCount: number;
  barcode: string;
  sku: string;
  options: ProductSubOption[];
  complect: ComplectItem[];
}

interface ProductSubOption {
  value: number;
  parameter: string;
  text: string;
  barcode: string;
  sku: string;
  restCount: number;
}

interface ComplectItem {
  productId: string;
  count: number;
  formId: string;
  id: string;
}

// interface ComplectItem {
//   complectId: number;
//   productId: number;
//   count: number;
// }

interface StatusMeta {
  type: string;
  name: string;
  label: string;
  options: Array<{
    value: number;
    text: string;
    active: number;
    type: number;
    sort: number;
  }>;
}

interface UserMeta {
  type: string;
  name: string;
  label: string;
  options: Array<{
    value: number;
    text: string;
    active: number;
  }>;
}

// Pagination and totals
interface Pagination {
  currentPage: number;
  pageCount: number;
  perPage: number;
}

interface Totals {
  count: number;
  paymentAmount: number;
  commission: number;
  expenses: number;
}

// // Axios instance setup example
// const apiClient = axios.create({
//   baseURL: process.env.SALES_DRIVE_BASE_URL
// });

// // Function to parse response
// async function fetchAndParseOrders(statusId: number): Promise<OrderResponse> {
//   try {
//     const response = await apiClient.get<ApiResponse<OrderDatum[]>>('/list/', {
//       params: {
//         'filter[statusId]': statusId.toString()
//       },
//       headers: this.getHeaderWithApiKey()
//     });

//     // Basic validation
//     if (response.data.status !== 'success') {
//       throw new Error('API request failed');
//     }

//     return {
//       data: response.data.data,
//       meta: response.data.meta
//     };
//   } catch (error) {
//     console.error('Error fetching orders:', error);
//     throw error;
//   }
// }

// // Usage example
// async function getOrders() {
//   try {
//     const orders = await fetchAndParseOrders('your-api-url');

//     // Access order data
//     orders.data.forEach(order => {
//       console.log(`Order ID: ${order.id}`);
//       console.log(`Customer: ${order.primaryContact.fName} ${order.primaryContact.lName}`);
//       console.log(`Products: ${order.products.length}`);

//       // Access delivery data
//       const delivery = order.ordDeliveryData[0];
//       if (delivery) {
//         console.log(`Delivery to: ${delivery.cityName}`);
//         console.log(`Tracking number: ${delivery.trackingNumber}`);
//       }
//     });

//     // Access meta data
//     const shippingMethods = orders.meta.fields.shippingMethod.options;
//     console.log('Available shipping methods:', shippingMethods.map(m => m.text));

//   } catch (error) {
//     console.error('Failed to get orders:', error);
//   }
// }




export {
  type ApiResponse,
  type OrderResponse,
  type OrderDatum,
  type Product,
  type DeliveryData,
  type PrimaryContact,
  type ComplectItem,
  type Meta,
  type ShippingMethodMeta,
  type ShippingMethodOption,
  type ProductsMeta,
  type ProductOption,
  type ProductSubOption,
  type StatusMeta,
  type UserMeta,
  type Pagination,
  // fetchAndParseOrders,
  // apiClient
};
