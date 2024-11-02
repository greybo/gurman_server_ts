
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
};
