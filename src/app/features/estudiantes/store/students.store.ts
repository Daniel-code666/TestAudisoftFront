import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { StudentsService } from '../services/students.service';
import { GradesService } from '../../notas/services/grades.service';
import { Student } from '../models/student.model';
import { StudentFilter } from '../models/student-filter.model';
import { StudentCreate } from '../models/student-create.model';
import { StudentUpdate } from '../models/student-update.model';
import { Grade } from '../../notas/models/grade.model';
import { DbActions } from '../../../core/models/db-actions.enum';
import { GetHttpErrorMessage } from '../../../core/utils/http-error.utils';

@Injectable({
  providedIn: 'root'
})
export class StudentsStore {
  private readonly _students_service = inject(StudentsService);
  private readonly _grades_service = inject(GradesService);
  
  readonly save_success = signal<string | null>(null);

  readonly items = signal<Student[]>([]);
  readonly total_records = signal(0);
  readonly page_number = signal(1);
  readonly page_size = signal(10);
  readonly total_pages = signal(0);

  readonly first_name_filter = signal('');
  readonly last_name_filter = signal('');
  readonly email_filter = signal('');

  readonly selected_student = signal<Student | null>(null);
  readonly selected_student_grades = signal<Grade[]>([]);

  readonly list_error = signal<string | null>(null);
  readonly detail_error = signal<string | null>(null);
  readonly save_error = signal<string | null>(null);

  readonly modal_mode = signal<'create' | 'edit'>('create');

  readonly has_items = computed(() => this.items().length > 0);
  readonly results_label = computed(
    () => `Resultados: ${this.total_records()}`
  );

  async LoadStudents(): Promise<void> {
    this.list_error.set(null);

    try {
      const filter: StudentFilter = {
        firstName: this.first_name_filter().trim() || null,
        lastName: this.last_name_filter().trim() || null,
        email: this.email_filter().trim() || null,
        pageNumber: this.page_number(),
        pageSize: this.page_size()
      };

      const response = await firstValueFrom(
        this._students_service.GetAll(filter)
      );

      this.items.set(response.items ?? []);
      this.total_records.set(response.totalRecords);
      this.page_number.set(response.pageNumber);
      this.page_size.set(response.pageSize);
      this.total_pages.set(response.totalPages);
    } catch {
      this.items.set([]);
      this.total_records.set(0);
      this.total_pages.set(0);
      this.list_error.set('No fue posible cargar los estudiantes.');
    }
  }

  async ShowStudentGrades(student: Student): Promise<void> {
    this.selected_student.set(student);
    this.selected_student_grades.set([]);
    this.detail_error.set(null);

    try {
      const grades = await firstValueFrom(
        this._grades_service.GetByStudentId(student.id)
      );

      this.selected_student_grades.set(grades ?? []);
    } catch {
      this.selected_student_grades.set([]);
      this.detail_error.set('No fue posible cargar las notas del estudiante.');
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
    await this.LoadStudents();
  }

  SetCreateMode(): void {
    this.modal_mode.set('create');
    this.save_error.set(null);
    this.selected_student.set(null);
  }

  SetEditMode(student: Student): void {
    this.modal_mode.set('edit');
    this.save_error.set(null);
    this.selected_student.set(student);
  }

  ClearMessages(): void {
    this.save_error.set(null);
    this.save_success.set(null);
  }

  async CreateStudent(student_to_create: StudentCreate): Promise<boolean> {
    this.save_error.set(null);

    try {
      const response = await firstValueFrom(
        this._students_service.Create(student_to_create)
      );

      if (response === DbActions.Created) {
        await this.LoadStudents();
        return true;
      }

      this.save_error.set('No fue posible crear el estudiante.');
      return false;
    } catch (error) {
      this.save_error.set(GetHttpErrorMessage(error));
      return false;
    }
  }

  async UpdateStudent(student_to_update: StudentUpdate): Promise<boolean> {
    this.save_error.set(null);

    try {
      const response = await firstValueFrom(
        this._students_service.Update(student_to_update)
      );

      if (response === DbActions.Updated) {
        await this.LoadStudents();
        return true;
      }

      if (response === DbActions.NotFound) {
        this.save_error.set('El estudiante no fue encontrado.');
        return false;
      }

      this.save_error.set('No fue posible actualizar el estudiante.');
      return false;
    } catch (error) {
      this.save_error.set(GetHttpErrorMessage(error));
      return false;
    }
  }

  async DeleteStudent(id: number): Promise<boolean> {
    this.save_error.set(null);
    try {
      const response = await firstValueFrom(
        this._students_service.Delete(id)
      );

      if (response === DbActions.Updated || response === DbActions.Created) {
        await this.LoadStudents();
        return true;
      }

      if (response === DbActions.NotFound) {
        this.save_error.set('El estudiante no fue encontrado.');
        return false;
      }

      await this.LoadStudents();
      return true;
    } catch (error) {
      this.save_error.set(GetHttpErrorMessage(error));
      return false;
    }
  }
}