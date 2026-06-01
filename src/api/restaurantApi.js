import axiosInstance from './axiosInstance';

const useMock = false;

const seedRestaurants = [
  {
    id_restaurant: 1,
    restaurant_name: 'Pizzeria Bella',
    description: 'Autentyczna włoska pizza z pieca opalanego drewnem. Świeże składniki prosto z lokalnych dostawców.',
    street: 'ul. Marszałkowska',
    house_number: '12',
    apartment_number: null,
    postal_code: '00-001',
    city: 'Warszawa',
    image_path: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800',
    is_approved: 1,
    restaurant_category_id: 1,
    user_id: 2,
  },
  {
    id_restaurant: 2,
    restaurant_name: 'Sushi Yoko',
    description: 'Japońska kuchnia w sercu miasta. Codziennie świeże ryby i własne sosy.',
    street: 'ul. Nowy Świat',
    house_number: '45',
    apartment_number: null,
    postal_code: '00-029',
    city: 'Warszawa',
    image_path: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800',
    is_approved: 1,
    restaurant_category_id: 3,
    user_id: 3,
  },
  {
    id_restaurant: 3,
    restaurant_name: 'Burger House',
    description: 'Soczyste burgery z polskiej wołowiny, domowe bułki i autorskie sosy.',
    street: 'ul. Krucza',
    house_number: '8',
    apartment_number: null,
    postal_code: '00-548',
    city: 'Warszawa',
    image_path: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800',
    is_approved: 1,
    restaurant_category_id: 4,
    user_id: 2,
  },
];

const store = {
  restaurants: [...seedRestaurants],
  myRestaurantId: 1,
  nextId: 4,
};

const delay = (ms = 300) => new Promise((res) => setTimeout(res, ms));

const extractFromFormData = (formData) => {
  if (!(formData instanceof FormData)) return formData;
  const get = (key) => formData.get(key);
  const imageFile = formData.get('image');
  return {
    restaurant_name: get('restaurant_name') || '',
    description: get('description') || '',
    street: get('street') || '',
    house_number: get('house_number') || '',
    apartment_number: get('apartment_number') || null,
    postal_code: get('postal_code') || '',
    city: get('city') || '',
    restaurant_category_id: get('restaurant_category_id')
      ? Number(get('restaurant_category_id'))
      : null,
    image_path: imageFile && imageFile.name ? imageFile.name : undefined,
  };
};

const mockGetRestaurants = async () => {
  await delay();
  return { data: [...store.restaurants] };
};

const mockGetRestaurantById = async (id) => {
  await delay();
  const numericId = Number(id);
  const found = store.restaurants.find((r) => r.id_restaurant === numericId);
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
  const found = store.restaurants.find((r) => r.id_restaurant === store.myRestaurantId);
  if (!found) {
    const err = new Error('Not found');
    err.response = { status: 404, data: { message: 'Brak restauracji.' } };
    throw err;
  }
  return { data: { ...found } };
};

const mockCreateRestaurant = async (formData) => {
  await delay();
  const data = extractFromFormData(formData);
  const created = {
    id_restaurant: store.nextId++,
    user_id: 999,
    is_approved: 0,
    ...data,
  };
  store.restaurants.push(created);
  store.myRestaurantId = created.id_restaurant;
  return { data: { ...created } };
};

const mockUpdateRestaurant = async (id, formData) => {
  await delay();
  const numericId = Number(id);
  const index = store.restaurants.findIndex((r) => r.id_restaurant === numericId);
  if (index === -1) {
    const err = new Error('Not found');
    err.response = { status: 404, data: { message: 'Restauracja nie istnieje.' } };
    throw err;
  }
  const data = extractFromFormData(formData);
  const updatedData = { ...data };
  if (updatedData.image_path === undefined) {
    delete updatedData.image_path;
  }
  store.restaurants[index] = {
    ...store.restaurants[index],
    ...updatedData,
    id_restaurant: numericId,
  };
  return { data: { ...store.restaurants[index] } };
};

export const getRestaurants = () =>
  useMock ? mockGetRestaurants() : axiosInstance.get('/restaurants');

export const getRestaurantById = (id) =>
  useMock ? mockGetRestaurantById(id) : axiosInstance.get(`/restaurants/${id}`);

export const getMyRestaurant = () =>
  useMock ? mockGetMyRestaurant() : axiosInstance.get('/restaurants/my');

export const createRestaurant = (formData) =>
  useMock
    ? mockCreateRestaurant(formData)
    : axiosInstance.post('/restaurants', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

export const updateRestaurant = (id, formData) =>
  useMock
    ? mockUpdateRestaurant(id, formData)
    : axiosInstance.put(`/restaurants/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

const mockCategories = [
  { id_restaurant_category: 1, category_name: 'Pizzeria' },
  { id_restaurant_category: 2, category_name: 'Sushi' },
  { id_restaurant_category: 3, category_name: 'Burger' },
  { id_restaurant_category: 4, category_name: 'Polska' },
];

export const getRestaurantCategories = () =>
  useMock
    ? Promise.resolve({ data: mockCategories })
    : axiosInstance.get('/restaurant-categories');
