import axiosInstance from './axiosInstance';

const useMock = process.env.REACT_APP_USE_MOCK_AUTH === 'true';

const MOCK_USERS = [
  {
    email: 'jan@test.com',
    password: 'Test1234',
    role: 'USER',
    name: 'Jan',
    surname: 'Kowalski',
    street: 'ul. Marszałkowska',
    houseNumber: '10',
    apartmentNumber: '5',
    postalCode: '00-001',
    city: 'Warszawa',
  },
  {
    email: 'owner@test.com',
    password: 'Owner1234',
    role: 'OWNER',
    name: 'Anna',
    surname: 'Nowak',
    street: 'ul. Nowy Świat',
    houseNumber: '20',
    apartmentNumber: '',
    postalCode: '00-029',
    city: 'Warszawa',
  },
  {
    email: 'admin@test.com',
    password: 'Admin1234',
    role: 'ADMIN',
    name: 'Piotr',
    surname: 'Wiśniewski',
    street: 'ul. Krucza',
    houseNumber: '8',
    apartmentNumber: '12',
    postalCode: '00-548',
    city: 'Warszawa',
  },
];

const buildLoginPayload = (user) => ({
  token: 'fake-jwt-token',
  role: user.role,
  login: user.email,
  name: user.name,
  surname: user.surname,
  street: user.street,
  house_number: user.houseNumber,
  apartment_number: user.apartmentNumber || null,
  postal_code: user.postalCode,
  city: user.city,
});

const mockLogin = (credentials) =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      const match = MOCK_USERS.find(
        (u) => u.email === credentials.email && u.password === credentials.password
      );
      if (!match) {
        reject({
          response: { status: 401, data: { message: 'Nieprawidłowy email lub hasło.' } },
        });
        return;
      }
      resolve({ data: buildLoginPayload(match) });
    }, 300);
  });

const mockRegister = (payload) =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      const required = [
        'login',
        'password',
        'name',
        'surname',
        'street',
        'house_number',
        'postal_code',
        'city',
      ];
      const missing = required.some((key) => !payload[key]);
      if (missing) {
        reject({ response: { status: 400, data: { message: 'Brak wymaganych pól.' } } });
        return;
      }
      if (MOCK_USERS.some((u) => u.email === payload.login)) {
        reject({
          response: { status: 409, data: { message: 'Konto z tym adresem email już istnieje.' } },
        });
        return;
      }
      resolve({ data: { message: 'Konto utworzone.' } });
    }, 300);
  });

export const loginUser = (credentials) => {
  if (useMock) return mockLogin(credentials);
  return axiosInstance.post('/auth/login', {
    login: credentials.email,
    password: credentials.password,
  });
};

export const registerUser = (data) => {
  const payload = {
    login: data.email,
    password: data.password,
    name: data.name,
    surname: data.surname,
    street: data.street,
    houseNumber: data.houseNumber,
    apartmentNumber: data.apartmentNumber ? data.apartmentNumber : null,
    postalCode: data.postalCode,
    city: data.city,
  };
  if (useMock) return mockRegister(payload);
  return axiosInstance.post('/auth/register', payload);
};
