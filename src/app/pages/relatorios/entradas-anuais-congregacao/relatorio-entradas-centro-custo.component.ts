import { Component, OnInit } from '@angular/core';
import { Lancamento } from 'src/app/models/Lancamento';
import { Congregation } from 'src/app/enums/congregation.enum';
import { ComunicationService } from 'src/app/services/comunication.service';
import { take } from 'rxjs';
import * as moment from 'moment';
import { Inflows } from 'src/app/enums/inflows.enum';

@Component({
  selector: 'app-relatorio-entradas-centro-custo',
  templateUrl: './relatorio-entradas-centro-custo.component.html',
  styleUrls: ['./relatorio-entradas-centro-custo.component.sass']
})
export class RelatorioEntradasCentroCustoComponent implements OnInit {
  annualEntries: Record<string, Record<string, Record<string, number>>> = {};
  startDate: moment.Moment;
  endDate: moment.Moment;
  congregations = Object.values(Congregation);

  constructor(private commService: ComunicationService) {
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
    this.commService.receitasList$.pipe(take(1)).subscribe(receitas => {
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

  processAnnualEntries(receitas: Lancamento[]): Record<string, Record<string, Record<string, number>>> {
    const annualEntries: Record<string, Record<string, Record<string, number>>> = {};

    Object.values(Congregation).forEach(congName => {
      annualEntries[congName] = {};
    });

    receitas.forEach(lancamento => {
      const congName = lancamento.cong;
      const month = moment(lancamento.data_lan).format('MMMM');
      const costCenter = lancamento.entrada;

      if (!annualEntries[congName]) {
        annualEntries[congName] = {};
      }
      if (!annualEntries[congName][month]) {
        annualEntries[congName][month] = {};
      }
      if (!annualEntries[congName][month][costCenter]) {
        annualEntries[congName][month][costCenter] = 0;
      }

      annualEntries[congName][month][costCenter] += parseFloat(lancamento.valor);
    });

    return annualEntries;
  }

  getMonths(congName: string): string[] {
    return Object.keys(this.annualEntries[congName] || {});
  }

  getCostCenters(congName: string, month: string): string[] {
    return Object.keys(this.annualEntries[congName]?.[month] || {});
  }
  
  getMonthTotal(congName: string, month: string): number {
    let total = 0;
    const costCenters = this.getCostCenters(congName, month);
    costCenters.forEach(cc => {
      total += this.annualEntries[congName][month][cc];
    });
    return total;
  }
  
  getCongregationTotal(congName: string): number {
    let total = 0;
    const months = this.getMonths(congName);
    months.forEach(month => {
      total += this.getMonthTotal(congName, month);
    });
    return total;
  }

  formatCurrency(value: number): string {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  isAnnualEntriesEmpty(): boolean {
    return Object.keys(this.annualEntries).length === 0;
  }

  exportToCSV(): void {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Congregação,Mês,Centro de Custo,Valor\r\n";

    this.congregations.forEach(congName => {
      const months = this.getMonths(congName);
      months.forEach(month => {
        const costCenters = this.getCostCenters(congName, month);
        costCenters.forEach(costCenter => {
          const value = this.annualEntries[congName][month][costCenter];
          csvContent += `${congName},${month},${costCenter},${value}\r\n`;
        });
      });
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "relatorio_entradas_centro_custo.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
