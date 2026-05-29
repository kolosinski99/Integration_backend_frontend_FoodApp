import axiosInstance from './axiosInstance';

const useMock = false;

const CATEGORIES = [
  { id: 1, category_name: 'Przystawki' },
  { id: 2, category_name: 'Dania główne' },
  { id: 3, category_name: 'Desery' },
  { id: 4, category_name: 'Napoje' },
];

const store = {
  menuItems: [
    {
      id_menu_product: 1,
      category_id: 2,
      restaurant_id: 1,
      product_name: 'Margherita',
      price: 32.0,
      product_description: 'Sos pomidorowy, mozzarella fior di latte, świeża bazylia, oliwa extra virgin.',
      image_path: 'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=600',
    },
    {
      id_menu_product: 2,
      category_id: 2,
      restaurant_id: 1,
      product_name: 'Capricciosa',
      price: 38.5,
      product_description: 'Sos pomidorowy, mozzarella, szynka dojrzewająca, pieczarki, karczochy, oliwki.',
      image_path: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600',
    },
    {
      id_menu_product: 3,
      category_id: 4,
      restaurant_id: 1,
      product_name: 'Cola 0,5L',
      price: 8.0,
      product_description: 'Schłodzony napój gazowany.',
      image_path: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=600',
    },
    {
      id_menu_product: 4,
      category_id: 3,
      restaurant_id: 1,
      product_name: 'Tiramisu',
      price: 18.0,
      product_description: 'Klasyczny włoski deser z mascarpone, kawą espresso i biszkoptami.',
      image_path: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600',
    },
    {
      id_menu_product: 5,
      category_id: 1,
      restaurant_id: 1,
      product_name: 'Bruschetta',
      price: 22.0,
      product_description: 'Grzanki z pieczywa pszennego z pomidorami, czosnkiem i świeżą bazylią.',
      image_path: 'https://images.unsplash.com/photo-1572441713132-c542fc4fe282?w=600',
    },
    {
      id_menu_product: 6,
      category_id: 2,
      restaurant_id: 1,
      product_name: 'Spaghetti Carbonara',
      price: 36.0,
      product_description: 'Makaron spaghetti z guanciale, jajkiem, pecorino romano i czarnym pieprzem.',
      image_path: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=600',
    },
    {
      id_menu_product: 7,
      category_id: 3,
      restaurant_id: 1,
      product_name: 'Panna cotta',
      price: 16.0,
      product_description: 'Delikatny włoski deser ze śmietanki z sosem malinowym.',
      image_path: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600',
    },
    {
      id_menu_product: 8,
      category_id: 4,
      restaurant_id: 1,
      product_name: 'Lemoniada cytrynowa',
      price: 12.0,
      product_description: 'Domowa lemoniada z miętą i limonką.',
      image_path: 'https://images.unsplash.com/photo-1523677011781-c91d1bbe2f9e?w=600',
    },
    {
      id_menu_product: 9,
      category_id: 2,
      restaurant_id: 2,
      product_name: 'Sushi set 16 szt.',
      price: 79.0,
      product_description: 'Mix sushi z łososiem i tuńczykiem, w komplecie sos sojowy i wasabi.',
      image_path: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600',
    },
  ],
  nextId: 10,
};

const delay = (ms = 300) => new Promise((res) => setTimeout(res, ms));

const extractFromFormData = (input) => {
  if (!(input instanceof FormData)) return { ...input, _image: null };
  const get = (key) => input.get(key);
  const imageEntry = input.get('image');
  const hasImage = imageEntry && typeof imageEntry === 'object' && imageEntry.name;
  return {
    product_name: get('product_name') || '',
    category_id: get('category_id') ? Number(get('category_id')) : null,
    restaurant_id: get('restaurant_id') ? Number(get('restaurant_id')) : null,
    price: get('price') !== null ? Number(get('price')) : null,
    product_description: get('product_description') || '',
    _image: hasImage ? imageEntry : null,
  };
};

const mockGetMenuByRestaurant = async (restaurantId) => {
  await delay();
  const id = Number(restaurantId);
  return { data: store.menuItems.filter((item) => item.restaurant_id === id) };
};

const mockGetMenuItemById = async (menuItemId) => {
  await delay();
  const id = Number(menuItemId);
  const found = store.menuItems.find((i) => i.id_menu_product === id);
  if (!found) {
    const err = new Error('Not found');
    err.response = { status: 404, data: { message: 'Danie nie istnieje.' } };
    throw err;
  }
  return { data: { ...found } };
};

const mockCreateMenuItem = async (input) => {
  await delay();
  const data = extractFromFormData(input);
  const created = {
    id_menu_product: store.nextId++,
    product_name: data.product_name,
    category_id: data.category_id,
    restaurant_id: data.restaurant_id,
    price: data.price,
    product_description: data.product_description,
    image_path: data._image ? data._image.name : null,
  };
  store.menuItems.push(created);
  return { data: { ...created } };
};

const mockUpdateMenuItem = async (menuItemId, input) => {
  await delay();
  const id = Number(menuItemId);
  const idx = store.menuItems.findIndex((i) => i.id_menu_product === id);
  if (idx === -1) {
    const err = new Error('Not found');
    err.response = { status: 404, data: { message: 'Danie nie istnieje.' } };
    throw err;
  }
  const data = extractFromFormData(input);
  const existing = store.menuItems[idx];
  const merged = {
    ...existing,
    product_name: data.product_name || existing.product_name,
    category_id: data.category_id ?? existing.category_id,
    price: data.price ?? existing.price,
    product_description:
      data.product_description !== undefined
        ? data.product_description
        : existing.product_description,
    image_path: data._image ? data._image.name : existing.image_path,
    id_menu_product: id,
  };
  store.menuItems[idx] = merged;
  return { data: { ...merged } };
};

const mockDeleteMenuItem = async (menuItemId) => {
  await delay();
  const id = Number(menuItemId);
  store.menuItems = store.menuItems.filter((i) => i.id_menu_product !== id);
  return { data: { success: true } };
};

const mockGetCategories = async () => {
  await delay();
  return { data: [...CATEGORIES] };
};

export const getMenuByRestaurant = (restaurantId) =>
  useMock
    ? mockGetMenuByRestaurant(restaurantId)
    : axiosInstance.get(`/restaurants/${restaurantId}/menu`);

export const getMenuItemById = (menuItemId) =>
  useMock ? mockGetMenuItemById(menuItemId) : axiosInstance.get(`/menu-products/${menuItemId}`);

export const createMenuItem = (formData) =>
  useMock
    ? mockCreateMenuItem(formData)
    : axiosInstance.post('/menu-products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

export const updateMenuItem = (menuItemId, formData) =>
  useMock
    ? mockUpdateMenuItem(menuItemId, formData)
    : axiosInstance.put(`/menu-products/${menuItemId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

export const deleteMenuItem = (menuItemId) =>
  useMock ? mockDeleteMenuItem(menuItemId) : axiosInstance.delete(`/menu-products/${menuItemId}`);

export const getMenuCategories = () =>
  useMock ? mockGetCategories() : axiosInstance.get('/menu-product-categories');

export const setMockMyRestaurantMenu = (restaurantId) => {
  if (!useMock) return;
  store.menuItems
    .filter((i) => i.restaurant_id === null || i.restaurant_id === undefined)
    .forEach((i) => {
      i.restaurant_id = restaurantId;
    });
};
