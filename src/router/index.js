import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/sale-items',
      name: 'sale-items-gallery',
      component: () => import('../views/sale-item/SaleItemGalleryView.vue'),
    },
    {
      path: '/sale-items/:id',
      name: 'sale-item-detail',
      component: () => import('../views/sale-item/SaleItemDetailView.vue'),
    },
    {
      path: '/sale-items/add',
      name: 'sale-item-add',
      component: () => import('../views/sale-item/SaleItemAddView.vue'),
    },
    {
      path: '/sale-items/:id/edit',
      name: 'sale-item-edit',
      component: () => import('../views/sale-item/SaleItemEditView.vue'),
    },
    {
      path: '/sale-items/list',
      name: 'sale-item-list',
      component: () => import('../views/sale-item/SaleItemListView.vue'),
    },
    {
      path: '/brands',
      name: 'brand-list',
      component: () => import('../views/brand/BrandListView.vue'),
    },
    {
      path: '/brands/:id/edit',
      name: 'brand-edit',
      component: () => import('../views/brand/BrandEditView.vue'),
    },
     {
      path: '/brands/add',
      name: 'brand-add',
      component: () => import('../views/brand/BrandAddView.vue'),
    },
  ],
})

export default router
