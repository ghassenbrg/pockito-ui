import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { 
  SubscriptionRequest, 
  Subscription, 
  PaySubscriptionRequest,
  Transaction
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {
  private readonly baseUrl = '/api/subscriptions';

  constructor(private http: HttpClient) {}

  /**
   * Get all subscriptions for the authenticated user, ordered by name
   */
  listSubscriptions(): Observable<Subscription[]> {
    return this.http.get<Subscription[]>(this.baseUrl);
  }

  /**
   * Create a new subscription for the authenticated user
   */
  createSubscription(subscription: SubscriptionRequest): Observable<Subscription> {
    return this.http.post<Subscription>(this.baseUrl, subscription);
  }

  /**
   * Get a specific subscription by ID
   */
  getSubscription(subscriptionId: string): Observable<Subscription> {
    return this.http.get<Subscription>(`${this.baseUrl}/${subscriptionId}`);
  }

  /**
   * Update an existing subscription for the authenticated user
   */
  updateSubscription(subscriptionId: string, subscription: SubscriptionRequest): Observable<Subscription> {
    return this.http.put<Subscription>(`${this.baseUrl}/${subscriptionId}`, subscription);
  }

  /**
   * Delete a subscription for the authenticated user
   */
  deleteSubscription(subscriptionId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${subscriptionId}`);
  }

  /**
   * Pay subscription
   * Processes a payment for a subscription. Creates a new EXPENSE transaction 
   * and updates the subscription's nextDueDate. Exchange rate is only used 
   * if subscription currency differs from wallet currency, otherwise it's ignored.
   */
  paySubscription(subscriptionId: string, request: PaySubscriptionRequest): Observable<Transaction> {
    return this.http.post<Transaction>(`${this.baseUrl}/${subscriptionId}/pay`, request);
  }
}
