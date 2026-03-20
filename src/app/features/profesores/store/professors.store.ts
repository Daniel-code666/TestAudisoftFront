import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ProfessorsService } from '../services/professors.service';
import { GradesService } from '../../notas/services/grades.service';
import { Professor } from '../models/professor.model';
import { ProfessorFilter } from '../models/professor-filter.model';
import { ProfessorCreate } from '../models/professor-create.model';
import { ProfessorUpdate } from '../models/professor-update.model';
import { Grade } from '../../notas/models/grade.model';
import { DbActions } from '../../../core/models/db-actions.enum';
import { GetHttpErrorMessage } from '../../../core/utils/http-error.utils';

@Injectable({
  providedIn: 'root'
})
export class ProfessorsStore {
  private readonly _professors_service = inject(ProfessorsService);
  private readonly _grades_service = inject(GradesService);

  readonly items = signal<Professor[]>([]);
  readonly total_records = signal(0);
  readonly page_number = signal(1);
  readonly page_size = signal(10);
  readonly total_pages = signal(0);

  readonly first_name_filter = signal('');
  readonly last_name_filter = signal('');
  readonly email_filter = signal('');

  readonly selected_professor = signal<Professor | null>(null);
  readonly selected_professor_grades = signal<Grade[]>([]);

  readonly selected_professor_for_detail = signal<Professor | null>(null);
  readonly selected_professor_for_edit = signal<Professor | null>(null);

  readonly list_error = signal<string | null>(null);
  readonly detail_error = signal<string | null>(null);
  readonly save_error = signal<string | null>(null);
  readonly save_success = signal<string | null>(null);

  readonly modal_mode = signal<'create' | 'edit'>('create');

  readonly has_items = computed(() => this.items().length > 0);
  readonly results_label = computed(
    () => `Resultados: ${this.total_records()}`
  );

  async LoadProfessors(): Promise<void> {
    this.list_error.set(null);

    try {
      const filter: ProfessorFilter = {
        firstName: this.first_name_filter().trim() || null,
        lastName: this.last_name_filter().trim() || null,
        email: this.email_filter().trim() || null,
        pageNumber: this.page_number(),
        pageSize: this.page_size()
      };

      const response = await firstValueFrom(
        this._professors_service.GetAll(filter)
      );

      this.items.set(response.items ?? []);
      this.total_records.set(response.totalRecords);
      this.page_number.set(response.pageNumber);
      this.page_size.set(response.pageSize);
      this.total_pages.set(response.totalPages);
    } catch (error) {
      this.items.set([]);
      this.total_records.set(0);
      this.total_pages.set(0);
      this.list_error.set(GetHttpErrorMessage(error));
    }
  }

  async ShowProfessorGrades(professor: Professor): Promise<void> {
    this.selected_professor_for_detail.set(professor);
    this.selected_professor_grades.set([]);
    this.detail_error.set(null);

    try {
      const grades = await firstValueFrom(
        this._grades_service.GetByProfessorId(professor.id)
      );

      this.selected_professor_grades.set(grades ?? []);
    } catch (error) {
      this.selected_professor_grades.set([]);
      this.detail_error.set(GetHttpErrorMessage(error));
    }
  }

  SetFirstNameFilter(value: string): void {
    this.first_name_filter.set(value);
  }

  SetLastNameFilter(value: string): void {
    this.last_name_filter.set(value);
  }

  SetEmailFilter(value: string): void {
    this.email_filter.set(value);
  }

  SetPageSize(value: number): void {
    this.page_size.set(value);
    this.page_number.set(1);
  }

  GoToPage(page: number): void {
    if (page < 1 || page > this.total_pages()) {
      return;
    }

    this.page_number.set(page);
  }

  ResetFilters(): void {
    this.first_name_filter.set('');
    this.last_name_filter.set('');
    this.email_filter.set('');
    this.page_number.set(1);
    this.page_size.set(10);
  }

  async ApplyFilters(): Promise<void> {
    this.page_number.set(1);
    await this.LoadProfessors();
  }

  SetCreateMode(): void {
    this.modal_mode.set('create');
    this.save_error.set(null);
    this.save_success.set(null);
    this.selected_professor_for_edit.set(null);
  }

  SetEditMode(professor: Professor): void {
    this.modal_mode.set('edit');
    this.save_error.set(null);
    this.save_success.set(null);
    this.selected_professor_for_edit.set(professor);
  }

  ClearMessages(): void {
    this.save_error.set(null);
    this.save_success.set(null);
  }

  async CreateProfessor(professor_to_create: ProfessorCreate): Promise<boolean> {
    this.save_error.set(null);
    this.save_success.set(null);

    try {
      const response = await firstValueFrom(
        this._professors_service.Create(professor_to_create)
      );

      if (response === DbActions.Created) {
        this.save_success.set('Profesor creado correctamente.');
        await this.LoadProfessors();
        return true;
      }

      this.save_error.set('No fue posible crear el profesor.');
      return false;
    } catch (error) {
      this.save_error.set(GetHttpErrorMessage(error));
      return false;
    }
  }

  async UpdateProfessor(professor_to_update: ProfessorUpdate): Promise<boolean> {
    this.save_error.set(null);
    this.save_success.set(null);

    try {
      const response = await firstValueFrom(
        this._professors_service.Update(professor_to_update)
      );

      if (response === DbActions.Updated) {
        this.save_success.set('Profesor actualizado correctamente.');
        await this.LoadProfessors();
        return true;
      }

      if (response === DbActions.NotFound) {
        this.save_error.set('El profesor no fue encontrado.');
        return false;
      }

      this.save_error.set('No fue posible actualizar el profesor.');
      return false;
    } catch (error) {
      this.save_error.set(GetHttpErrorMessage(error));
      return false;
    }
  }

  async DeleteProfessor(id: number): Promise<boolean> {
    this.save_error.set(null);
    this.save_success.set(null);

    try {
      const response = await firstValueFrom(
        this._professors_service.Delete(id)
      );

      if (response === DbActions.NotFound) {
        this.save_error.set('El profesor no fue encontrado.');
        return false;
      }

      this.save_success.set('Profesor eliminado correctamente.');
      await this.LoadProfessors();
      return true;
    } catch (error) {
      this.save_error.set(GetHttpErrorMessage(error));
      return false;
    }
  }

  async ToggleProfessorGrades(professor: Professor): Promise<void> {
    const current_professor = this.selected_professor_for_detail();

    if (current_professor?.id === professor.id) {
      this.ClearProfessorDetail();
      return;
    }

    this.selected_professor_for_detail.set(professor);
    this.selected_professor_grades.set([]);
    this.detail_error.set(null);

    try {
      const grades = await firstValueFrom(
        this._grades_service.GetByProfessorId(professor.id)
      );

      this.selected_professor_grades.set(grades ?? []);
    } catch (error) {
      this.selected_professor_grades.set([]);
      this.detail_error.set(GetHttpErrorMessage(error));
    }
  }

  ClearProfessorDetail(): void {
    this.selected_professor_for_detail.set(null);
    this.selected_professor_grades.set([]);
    this.detail_error.set(null);
  }
}