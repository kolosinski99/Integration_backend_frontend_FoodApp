import axios from 'axios';

const useMock =
    process.env.REACT_APP_USE_MOCK_DATA === 'true';

const publicAxios = axios.create({
  baseURL:
      process.env.REACT_APP_API_URL ||
      'http://localhost:8080/api',
});

const RESTAURANT_CATEGORIES = [
  { id: 1, category_name: 'Włoska' },
  { id: 2, category_name: 'Polska' },
  { id: 3, category_name: 'Azjatycka' },
  { id: 4, category_name: 'Fast food' },
];

const delay = (ms = 400) =>
    new Promise((res) => setTimeout(res, ms));

const mockSubmit = async () => {
  await delay();

  return {
    data: {
      id: Date.now(),
      status: 'PENDING',
    },
  };
};

const mockGetCategories = async () => {
  await delay(200);

  return {
    data: [...RESTAURANT_CATEGORIES],
  };
};

export const submitPartnerApplication = (
    formData
) =>
    useMock
        ? mockSubmit(formData)
        : publicAxios.post(
            '/restaurants',
            formData,
            {
              headers: {
                'Content-Type':
                    'multipart/form-data',
              },
            }
        );

export const getRestaurantCategories =
    () =>
        useMock
            ? mockGetCategories()
            : publicAxios.get(
                '/restaurant-categories'
            );