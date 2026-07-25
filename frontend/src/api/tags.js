import client from './client'

export const tagsApi = {
  list: () => client.get('/tags'),
  create: (data) => client.post('/tags', data),
}
