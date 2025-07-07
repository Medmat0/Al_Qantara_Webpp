import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckQrCodeComponent } from './check-qr-code.component';

describe('CheckQrCodeComponent', () => {
  let component: CheckQrCodeComponent;
  let fixture: ComponentFixture<CheckQrCodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheckQrCodeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CheckQrCodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
