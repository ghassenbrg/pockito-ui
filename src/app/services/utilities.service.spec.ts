import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UtilitiesService } from './utilities.service';
import { environment } from '../../environments/environment';

describe('UtilitiesService', () => {
  let service: UtilitiesService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UtilitiesService]
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
      const mockResponse = {
        message: 'You have access to the protected endpoint',
        timestamp: '2024-01-15T10:30:00Z',
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
      const mockResponse = {
        status: 'healthy',
        timestamp: '2024-01-15T10:30:00Z',
        service: 'Pockito API',
        version: '1.0.0',
        uptime: '2h 15m 30s'
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
    it('should make GET request to echo endpoint with message parameter', () => {
      const message = 'Hello World';
      const mockResponse = {
        message: 'Hello World',
        timestamp: '2024-01-15T10:30:00Z',
        length: 11,
        uppercase: 'HELLO WORLD',
        lowercase: 'hello world'
      };

      service.echoMessage(message).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${environment.api.baseUrl}/sample/echo/${encodeURIComponent(message)}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should throw error for empty message', () => {
      expect(() => service.echoMessage('')).toThrow('Message cannot be empty or null');
      expect(() => service.echoMessage('   ')).toThrow('Message cannot be empty or null');
    });

    it('should throw error for null message', () => {
      expect(() => service.echoMessage(null as any)).toThrow('Message cannot be empty or null');
    });

    it('should throw error for message exceeding 100 characters', () => {
      const longMessage = 'a'.repeat(101);
      expect(() => service.echoMessage(longMessage)).toThrow('Message cannot exceed 100 characters');
    });
  });

  describe('getPublicInfo', () => {
    it('should make GET request to public endpoint', () => {
      const mockResponse = {
        message: 'This is a public endpoint',
        timestamp: '2024-01-15T10:30:00Z',
        authenticated: false,
        service: 'Pockito API'
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
