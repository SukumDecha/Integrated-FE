import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import DefaultLayout from '@/components/layout/DefaultLayout.vue'
import AuthLayout from '@/components/layout/AuthLayout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/',
      component: AuthLayout,
      children: [
        {
          path: '/register',
          name: 'user-register',
          component: () => import('../views/user/UserRegisterView.vue'),
        },
        // {
        //   path: '/login',
        //   name: 'user-login',
        //   component: () => import('../views/user/UserLoginView.vue'),
        // },
        {
          path: '/verify-email',
          name: 'verify-email',
          component: () => import('../views/user/VerifyEmailView.vue'),
        },
      ],
    },
    {
      path: '/',
      component: DefaultLayout,
      children: [
        {
          path: 'profile',
          component: () => import('../views/user/UserProfileView.vue'),
        },
        {
          path: 'sale-items',
          children: [
            {
              path: '',
              name: 'sale-items-gallery',
              component: () => import('../views/sale-item/SaleItemGalleryView.vue'),
            },
            {
              path: ':id',
              name: 'sale-item-detail',
              component: () => import('../views/sale-item/SaleItemDetailView.vue'),
              props: true,
            },
            {
              path: 'add',
              name: 'sale-item-add',
              component: () => import('../views/sale-item/SaleItemAddView.vue'),
            },
            {
              path: ':id/edit',
              name: 'sale-item-edit',
              component: () => import('../views/sale-item/SaleItemEditView.vue'),
              props: true,
            },
            {
              path: 'list',
              name: 'sale-item-list',
              component: () => import('../views/sale-item/SaleItemListView.vue'),
            },
          ],
        },
        {
          path: 'brands',
          children: [
            {
              path: '',
              name: 'brand-list',
              component: () => import('../views/brand/BrandListView.vue'),
            },
            {
              path: ':id/edit',
              name: 'brand-edit',
              component: () => import('../views/brand/BrandEditView.vue'),
              props: true,
            },
            {
              path: 'add',
              name: 'brand-add',
              component: () => import('../views/brand/BrandAddView.vue'),
            },
          ],
        },
      ],
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('../views/NotFoundView.vue'),
    },
  ],
})

export default router
