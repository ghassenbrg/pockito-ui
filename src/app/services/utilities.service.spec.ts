import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UtilitiesService } from './utilities.service';
import { 
  ProtectedResponse, 
  HealthResponse, 
  EchoResponse, 
  PublicResponse 
} from '../models/api-models';
import { environment } from '../../environments/environment';

/* eslint-disable @typescript-eslint/no-unused-vars */
declare const describe: any;
declare const it: any;
declare const beforeEach: any;
declare const expect: any;
declare const afterEach: any;

describe('UtilitiesService', () => {
  let service: UtilitiesService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        UtilitiesService
      ]
    });

    service = TestBed.inject(UtilitiesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('accessProtectedEndpoint', () => {
    it('should make POST request to protected endpoint', () => {
      const mockResponse: ProtectedResponse = {
        message: 'Access granted',
        timestamp: new Date().toISOString(),
        authenticated: true,
        userRole: 'USER',
        accessLevel: 'STANDARD'
      };

      service.accessProtectedEndpoint().subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${environment.api.baseUrl}/sample/protected`);
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);
    });
  });

  describe('getHealthStatus', () => {
    it('should make GET request to health endpoint', () => {
      const mockResponse: HealthResponse = {
        status: 'UP',
        timestamp: new Date().toISOString(),
        service: 'pockito-api',
        version: '1.0.0',
        uptime: 'PT1H30M'
      };

      service.getHealthStatus().subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${environment.api.baseUrl}/sample/health`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('echoMessage', () => {
    it('should make GET request to echo endpoint with message', () => {
      const message = 'Hello World';
      const mockResponse: EchoResponse = {
        message: message,
        timestamp: new Date().toISOString(),
        length: message.length,
        uppercase: message.toUpperCase(),
        lowercase: message.toLowerCase()
      };

      service.echoMessage(message).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${environment.api.baseUrl}/sample/echo/${encodeURIComponent(message)}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should throw error for empty message', () => {
      expect(() => service.echoMessage('')).toThrowError('Message cannot be empty or null');
      expect(() => service.echoMessage('   ')).toThrowError('Message cannot be empty or null');
    });

    it('should throw error for message exceeding 100 characters', () => {
      const longMessage = 'a'.repeat(101);
      expect(() => service.echoMessage(longMessage)).toThrowError('Message cannot exceed 100 characters');
    });
  });

  describe('getPublicInfo', () => {
    it('should make GET request to public endpoint', () => {
      const mockResponse: PublicResponse = {
        message: 'Public information',
        timestamp: new Date().toISOString(),
        authenticated: false,
        service: 'pockito-api'
      };

      service.getPublicInfo().subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${environment.api.baseUrl}/public`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });


});
