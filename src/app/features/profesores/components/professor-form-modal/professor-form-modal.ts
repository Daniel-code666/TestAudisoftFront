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
import { Professor } from '../../models/professor.model';
import { ProfessorCreate } from '../../models/professor-create.model';
import { ProfessorUpdate } from '../../models/professor-update.model';

@Component({
  selector: 'app-professor-form-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './professor-form-modal.html',
  styleUrl: './professor-form-modal.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfessorFormModalComponent implements OnChanges {
  private readonly _fb = inject(FormBuilder);

  @Input() is_open = false;
  @Input() mode: 'create' | 'edit' = 'create';
  @Input() professor: Professor | null = null;
  @Input() save_error: string | null = null;

  @Output() close = new EventEmitter<void>();
  @Output() create = new EventEmitter<ProfessorCreate>();
  @Output() update = new EventEmitter<ProfessorUpdate>();

  readonly form = this._fb.nonNullable.group({
    first_name: ['', [Validators.required, Validators.maxLength(100)]],
    last_name: ['', [Validators.required, Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(200)]]
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['professor'] || changes['mode'] || changes['is_open']) {
      this.LoadForm();
    }
  }

  private LoadForm(): void {
    if (!this.is_open) {
      return;
    }

    if (this.mode === 'edit' && this.professor) {
      this.form.patchValue({
        first_name: this.professor.firstName ?? '',
        last_name: this.professor.lastName ?? '',
        email: this.professor.email ?? ''
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

    if (!this.professor) {
      return;
    }

    this.update.emit({
      id: this.professor.id,
      ...payload
    });
  }
}