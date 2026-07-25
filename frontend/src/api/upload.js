import client from './client'

export const uploadApi = {
  image: (file) => {
    const fd = new FormData()
    fd.append('file', file)
    // 不手动设 Content-Type，让 axios 自动加 boundary
    return client.post('/upload/image', fd)
  },
  markdown: (file) => {
    const fd = new FormData()
    fd.append('file', file)
    return client.post('/upload/markdown', fd)
  },
}
