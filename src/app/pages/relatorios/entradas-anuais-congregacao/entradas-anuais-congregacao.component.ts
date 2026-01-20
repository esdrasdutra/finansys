import { Component, OnInit } from '@angular/core';
import { LancamentoService } from 'src/app/services/lancamentos/lancamento.service';
import { RelatorioService } from 'src/app/services/relatorios/relatorio.service';
import { Lancamento } from 'src/app/models/Lancamento';
import { Congregation } from 'src/app/enums/congregation.enum';

@Component({
  selector: 'app-entradas-anuais-congregacao',
  templateUrl: './entradas-anuais-congregacao.component.html',
  styleUrls: ['./entradas-anuais-congregacao.component.sass']
})
export class EntradasAnuaisCongregacaoComponent implements OnInit {
  annualEntries: Record<string, number> = {};
  selectedYear: number = new Date().getFullYear();
  availableYears: number[] = [];
  congregations = Object.values(Congregation);

  constructor(
    private lancamentoService: LancamentoService,
    private relatorioService: RelatorioService
  ) { }

  ngOnInit(): void {
    this.populateAvailableYears();
    this.loadAnnualEntries();
  }

  populateAvailableYears(): void {
    const currentYear = new Date().getFullYear();
    for (let i = currentYear - 5; i <= currentYear + 5; i++) {
      this.availableYears.push(i);
    }
  }

  onYearChange(): void {
    // The selectedYear is bound with ngModel, so we just need to reload the data.
    this.loadAnnualEntries();
  }

  loadAnnualEntries(): void {
    this.lancamentoService.getLancamentos().subscribe(
      (response) => {
        const lancamentos: Lancamento[] = response.data;
        console.log(this.selectedYear);
        console.log(lancamentos);
        this.annualEntries = this.relatorioService.getAnnualEntriesByCongregation(lancamentos, this.selectedYear);
      },
      (error) => {
        console.error('Erro ao buscar lançamentos:', error);
      }
    );
  }

  formatCurrency(value: number): string {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  isAnnualEntriesEmpty(): boolean {
    return Object.keys(this.annualEntries).length === 0;
  }

}
