import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BalanceteComponent } from './balancete.component';

describe('BalanceteComponent', () => {
  let component: BalanceteComponent;
  let fixture: ComponentFixture<BalanceteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BalanceteComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BalanceteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
