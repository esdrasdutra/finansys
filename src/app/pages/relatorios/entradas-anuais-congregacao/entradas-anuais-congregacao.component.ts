import { Component, OnInit } from '@angular/core';
import { LancamentoService } from 'src/app/services/lancamentos/lancamento.service';
import { RelatorioService } from 'src/app/services/relatorios/relatorio.service';
import { Lancamento } from 'src/app/models/Lancamento';
import { Congregation } from 'src/app/enums/congregation.enum';
import { ComunicationService } from 'src/app/services/comunication.service';
import { take } from 'rxjs';

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
    private commService: ComunicationService,
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
    // 1. Pega o valor mais recente da lista de receitas
        this.commService.receitasList$.pipe(
          take(1) // Usa take(1) para pegar o valor atual e fazer unsubscribe automaticamente!
        ).subscribe(receitas => {
          // 2. Passa os dados para o serviço, que tem a responsabilidade de processá-los
          if (receitas && receitas.length > 0) {
            this.annualEntries = this.relatorioService.getAnnualEntriesByCongregation(receitas, this.selectedYear);
          } else {
            console.warn("Não há dados de receita para gerar o relatório.");
            // Opcional: mostrar uma mensagem para o usuário
          }
        });
  }

  formatCurrency(value: number): string {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  isAnnualEntriesEmpty(): boolean {
    return Object.keys(this.annualEntries).length === 0;
  }

}
