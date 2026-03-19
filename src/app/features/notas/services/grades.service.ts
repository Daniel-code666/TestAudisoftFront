import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../../core/constants/api.constants';
import { DbActions } from '../../../core/models/db-actions.enum';
import { PagedResult } from '../../../core/models/paged-result.model';
import { Grade } from '../models/grade.model';
import { GradeCreate } from '../models/grade-create.model';
import { GradeUpdate } from '../models/grade-update.model';
import { GradesFilter } from '../models/grades-filter.model';

@Injectable({
  providedIn: 'root'
})
export class GradesService {
  private readonly _http = inject(HttpClient);
  private readonly _base_url = `${API_BASE_URL}/api/Grades`;

  GetAll(filter: GradesFilter): Observable<PagedResult<Grade>> {
    return this._http.post<PagedResult<Grade>>(`${this._base_url}/GetAll`, filter);
  }

  GetById(id: number): Observable<Grade> {
    return this._http.get<Grade>(`${this._base_url}/${id}`);
  }

  GetByStudentId(student_id: number): Observable<Grade[]> {
    return this._http.get<Grade[]>(`${this._base_url}/student/${student_id}`);
  }

  GetByProfessorId(professor_id: number): Observable<Grade[]> {
    return this._http.get<Grade[]>(`${this._base_url}/professor/${professor_id}`);
  }

  Create(grade_to_create: GradeCreate): Observable<DbActions> {
    return this._http.post<DbActions>(this._base_url, grade_to_create);
  }

  Update(grade_to_update: GradeUpdate): Observable<DbActions> {
    return this._http.put<DbActions>(this._base_url, grade_to_update);
  }

  Delete(id: number): Observable<DbActions> {
    return this._http.delete<DbActions>(`${this._base_url}/${id}`);
  }
}