<script setup>
import { NAVBAR_MENU } from '@/constants/navbar.constant';
import { Menu, ShoppingBag, ShoppingCart, X } from 'lucide-vue-next';
import { ref } from 'vue';
import { useRoute } from 'vue-router';

defineProps({
  cartCount: {
    type: Number,
    default: 0,
  },
});

const route = useRoute();
const isOpen = ref(false);

const isActiveRoute = (navItem) => {
  if (navItem.exact) {
    return route.path === navItem.to;
  } else {
    return route.path.startsWith(navItem.to);
  }
};

const toggleMobileMenu = () => {
  isOpen.value = !isOpen.value;
};

const closeMobileMenu = () => {
  isOpen.value = false;
};
</script>

<template>
  <nav class="bg-white shadow-sm sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <!-- Logo and Desktop Navigation -->
        <div class="flex items-center">
          <router-link
            to="/"
            class="flex-shrink-0 flex items-center"
          >
            <ShoppingBag class="h-8 w-8 text-emerald-600" />
            <span class="ml-2 text-xl font-bold text-emerald-800">Green Cart</span>
          </router-link>

          <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
            <router-link
              v-for="item in NAVBAR_MENU"
              :key="item.name"
              :to="item.to"
              class="inline-flex items-center px-1 pt-1 border-b-2 text-base md:text-lg font-medium transition-colors duration-200"
              :class="isActiveRoute(item)
                ? 'border-emerald-500 text-gray-900'
                : 'border-transparent text-gray-500 hover:border-emerald-300 hover:text-gray-700'"
            >
              {{ item.name }}
            </router-link>
          </div>
        </div>

        <!-- Desktop Action Buttons -->
        <div class="hidden sm:ml-6 sm:flex sm:items-center space-x-3">
          <!-- <button
            type="button"
            class="p-1 rounded-full text-gray-500 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors duration-200"
            aria-label="Search"
          >
            <Search class="h-6 w-6" />
          </button> -->

          <router-link
            to="/login"
            class="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 transition-colors duration-200"
          >
            Login
          </router-link>

          <router-link
            to="/register"
            class="px-3 py-2 rounded-md text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors duration-200"
          >
            Sign Up
          </router-link>

          <router-link
            to="/cart"
            class="relative p-1 rounded-full text-gray-500 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors duration-200"
            aria-label="Shopping Cart"
          >
            <ShoppingCart class="h-6 w-6" />
            <span
              v-if="cartCount > 0"
              class="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-emerald-600 rounded-full min-w-[1.25rem] h-5"
            >
              {{ cartCount }}
            </span>
          </router-link>
        </div>

        <!-- Mobile Menu Button -->
        <div class="sm:hidden">
          <button
            type="button"
            class="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-emerald-500 transition-colors duration-200"
            :aria-expanded="isOpen"
            aria-controls="mobile-menu"
            @click="toggleMobileMenu"
          >
            <span class="sr-only">{{ isOpen ? 'Close' : 'Open' }} main menu</span>
            <Menu
              v-if="!isOpen"
              class="block h-6 w-6"
            />
            <X
              v-else
              class="block h-6 w-6"
            />
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile Menu -->
    <transition name="slide-down">
      <div
        v-show="isOpen"
        id="mobile-menu"
        class="sm:hidden"
      >
        <div class="pt-2 pb-3 space-y-1">
          <router-link
            v-for="item in NAVBAR_MENU"
            :key="item.name"
            :to="item.to"
            class="block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors duration-200"
            :class="isActiveRoute(item)
              ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
              : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-emerald-300 hover:text-gray-700'"
            @click="closeMobileMenu"
          >
            {{ item.name }}
          </router-link>
        </div>

        <!-- Mobile Action Buttons -->
        <div class="pt-4 pb-3 border-t border-gray-200">
          <div class="flex items-center justify-between px-4 mb-3">
            <router-link
              to="/login"
              class="px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 transition-colors duration-200"
              @click="closeMobileMenu"
            >
              Login
            </router-link>

            <router-link
              to="/register"
              class="px-4 py-2 rounded-md text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors duration-200"
              @click="closeMobileMenu"
            >
              Sign Up
            </router-link>
          </div>

          <div class="flex items-center justify-center px-4">
            <router-link
              to="/cart"
              class="relative p-2 rounded-full text-gray-500 hover:text-gray-600 hover:bg-gray-100 transition-colors duration-200"
              aria-label="Shopping Cart"
              @click="closeMobileMenu"
            >
              <ShoppingCart class="h-6 w-6" />
              <span
                v-if="cartCount > 0"
                class="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-emerald-600 rounded-full min-w-[1.25rem] h-5"
              >
                {{ cartCount }}
              </span>
            </router-link>
          </div>
        </div>
      </div>
    </transition>
  </nav>
</template>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease-out;
  overflow: hidden;
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  max-height: 0;
  transform: translateY(-10px);
}

.slide-down-enter-to,
.slide-down-leave-from {
  opacity: 1;
  max-height: 400px;
  transform: translateY(0);
}
</style>
