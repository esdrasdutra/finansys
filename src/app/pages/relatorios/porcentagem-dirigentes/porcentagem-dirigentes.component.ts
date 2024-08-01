import { Component } from '@angular/core';
import { FILTROS, MESES, RelatorioAnalitico } from 'src/app/entities/relatorios/relatorios';
import { Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { Lancamento } from 'src/app/models/Lancamento';
import { ComunicationService } from 'src/app/services/comunication.service';
import moment from 'moment';

@Component({
  selector: 'app-porcentagem-dirigentes',
  templateUrl: './porcentagem-dirigentes.component.html',
  styleUrls: ['./porcentagem-dirigentes.component.sass']
})
export class PorcentagemDirigentesComponent {
  filtros = FILTROS;
  meses = MESES;
  dataSource = new MatTableDataSource<Lancamento>();
  receitasList: any = [];
  relatorio = new RelatorioAnalitico();

  displayedColumns = [
    'cong', 'valor',]

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

  selectedParam!: string;
  selectedMonth!: string;

  constructor(
    private commService: ComunicationService,    
  ){}

  navigateTo(){
    console.log('VOU NAVEGAR PARA...')
    //const url = 
    //this.router.navigateByUrl('/dirigentes', url)
  }

  onKey(event: Event) {
    const inputValue = event.target as HTMLInputElement;
    console.log(inputValue.value);
  }

  onChange(event: any): void {
    this.calculateTeth(event.value);
  }

  calculateTeth(month: string): void {
    this.commService.receitasList$.subscribe(
      {
        next: (data) => { this.receitasList = data.filter((el: Lancamento) => el.entrada !== 'ENTRADA OFERTA AVULSA' && el.cong !== 'TEMPLO CENTRAL'); },
        error: (err) => console.log(err),
      }
    );

    const data = this.receitasList.filter((el: Lancamento) => {
      let monthInt = moment(el.data_lan).month();
      let monthStr = this.meses[monthInt];
      return monthStr === month;
    });

    const dataFiltered = this.relatorio.getDizimoDirigentes(data);

    this.dataSource.data = dataFiltered;

    console.log(dataFiltered);

  }

}
