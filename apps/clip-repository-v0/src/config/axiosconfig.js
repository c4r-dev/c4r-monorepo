import axios from 'axios'; 

const api  = axios.create({ baseURL: process.env.ROOT_URL });

export default api