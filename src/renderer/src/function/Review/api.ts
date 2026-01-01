import axios from 'axios'

export const ReviewAxios = axios.create({
  baseURL: 'http://localhost:3001/api/reviews',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})
export const ReviewItemAxios = axios.create({
  baseURL: 'http://localhost:3001/api/review-items',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
// axiosInstance.interceptors.request.use(
//   (config) => {
//     // 可以在请求前添加 token 等
//     const token = localStorage.getItem('token');
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// // 响应拦截器
// axiosInstance.interceptors.response.use(
//   (response) => {
//     return response.data; // 直接返回 data
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );
