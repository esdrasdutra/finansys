import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RequestService {

  httpOptionJson = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json'})
  };

  httpOptionFormData = {
    headers: new HttpHeaders({ 'Content-Type': 'multipart/form-data'})
  };

  constructor(
    private http: HttpClient,
  ) { }

  get<Response>(url: any): Observable<Response> {
    return this.http.get<Response>(url)
  }

  post<Request, Response>(url: any, item: Request): Observable<Response>{
    return this.http.post<Response>(url, item, this.httpOptionJson);
  }

  put<Request, Response>(url: any, item: Request): Observable<Response>{
    return this.http.put<Response>(url, item, this.httpOptionJson);
  }

  delete<Response>(url: any): Observable<Response>{
    return this.http.delete<Response>(url);
  }
}
