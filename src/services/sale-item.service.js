import { get } from "./helper/api";

const BASE_URL = '/v1/sale-items';

const SaleItemService = {

    async getAllSaleItems() {
        return await get(`${BASE_URL}`);
        // return [
        //     {
        //       id: 1,
        //       brand: 'Apple',
        //       model: 'iPhone 14 Pro',
        //       ramGb: 6,
        //       storageGb: 256,
        //       price: 1099,
        //     },
        //     {
        //       id: 2,
        //       brand: 'Samsung',
        //       model: 'Galaxy S23 Ultra',
        //       ramGb: 12,
        //       storageGb: 512,
        //       price: 1199,
        //     },
        //     {
        //       id: 3,
        //       brand: 'Dell',
        //       model: 'XPS 15',
        //       ramGb: 32,
        //       storageGb: 1000,
        //       price: 2199,
        //     },
        //     {
        //       id: 4,
        //       brand: 'Microsoft',
        //       model: 'Surface Pro 9',
        //       ramGb: 16,
        //       storageGb: 512,
        //       price: 1599,
        //     },
        //     {
        //       id: 5,
        //       brand: 'Google',
        //       model: 'Pixel 7 Pro',
        //       ramGb: 12,
        //       storageGb: 256,
        //       price: 899,
        //     },
        //     {
        //       id: 6,
        //       brand: 'OnePlus',
        //       model: 'OnePlus 11',
        //       ramGb: 16,
        //       storageGb: 256,
        //       price: 799,
        //     },
        //     {
        //       id: 7,
        //       brand: 'Sony',
        //       model: 'PlayStation 5',
        //       ramGb: null,
        //       storageGb: null,
        //       price: 499,
        //     },
        //     {
        //       id: 8,
        //       brand: 'LG',
        //       model: 'UltraFine Monitor',
        //       ramGb: null,
        //       storageGb: null,
        //       price: 1299,
        //     },
        //   ]
    },

    async getSaleItemById(id) {
        return await get(`${BASE_URL}/${id}`);
        // return {
        //     id: 1,
        //     model: 'iPhone 12 Pro Max',
        //     brandName: 'Apple',
        //     description: '2020 flagship model',
        //     price: 29700,
        //     ramGb: 6,
        //     screenSizeInch: 6.7,
        //     quantity: 41,
        //     storageGb: 256,
        //     color: 'Pacific Blue',
        //     image:
        //         'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-X1LVu0OTdeeLpcmhfBEmRPeP7UdYg3.png',
        // }
    },

    // addSaleItem(item) {
    //     // Logic to add a sale item
    // },

    // removeSaleItem(itemId) {
    //     // Logic to remove a sale item
    // }

}

export default SaleItemService;