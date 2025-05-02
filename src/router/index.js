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
      component: () => import('../views/sale-items/SaleItemGalleryView.vue'),
    },
    {
      path: '/sale-items/:id',
      name: 'sale-item-detail',
      component: () => import('../views/sale-items/SaleItemDetailView.vue'),
    }
  ],
})

export default router
