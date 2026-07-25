import client from './client'

export const usersApi = {
  getMe: () => client.get('/users/me'),
  updateMe: (data) => client.put('/users/me', data),
}
