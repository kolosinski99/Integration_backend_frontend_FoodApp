import axiosInstance from './axiosInstance';

const useMock = false;

const delay = (ms = 300) => new Promise((res) => setTimeout(res, ms));

// Lookup do odtworzenia nazw i cen pozycji w mocku createOrder
// (backend zwroci komplet danych; payload wysyla tylko id + quantity).
const PRODUCT_LOOKUP = {
  1: { product_name: 'Margherita', item_price: 32.0 },
  2: { product_name: 'Capricciosa', item_price: 38.5 },
  3: { product_name: 'Cola 0,5L', item_price: 8.0 },
  4: { product_name: 'Tiramisu', item_price: 18.0 },
  5: { product_name: 'Bruschetta', item_price: 22.0 },
  6: { product_name: 'Spaghetti Carbonara', item_price: 36.0 },
  7: { product_name: 'Panna cotta', item_price: 16.0 },
  8: { product_name: 'Lemoniada cytrynowa', item_price: 12.0 },
  9: { product_name: 'Sushi set 16 szt.', item_price: 79.0 },
};

const PAYMENT_METHODS = [
  { id: 1, method_name: 'CASH', method_description: 'Gotówka przy odbiorze' },
  { id: 2, method_name: 'CARD', method_description: 'Karta przy odbiorze' },
  { id: 3, method_name: 'ONLINE', method_description: 'Płatność online' },
];

const sumTotal = (items) =>
  Number(
    items.reduce((acc, i) => acc + Number(i.item_price) * Number(i.quantity), 0).toFixed(2)
  );

const myOrdersStore = {
  orders: [
    {
      id_order: 1024,
      restaurant_id: 1,
      restaurant_name: 'Pizzeria Bella',
      status_name: 'COMPLETED',
      create_date: '2026-05-28T18:42:00',
      client_comment: 'Bez cebuli',
      restaurant_comment: 'Smacznego!',
      total_price: 103.99,
      items: [
        { menu_product_id: 1, product_name: 'Margherita', quantity: 2, item_price: 32.0 },
        { menu_product_id: 6, product_name: 'Spaghetti Carbonara', quantity: 1, item_price: 36.0 },
      ],
    },
    {
      id_order: 1031,
      restaurant_id: 1,
      restaurant_name: 'Pizzeria Bella',
      status_name: 'NEW',
      create_date: '2026-06-01T12:05:00',
      client_comment: null,
      restaurant_comment: null,
      total_price: 56.5,
      items: [
        { menu_product_id: 2, product_name: 'Capricciosa', quantity: 1, item_price: 38.5 },
        { menu_product_id: 8, product_name: 'Lemoniada cytrynowa', quantity: 1, item_price: 12.0 },
        { menu_product_id: 3, product_name: 'Cola 0,5L', quantity: 1, item_price: 8.0 },
      ],
    },
    {
      id_order: 1009,
      restaurant_id: 2,
      restaurant_name: 'Sushi Yoko',
      status_name: 'CANCELLED',
      create_date: '2026-05-20T20:15:00',
      client_comment: 'Proszę o sztućce',
      restaurant_comment: 'Brak dostawcy',
      total_price: 79.0,
      items: [
        { menu_product_id: 9, product_name: 'Sushi set 16 szt.', quantity: 1, item_price: 79.0 },
      ],
    },
  ],
  nextId: 1100,
};

const restaurantOrdersStore = {
  orders: [
    {
      id_order: 2001,
      restaurant_id: 1,
      restaurant_name: 'Pizzeria Bella',
      status_name: 'NEW',
      create_date: '2026-06-02T11:30:00',
      client_comment: 'Dzwonić przed dostawą',
      restaurant_comment: null,
      total_price: 70.5,
      items: [
        { menu_product_id: 1, product_name: 'Margherita', quantity: 1, item_price: 32.0 },
        { menu_product_id: 2, product_name: 'Capricciosa', quantity: 1, item_price: 38.5 },
      ],
    },
    {
      id_order: 2002,
      restaurant_id: 1,
      restaurant_name: 'Pizzeria Bella',
      status_name: 'IN_PROGRESS',
      create_date: '2026-06-02T11:50:00',
      client_comment: null,
      restaurant_comment: null,
      total_price: 54.0,
      items: [
        { menu_product_id: 6, product_name: 'Spaghetti Carbonara', quantity: 1, item_price: 36.0 },
        { menu_product_id: 4, product_name: 'Tiramisu', quantity: 1, item_price: 18.0 },
      ],
    },
    {
      id_order: 1998,
      restaurant_id: 1,
      restaurant_name: 'Pizzeria Bella',
      status_name: 'COMPLETED',
      create_date: '2026-06-01T19:05:00',
      client_comment: 'Bez glutenu jeśli można',
      restaurant_comment: 'Zrealizowano',
      total_price: 40.0,
      items: [
        { menu_product_id: 5, product_name: 'Bruschetta', quantity: 1, item_price: 22.0 },
        { menu_product_id: 7, product_name: 'Panna cotta', quantity: 1, item_price: 16.0 },
      ],
    },
  ],
};

const mockCreateOrder = async (payload) => {
  await delay();
  const items = (payload.items || []).map((it) => {
    const lookup = PRODUCT_LOOKUP[it.menu_product_id] || {
      product_name: `Pozycja #${it.menu_product_id}`,
      item_price: 0,
    };
    return {
      menu_product_id: it.menu_product_id,
      product_name: lookup.product_name,
      quantity: it.quantity,
      item_price: lookup.item_price,
    };
  });
  const created = {
    id_order: myOrdersStore.nextId++,
    restaurant_id: payload.restaurant_id,
    restaurant_name: payload.restaurant_name || 'Restauracja',
    status_name: 'NEW',
    create_date: new Date().toISOString(),
    client_comment: payload.client_comment || null,
    restaurant_comment: null,
    total_price: sumTotal(items),
    items,
  };
  myOrdersStore.orders.unshift(created);
  return { data: { ...created } };
};

const mockGetMyOrders = async () => {
  await delay();
  return { data: myOrdersStore.orders.map((o) => ({ ...o })) };
};

const mockGetRestaurantOrders = async () => {
  await delay();
  return { data: restaurantOrdersStore.orders.map((o) => ({ ...o })) };
};

const mockUpdateOrderStatus = async (orderId, statusName) => {
  await delay();
  const id = Number(orderId);
  const fromRestaurant = restaurantOrdersStore.orders.find((o) => o.id_order === id);
  const fromMine = myOrdersStore.orders.find((o) => o.id_order === id);
  const target = fromRestaurant || fromMine;
  if (!target) {
    const err = new Error('Not found');
    err.response = { status: 404, data: { message: 'Zamówienie nie istnieje.' } };
    throw err;
  }
  target.status_name = statusName;
  return { data: { ...target } };
};

const mockGetPaymentMethods = async () => {
  await delay();
  return { data: PAYMENT_METHODS.map((m) => ({ ...m })) };
};

export const createOrder = (payload) =>
  useMock ? mockCreateOrder(payload) : axiosInstance.post('/orders', payload);

export const getMyOrders = () =>
  useMock ? mockGetMyOrders() : axiosInstance.get('/orders/my');

export const getRestaurantOrders = () =>
  useMock ? mockGetRestaurantOrders() : axiosInstance.get('/orders/restaurant');

export const updateOrderStatus = (orderId, statusName) =>
  useMock
    ? mockUpdateOrderStatus(orderId, statusName)
    : axiosInstance.patch(`/orders/${orderId}/status`, { status_name: statusName });

export const getPaymentMethods = () =>
  useMock ? mockGetPaymentMethods() : axiosInstance.get('/payment-methods');
