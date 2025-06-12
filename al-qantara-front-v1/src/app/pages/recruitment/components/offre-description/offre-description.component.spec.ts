import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OffreDescriptionComponent } from './offre-description.component';

describe('OffreDescriptionComponent', () => {
  let component: OffreDescriptionComponent;
  let fixture: ComponentFixture<OffreDescriptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OffreDescriptionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OffreDescriptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
