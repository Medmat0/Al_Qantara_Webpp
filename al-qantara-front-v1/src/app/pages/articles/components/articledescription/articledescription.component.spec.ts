import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArticledescriptionComponent } from './articledescription.component';

describe('ArticledescriptionComponent', () => {
  let component: ArticledescriptionComponent;
  let fixture: ComponentFixture<ArticledescriptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArticledescriptionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ArticledescriptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
