import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Grade } from '../../models/grade.model';
import { GradeCreate } from '../../models/grade-create.model';
import { GradeUpdate } from '../../models/grade-update.model';
import {
  SearchableSelectComponent,
  SearchableSelectItem
} from '../../../../shared/components/searchable-text/searchable-select';

@Component({
  selector: 'app-grade-form-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SearchableSelectComponent],
  templateUrl: './grade-form-modal.html',
  styleUrl: './grade-form-modal.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GradeFormModalComponent implements OnChanges {
  private readonly _fb = inject(FormBuilder);

  @Input() is_open = false;
  @Input() mode: 'create' | 'edit' = 'create';
  @Input() grade: Grade | null = null;
  @Input() students: SearchableSelectItem[] = [];
  @Input() professors: SearchableSelectItem[] = [];
  @Input() save_error: string | null = null;
  @Input() save_success: string | null = null;
  @Input() catalogs_error: string | null = null;

  @Output() close = new EventEmitter<void>();
  @Output() create = new EventEmitter<GradeCreate>();
  @Output() update = new EventEmitter<GradeUpdate>();

  readonly form = this._fb.nonNullable.group({
    name: ['', [Validators.maxLength(100)]],
    grade_value: [0, [Validators.required, Validators.min(0), Validators.max(5)]],
    student_id: [0, [Validators.required, Validators.min(1)]],
    professor_id: [0, [Validators.required, Validators.min(1)]]
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['grade'] || changes['mode'] || changes['is_open']) {
      this.LoadForm();
    }
  }

  private LoadForm(): void {
    if (!this.is_open) {
      return;
    }

    if (this.mode === 'edit' && this.grade) {
      this.form.patchValue({
        name: this.grade.name ?? '',
        grade_value: this.grade.gradeValue,
        student_id: this.grade.studentId,
        professor_id: this.grade.professorId
      });
      return;
    }

    this.form.reset({
      name: '',
      grade_value: 0,
      student_id: 0,
      professor_id: 0
    });
  }

  OnStudentSelected(student_id: number): void {
    this.form.controls.student_id.setValue(student_id);
    this.form.controls.student_id.markAsTouched();
  }

  OnProfessorSelected(professor_id: number): void {
    this.form.controls.professor_id.setValue(professor_id);
    this.form.controls.professor_id.markAsTouched();
  }

  OnClose(): void {
    this.close.emit();
  }

  OnSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = {
      name: this.form.controls.name.value.trim() || null,
      gradeValue: Number(this.form.controls.grade_value.value),
      studentId: Number(this.form.controls.student_id.value),
      professorId: Number(this.form.controls.professor_id.value)
    };

    if (this.mode === 'create') {
      this.create.emit(payload);
      return;
    }

    if (!this.grade) {
      return;
    }

    this.update.emit({
      id: this.grade.id,
      ...payload
    });
  }
}