import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <!-- Page Header -->
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Transactions</h1>
          <p class="mt-1 text-sm text-gray-500">Track your income, expenses, and transfers</p>
        </div>
        <button class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          Add Transaction
        </button>
      </div>

      <!-- Filters -->
      <div class="bg-white shadow rounded-lg p-4">
        <div class="flex flex-wrap gap-4">
          <select class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">All Types</option>
            <option value="EXPENSE">Expenses</option>
            <option value="INCOME">Income</option>
            <option value="TRANSFER">Transfers</option>
          </select>
          <select class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">All Wallets</option>
            <option value="bank">Bank Account</option>
            <option value="savings">Savings</option>
            <option value="cash">Cash</option>
          </select>
          <input 
            type="date" 
            class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="From Date"
          >
          <input 
            type="date" 
            class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="To Date"
          >
        </div>
      </div>

      <!-- Transaction List -->
      <div class="bg-white shadow rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">Recent Transactions</h3>
          
          <div class="space-y-3">
            <!-- Transaction Item 1 -->
            <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div class="flex items-center">
                <div class="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 13l-5 5m0 0l-5-5m5 5V6"></path>
                  </svg>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-900">Grocery Shopping</p>
                  <p class="text-sm text-gray-500">Main Bank Account • Today</p>
                </div>
              </div>
              <div class="text-right">
                <p class="text-sm font-medium text-red-600">-$85.50</p>
                <p class="text-xs text-gray-500">Food & Dining</p>
              </div>
            </div>

            <!-- Transaction Item 2 -->
            <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div class="flex items-center">
                <div class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 11l5-5m0 0l5 5m-5-5v12"></path>
                  </svg>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-900">Salary Payment</p>
                  <p class="text-sm text-gray-500">Main Bank Account • Yesterday</p>
                </div>
              </div>
              <div class="text-right">
                <p class="text-sm font-medium text-green-600">+$4,500.00</p>
                <p class="text-xs text-gray-500">Income</p>
              </div>
            </div>

            <!-- Transaction Item 3 -->
            <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div class="flex items-center">
                <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path>
                  </svg>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-900">Transfer to Savings</p>
                  <p class="text-sm text-gray-500">Bank → Savings • 2 days ago</p>
                </div>
              </div>
              <div class="text-right">
                <p class="text-sm font-medium text-blue-600">-$500.00</p>
                <p class="text-xs text-gray-500">Transfer</p>
              </div>
            </div>

            <!-- Transaction Item 4 -->
            <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div class="flex items-center">
                <div class="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 13l-5 5m0 0l-5-5m5 5V6"></path>
                  </svg>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-900">Netflix Subscription</p>
                  <p class="text-sm text-gray-500">Main Bank Account • 3 days ago</p>
                </div>
              </div>
              <div class="text-right">
                <p class="text-sm font-medium text-red-600">-$15.99</p>
                <p class="text-xs text-gray-500">Entertainment</p>
              </div>
            </div>
          </div>

          <!-- Load More -->
          <div class="mt-6 text-center">
            <button class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              Load More Transactions
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class TransactionsComponent {}
