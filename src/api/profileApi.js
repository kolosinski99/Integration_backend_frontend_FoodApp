import axiosInstance from './axiosInstance';

const useMock = false;

const mockProfileStore = {
  profile: {
    name: '',
    surname: '',
    login: '',
    role: '',
    address: {
      id_address: 1,
      street: '',
      house_number: '',
      apartment_number: '',
      postal_code: '',
      city: '',
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
