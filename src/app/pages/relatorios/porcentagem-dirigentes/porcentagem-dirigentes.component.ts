import { Component } from '@angular/core';
import { FILTROS, MESES } from 'src/app/entities/relatorios/relatorios';
import { Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { Lancamento } from 'src/app/models/Lancamento';

@Component({
  selector: 'app-porcentagem-dirigentes',
  templateUrl: './porcentagem-dirigentes.component.html',
  styleUrls: ['./porcentagem-dirigentes.component.sass']
})
export class PorcentagemDirigentesComponent {
  filtros = FILTROS;
  meses = MESES;
  dataSource = new MatTableDataSource<Lancamento>();

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


  constructor(
    private router: Router,
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

}
