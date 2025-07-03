import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommunityPostCreationComponent } from './community-post-creation.component';

describe('CommunityPostCreationComponent', () => {
  let component: CommunityPostCreationComponent;
  let fixture: ComponentFixture<CommunityPostCreationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommunityPostCreationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommunityPostCreationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
