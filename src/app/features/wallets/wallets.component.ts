import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-wallets',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <!-- Page Header -->
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Wallets</h1>
          <p class="mt-1 text-sm text-gray-500">Manage your financial accounts and wallets</p>
        </div>
        <button class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          Add Wallet
        </button>
      </div>

      <!-- Wallet Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- Main Bank Account -->
        <div class="bg-white overflow-hidden shadow rounded-lg border-l-4 border-blue-500">
          <div class="p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span class="text-xl">🏦</span>
                </div>
              </div>
              <div class="ml-4 flex-1">
                <h3 class="text-lg font-medium text-gray-900">Main Bank Account</h3>
                <p class="text-sm text-gray-500">Bank of America</p>
              </div>
              <div class="text-right">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Default
                </span>
              </div>
            </div>
            <div class="mt-4">
              <p class="text-2xl font-bold text-gray-900">$8,245.67</p>
              <p class="text-sm text-gray-500">USD</p>
            </div>
            <div class="mt-4 flex space-x-2">
              <button class="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
                Edit
              </button>
              <button class="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
                Archive
              </button>
            </div>
          </div>
        </div>

        <!-- Savings Wallet -->
        <div class="bg-white overflow-hidden shadow rounded-lg border-l-4 border-green-500">
          <div class="p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <span class="text-xl">💰</span>
                </div>
              </div>
              <div class="ml-4 flex-1">
                <h3 class="text-lg font-medium text-gray-900">Emergency Fund</h3>
                <p class="text-sm text-gray-500">Savings</p>
              </div>
            </div>
            <div class="mt-4">
              <p class="text-2xl font-bold text-gray-900">$3,500.00</p>
              <p class="text-sm text-gray-500">USD</p>
            </div>
            <div class="mt-2">
              <div class="flex items-center justify-between text-sm">
                <span class="text-gray-500">Goal: $10,000</span>
                <span class="text-gray-900 font-medium">35%</span>
              </div>
              <div class="mt-1 w-full bg-gray-200 rounded-full h-2">
                <div class="bg-green-600 h-2 rounded-full" style="width: 35%"></div>
              </div>
            </div>
            <div class="mt-4 flex space-x-2">
              <button class="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
                Edit
              </button>
              <button class="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
                Archive
              </button>
            </div>
          </div>
        </div>

        <!-- Cash Wallet -->
        <div class="bg-white overflow-hidden shadow rounded-lg border-l-4 border-yellow-500">
          <div class="p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                  <span class="text-xl">💵</span>
                </div>
              </div>
              <div class="ml-4 flex-1">
                <h3 class="text-lg font-medium text-gray-900">Cash</h3>
                <p class="text-sm text-gray-500">Physical cash</p>
              </div>
            </div>
            <div class="mt-4">
              <p class="text-2xl font-bold text-gray-900">$600.00</p>
              <p class="text-sm text-gray-500">USD</p>
            </div>
            <div class="mt-4 flex space-x-2">
              <button class="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
                Edit
              </button>
              <button class="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
                Archive
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Wallet Summary -->
      <div class="bg-white shadow rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">Wallet Summary</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="text-center">
              <p class="text-2xl font-bold text-gray-900">3</p>
              <p class="text-sm text-gray-500">Active Wallets</p>
            </div>
            <div class="text-center">
              <p class="text-2xl font-bold text-gray-900">$12,345.67</p>
              <p class="text-sm text-gray-500">Total Balance</p>
            </div>
            <div class="text-center">
              <p class="text-2xl font-bold text-gray-900">$10,000</p>
              <p class="text-sm text-gray-500">Total Goals</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class WalletsComponent {}
