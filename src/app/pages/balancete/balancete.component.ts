import { Component, OnInit } from '@angular/core';
import { COLUMNMAPPING, MESES } from 'src/app/entities/relatorios/relatorios';
import { MatButtonToggleGroup, MatButtonToggleModule } from '@angular/material/button-toggle';
import { Lancamento } from 'src/app/models/Lancamento';
import { ComunicationService } from 'src/app/services/comunication.service';
import { LancamentoService } from 'src/app/services/lancamentos/lancamento.service';
import { Inflows } from 'src/app/enums/inflows.enum';

@Component({
  selector: 'app-balancete',
  templateUrl: './balancete.component.html',
  styleUrls: ['./balancete.component.sass'],
})
export class BalanceteComponent implements OnInit {
  columnMapping = COLUMNMAPPING;

  meses = MESES;

  dataDespesas!: Lancamento[];
  dataReceitas!: Lancamento[];
  dadosBrutos: any = [];
  dataSourceDespesas: any;
  dataSource: any = []

  tables = [0];

  displayedColumns: string[] = [];

  displayColumnsReceitas: string[] = []

  displayColumnsDespesas = [
    'DESPESAS', ...this.meses, 'TOTAL', 'PERCENTUAL'
  ];
  displayDespesas!: boolean;
  displayReceitas!: boolean;

  constructor(
    private commService: ComunicationService,
    private lancamentoService: LancamentoService,
  ) {
    this.displayedColumns = ['receitas', ...this.meses, 'total', 'percentual'];

    console.log(this.displayedColumns);
    console.log(this.displayColumnsDespesas);
  }

  /** Whether the button toggle group contains the id as an active value. */
  isSticky(buttonToggleGroup: MatButtonToggleGroup, id: string) {
    return (buttonToggleGroup.value || []).indexOf(id) !== -1;
  }

  ngOnInit(): void {
    this.lancamentoService.getAll().subscribe(
      {
        next: (data) => {
          this.commService.setLancamentos(data, 'Balancete')
        },
        error: (err) => console.log(err),
      });

    this.commService.lancamentosList$.subscribe(data => { this.dadosBrutos = data })

    this.formatDados();
  }

  formatDados(): void {
    let INFLOWS = Object.values(Inflows);
    let dadosPorEntrada: any = [[]];
    let totalToPercent = 0

    INFLOWS.forEach((entries: string) => {
      delete dadosPorEntrada[0]

      if (!dadosPorEntrada[entries]){
        dadosPorEntrada[entries] = { receitas: entries }
      }
      dadosPorEntrada[entries].total = 0
      this.dadosBrutos.entradas.forEach((res: any) => {
        if (entries === res.entrada) {
          if (!dadosPorEntrada[entries]) {
            dadosPorEntrada[entries] = [];
          }
      
          if (!dadosPorEntrada[entries][this.meses[res.mes - 1]]) {
            dadosPorEntrada[entries][this.meses[res.mes - 1]] = [];
          }
          dadosPorEntrada[entries].total += res.valor_total
          totalToPercent += res.valor_total;

          const formattedValue = res.valor_total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });                   
          dadosPorEntrada[entries][this.meses[res.mes - 1]].push( formattedValue );
        }
      });
 
    });

    INFLOWS.forEach((entries: string) => {
      dadosPorEntrada[entries].percentual = 0;
      dadosPorEntrada[entries].percentual = ((dadosPorEntrada[entries].total / totalToPercent ) * 100).toFixed(1) + '%'
      const unformattedTotal = dadosPorEntrada[entries].total
      const formattedTotal = unformattedTotal.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL' });
      dadosPorEntrada[entries].total = formattedTotal
    });

    this.dataSource = Object.values(dadosPorEntrada);
  }

  changeTable(event: any) {
    if (event.target.innerText === 'DESPESAS') {
      this.displayDespesas = true
      this.displayReceitas = false
    }
    if (event.target.innerText === 'RECEITAS') {
      this.displayReceitas = true
      this.displayDespesas = false
    }
  }
}
