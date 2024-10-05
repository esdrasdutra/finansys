import { Component, OnInit } from '@angular/core';
import { COLUMNMAPPING, MESES } from 'src/app/entities/relatorios/relatorios';
import { MatButtonToggleGroup, MatButtonToggleModule } from '@angular/material/button-toggle';
import { Lancamento } from 'src/app/models/Lancamento';
import { ComunicationService } from 'src/app/services/comunication.service';
import { LancamentoService } from 'src/app/services/lancamentos/lancamento.service';
import { Inflows } from 'src/app/enums/inflows.enum';

export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
}

export interface Balancete {
  receitas: string,
  meses: string,
  valor: number
  total: number,
  percentual: number
}

const ELEMENT_DATA: PeriodicElement[] = [
  { position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H' },
  { position: 2, name: 'Helium', weight: 4.0026, symbol: 'He' },
  { position: 3, name: 'Lithium', weight: 6.941, symbol: 'Li' },
  { position: 4, name: 'Beryllium', weight: 9.0122, symbol: 'Be' },
  { position: 5, name: 'Boron', weight: 10.811, symbol: 'B' },
  { position: 6, name: 'Carbon', weight: 12.0107, symbol: 'C' },
  { position: 7, name: 'Nitrogen', weight: 14.0067, symbol: 'N' },
  { position: 8, name: 'Oxygen', weight: 15.9994, symbol: 'O' },
  { position: 9, name: 'Fluorine', weight: 18.9984, symbol: 'F' },
  { position: 10, name: 'Neon', weight: 20.1797, symbol: 'Ne' },
];

const ELEMENT_DATA_2: Balancete[] = []

@Component({
  selector: 'app-balancete',
  templateUrl: './balancete.component.html',
  styleUrls: ['./balancete.component.sass'],
})
export class BalanceteComponent implements OnInit {
  columnMapping = COLUMNMAPPING;

  dataDespesas!: Lancamento[];
  dataReceitas!: Lancamento[];
  dadosBrutos: any = [];
  dataSourceDespesas: any;
  dataSource: any = []

  tables = [0];

  displayedColumns: string[] = [];

  displayColumnsReceitas: string[] = []

  displayColumnsDespesas = [
    'DESPESAS', ...MESES, 'TOTAL', 'PERCENTUAL'
  ];

  constructor(
    private commService: ComunicationService,
    private lancamentoService: LancamentoService,
  ) {
    this.displayedColumns = ['receitas', ...MESES, 'total', 'percentual'];

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
    let dadosPorSaida: any = [[]];
    let groupedData: any = [[]];

    INFLOWS.forEach((entry: string) => {
      if (!dadosPorEntrada[entry]){
        dadosPorEntrada[entry] = []
      }
      
      this.dadosBrutos.entradas.forEach((res: any) => {
        if (entry === res.entrada){
          dadosPorEntrada[entry][MESES[res.mes - 1]] = res.valor_total
        }
      });
    });
    console.log(dadosPorEntrada);
    this.dataSource = Object.values(dadosPorEntrada);
  
    console.log(this.dataSource)
  }
}
