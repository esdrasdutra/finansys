import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LancamentoDeleteComponent } from './lancamento-delete.component';

describe('LancamentoDeleteComponent', () => {
  let component: LancamentoDeleteComponent;
  let fixture: ComponentFixture<LancamentoDeleteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LancamentoDeleteComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LancamentoDeleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
