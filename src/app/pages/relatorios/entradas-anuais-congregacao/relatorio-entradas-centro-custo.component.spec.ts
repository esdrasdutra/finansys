import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { LancamentoService } from 'src/app/services/lancamentos/lancamento.service';
import { RelatorioService } from 'src/app/services/relatorios/relatorio.service';

import { RelatorioEntradasCentroCustoComponent } from './relatorio-entradas-centro-custo.component';

describe('RelatorioEntradasCentroCustoComponent', () => {
  let component: RelatorioEntradasCentroCustoComponent;
  let fixture: ComponentFixture<RelatorioEntradasCentroCustoComponent>;
  let lancamentoServiceSpy: jasmine.SpyObj<LancamentoService>;
  let relatorioServiceSpy: jasmine.SpyObj<RelatorioService>;

  beforeEach(async () => {
    lancamentoServiceSpy = jasmine.createSpyObj('LancamentoService', ['getLancamentos']);
    relatorioServiceSpy = jasmine.createSpyObj('RelatorioService', ['getAnnualEntriesByCongregation']);

    await TestBed.configureTestingModule({
      declarations: [ RelatorioEntradasCentroCustoComponent ],
      imports: [ FormsModule ],
      providers: [
        { provide: LancamentoService, useValue: lancamentoServiceSpy },
        { provide: RelatorioService, useValue: relatorioServiceSpy }
      ]
    })
    .compileComponents();

    lancamentoServiceSpy.getLancamentos.and.returnValue(of({ data: [] }));
    relatorioServiceSpy.getAnnualEntriesByCongregation.and.returnValue({});

    fixture = TestBed.createComponent(RelatorioEntradasCentroCustoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
