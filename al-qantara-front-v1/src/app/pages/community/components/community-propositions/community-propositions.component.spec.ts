import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommunityPropositionsComponent } from './community-propositions.component';

describe('CommunityPropositionsComponent', () => {
  let component: CommunityPropositionsComponent;
  let fixture: ComponentFixture<CommunityPropositionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommunityPropositionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommunityPropositionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
