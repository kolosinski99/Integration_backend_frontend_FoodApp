import axiosInstance from './axiosInstance';

const useMock = false;

const delay = (ms = 300) => new Promise((res) => setTimeout(res, ms));

const store = {
  restaurants: [
    {
      id_restaurant: 11,
      restaurant_name: 'Pasta Italia',
      street: 'Słoneczna',
      house_number: '15',
      city: 'Wrocław',
      is_approved: 0,
      restaurant_category_id: 1,
      owner_name: 'Piotr',
      owner_surname: 'Wiśniewski',
      owner_login: 'piotr@pasta.pl',
    },
    {
      id_restaurant: 13,
      restaurant_name: 'Vege Life',
      street: 'Leśna',
      house_number: '9',
      city: 'Szczecin',
      is_approved: 0,
      restaurant_category_id: 1,
      owner_name: 'Marta',
      owner_surname: 'Zielińska',
      owner_login: 'marta@vege.pl',
    },
    {
      id_restaurant: 4,
      restaurant_name: 'Pizza House',
      street: 'Nowa',
      house_number: '10',
      city: 'Lublin',
      is_approved: 1,
      restaurant_category_id: 1,
      owner_name: 'Anna',
      owner_surname: 'Nowak',
      owner_login: 'owner@test.com',
    },
    {
      id_restaurant: 14,
      restaurant_name: 'Sweet Cake',
      street: 'Ogrodowa',
      house_number: '14',
      city: 'Gdańsk',
      is_approved: 0,
      restaurant_category_id: 1,
      owner_name: 'Karolina',
      owner_surname: 'Dąbrowska',
      owner_login: 'karolina@sweet.pl',
    },
    {
      id_restaurant: 12,
      restaurant_name: 'Steak Grill',
      street: 'Polna',
      house_number: '21',
      city: 'Poznań',
      is_approved: 1,
      restaurant_category_id: 1,
      owner_name: 'Tomasz',
      owner_surname: 'Kowalczyk',
      owner_login: 'tomasz@steak.pl',
    },
  ],
};

const setApproval = (id, value) => {
  const numericId = Number(id);
  const found = store.restaurants.find((r) => r.id_restaurant === numericId);
  if (!found) {
    const err = new Error('Not found');
    err.response = { status: 404, data: { message: 'Restauracja nie istnieje.' } };
    throw err;
  }
  found.is_approved = value;
  return { ...found };
};

const mockGetAdminRestaurants = async () => {
  await delay();
  return { data: store.restaurants.map((r) => ({ ...r })) };
};

const mockApproveRestaurant = async (id) => {
  await delay();
  return { data: setApproval(id, 1) };
};

const mockRejectRestaurant = async (id) => {
  await delay();
  return { data: setApproval(id, 0) };
};

export const getAdminRestaurants = () =>
  useMock ? mockGetAdminRestaurants() : axiosInstance.get('/admin/restaurants');

export const approveRestaurant = (id) =>
  useMock ? mockApproveRestaurant(id) : axiosInstance.patch(`/admin/restaurants/${id}/approve`);

export const rejectRestaurant = (id) =>
  useMock ? mockRejectRestaurant(id) : axiosInstance.patch(`/admin/restaurants/${id}/reject`);

export const getAdminRestaurantDetail = (id) => {
  if (useMock) {
    const r = store.restaurants.find((x) => x.id_restaurant === id);
    return Promise.resolve({
      data: {
        ...r,
        category_name: 'Włoska',
        owner_login: 'owner@example.com',
        owner_name: 'Jan',
        owner_surname: 'Kowalski',
        menu: [
          {
            id_menu_product: 1,
            product_name: 'Pizza Margherita',
            price: 32.99,
            product_description: 'Sos pomidorowy, mozzarella',
            spice_level: 0,
            allergens: 'gluten, laktoza',
          },
        ],
      },
    });
  }
  return axiosInstance.get(`/admin/restaurants/${id}`);
};
