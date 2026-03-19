import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentFormModal } from './student-form-modal';

describe('StudentFormModal', () => {
  let component: StudentFormModal;
  let fixture: ComponentFixture<StudentFormModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentFormModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentFormModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
