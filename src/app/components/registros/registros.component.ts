import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';

import { Lancamento } from 'src/app/models/Lancamento';
import { FormCadastro } from 'src/enums/forms.enum';
import { ModalService } from 'src/app/services/modal.service';
import { ComunicationService } from 'src/app/services/comunication.service';

@Component({
  selector: 'app-registros',
  templateUrl: './registros.component.html',
  styleUrls: ['./registros.component.sass']
})
export class RegistrosComponent implements OnInit {

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

  title = null;

  dataSourceDespesas = new MatTableDataSource<Lancamento>();
  dataSourceReceitas = new MatTableDataSource<Lancamento>();

  selectedRowIndex = -1;
  displayedColumnsLancamento!: string[];

  @Input() tipoLancFromParent!: any;
  @Output() idLanc = new EventEmitter<Lancamento>();
  constructor(
    private elementRef: ElementRef,
    private commService: ComunicationService,
  ) { }

  ngOnInit(): void {
    this.commService.refreshData();

    this.commService.dataChanged.subscribe({
      next: (data: any) => {
        console.log(data);
      },
    })

/*     this.dataFromParent.subscribe({
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
    }) */
  }

  getSelectedRowIndex(row: any) {
    this.selectedRowIndex = row.id; // Define o índice da linha selecionada
    return this.selectedRowIndex;
  }

  onClickRow(row: any, event: any) {
    this.getSelectedRowIndex(row);
    this.idLanc.emit(row);
    event.stopPropagation();
  }

  @HostListener('document:click', ['$event'])
  handleDocumentClick(event: MouseEvent) {
    const clickedInside = this.elementRef.nativeElement.contains(event.target);
    if (!clickedInside) {
      this.selectedRowIndex = -1; // Reseta o índice da linha selecionada
    }
  }
}
