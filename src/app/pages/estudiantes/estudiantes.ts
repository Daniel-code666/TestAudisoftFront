import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StudentsStore } from '../../features/estudiantes/store/students.store';
import { LoadingService } from '../../core/services/loading.service';
import { StudentFormModalComponent } from '../../features/estudiantes/components/student-form-modal/student-form-modal';
import { StudentCreate } from '../../features/estudiantes/models/student-create.model';
import { StudentUpdate } from '../../features/estudiantes/models/student-update.model';
import { ConfirmModalComponent } from '../../shared/components/confirm-modal/confirm-modal';
import { ShowSuccessAlert } from '../../core/utils/alert.utils';
import { ErrorModalComponent } from '../../shared/components/error-modal/error-modal';

@Component({
  selector: 'app-estudiantes',
  standalone: true,
  imports: [CommonModule, FormsModule, StudentFormModalComponent, ConfirmModalComponent, ErrorModalComponent],
  templateUrl: './estudiantes.html',
  styleUrl: './estudiantes.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EstudiantesComponent implements OnInit {
  readonly students_store = inject(StudentsStore);
  readonly loading_service = inject(LoadingService);

  readonly is_error_modal_open = signal(false);
  readonly error_modal_message = signal('');

  readonly is_loading = this.loading_service.is_loading;
  readonly is_form_modal_open = signal(false);

  readonly is_delete_modal_open = signal(false);
  readonly student_id_to_delete = signal<number | null>(null);

  readonly pages = computed(() => {
    const total_pages = this.students_store.total_pages();
    return Array.from({ length: total_pages }, (_, index) => index + 1);
  });

  async ngOnInit(): Promise<void> {
    await this.students_store.LoadStudents();
  }

  async OnApplyFilters(): Promise<void> {
    await this.students_store.ApplyFilters();

    if (this.students_store.list_error()) {
      this.OpenErrorModal(this.students_store.list_error()!);
    }
  }

  async OnResetFilters(): Promise<void> {
    this.students_store.ResetFilters();
    await this.students_store.LoadStudents();

    if (this.students_store.list_error()) {
      this.OpenErrorModal(this.students_store.list_error()!);
    }
  }

  async OnPageChange(page: number): Promise<void> {
    this.students_store.GoToPage(page);
    await this.students_store.LoadStudents();

    if (this.students_store.list_error()) {
      this.OpenErrorModal(this.students_store.list_error()!);
    }
  }

  async OnPageSizeChange(event: Event): Promise<void> {
    const target = event.target as HTMLSelectElement;
    const value = Number(target.value);

    this.students_store.SetPageSize(value);
    await this.students_store.LoadStudents();

    if (this.students_store.list_error()) {
      this.OpenErrorModal(this.students_store.list_error()!);
    }
  }

  async OnShowDetail(student_id: number): Promise<void> {
    const student = this.students_store.items().find(x => x.id === student_id);

    if (!student) {
      return;
    }

    await this.students_store.ToggleStudentGrades(student);

    if (this.students_store.detail_error()) {
      this.OpenErrorModal(this.students_store.detail_error()!);
    }
  }

  OpenCreateModal(): void {
    this.students_store.SetCreateMode();
    this.is_form_modal_open.set(true);
  }

  OpenEditModal(student_id: number): void {
    const student = this.students_store.items().find(x => x.id === student_id);

    if (!student) {
      return;
    }

    this.students_store.SetEditMode(student);
    this.is_form_modal_open.set(true);
  }

  CloseFormModal(): void {
    this.is_form_modal_open.set(false);
    this.students_store.ClearMessages();
  }

  async OnCreateStudent(student_to_create: StudentCreate): Promise<void> {
    const success = await this.students_store.CreateStudent(student_to_create);

    if (success) {
      this.is_form_modal_open.set(false);
      this.students_store.ClearMessages();
      await ShowSuccessAlert('Regsitro creado', 'El estudiante ha sido creado exitosamente.');
    }

    if (this.students_store.save_error()) {
      this.OpenErrorModal(this.students_store.save_error()!);
    }
  }

  async OnUpdateStudent(student_to_update: StudentUpdate): Promise<void> {
    const success = await this.students_store.UpdateStudent(student_to_update);

    if (success) {
      this.is_form_modal_open.set(false);
      this.students_store.ClearMessages();
      await ShowSuccessAlert('Regsitro actualizado', 'El estudiante ha sido actualizado exitosamente.');
    }

    if (this.students_store.save_error()) {
      this.OpenErrorModal(this.students_store.save_error()!);
    }
  }

  OpenDeleteModal(student_id: number): void {
    this.student_id_to_delete.set(student_id);
    this.is_delete_modal_open.set(true);
  }

  CloseDeleteModal(): void {
    this.student_id_to_delete.set(null);
    this.is_delete_modal_open.set(false);
  }

  async ConfirmDeleteStudent(): Promise<void> {
    const student_id = this.student_id_to_delete();

    if (!student_id) {
      return;
    }

    const success = await this.students_store.DeleteStudent(student_id);

    if (success) {
      this.CloseDeleteModal();
      this.students_store.ClearMessages();
      await ShowSuccessAlert('Registro eliminado', 'El estudiante ha sido eliminado exitosamente.');
    }

    if (this.students_store.save_error()) {
      this.OpenErrorModal(this.students_store.save_error()!);
    }
  }

  async OnDeleteStudent(student_id: number): Promise<void> {
    const confirmed = window.confirm('¿Desea eliminar este estudiante?');

    if (!confirmed) {
      return;
    }

    await this.students_store.DeleteStudent(student_id);
  }

  OpenErrorModal(message: string): void {
    this.CloseFormModal();
    this.error_modal_message.set(message);
    this.is_error_modal_open.set(true);
  }

  CloseErrorModal(): void {
    this.error_modal_message.set('');
    this.is_error_modal_open.set(false);
    this.students_store.ClearMessages();
  }
}