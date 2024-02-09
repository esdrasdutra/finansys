import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Lancamento } from 'src/app/models/Lancamento';
import { LancamentoService } from 'src/app/services/lancamentos/lancamento.service';
import { FormCadastro } from 'src/enums/forms.enum';
import { LancamentosComponent } from '../lancamentos/lancamentos.component';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ModalService } from 'src/app/services/modal.service';


@Component({
  selector: 'app-Home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.sass'],
  providers: [LancamentoService]
})
export class HomeComponent implements OnInit {
  @Output() outputReceitas = new EventEmitter<Lancamento[]>;
  @Output() outputDespesas = new EventEmitter<Lancamento[]>;
  @Output() outputLancDes = new EventEmitter<string>;  
  @Output() outputLancRec = new EventEmitter<string>;

  private sub: any;

  form = FormCadastro;
  form_values: any = Object.values(FormCadastro);
  title = null;
  all = new BehaviorSubject<Lancamento[]>([]);
  showTable!: boolean;
  statusMessage!: string;
  isLoaded: boolean = true;
  data: Lancamento[] = [];

  displayedColumnsLancamento: string[] = [
    'RECIBO', 'LANÇAMENTO', 'VENCIMENTO', 'TIPO DOCUMENTO', 'Nº DOCUMENTO', 'ENTRADAS', 'SAÍDAS',
    'CONGREGAÇÃO', 'FORNECEDOR', 'NOME DO DIZIMISTA', 'OBS:.', 'VALOR', 'CONTA',
    '_', 'HISTÓRICO', 'SITUAÇÃO'];

  dataSourceLancamento: any;
  dataSourceAddLancamento: any;
  newLancamento!: Lancamento;

  lanc_despesas!: Lancamento[];
  lanc_receitas!: Lancamento[];

  constructor(
    private lancamentoService: LancamentoService,
    private modalService: ModalService,
  ) { }

  @ViewChild(MatSort, { static: true }) sort!: MatSort;

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.lancamentoService.getLancamentos().subscribe({
      next: (data) => {
        this.data = data.data;
        this.lanc_despesas = this.data.filter(el => el.tipo_lanc === "DESPESA");
        this.lanc_receitas = this.data.filter(el => el.tipo_lanc === "RECEITA");
        this.outputDespesas.emit(this.lanc_despesas);
        this.outputReceitas.emit(this.lanc_receitas);
      },
      error: (err) => {
        console.log(err)
      },
      complete: () => {
        console.log('COMPLETE')
      }
    });
  }

  showLancamentoModal(): void {
    this.modalService.openLancamentoModal();
  }

  show() {
    console.log('SHOWING')
  }

  getErrorMessage() {
    return 'You must enter a value'
  }
}
