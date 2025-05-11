<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <!-- Header -->
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Leaseweb Server List</h1>
        <p class="mt-2 text-sm text-gray-600">Find and filter servers based on your requirements</p>
      </div>

      <!-- Filters Card -->
      <div class="bg-white border border-blue-100 rounded-xl shadow p-6 max-w-3xl mx-auto">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Location Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Location</label>
            <select
              v-model="filters.location"
              class="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white"
              @change="fetchServers"
            >
              <option value="">All Locations</option>
              <option v-for="location in locations" :key="location" :value="location">
                {{ location }}
              </option>
            </select>
          </div>

          <!-- HDD Type Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">HDD Type</label>
            <select
              v-model="filters.hddType"
              class="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white"
              @change="fetchServers"
            >
              <option value="">All Types</option>
              <option v-for="type in hddTypes" :key="type" :value="type">
                {{ type }}
              </option>
            </select>
          </div>

          <!-- Storage Range -->
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-2">Storage Range</label>
            <div class="flex flex-wrap gap-2 items-center">
              <div class="flex gap-1">
                <input
                  type="number"
                  v-model="filters.minStorageValue"
                  class="w-24 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white"
                  placeholder="Min"
                  @change="fetchServers"
                />
                <select
                  v-model="filters.minStorageUnit"
                  class="rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white"
                >
                  <option value="GB">GB</option>
                  <option value="TB">TB</option>
                </select>
              </div>
              <span class="text-gray-400">-</span>
              <div class="flex gap-1">
                <input
                  type="number"
                  v-model="filters.maxStorageValue"
                  class="w-24 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white"
                  placeholder="Max"
                  @change="fetchServers"
                />
                <select
                  v-model="filters.maxStorageUnit"
                  class="rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white"
                >
                  <option value="GB">GB</option>
                  <option value="TB">TB</option>
                </select>
              </div>
            </div>
          </div>

          <!-- RAM Filter -->
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-2">RAM</label>
            <div class="flex flex-wrap gap-3">
              <label v-for="ram in ramOptions" :key="ram" class="flex items-center space-x-1">
                <input
                  type="checkbox"
                  :value="ram"
                  v-model="filters.ram"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  @change="fetchServers"
                />
                <span class="text-sm text-gray-700">{{ ram }}GB</span>
              </label>
            </div>
          </div>
        </div>
        <!-- Clear Filters -->
        <div class="mt-6 flex justify-end">
          <button
            class="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
            @click="clearFilters"
          >
            Clear All Filters
          </button>
        </div>
      </div>

      <!-- Results Card -->
      <div class="bg-white border border-gray-200 rounded-xl shadow p-6">
        <!-- Loading State -->
        <div v-if="isLoading" class="flex justify-center items-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
        <!-- Server List Table -->
        <div v-if="!isLoading" class="overflow-x-auto w-full">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Model</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">RAM</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">HDD</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Location</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="server in servers" :key="server.model" class="hover:bg-blue-50 transition-colors duration-150">
                <td class="px-4 py-3 text-sm text-gray-900 font-medium align-middle">{{ server.model }}</td>
                <td class="px-4 py-3 text-sm text-gray-700 align-middle">{{ server.ram }}</td>
                <td class="px-4 py-3 text-sm text-gray-700 align-middle">{{ server.hdd }}</td>
                <td class="px-4 py-3 text-sm text-gray-700 align-middle">{{ server.location }}</td>
                <td class="px-4 py-3 text-sm text-blue-600 font-medium align-middle">{{ server.price }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <!-- Pagination -->
        <div class="mt-8 flex justify-between items-center">
          <div class="text-sm text-gray-700">
            Showing page {{ pagination.page_no }} of {{ Math.ceil(pagination.total / pagination.per_page) }}
          </div>
          <div class="flex space-x-3">
            <button
              @click="prevPage"
              :disabled="pagination.page_no <= 1"
              class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium transition-colors duration-150"
              :class="pagination.page_no <= 1 ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'"
            >
              <svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </button>
            <button
              @click="nextPage"
              :disabled="pagination.page_no >= Math.ceil(pagination.total / pagination.per_page)"
              class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium transition-colors duration-150"
              :class="pagination.page_no >= Math.ceil(pagination.total / pagination.per_page) ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'"
            >
              Next
              <svg class="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
        <div v-if="!isLoading && servers.length === 0" class="text-center text-gray-500 py-8">
          No results found.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { apiService, type Server, type Pagination } from '../services/api';

const servers = ref<Server[]>([]);
const locations = ref<string[]>([]);
const hddTypes = ref<string[]>([]);
const ramOptions = [2, 4, 8, 16, 32, 64, 128];
const isLoading = ref(false);

const filters = ref({
  location: '',
  hddType: '',
  minStorageValue: '',
  minStorageUnit: 'GB',
  maxStorageValue: '',
  maxStorageUnit: 'GB',
  ram: [] as number[],
});

const pagination = ref<Pagination>({
  per_page: 10,
  page_no: 1,
  total: 0,
});

const fetchLocations = async () => {
  try {
    locations.value = await apiService.getLocations();
  } catch (error) {
    console.error('Error fetching locations:', error);
  }
};

const fetchHddTypes = async () => {
  try {
    hddTypes.value = await apiService.getHddTypes();
  } catch (error) {
    console.error('Error fetching HDD types:', error);
  }
};

const getStorageInGB = (value: string | number, unit: string): string => {
  if (!value) return '';
  const num = Number(value);
  if (isNaN(num)) return '';
  return unit === 'TB' ? String(num * 1024) : String(num);
};

const fetchServers = async () => {
  isLoading.value = true;
  try {
    // Build params object dynamically
    const params: Record<string, any> = {
      per_page: pagination.value.per_page,
      page_no: pagination.value.page_no,
    };
    if (filters.value.minStorageValue)
      params.min_storage = `${filters.value.minStorageValue}${filters.value.minStorageUnit}`;
    if (filters.value.maxStorageValue)
      params.max_storage = `${filters.value.maxStorageValue}${filters.value.maxStorageUnit}`;
    if (filters.value.ram.length)
      params.ram = filters.value.ram.map((r: number) => `${r}GB`).join(',');
    if (filters.value.location)
      params.location = filters.value.location;
    if (filters.value.hddType)
      params.hdd_type = filters.value.hddType;

    const response = await apiService.getServers(params);
    servers.value = response.data;
    pagination.value = response.pagination;
  } catch (error: any) {
    if (error.response && error.response.status === 404) {
      servers.value = [];
      pagination.value = { per_page: 10, page_no: 1, total: 0 };
    } else {
      console.error('Error fetching servers:', error);
    }
  } finally {
    isLoading.value = false;
  }
};

const clearFilters = () => {
  filters.value = {
    location: '',
    hddType: '',
    minStorageValue: '',
    minStorageUnit: 'GB',
    maxStorageValue: '',
    maxStorageUnit: 'GB',
    ram: [],
  };
  fetchServers();
};

const nextPage = () => {
  if (pagination.value.page_no < Math.ceil(pagination.value.total / pagination.value.per_page)) {
    pagination.value.page_no++;
    fetchServers();
  }
};

const prevPage = () => {
  if (pagination.value.page_no > 1) {
    pagination.value.page_no--;
    fetchServers();
  }
};

onMounted(() => {
  fetchLocations();
  fetchHddTypes();
  fetchServers();
});
</script>