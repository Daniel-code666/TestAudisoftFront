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
import { Student } from '../../models/student.model';
import { StudentCreate } from '../../models/student-create.model';
import { StudentUpdate } from '../../models/student-update.model';

@Component({
  selector: 'app-student-form-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './student-form-modal.html',
  styleUrl: './student-form-modal.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StudentFormModalComponent implements OnChanges {
  private readonly _fb = inject(FormBuilder);

  @Input() is_open = false;
  @Input() mode: 'create' | 'edit' = 'create';
  @Input() student: Student | null = null;
  @Input() save_error: string | null = null;

  @Output() close = new EventEmitter<void>();
  @Output() create = new EventEmitter<StudentCreate>();
  @Output() update = new EventEmitter<StudentUpdate>();

  readonly form = this._fb.nonNullable.group({
    first_name: ['', [Validators.required, Validators.maxLength(100)]],
    last_name: ['', [Validators.required, Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(200)]]
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['student'] || changes['mode'] || changes['is_open']) {
      this.LoadForm();
    }
  }

  private LoadForm(): void {
    if (!this.is_open) {
      return;
    }

    if (this.mode === 'edit' && this.student) {
      this.form.patchValue({
        first_name: this.student.firstName ?? '',
        last_name: this.student.lastName ?? '',
        email: this.student.email ?? ''
      });
      return;
    }

    this.form.reset({
      first_name: '',
      last_name: '',
      email: ''
    });
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
      firstName: this.form.controls.first_name.value.trim(),
      lastName: this.form.controls.last_name.value.trim(),
      email: this.form.controls.email.value.trim()
    };

    if (this.mode === 'create') {
      this.create.emit(payload);
      return;
    }

    if (!this.student) {
      return;
    }

    this.update.emit({
      id: this.student.id,
      ...payload
    });
  }
}