import client from './client'

export const usersApi = {
  getMe: () => client.get('/users/me'),
  updateMe: (data) => client.put('/users/me', data),
  getByUsername: (username) => client.get(`/users/${username}`),
  getOwner: () => client.get('/users'),
}
