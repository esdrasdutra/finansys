import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BalancoMensalCongregacaoComponent } from './balanco-mensal-congregacao.component';

describe('BalancoMensalCongregacaoComponent', () => {
  let component: BalancoMensalCongregacaoComponent;
  let fixture: ComponentFixture<BalancoMensalCongregacaoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BalancoMensalCongregacaoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BalancoMensalCongregacaoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
