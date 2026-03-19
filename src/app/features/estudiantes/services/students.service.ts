import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../../core/constants/api.constants';
import { DbActions } from '../../../core/models/db-actions.enum';
import { PagedResult } from '../../../core/models/paged-result.model';
import { Student } from '../models/student.model';
import { StudentCreate } from '../models/student-create.model';
import { StudentUpdate } from '../models/student-update.model';
import { StudentFilter } from '../models/student-filter.model';
import { StudentWithGrades } from '../models/student-with-grades.model';

@Injectable({
  providedIn: 'root'
})
export class StudentsService {
  private readonly _http = inject(HttpClient);
  private readonly _base_url = `${API_BASE_URL}/api/Student`;

  GetAll(filter: StudentFilter): Observable<PagedResult<Student>> {
    return this._http.post<PagedResult<Student>>(`${this._base_url}/GetAll`, filter);
  }

  GetById(id: number): Observable<Student> {
    return this._http.get<Student>(`${this._base_url}/${id}`);
  }

  GetWithGrades(id: number): Observable<StudentWithGrades> {
    return this._http.get<StudentWithGrades>(`${this._base_url}/${id}/grades`);
  }

  Create(student_to_create: StudentCreate): Observable<DbActions> {
    return this._http.post<DbActions>(this._base_url, student_to_create);
  }

  Update(student_to_update: StudentUpdate): Observable<DbActions> {
    return this._http.put<DbActions>(`${this._base_url}/${student_to_update.id}`, student_to_update);
  }

  Delete(id: number): Observable<DbActions> {
    return this._http.delete<DbActions>(`${this._base_url}/${id}`);
  }
}