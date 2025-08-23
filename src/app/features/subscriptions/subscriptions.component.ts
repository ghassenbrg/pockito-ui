import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-subscriptions',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <!-- Page Header -->
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Subscriptions</h1>
          <p class="mt-1 text-sm text-gray-500">Manage your recurring payments and subscriptions</p>
        </div>
        <button class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          Add Subscription
        </button>
      </div>

      <!-- Subscription Summary -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg class="h-6 w-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Monthly Cost</dt>
                  <dd class="text-lg font-medium text-gray-900">$89.97</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg class="h-6 w-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Active Subscriptions</dt>
                  <dd class="text-lg font-medium text-gray-900">5</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg class="h-6 w-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Next Due</dt>
                  <dd class="text-lg font-medium text-gray-900">3 days</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Subscription List -->
      <div class="bg-white shadow rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">Your Subscriptions</h3>
          
          <div class="space-y-4">
            <!-- Netflix -->
            <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div class="flex items-center">
                <div class="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <span class="text-xl">📺</span>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-900">Netflix</p>
                  <p class="text-sm text-gray-500">Entertainment • Monthly</p>
                  <p class="text-xs text-gray-400">Next due: Dec 15, 2024</p>
                </div>
              </div>
              <div class="text-right">
                <p class="text-sm font-medium text-gray-900">$15.99</p>
                <div class="flex space-x-2 mt-2">
                  <button class="px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200">
                    Pay Now
                  </button>
                  <button class="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
                    Edit
                  </button>
                </div>
              </div>
            </div>

            <!-- Spotify -->
            <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div class="flex items-center">
                <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <span class="text-xl">🎵</span>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-900">Spotify Premium</p>
                  <p class="text-sm text-gray-500">Music • Monthly</p>
                  <p class="text-xs text-gray-400">Next due: Dec 20, 2024</p>
                </div>
              </div>
              <div class="text-right">
                <p class="text-sm font-medium text-gray-900">$9.99</p>
                <div class="flex space-x-2 mt-2">
                  <button class="px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200">
                    Pay Now
                  </button>
                  <button class="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
                    Edit
                  </button>
                </div>
              </div>
            </div>

            <!-- Gym Membership -->
            <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div class="flex items-center">
                <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span class="text-xl">💪</span>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-900">Planet Fitness</p>
                  <p class="text-sm text-gray-500">Fitness • Monthly</p>
                  <p class="text-xs text-gray-400">Next due: Dec 25, 2024</p>
                </div>
              </div>
              <div class="text-right">
                <p class="text-sm font-medium text-gray-900">$24.99</p>
                <div class="flex space-x-2 mt-2">
                  <button class="px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200">
                    Pay Now
                  </button>
                  <button class="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
                    Edit
                  </button>
                </div>
              </div>
            </div>

            <!-- Adobe Creative Cloud -->
            <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div class="flex items-center">
                <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span class="text-xl">🎨</span>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-900">Adobe Creative Cloud</p>
                  <p class="text-sm text-gray-500">Software • Annual</p>
                  <p class="text-xs text-gray-400">Next due: Jan 15, 2025</p>
                </div>
              </div>
              <div class="text-right">
                <p class="text-sm font-medium text-gray-900">$39.00</p>
                <div class="flex space-x-2 mt-2">
                  <button class="px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200">
                    Pay Now
                  </button>
                  <button class="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
                    Edit
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class SubscriptionsComponent {}
