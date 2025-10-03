import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { LoadingService } from './loading.service';

export interface ApiErrorResponse {
  error: string;
  message: string;
}

export interface RequestOptions {
  headers?: { [key: string]: string };
  params?: { [key: string]: string | number | boolean };
  skipAuth?: boolean;
  skipLoading?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  private loadingService = inject(LoadingService);

  private readonly baseUrl = '/noi-intervistiamo/api';

  private getHeaders(options?: RequestOptions): HttpHeaders {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    if (!options?.skipAuth) {
      const token = this.getAuthToken();
      if (token) {
        headers = headers.set('Authorization', `Bearer ${token}`);
      }
    }

    if (options?.headers) {
      Object.keys(options.headers).forEach(key => {
        headers = headers.set(key, options.headers![key]);
      });
    }

    return headers;
  }

  private getParams(options?: RequestOptions): HttpParams {
    let params = new HttpParams();

    if (options?.params) {
      Object.keys(options.params).forEach(key => {
        params = params.set(key, String(options.params![key]));
      });
    }

    return params;
  }

  private getAuthToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  private handleRequest<T>(request: Observable<T>, skipLoading = false): Observable<T> {
    if (!skipLoading) {
      this.loadingService.show();
    }

    return request.pipe(
      catchError(error => {
        console.error('API Error:', error);
        return throwError(() => error);
      }),
      finalize(() => {
        if (!skipLoading) {
          this.loadingService.hide();
        }
      })
    );
  }

  get<T>(endpoint: string, options?: RequestOptions): Observable<T> {
    const url = `${this.baseUrl}/${endpoint}`;
    const headers = this.getHeaders(options);
    const params = this.getParams(options);

    const request = this.http.get<T>(url, { headers, params });
    return this.handleRequest(request, options?.skipLoading);
  }

  post<T>(endpoint: string, body: any, options?: RequestOptions): Observable<T> {
    const url = `${this.baseUrl}/${endpoint}`;
    const headers = this.getHeaders(options);
    const params = this.getParams(options);

    const request = this.http.post<T>(url, body, { headers, params });
    return this.handleRequest(request, options?.skipLoading);
  }

  put<T>(endpoint: string, body: any, options?: RequestOptions): Observable<T> {
    const url = `${this.baseUrl}/${endpoint}`;
    const headers = this.getHeaders(options);
    const params = this.getParams(options);

    const request = this.http.put<T>(url, body, { headers, params });
    return this.handleRequest(request, options?.skipLoading);
  }

  patch<T>(endpoint: string, body: any = {}, options?: RequestOptions): Observable<T> {
    const url = `${this.baseUrl}/${endpoint}`;
    const headers = this.getHeaders(options);
    const params = this.getParams(options);

    const request = this.http.patch<T>(url, body, { headers, params });
    return this.handleRequest(request, options?.skipLoading);
  }

  delete<T>(endpoint: string, options?: RequestOptions): Observable<T> {
    const url = `${this.baseUrl}/${endpoint}`;
    const headers = this.getHeaders(options);
    const params = this.getParams(options);

    const request = this.http.delete<T>(url, { headers, params });
    return this.handleRequest(request, options?.skipLoading);
  }

}