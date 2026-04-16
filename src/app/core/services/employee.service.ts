import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Employee, EmployeeFilters, EmployeeListResponse } from '../models/employee.model';

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  private readonly baseUrl = 'http://localhost:3000/employees';

  constructor(private readonly http: HttpClient) {}

  getEmployees(page: number, limit: number, filters: EmployeeFilters): Observable<EmployeeListResponse> {
    let params = new HttpParams().set('page', page).set('limit', limit);

    if (filters.search) {
      params = params.set('search', filters.search.trim());
    }
    if (filters.department) {
      params = params.set('department', filters.department);
    }
    if (filters.designation) {
      params = params.set('designation', filters.designation);
    }
    if (filters.status) {
      params = params.set('status', filters.status);
    }

    return this.http.get<EmployeeListResponse>(this.baseUrl, { params });
  }

  getAllEmployees(): Observable<EmployeeListResponse> {
    const params = new HttpParams().set('page', 1).set('limit', 10000);
    return this.http.get<EmployeeListResponse>(this.baseUrl, { params });
  }

  createEmployee(payload: Employee): Observable<Employee> {
    return this.http.post<Employee>(this.baseUrl, payload);
  }

  updateEmployee(id: string, payload: Partial<Employee>): Observable<Employee> {
    return this.http.put<Employee>(`${this.baseUrl}/${id}`, payload);
  }

  deleteEmployee(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/${id}`);
  }
}
