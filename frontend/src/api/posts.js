import client from './client'

export const postsApi = {
  list: (params) => client.get('/posts', { params }),
  getBySlug: (slug) => client.get(`/posts/${slug}`),
  getById: (id) => client.get(`/posts/id/${id}`),
  create: (data) => client.post('/posts', data),
  update: (id, data) => client.put(`/posts/${id}`, data),
  delete: (id) => client.delete(`/posts/${id}`),
}
