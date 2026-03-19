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
import { GradesStore } from '../../features/notas/store/grades.store';
import { LoadingService } from '../../core/services/loading.service';
import { GradeFormModalComponent } from '../../features/notas/components/grade-form-modal/grade-form-modal';
import { GradeCreate } from '../../features/notas/models/grade-create.model';
import { GradeUpdate } from '../../features/notas/models/grade-update.model';
import { SearchableSelectItem } from '../../shared/components/searchable-text/searchable-select';
import { ConfirmModalComponent } from '../../shared/components/confirm-modal/confirm-modal';
import { ShowSuccessAlert } from '../../core/utils/alert.utils';

@Component({
  selector: 'app-notas',
  standalone: true,
  imports: [CommonModule, FormsModule, GradeFormModalComponent, ConfirmModalComponent],
  templateUrl: './notas.html',
  styleUrl: './notas.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotasComponent implements OnInit {
  readonly grades_store = inject(GradesStore);
  readonly loading_service = inject(LoadingService);

  readonly is_loading = this.loading_service.is_loading;
  readonly is_form_modal_open = signal(false);

  readonly is_delete_modal_open = signal(false);
  readonly grade_id_to_delete = signal<number | null>(null);

  readonly pages = computed(() => {
    const total_pages = this.grades_store.total_pages();
    return Array.from({ length: total_pages }, (_, index) => index + 1);
  });

  readonly student_options = computed<SearchableSelectItem[]>(() =>
    this.grades_store.students_catalog().map(student => ({
      id: student.id,
      label: `${student.firstName ?? ''} ${student.lastName ?? ''} - ${student.email ?? ''}`.trim()
    }))
  );

  readonly professor_options = computed<SearchableSelectItem[]>(() =>
    this.grades_store.professors_catalog().map(professor => ({
      id: professor.id,
      label: `${professor.firstName ?? ''} ${professor.lastName ?? ''} - ${professor.email ?? ''}`.trim()
    }))
  );

  async ngOnInit(): Promise<void> {
    await this.grades_store.LoadGrades();
  }

  async OnApplyFilters(): Promise<void> {
    await this.grades_store.ApplyFilters();
  }

  async OnResetFilters(): Promise<void> {
    this.grades_store.ResetFilters();
    await this.grades_store.LoadGrades();
  }

  async OnPageChange(page: number): Promise<void> {
    this.grades_store.GoToPage(page);
    await this.grades_store.LoadGrades();
  }

  async OnPageSizeChange(event: Event): Promise<void> {
    const target = event.target as HTMLSelectElement;
    const value = Number(target.value);

    this.grades_store.SetPageSize(value);
    await this.grades_store.LoadGrades();
  }

  async OpenCreateModal(): Promise<void> {
    await this.grades_store.SetCreateMode();
    this.is_form_modal_open.set(true);
  }

  async OpenEditModal(grade_id: number): Promise<void> {
    const grade = this.grades_store.items().find(x => x.id === grade_id);

    if (!grade) {
      return;
    }

    await this.grades_store.SetEditMode(grade);
    this.is_form_modal_open.set(true);
  }

  CloseFormModal(): void {
    this.is_form_modal_open.set(false);
    this.grades_store.ClearMessages();
  }

  async OnCreateGrade(grade_to_create: GradeCreate): Promise<void> {
    const success = await this.grades_store.CreateGrade(grade_to_create);

    if (success) {
      this.is_form_modal_open.set(false);
      await ShowSuccessAlert('Regsitro creado', 'La nota ha sido creada exitosamente.');
      this.grades_store.ClearMessages();
    }
  }

  async OnUpdateGrade(grade_to_update: GradeUpdate): Promise<void> {
    const success = await this.grades_store.UpdateGrade(grade_to_update);

    if (success) {
      this.is_form_modal_open.set(false);
      this.grades_store.ClearMessages();
    }
  }

  OpenDeleteModal(grade_id: number): void {
    this.grade_id_to_delete.set(grade_id);
    this.is_delete_modal_open.set(true);
  }

  CloseDeleteModal(): void {
    this.grade_id_to_delete.set(null);
    this.is_delete_modal_open.set(false);
  }

  async ConfirmDeleteGrade(): Promise<void> {
    const grade_id = this.grade_id_to_delete();

    if (!grade_id) {
      return;
    }

    const success = await this.grades_store.DeleteGrade(grade_id);

    if (success) {
      this.CloseDeleteModal();
    }
  }

  async OnDeleteGrade(grade_id: number): Promise<void> {
    const confirmed = window.confirm('¿Desea eliminar esta nota?');

    if (!confirmed) {
      return;
    }

    await this.grades_store.DeleteGrade(grade_id);
  }
}