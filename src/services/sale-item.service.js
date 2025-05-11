import { get, post, put, remove } from './helper/api'; 

const BASE_URL = '/v1/sale-items';

const SaleItemService = {
  async getAllSaleItems() {
    return await get(`${BASE_URL}`);
  },

  async getSaleItemById(id) {
    return await get(`${BASE_URL}/${id}`);
  },

  async addSaleItem(data) {
    return await post(`${BASE_URL}`, data); // ✅ เพิ่มฟังก์ชัน POST
  },

  async updateSaleItem(id, data) {
    return await put(`${BASE_URL}/${id}`, data); // สำหรับ Edit
  },

  async deleteSaleItem(id) {
    return await remove(`${BASE_URL}/${id}`); // เผื่อใช้ Delete
  }
};

export default SaleItemService;
