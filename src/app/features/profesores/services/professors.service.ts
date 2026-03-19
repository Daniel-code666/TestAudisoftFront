import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../../core/constants/api.constants';
import { DbActions } from '../../../core/models/db-actions.enum';
import { PagedResult } from '../../../core/models/paged-result.model';
import { Professor } from '../models/professor.model';
import { ProfessorCreate } from '../models/professor-create.model';
import { ProfessorUpdate } from '../models/professor-update.model';
import { ProfessorWithGrades } from '../models/professor-with-grades.model';
import { StudentFilter } from '../../estudiantes/models/student-filter.model';

@Injectable({
  providedIn: 'root'
})
export class ProfessorsService {
  private readonly _http = inject(HttpClient);
  private readonly _base_url = `${API_BASE_URL}/api/Professor`;

  GetAll(filter: StudentFilter): Observable<PagedResult<Professor>> {
    return this._http.post<PagedResult<Professor>>(`${this._base_url}/GetAll`, filter);
  }

  GetById(id: number): Observable<Professor> {
    return this._http.get<Professor>(`${this._base_url}/${id}`);
  }

  GetWithGrades(id: number): Observable<ProfessorWithGrades> {
    return this._http.get<ProfessorWithGrades>(`${this._base_url}/${id}/grades`);
  }

  Create(professor_to_create: ProfessorCreate): Observable<DbActions> {
    return this._http.post<DbActions>(this._base_url, professor_to_create);
  }

  Update(professor_to_update: ProfessorUpdate): Observable<DbActions> {
    return this._http.put<DbActions>(`${this._base_url}/${professor_to_update.id}`, professor_to_update);
  }

  Delete(id: number): Observable<DbActions> {
    return this._http.delete<DbActions>(`${this._base_url}/${id}`);
  }
}