import axios from "../utils/axios.jsx";

const BASE = "/Admin/Coupons";

const CouponsAPI = {
  getAll: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return axios.get(`${BASE}?${qs}`);
  },
  getById: (id) => axios.get(`${BASE}/${id}`),
  create: (data) => axios.post(BASE, data),
  update: (id, data) => axios.put(`${BASE}/${id}`, data),
  remove: (id) => axios.delete(`${BASE}/${id}`),
  assignToUser: (id, userId) => axios.post(`${BASE}/${id}/assign`, { userId }),
};

export default CouponsAPI;
