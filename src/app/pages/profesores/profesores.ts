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
import { ProfessorsStore } from '../../features/profesores/store/professors.store';
import { LoadingService } from '../../core/services/loading.service';
import { ProfessorFormModalComponent } from '../../features/profesores/components/professor-form-modal/professor-form-modal';
import { ProfessorCreate } from '../../features/profesores/models/professor-create.model';
import { ProfessorUpdate } from '../../features/profesores/models/professor-update.model';
import { ConfirmModalComponent } from '../../shared/components/confirm-modal/confirm-modal';
import { ShowSuccessAlert } from '../../core/utils/alert.utils';
import { ErrorModalComponent } from '../../shared/components/error-modal/error-modal';

@Component({
  selector: 'app-profesores',
  standalone: true,
  imports: [CommonModule, FormsModule, ProfessorFormModalComponent, ConfirmModalComponent, ErrorModalComponent],
  templateUrl: './profesores.html',
  styleUrl: './profesores.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfesoresComponent implements OnInit {
  readonly professors_store = inject(ProfessorsStore);
  readonly loading_service = inject(LoadingService);

  readonly is_loading = this.loading_service.is_loading;
  readonly is_form_modal_open = signal(false);

  readonly is_delete_modal_open = signal(false);
  readonly professor_id_to_delete = signal<number | null>(null);

  readonly is_error_modal_open = signal(false);
  readonly error_modal_message = signal('');

  readonly pages = computed(() => {
    const total_pages = this.professors_store.total_pages();
    return Array.from({ length: total_pages }, (_, index) => index + 1);
  });

  async ngOnInit(): Promise<void> {
    await this.professors_store.LoadProfessors();
  }

  async OnApplyFilters(): Promise<void> {
    await this.professors_store.ApplyFilters();

    if (this.professors_store.list_error()) {
      this.OpenErrorModal(this.professors_store.list_error()!);
    }
  }

  async OnResetFilters(): Promise<void> {
    this.professors_store.ResetFilters();
    await this.professors_store.LoadProfessors();

    if (this.professors_store.list_error()) {
      this.OpenErrorModal(this.professors_store.list_error()!);
    }
  }

  async OnPageChange(page: number): Promise<void> {
    this.professors_store.GoToPage(page);
    await this.professors_store.LoadProfessors();

    if (this.professors_store.list_error()) {
      this.OpenErrorModal(this.professors_store.list_error()!);
    }
  }

  async OnPageSizeChange(event: Event): Promise<void> {
    const target = event.target as HTMLSelectElement;
    const value = Number(target.value);

    this.professors_store.SetPageSize(value);
    await this.professors_store.LoadProfessors();

    if (this.professors_store.list_error()) {
      this.OpenErrorModal(this.professors_store.list_error()!);
    }
  }

  async OnShowDetail(professor_id: number): Promise<void> {
    const professor = this.professors_store.items().find(x => x.id === professor_id);

    if (!professor) {
      return;
    }

    await this.professors_store.ToggleProfessorGrades(professor);

    if (this.professors_store.detail_error()) {
      this.OpenErrorModal(this.professors_store.detail_error()!);
    }
  }

  OpenCreateModal(): void {
    this.professors_store.SetCreateMode();
    this.is_form_modal_open.set(true);
  }

  OpenEditModal(professor_id: number): void {
    const professor = this.professors_store.items().find(x => x.id === professor_id);

    if (!professor) {
      return;
    }

    this.professors_store.SetEditMode(professor);
    this.is_form_modal_open.set(true);
  }

  CloseFormModal(): void {
    this.is_form_modal_open.set(false);
    this.professors_store.ClearMessages();
  }

  async OnCreateProfessor(professor_to_create: ProfessorCreate): Promise<void> {
    const success = await this.professors_store.CreateProfessor(professor_to_create);

    if (success) {
      this.is_form_modal_open.set(false);
      this.professors_store.ClearMessages();
      await ShowSuccessAlert('Registro creado', 'El profesor ha sido creado exitosamente.');
    }

    if (this.professors_store.save_error()) {
      this.OpenErrorModal(this.professors_store.save_error()!);
    }
  }

  async OnUpdateProfessor(professor_to_update: ProfessorUpdate): Promise<void> {
    const success = await this.professors_store.UpdateProfessor(professor_to_update);

    if (success) {
      this.is_form_modal_open.set(false);
      this.professors_store.ClearMessages();
      await ShowSuccessAlert('Registro actualizado', 'El profesor ha sido actualizado exitosamente.');
    }

    if (this.professors_store.save_error()) {
      this.OpenErrorModal(this.professors_store.save_error()!);
    }
  }

  OpenDeleteModal(professor_id: number): void {
    this.professor_id_to_delete.set(professor_id);
    this.is_delete_modal_open.set(true);
  }

  CloseDeleteModal(): void {
    this.professor_id_to_delete.set(null);
    this.is_delete_modal_open.set(false);
  }

  async ConfirmDeleteProfessor(): Promise<void> {
    const professor_id = this.professor_id_to_delete();

    if (!professor_id) {
      return;
    }

    const success = await this.professors_store.DeleteProfessor(professor_id);

    if (success) {
      this.CloseDeleteModal();
      this.professors_store.ClearMessages();
      await ShowSuccessAlert('Registro eliminado', 'El profesor ha sido eliminado exitosamente.');
    }

    if (this.professors_store.save_error()) {
      this.OpenErrorModal(this.professors_store.save_error()!);
    }
  }

  async OnDeleteProfessor(professor_id: number): Promise<void> {
    const confirmed = window.confirm('¿Desea eliminar este profesor?');

    if (!confirmed) {
      return;
    }

    await this.professors_store.DeleteProfessor(professor_id);
  }

  OpenErrorModal(message: string): void {
    this.error_modal_message.set(message);
    this.is_error_modal_open.set(true);
  }

  CloseErrorModal(): void {
    this.error_modal_message.set('');
    this.is_error_modal_open.set(false);
    this.professors_store.ClearMessages();
  }
}