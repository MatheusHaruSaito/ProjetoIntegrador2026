import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditCharacterModal } from './edit-character-modal';

describe('EditCharacterModal', () => {
  let component: EditCharacterModal;
  let fixture: ComponentFixture<EditCharacterModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditCharacterModal],
    }).compileComponents();

    fixture = TestBed.createComponent(EditCharacterModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
