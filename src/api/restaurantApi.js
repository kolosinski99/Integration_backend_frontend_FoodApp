import axiosInstance from './axiosInstance';

const useMock = process.env.REACT_APP_USE_MOCK_AUTH === 'true';

const seedRestaurants = [
  {
    id: 1,
    name: 'Pizzeria Bella',
    description: 'Autentyczna włoska pizza z pieca opalanego drewnem. Świeże składniki prosto z lokalnych dostawców.',
    address: 'ul. Marszałkowska 12, Warszawa',
    phone: '123456789',
    imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800',
    ownerId: 2,
  },
  {
    id: 2,
    name: 'Sushi Yoko',
    description: 'Japońska kuchnia w sercu miasta. Codziennie świeże ryby i własne sosy.',
    address: 'ul. Nowy Świat 45, Warszawa',
    phone: '987654321',
    imageUrl: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800',
    ownerId: 3,
  },
  {
    id: 3,
    name: 'Burger House',
    description: 'Soczyste burgery z polskiej wołowiny, domowe bułki i autorskie sosy.',
    address: 'ul. Krucza 8, Warszawa',
    phone: '555111222',
    imageUrl: '',
    ownerId: 2,
  },
];

const store = {
  restaurants: [...seedRestaurants],
  myRestaurantId: null,
  nextId: 4,
};

const delay = (ms = 300) => new Promise((res) => setTimeout(res, ms));

const mockGetRestaurants = async () => {
  await delay();
  return { data: [...store.restaurants] };
};

const mockGetRestaurantById = async (id) => {
  await delay();
  const numericId = Number(id);
  const found = store.restaurants.find((r) => r.id === numericId);
  if (!found) {
    const err = new Error('Not found');
    err.response = { status: 404, data: { message: 'Restauracja nie istnieje.' } };
    throw err;
  }
  return { data: { ...found } };
};

const mockGetMyRestaurant = async () => {
  await delay();
  if (!store.myRestaurantId) {
    const err = new Error('Not found');
    err.response = { status: 404, data: { message: 'Brak restauracji.' } };
    throw err;
  }
  const found = store.restaurants.find((r) => r.id === store.myRestaurantId);
  if (!found) {
    const err = new Error('Not found');
    err.response = { status: 404, data: { message: 'Brak restauracji.' } };
    throw err;
  }
  return { data: { ...found } };
};

const mockCreateRestaurant = async (data) => {
  await delay();
  const created = { id: store.nextId++, ownerId: 999, ...data };
  store.restaurants.push(created);
  store.myRestaurantId = created.id;
  return { data: { ...created } };
};

const mockUpdateRestaurant = async (id, data) => {
  await delay();
  const numericId = Number(id);
  const index = store.restaurants.findIndex((r) => r.id === numericId);
  if (index === -1) {
    const err = new Error('Not found');
    err.response = { status: 404, data: { message: 'Restauracja nie istnieje.' } };
    throw err;
  }
  store.restaurants[index] = { ...store.restaurants[index], ...data, id: numericId };
  return { data: { ...store.restaurants[index] } };
};

export const getRestaurants = () =>
  useMock ? mockGetRestaurants() : axiosInstance.get('/restaurants');

export const getRestaurantById = (id) =>
  useMock ? mockGetRestaurantById(id) : axiosInstance.get(`/restaurants/${id}`);

export const getMyRestaurant = () =>
  useMock ? mockGetMyRestaurant() : axiosInstance.get('/restaurants/my');

export const createRestaurant = (data) =>
  useMock ? mockCreateRestaurant(data) : axiosInstance.post('/restaurants', data);

export const updateRestaurant = (id, data) =>
  useMock ? mockUpdateRestaurant(id, data) : axiosInstance.put(`/restaurants/${id}`, data);
