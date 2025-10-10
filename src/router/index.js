import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import DefaultLayout from '@/components/layout/DefaultLayout.vue'
import AuthLayout from '@/components/layout/AuthLayout.vue'
import { useAuthStore } from '@/stores/auth.store'

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
          component: () => import('../views/auth/RegisterView.vue'),
        },
        {
          path: '/signin',
          name: 'user-login',
          component: () => import('../views/auth/LoginView.vue'),
        },
        {
          path: '/verify-email',
          name: 'verify-email',
          component: () => import('../views/auth/VerifyEmailView.vue'),
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
          meta: {
            requiresAuth: true,
          },
        },
        {
          path: 'profile/edit',
          component: () => import('../views/user/UserEditProfileView.vue'),
          meta: {
            requiresAuth: true,
          },
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
              meta: {
                requiresAuth: true,
                roles: ['SELLER'],
              },
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
        {
          path: 'your-orders',
          children: [
            {
              path: '',
              name: 'YourOrders',
              component: () => import('../views/order/OrderHistoryView.vue'),
              meta: {
                requiresAuth: true,
              },
            },
            {
              path: ':id',
              name: 'OrderDetail',
              component: () => import('../views/order/OrderDetailView.vue'),
              meta: {
                requiresAuth: true,
              },
            },
          ],
        },
        {
  path: 'sale-orders',
  children: [
    {
      path: '',
      name: 'SaleOrders',
      component: () => import('../views/order/OrderSellerView.vue'),
      meta: {
        requiresAuth: true,
        roles: ['SELLER'],
      },
    },
    {
      path: ':id',
      name: 'SaleOrderDetail',
      component: () => import('../views/order/OrderSellerDetailView.vue'),
      meta: {
        requiresAuth: true,
        roles: ['SELLER'],
      },
    },
  ],
},

        {
          path: 'cart',
          name: 'Cart',
          component: () => import('../views/cart/CartView.vue'),
          meta: {
            requiresAuth: true,
          },
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

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const user = authStore.user
  if (to.meta.requiresAuth && to.meta.roles) {
    if (!user) {
      return next({ name: 'user-login' })
    }
    if (!to.meta.roles.includes(user.role)) {
      if (user.role === 'BUYER') {
        return next({ name: 'sale-items-gallery' })
      }
      return next({ name: 'home' })
    }
  }
  if (to.meta.requiresAuth && !user) {
    return next({ name: 'user-login' })
  }

  return next()
})

export default router


