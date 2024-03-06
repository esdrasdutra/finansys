import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FiltrosRelatoriosComponent } from './filtros-relatorios.component';

describe('FiltrosRelatoriosComponent', () => {
  let component: FiltrosRelatoriosComponent;
  let fixture: ComponentFixture<FiltrosRelatoriosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FiltrosRelatoriosComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FiltrosRelatoriosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
