<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Server List</h1>
        <p class="mt-2 text-sm text-gray-600">Find and filter servers based on your requirements</p>
      </div>

      <!-- Filters -->
      <div class="sticky top-0 z-10 bg-white py-6 px-6 rounded-xl shadow-sm border border-gray-100 mb-8">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <!-- Location Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Location</label>
            <select
              v-model="filters.location"
              class="w-full rounded-lg border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white"
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
              class="w-full rounded-lg border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white"
              @change="fetchServers"
            >
              <option value="">All Types</option>
              <option v-for="type in hddTypes" :key="type" :value="type">
                {{ type }}
              </option>
            </select>
          </div>

          <!-- Storage Range -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Storage Range (GB)
            </label>
            <div class="flex items-center space-x-3">
              <input
                type="number"
                v-model="filters.minStorage"
                class="w-full rounded-lg border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white"
                placeholder="Min"
                @change="fetchServers"
              />
              <span class="text-gray-400">-</span>
              <input
                type="number"
                v-model="filters.maxStorage"
                class="w-full rounded-lg border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white"
                placeholder="Max"
                @change="fetchServers"
              />
            </div>
          </div>

          <!-- RAM Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">RAM</label>
            <div class="grid grid-cols-2 gap-2 bg-gray-50 p-3 rounded-lg">
              <label v-for="ram in ramOptions" :key="ram" class="flex items-center">
                <input
                  type="checkbox"
                  :value="ram"
                  v-model="filters.ram"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  @change="fetchServers"
                />
                <span class="ml-2 text-sm text-gray-700">{{ ram }}GB</span>
              </label>
            </div>
          </div>
        </div>

        <!-- Clear Filters -->
        <div class="mt-4 flex justify-end">
          <button
            class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            @click="clearFilters"
          >
            <svg class="mr-2 h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Clear All Filters
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>

      <!-- Server List Table (always visible, responsive) -->
      <div v-if="!isLoading" class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto w-full">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Model</th>
              <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">RAM</th>
              <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">HDD</th>
              <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
              <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="server in servers" :key="server.model" class="hover:bg-gray-50 transition-colors duration-150">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ server.model }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{{ server.ram }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{{ server.hdd }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{{ server.location }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">{{ server.price }}</td>
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
  minStorage: '',
  maxStorage: '',
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

const fetchServers = async () => {
  isLoading.value = true;
  try {
    const response = await apiService.getServers({
      per_page: pagination.value.per_page,
      page_no: pagination.value.page_no,
      min_storage: filters.value.minStorage,
      max_storage: filters.value.maxStorage,
      ram: filters.value.ram.join(','),
      location: filters.value.location,
    });
    servers.value = response.data;
    pagination.value = response.pagination;
  } catch (error) {
    console.error('Error fetching servers:', error);
  } finally {
    isLoading.value = false;
  }
};

const clearFilters = () => {
  filters.value = {
    location: '',
    hddType: '',
    minStorage: '',
    maxStorage: '',
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
