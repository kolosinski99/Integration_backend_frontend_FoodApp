import axiosInstance from './axiosInstance';

const useMock = process.env.REACT_APP_USE_MOCK_DATA === 'true';

const mockProfileStore = {
  profile: {
    name: 'Jan',
    surname: 'Kowalski',
    login: 'jan@test.com',
    role: 'USER',
    address: {
      id_address: 1,
      street: 'ul. Marszałkowska',
      house_number: '10',
      apartment_number: '5',
      postal_code: '00-001',
      city: 'Warszawa',
    },
  },
};

const delay = (ms = 300) => new Promise((res) => setTimeout(res, ms));

const mockGet = async () => {
  await delay();
  return {
    data: {
      ...mockProfileStore.profile,
      address: { ...mockProfileStore.profile.address },
    },
  };
};

const mockUpdate = async (data) => {
  await delay();
  const updatedAddress = {
    ...mockProfileStore.profile.address,
    ...(data.address || {}),
  };
  mockProfileStore.profile = {
    ...mockProfileStore.profile,
    name: data.name !== undefined ? data.name : mockProfileStore.profile.name,
    surname: data.surname !== undefined ? data.surname : mockProfileStore.profile.surname,
    address: updatedAddress,
  };
  return {
    data: {
      ...mockProfileStore.profile,
      address: { ...updatedAddress },
    },
  };
};

export const getMyProfile = () =>
  useMock ? mockGet() : axiosInstance.get('/clients/me');

export const updateMyProfile = (data) =>
  useMock ? mockUpdate(data) : axiosInstance.put('/clients/me', data);
