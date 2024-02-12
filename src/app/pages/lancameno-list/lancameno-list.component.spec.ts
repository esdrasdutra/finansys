import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LancamenoListComponent } from './lancameno-list.component';

describe('LancamenoListComponent', () => {
  let component: LancamenoListComponent;
  let fixture: ComponentFixture<LancamenoListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LancamenoListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LancamenoListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
