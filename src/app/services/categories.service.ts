import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Category {
  id: number;
  name: string;
  created_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CategoriesService {

  private apiUrl = 'http://localhost:3000/categories';

  constructor(private http: HttpClient) {}

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(this.apiUrl);
  }

  addCategory(name: string): Observable<Category> {

    const role =
      typeof window !== 'undefined'
        ? localStorage.getItem('adminRole') || ''
        : '';

    const headers = new HttpHeaders({
      'x-admin-role': role
    });

    return this.http.post<Category>(
      this.apiUrl,
      { name },
      { headers }
    );
  }
}