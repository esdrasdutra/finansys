import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, tap } from 'rxjs';



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
    
    return this.http.post<Response>(url, item, this.httpOptionJson).pipe(
      tap((response: any) => {
        console.log(response);
      })
    )
  }

  put<Request, Response>(url: any, item: Request): Observable<Response>{
    const post_item = {
      ...item,
    }
    return this.http.put<Response>(url, post_item, this.httpOptionJson)
  }

  delete<Response>(url: any): Observable<Response>{
    return this.http.delete<Response>(url);
  }
}
