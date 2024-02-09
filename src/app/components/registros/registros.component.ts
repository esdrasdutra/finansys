import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import {SelectionModel} from '@angular/cdk/collections';

import { Lancamento } from 'src/app/models/Lancamento';
import { FormCadastro } from 'src/enums/forms.enum';

@Component({
  selector: 'app-registros',
  templateUrl: './registros.component.html',
  styleUrls: ['./registros.component.sass']
})
export class RegistrosComponent implements OnInit {
  selection = new SelectionModel<Lancamento>(true, []);
  dataSource: any;
  selectedRowIndex = -1;
  highlightedRows = [];

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }

    this.selection.select(...this.dataSource.data);
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: Lancamento): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.recibo + 1}`;
  }

  columnMapping: { [key: string]: string } = {
    'recibo': 'RECIBO',
    'data_lan': 'LANÇAMENTO',
    'data_ven': 'VENCIMENTO',
    'tipo_doc': 'TIPO DOCUMENTO',
    'num_doc': 'Nº DOCUMENTO',
    'entrada': 'ENTRADAS',
    'saida': 'SAÍDAS',
    'cong': 'CONGREGAÇÃO',
    'forn': 'FORNECEDOR',
    'dizimista': 'NOME DO DIZIMISTA',
    'obs': 'OBS:.',
    'valor': 'VALOR',
    'conta': 'CONTA',
    'situacao': 'SITUAÇÃO',
    'historico': 'HISTÓRICO',
    'status_lanc': 'SITUAÇÃO'
  };

  @Input() dataFromParent: any;
  @Input() tipoLancFromParent!: any;

  clickedRows = new Set<Lancamento>

  private sub: any;
  form = FormCadastro;
  form_values: any = Object.values(FormCadastro);
  title = null;
  data: Lancamento[] = [];
  tipoLan: string = 'entrada';
  dataSourceLan!: Lancamento[];

  displayedColumnsLancamento!: string[];

  constructor(
  ) { }



  ngOnInit(): void {
    this.dataFromParent.subscribe({
      next: (data: any) => {
        this.dataSource = new MatTableDataSource<Lancamento>(data);
        data.forEach((el: any) => {
          if (el.tipo_lanc === "RECEITA") {
            this.displayedColumnsLancamento = [
              'recibo', 'data_lan', 'data_ven', 'tipo_doc', 'num_doc', 'entrada', 'cong',
              'forn', 'dizimista', 'obs', 'valor', 'conta', 'situacao', 'historico', 'status_lanc'
            ]
          } else if (el.tipo_lanc === "DESPESA") {
            this.displayedColumnsLancamento = [
              'recibo', 'data_lan', 'data_ven', 'tipo_doc', 'num_doc', 'saida', 'cong',
              'forn', 'dizimista', 'obs', 'valor', 'conta', 'situacao', 'historico', 'status_lanc'
            ]
          }
        })
        this.dataSource.data = data;
      }
    })
  }

  clickedRow(row: any) {
    this.selection.changed.subscribe((a) =>
    {
        if (a.added[0])   // will be undefined if no selection
        {
            alert('You selected ' + a.added[0].tipo_lanc);
        }
    });
    this.selectedRowIndex = row.id;
    console.log(this.selectedRowIndex);
    console.log(row);
  }
}
