import client from './client'

export const categoriesApi = {
  list: () => client.get('/categories'),
  create: (data) => client.post('/categories', data),
  delete: (id) => client.delete(`/categories/${id}`),
}
