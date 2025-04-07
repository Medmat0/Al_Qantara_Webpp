import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RevueDescriptionComponent } from './revue-description.component';

describe('RevueDescriptionComponent', () => {
  let component: RevueDescriptionComponent;
  let fixture: ComponentFixture<RevueDescriptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RevueDescriptionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RevueDescriptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
