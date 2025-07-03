import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommunityHomeComponent } from './community-home.component';

describe('CommunityHomeComponent', () => {
  let component: CommunityHomeComponent;
  let fixture: ComponentFixture<CommunityHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommunityHomeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommunityHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
