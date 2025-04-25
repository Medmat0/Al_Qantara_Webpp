import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RemoveRevueComponent } from './remove-revue.component';

describe('RemoveRevueComponent', () => {
  let component: RemoveRevueComponent;
  let fixture: ComponentFixture<RemoveRevueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RemoveRevueComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RemoveRevueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
