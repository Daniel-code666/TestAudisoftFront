import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { GradesService } from '../services/grades.service';
import { Grade } from '../models/grade.model';
import { GradesFilter } from '../models/grades-filter.model';
import { GradeCreate } from '../models/grade-create.model';
import { GradeUpdate } from '../models/grade-update.model';
import { DbActions } from '../../../core/models/db-actions.enum';
import { GetHttpErrorMessage } from '../../../core/utils/http-error.utils';
import { StudentsService } from '../../estudiantes/services/students.service';
import { ProfessorsService } from '../../profesores/services/professors.service';
import { Student } from '../../estudiantes/models/student.model';
import { Professor } from '../../profesores/models/professor.model';

@Injectable({
  providedIn: 'root'
})
export class GradesStore {
  private readonly _grades_service = inject(GradesService);
  private readonly _students_service = inject(StudentsService);
  private readonly _professors_service = inject(ProfessorsService);

  readonly items = signal<Grade[]>([]);
  readonly total_records = signal(0);
  readonly page_number = signal(1);
  readonly page_size = signal(10);
  readonly total_pages = signal(0);

  readonly name_filter = signal('');
  readonly grade_filter = signal<string>('');
  readonly creation_date_from_filter = signal('');
  readonly creation_date_to_filter = signal('');
  readonly modification_date_from_filter = signal('');
  readonly modification_date_to_filter = signal('');

  readonly selected_grade = signal<Grade | null>(null);

  readonly students_catalog = signal<Student[]>([]);
  readonly professors_catalog = signal<Professor[]>([]);

  readonly list_error = signal<string | null>(null);
  readonly save_error = signal<string | null>(null);
  readonly save_success = signal<string | null>(null);
  readonly catalogs_error = signal<string | null>(null);

  readonly modal_mode = signal<'create' | 'edit'>('create');

  readonly has_items = computed(() => this.items().length > 0);
  readonly results_label = computed(
    () => `Resultados: ${this.total_records()}`
  );

  async LoadGrades(): Promise<void> {
    this.list_error.set(null);

    try {
      const grade_value = this.grade_filter().trim();

      const filter: GradesFilter = {
        name: this.name_filter().trim() || null,
        grade: grade_value === '' ? null : Number(grade_value),
        creationDateFrom: this.creation_date_from_filter() || null,
        creationDateTo: this.creation_date_to_filter() || null,
        modificationDateFrom: this.modification_date_from_filter() || null,
        modificationDateTo: this.modification_date_to_filter() || null,
        pageNumber: this.page_number(),
        pageSize: this.page_size()
      };

      const response = await firstValueFrom(
        this._grades_service.GetAll(filter)
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

  async LoadCatalogs(): Promise<void> {
    this.catalogs_error.set(null);

    try {
      const [students_response, professors_response] = await Promise.all([
        firstValueFrom(
          this._students_service.GetAll({
            firstName: null,
            lastName: null,
            email: null,
            pageNumber: 1,
            pageSize: 1000
          })
        ),
        firstValueFrom(
          this._professors_service.GetAll({
            firstName: null,
            lastName: null,
            email: null,
            pageNumber: 1,
            pageSize: 1000
          })
        )
      ]);

      this.students_catalog.set(students_response.items ?? []);
      this.professors_catalog.set(professors_response.items ?? []);
    } catch (error) {
      this.students_catalog.set([]);
      this.professors_catalog.set([]);
      this.catalogs_error.set(GetHttpErrorMessage(error));
    }
  }

  SetNameFilter(value: string): void {
    this.name_filter.set(value);
  }

  SetGradeFilter(value: string): void {
    this.grade_filter.set(value);
  }

  SetCreationDateFromFilter(value: string): void {
    this.creation_date_from_filter.set(value);
  }

  SetCreationDateToFilter(value: string): void {
    this.creation_date_to_filter.set(value);
  }

  SetModificationDateFromFilter(value: string): void {
    this.modification_date_from_filter.set(value);
  }

  SetModificationDateToFilter(value: string): void {
    this.modification_date_to_filter.set(value);
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
    this.name_filter.set('');
    this.grade_filter.set('');
    this.creation_date_from_filter.set('');
    this.creation_date_to_filter.set('');
    this.modification_date_from_filter.set('');
    this.modification_date_to_filter.set('');
    this.page_number.set(1);
    this.page_size.set(10);
  }

  async ApplyFilters(): Promise<void> {
    this.page_number.set(1);
    await this.LoadGrades();
  }

  async SetCreateMode(): Promise<void> {
    this.modal_mode.set('create');
    this.save_error.set(null);
    this.save_success.set(null);
    this.catalogs_error.set(null);
    this.selected_grade.set(null);

    await this.LoadCatalogs();
  }

  async SetEditMode(grade: Grade): Promise<void> {
    this.modal_mode.set('edit');
    this.save_error.set(null);
    this.save_success.set(null);
    this.catalogs_error.set(null);
    this.selected_grade.set(grade);

    await this.LoadCatalogs();
  }

  ClearMessages(): void {
    this.save_error.set(null);
    this.save_success.set(null);
    this.catalogs_error.set(null);
  }

  async CreateGrade(grade_to_create: GradeCreate): Promise<boolean> {
    this.save_error.set(null);
    this.save_success.set(null);

    try {
      const response = await firstValueFrom(
        this._grades_service.Create(grade_to_create)
      );

      if (response === DbActions.Created) {
        this.save_success.set('Nota creada correctamente.');
        await this.LoadGrades();
        return true;
      }

      this.save_error.set('No fue posible crear la nota.');
      return false;
    } catch (error) {
      this.save_error.set(GetHttpErrorMessage(error));
      return false;
    }
  }

  async UpdateGrade(grade_to_update: GradeUpdate): Promise<boolean> {
    this.save_error.set(null);
    this.save_success.set(null);

    try {
      const response = await firstValueFrom(
        this._grades_service.Update(grade_to_update)
      );

      if (response === DbActions.Updated) {
        this.save_success.set('Nota actualizada correctamente.');
        await this.LoadGrades();
        return true;
      }

      if (response === DbActions.NotFound) {
        this.save_error.set('La nota no fue encontrada.');
        return false;
      }

      this.save_error.set('No fue posible actualizar la nota.');
      return false;
    } catch (error) {
      this.save_error.set(GetHttpErrorMessage(error));
      return false;
    }
  }

  async DeleteGrade(id: number): Promise<boolean> {
    this.save_error.set(null);
    this.save_success.set(null);

    try {
      const response = await firstValueFrom(
        this._grades_service.Delete(id)
      );

      if (response === DbActions.NotFound) {
        this.save_error.set('La nota no fue encontrada.');
        return false;
      }

      this.save_success.set('Nota eliminada correctamente.');
      await this.LoadGrades();
      return true;
    } catch (error) {
      this.save_error.set(GetHttpErrorMessage(error));
      return false;
    }
  }
}