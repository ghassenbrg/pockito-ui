import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UtilitiesService } from './utilities.service';
import { EnvironmentService } from '../core/environment.service';
import { 
  ProtectedResponse, 
  HealthResponse, 
  EchoResponse, 
  PublicResponse 
} from '../models/api-models';

describe('UtilitiesService', () => {
  let service: UtilitiesService;
  let httpMock: HttpTestingController;
  let environmentService: jasmine.SpyObj<EnvironmentService>;

  beforeEach(() => {
    const environmentSpy = jasmine.createSpyObj('EnvironmentService', ['loadConfig'], {
      isReady: true,
      apiBaseUrl: '/api'
    });

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        UtilitiesService,
        { provide: EnvironmentService, useValue: environmentSpy }
      ]
    });

    service = TestBed.inject(UtilitiesService);
    httpMock = TestBed.inject(HttpTestingController);
    environmentService = TestBed.inject(EnvironmentService) as jasmine.SpyObj<EnvironmentService>;
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

      const req = httpMock.expectOne(`/api/sample/protected`);
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

      const req = httpMock.expectOne(`/api/sample/health`);
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

      const req = httpMock.expectOne(`/api/sample/echo/${encodeURIComponent(message)}`);
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

      const req = httpMock.expectOne(`/api/public`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('configuration handling', () => {
    it('should use fallback URL when config is not ready', () => {
      const mockResponse: HealthResponse = {
        status: 'UP',
        timestamp: new Date().toISOString(),
        service: 'pockito-api',
        version: '1.0.0',
        uptime: 'PT1H30M'
      };

      // Create a new spy for this test case
      const notReadySpy = jasmine.createSpyObj('EnvironmentService', ['loadConfig'], {
        isReady: false,
        apiBaseUrl: '/api'
      });

      // Create a new TestBed configuration for this specific test
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
        providers: [
          UtilitiesService,
          { provide: EnvironmentService, useValue: notReadySpy }
        ]
      });

      const testService = TestBed.inject(UtilitiesService);
      const testHttpMock = TestBed.inject(HttpTestingController);

      testService.getHealthStatus().subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = testHttpMock.expectOne(`/api/sample/health`);
      req.flush(mockResponse);
      
      testHttpMock.verify();
    });
  });
});
