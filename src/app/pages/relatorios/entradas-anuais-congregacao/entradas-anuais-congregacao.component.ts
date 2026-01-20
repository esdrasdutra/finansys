import { Component, OnInit } from '@angular/core';
import { LancamentoService } from 'src/app/services/lancamentos/lancamento.service';
import { RelatorioService } from 'src/app/services/relatorios/relatorio.service';
import { Lancamento } from 'src/app/models/Lancamento';
import { Congregation } from 'src/app/enums/congregation.enum';
import { ComunicationService } from 'src/app/services/comunication.service';
import { take } from 'rxjs';
import * as moment from 'moment';

@Component({
  selector: 'app-entradas-anuais-congregacao',
  templateUrl: './entradas-anuais-congregacao.component.html',
  styleUrls: ['./entradas-anuais-congregacao.component.sass']
})
export class EntradasAnuaisCongregacaoComponent implements OnInit {
  annualEntries: Record<string, number> = {};
  startDate: moment.Moment;
  endDate: moment.Moment;
  congregations = Object.values(Congregation);

  constructor(
    private commService: ComunicationService,
    private relatorioService: RelatorioService
  ) {
    const today = moment();
    this.startDate = today.clone().startOf('year');
    this.endDate = today.clone().endOf('year');
  }

  ngOnInit(): void {
    this.loadAnnualEntries();
  }

  onDateChange(): void {
    this.loadAnnualEntries();
  }

  loadAnnualEntries(): void {
    this.commService.receitasList$.pipe(
      take(1)
    ).subscribe(receitas => {
      if (receitas && receitas.length > 0) {
        const filteredReceitas = receitas.filter(r => {
          const lancamentoDate = moment(r.data_lan);
          return lancamentoDate.isBetween(this.startDate, this.endDate, null, '[]');
        });
        this.annualEntries = this.processAnnualEntries(filteredReceitas);
      } else {
        console.warn("Não há dados de receita para gerar o relatório.");
        this.annualEntries = {};
      }
    });
  }

  processAnnualEntries(receitas: Lancamento[]): Record<string, number> {
    const annualEntries: Record<string, number> = {};

    Object.values(Congregation).forEach(congName => {
      annualEntries[congName] = 0;
    });

    receitas.forEach(lancamento => {
      const congName = lancamento.cong;
      if (annualEntries.hasOwnProperty(congName)) {
        annualEntries[congName] += parseFloat(lancamento.valor);
      }
    });

    return annualEntries;
  }

  formatCurrency(value: number): string {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  isAnnualEntriesEmpty(): boolean {
    return Object.keys(this.annualEntries).length === 0 || Object.values(this.annualEntries).every(v => v === 0);
  }

}
