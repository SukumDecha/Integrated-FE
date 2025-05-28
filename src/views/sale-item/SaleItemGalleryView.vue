<script setup>
import { onMounted, watch, reactive, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useToastStore } from '@/stores/toast.store';

import XBreadcrumb from '@/components/layout/XBreadcrumb.vue';
import XButton from '@/components/common/XButton.vue';
import XPagination from '@/components/common/XPagination.vue';
import XSelector from '@/components/common/form/XSelector.vue';
import SaleItemCard from '@/components/sale-item/SaleItemCard.vue';

import { AlignJustify, ArrowDownWideNarrow, ArrowUpWideNarrow, PlusIcon } from 'lucide-vue-next';

import { SaleItemService, BrandService } from '@/services';
import { loadFromLocalStorage, saveToLocalStorage } from '@/utils/StorageUtils';
import { LOCAL_STORAGE_KEYS } from '@/constants/sale-item';

// --- State Management ---
const searchOptions = reactive({
  currentPage: 1,
  pageSize: 10,
  totalItems: 0,
  sortField: undefined,
  sortOrder: undefined,
  filteredBrands: [],
  activeOnly: false,
});

const allBrands = reactive([]);
const saleItems = reactive([]);

const loading = reactive({
  items: true,
  brands: false,
});

const error = reactive({
  items: null,
  brands: null,
});

const route = useRoute();
const router = useRouter();
const toast = useToastStore();

const breadcrumbs = [
  { text: 'Home', path: '/' },
  { text: 'Sale Items', active: true },
];

const brandOptions = computed(() => allBrands.map((b) => ({ label: b, value: b })));

const searchParams = computed(() => ({
  page: searchOptions.currentPage - 1,
  size: searchOptions.pageSize,
  sortField: searchOptions.sortField,
  sortDirection: searchOptions.sortOrder,
  filterBrands: searchOptions.filteredBrands,
  activeOnly: searchOptions.activeOnly,
}));


const initializeStateFromRouteOrStorage = () => {
  const q = route.query;

  // Pagination
  searchOptions.currentPage = parseInt(q.page, 10) || loadFromLocalStorage(LOCAL_STORAGE_KEYS.PAGINATION, {}).currentPage || 1;
  searchOptions.pageSize = parseInt(q.size, 10) || loadFromLocalStorage(LOCAL_STORAGE_KEYS.PAGINATION, {}).pageSize || 10;

  // Sort
  searchOptions.sortField = q.sortField || loadFromLocalStorage(LOCAL_STORAGE_KEYS.SORT, {}).field;
  searchOptions.sortOrder = q.sortDirection || loadFromLocalStorage(LOCAL_STORAGE_KEYS.SORT, {}).order;

  // Filter Brands
  searchOptions.filteredBrands = q.filterBrands ? q.filterBrands.split(',') : loadFromLocalStorage(LOCAL_STORAGE_KEYS.FILTER_BRANDS, []);

  // Active Only
  searchOptions.activeOnly = q.activeOnly === 'true' || false;

  updateRouteQuery()
};

/**
 * Updates the URL query parameters based on current searchOptions.
 */
const updateRouteQuery = () => {
  const query = {};

  if (searchOptions.currentPage) query.page = searchOptions.currentPage;
  if (searchOptions.pageSize) query.size = searchOptions.pageSize;

  if (searchOptions.sortField) query.sortField = searchOptions.sortField;
  if (searchOptions.sortOrder) query.sortDirection = searchOptions.sortOrder;

  if (searchOptions.filteredBrands.length > 0) query.filterBrands = searchOptions.filteredBrands.join(',');
  if (searchOptions.activeOnly) query.activeOnly = true;

  router.replace({ query });
};

// --- Data Fetching ---
const fetchSaleItems = async () => {
  loading.items = true;
  error.items = null;

  const response = await SaleItemService.getSaleItemListPaginated(searchParams.value);

  if (response.error) {
    error.items = response.error.message || 'Failed to load sale items. Please try again later.';
    toast.add({
      type: 'error',
      message: error.items,
    });
    loading.items = false;
    return;
  }

  saleItems.splice(0, saleItems.length);
  saleItems.push(...response.data);
  searchOptions.totalItems = response.pagination.totalItems;
  loading.items = false;
};

const fetchBrands = async () => {
  loading.brands = true;
  error.brands = null;

  const response = await BrandService.getAllBrands();
  if (response.error) {
    error.brands = response.error.message || 'Failed to load brands. Please try again later.';
    toast.add({
      type: 'error',
      message: 'Failed to load brands. Please try again later.',
    });
    loading.brands = false;
    return;
  }

  allBrands.push(...response.data
                    .map((b) => b.name)
                    .sort((a, b) => a.localeCompare(b)))
  loading.brands = false;
};

const handlePaginationChange = async ({ currentPage, pageSize }) => {
  const oldCurrentPage = searchOptions.currentPage;

  searchOptions.currentPage = currentPage;
  searchOptions.pageSize = pageSize;

  if (oldCurrentPage === currentPage) {
    await fetchSaleItems();
  }

  saveToLocalStorage(LOCAL_STORAGE_KEYS.PAGINATION, { currentPage, pageSize });
};

const setSort = (field, order) => {
  searchOptions.sortField = field;
  searchOptions.sortOrder = order;
  if (field && order) {
    saveToLocalStorage(LOCAL_STORAGE_KEYS.SORT, { field, order });
  } else {
    localStorage.removeItem(LOCAL_STORAGE_KEYS.SORT);
  }
};

const sortAscByName = () => setSort('brand.name', 'asc');
const sortDescByName = () => setSort('brand.name', 'desc');
const clearSort = () => setSort(undefined, undefined);

const handleBrandSelect = (selectedBrands) => {
  searchOptions.filteredBrands = [...selectedBrands];
  saveToLocalStorage(LOCAL_STORAGE_KEYS.FILTER_BRANDS, selectedBrands);
  resetPagination(false)
};

const handleBrandRemove = (brandToRemove) => {
  searchOptions.filteredBrands = searchOptions.filteredBrands.filter((b) => b !== brandToRemove);
  saveToLocalStorage(LOCAL_STORAGE_KEYS.FILTER_BRANDS, searchOptions.filteredBrands);
  resetPagination(false)
};

const clearBrandFilter = () => {
  searchOptions.filteredBrands = [];
  localStorage.removeItem(LOCAL_STORAGE_KEYS.FILTER_BRANDS);
  resetPagination(false)
};

const resetPagination = (resetPageSize) => {
  searchOptions.currentPage = 1;

  if (resetPageSize) {
    searchOptions.pageSize = 5;
  }

  saveToLocalStorage(LOCAL_STORAGE_KEYS.PAGINATION, {
          currentPage: searchOptions.currentPage,
          pageSize: searchOptions.pageSize
 });
};

onMounted(async () => {
  initializeStateFromRouteOrStorage();
  await fetchBrands();
  await fetchSaleItems()
});

watch(
  searchParams,
  async (newParams, oldParams) => {
    // If we use deep check, it won't allow us to fetch the same page
    // if (JSON.stringify(newParams) !== JSON.stringify(oldParams)) {
    //   updateRouteQuery();
    //   await fetchSaleItems();
    // }
    updateRouteQuery();
    await fetchSaleItems();
  },
  {  deep: true },
);

watch(
  () => route.query.toast,
  (newToastValue) => {
    if (newToastValue === 'created') {
      toast.add({ message: 'The sale item has been successfully added.', type: 'success' });
      // Remove the toast query parameter
      const newQuery = { ...route.query };
      delete newQuery.toast;
      router.replace({ query: newQuery });
    }
  },
  { immediate: true },
);
</script>

<template>
  <div class="bg-white flex-grow">
    <div class="max-w-7xl mx-auto py-8 px-4 space-y-6">
      <div class="flex justify-between items-center">
        <XBreadcrumb :items="breadcrumbs" />
        <XButton
          class-name="itbms-sale-item-add"
          @click="$router.push('/sale-items/add')"
        >
          <PlusIcon class="h-5 w-5 mr-2" /> Add Sale Item
        </XButton>
      </div>

      <div class="flex flex-wrap items-center justify-between gap-4 p-4 rounded-md">
        <div class="flex flex-col sm:flex-row items-start sm:items-center gap-2 flex-1">
          <div class="min-w-[200px]">
            <XSelector
              v-model="searchOptions.filteredBrands"
              :options="brandOptions"
              placeholder="Select Brands"
              mode="multiple"
              class="itbms-brand-filter itbms-brand-filter-button"
              :searchable="true"
              :clearable="true"
              @update:model-value="handleBrandSelect"
              @remove="handleBrandRemove"
            />
          </div>
          <XButton
            class-name="itbms-brand-filter-clear"
            @click="clearBrandFilter"
          >
            Clear Brands
          </XButton>
        </div>

        <div class="flex items-center gap-2">
          <XButton
            class-name="itbms-brand-none"
            variant="info"
            :disabled="!searchOptions.sortField && !searchOptions.sortOrder"
            @click="clearSort"
          >
            <AlignJustify />
          </XButton>
          <XButton
            class-name="itbms-brand-asc"
            variant="info"
            :disabled="searchOptions.sortField === 'brand.name' && searchOptions.sortOrder === 'asc'"
            @click="sortAscByName"
          >
            <ArrowUpWideNarrow />
          </XButton>
          <XButton
            class-name="itbms-brand-desc"
            variant="info"
            :disabled="searchOptions.sortField === 'brand.name' && searchOptions.sortOrder === 'desc'"
            @click="sortDescByName"
          >
            <ArrowDownWideNarrow />
          </XButton>
        </div>
      </div>

      <div class="space-y-2">
        <h2 class="text-3xl font-extrabold tracking-tight text-gray-900">
          Featured Products
        </h2>
        <p class="text-gray-500">
          Check out our most popular items this season.
        </p>
      </div>

      <div
        class="mt-10"
      >
        <div class="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-5 xl:gap-x-8">
          <SaleItemCard
            v-for="product in saleItems"
            :id="product.id"
            :key="product.id"
            :brand="product.brandName"
            :model="product.model"
            :ram-gb="product.ramGb"
            :storage-gb="product.storageGb"
            :price="product.price"
            :is-loading="loading.items"
          />
        </div>

        <XPagination
          class="mt-8"
          :v-if="!loading.items && saleItems.length > 0"
          :pagination="{
            currentPage: searchOptions.currentPage,
            pageSize: searchOptions.pageSize,
            total: searchOptions.totalItems,
          }"
          :show-size-changer="true"
          @change="handlePaginationChange"
        />
      </div>
      <div
        v-if="!loading.items && saleItems.length === 0 && !error.items"
        class="text-center py-10 itbms-row"
      >
        <p class="text-lg text-gray-500">
          no sale item
        </p>
      </div>
    </div>
  </div>
</template>
