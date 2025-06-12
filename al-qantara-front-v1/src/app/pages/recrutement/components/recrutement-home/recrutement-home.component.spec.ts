import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecrutementHomeComponent } from './recrutement-home.component';

describe('RecrutementHomeComponent', () => {
  let component: RecrutementHomeComponent;
  let fixture: ComponentFixture<RecrutementHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecrutementHomeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecrutementHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
