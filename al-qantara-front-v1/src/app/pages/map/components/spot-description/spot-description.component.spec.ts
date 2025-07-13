import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpotDescriptionComponent } from './spot-description.component';

describe('SpotDescriptionComponent', () => {
  let component: SpotDescriptionComponent;
  let fixture: ComponentFixture<SpotDescriptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpotDescriptionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpotDescriptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
