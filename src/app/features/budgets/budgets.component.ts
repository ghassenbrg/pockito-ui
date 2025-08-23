import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-budgets',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <!-- Page Header -->
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Budgets</h1>
          <p class="mt-1 text-sm text-gray-500">Set spending limits and track your budget progress</p>
        </div>
        <button class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          Create Budget
        </button>
      </div>

      <!-- Budget Overview -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg class="h-6 w-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Total Budget</dt>
                  <dd class="text-lg font-medium text-gray-900">$2,500.00</dd>
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
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                </svg>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Spent</dt>
                  <dd class="text-lg font-medium text-gray-900">$1,850.00</dd>
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
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                </svg>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Remaining</dt>
                  <dd class="text-lg font-medium text-gray-900">$650.00</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Budget Progress -->
      <div class="bg-white shadow rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">Budget Progress</h3>
          
          <div class="space-y-4">
            <!-- Overall Progress -->
            <div>
              <div class="flex items-center justify-between text-sm mb-2">
                <span class="text-gray-700 font-medium">Overall Budget</span>
                <span class="text-gray-900">74% used</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-3">
                <div class="bg-yellow-500 h-3 rounded-full" style="width: 74%"></div>
              </div>
              <div class="flex justify-between text-xs text-gray-500 mt-1">
                <span>$0</span>
                <span>$2,500</span>
              </div>
            </div>

            <!-- Category Budgets -->
            <div class="space-y-4">
              <!-- Groceries -->
              <div>
                <div class="flex items-center justify-between text-sm mb-2">
                  <span class="text-gray-700 font-medium">Groceries</span>
                  <span class="text-gray-900">$450 / $500</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div class="bg-green-500 h-2 rounded-full" style="width: 90%"></div>
                </div>
                <div class="flex justify-between text-xs text-gray-500 mt-1">
                  <span>$0</span>
                  <span>$500</span>
                </div>
              </div>

              <!-- Entertainment -->
              <div>
                <div class="flex items-center justify-between text-sm mb-2">
                  <span class="text-gray-700 font-medium">Entertainment</span>
                  <span class="text-gray-900">$180 / $200</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div class="bg-yellow-500 h-2 rounded-full" style="width: 90%"></div>
                </div>
                <div class="flex justify-between text-xs text-gray-500 mt-1">
                  <span>$0</span>
                  <span>$200</span>
                </div>
              </div>

              <!-- Transportation -->
              <div>
                <div class="flex items-center justify-between text-sm mb-2">
                  <span class="text-gray-700 font-medium">Transportation</span>
                  <span class="text-gray-900">$320 / $400</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div class="bg-green-500 h-2 rounded-full" style="width: 80%"></div>
                </div>
                <div class="flex justify-between text-xs text-gray-500 mt-1">
                  <span>$0</span>
                  <span>$400</span>
                </div>
              </div>

              <!-- Dining Out -->
              <div>
                <div class="flex items-center justify-between text-sm mb-2">
                  <span class="text-gray-700 font-medium">Dining Out</span>
                  <span class="text-gray-900">$500 / $400</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div class="bg-red-500 h-2 rounded-full" style="width: 125%"></div>
                </div>
                <div class="flex justify-between text-xs text-gray-500 mt-1">
                  <span>$0</span>
                  <span>$400</span>
                </div>
                <p class="text-xs text-red-600 mt-1">⚠️ Over budget by $100</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Budget Categories -->
      <div class="bg-white shadow rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">Budget Categories</h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div class="p-4 border border-gray-200 rounded-lg">
              <div class="flex items-center justify-between mb-2">
                <h4 class="text-sm font-medium text-gray-900">Groceries</h4>
                <span class="text-xs text-gray-500">Monthly</span>
              </div>
              <p class="text-2xl font-bold text-gray-900">$500</p>
              <div class="flex justify-between text-xs text-gray-500 mt-1">
                <span>Spent: $450</span>
                <span>Left: $50</span>
              </div>
              <div class="mt-2 flex space-x-2">
                <button class="flex-1 px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded hover:bg-blue-200">
                  Edit
                </button>
                <button class="flex-1 px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200">
                  Archive
                </button>
              </div>
            </div>

            <div class="p-4 border border-gray-200 rounded-lg">
              <div class="flex items-center justify-between mb-2">
                <h4 class="text-sm font-medium text-gray-900">Entertainment</h4>
                <span class="text-xs text-gray-500">Monthly</span>
              </div>
              <p class="text-2xl font-bold text-gray-900">$200</p>
              <div class="flex justify-between text-xs text-gray-500 mt-1">
                <span>Spent: $180</span>
                <span>Left: $20</span>
              </div>
              <div class="mt-2 flex space-x-2">
                <button class="flex-1 px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded hover:bg-blue-200">
                  Edit
                </button>
                <button class="flex-1 px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200">
                  Archive
                </button>
              </div>
            </div>

            <div class="p-4 border border-gray-200 rounded-lg">
              <div class="flex items-center justify-between mb-2">
                <h4 class="text-sm font-medium text-gray-900">Transportation</h4>
                <span class="text-xs text-gray-500">Monthly</span>
              </div>
              <p class="text-2xl font-bold text-gray-900">$400</p>
              <div class="flex justify-between text-xs text-gray-500 mt-1">
                <span>Spent: $320</span>
                <span>Left: $80</span>
              </div>
              <div class="mt-2 flex space-x-2">
                <button class="flex-1 px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded hover:bg-blue-200">
                  Edit
                </button>
                <button class="flex-1 px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200">
                  Archive
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class BudgetsComponent {}
