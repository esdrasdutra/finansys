import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import moment from 'moment';
import { Congregation } from 'src/app/enums/congregation.enum';
import { Lancamento } from 'src/app/models/Lancamento';
import { LancamentoService } from 'src/app/services/lancamentos/lancamento.service';

@Component({
  selector: 'app-filtros-relatorios',
  templateUrl: './filtros-relatorios.component.html',
  styleUrls: ['./filtros-relatorios.component.sass']
})
export class FiltrosRelatoriosComponent implements OnInit {

  columnMapping: { [key: string]: string } = {
    'recibo': 'RECIBO',
    'data_lan': 'LANÇAMENTO',
    'data_ven': 'VENCIMENTO',
    'tipo_doc': 'TIPO DOCUMENTO',
    'num_doc': 'Nº DOCUMENTO',
    'entrada': 'ENTRADAS',
    'saida': 'SAÍDAS',
    'congregation': 'CONGREGAÇÃO',
    'forn': 'FORNECEDOR',
    'dizimista': 'NOME DO DIZIMISTA',
    'obs': 'OBS:.',
    'valor': 'VALOR',
    'conta': 'CONTA',
    'situacao': 'SITUAÇÃO',
    'historico': 'HISTÓRICO',
    'status_lanc': 'SITUAÇÃO',
    'mes':'MÊS'
  };

  dataSourceDespesa = new MatTableDataSource();
  dataSourceReceita = new MatTableDataSource();

  displayedColumnsLancamento = [
    'congregation', 'mes', 'valor',
  ]

  filteredCongregations = Object.values(Congregation);
  dataReceitas:any =  [];
  dataDespesas:any =  [];

  dataDespesasFiltered: any = [];
  dataReceitasFiltered: any = [];

  constructor(
    private lancamentoService: LancamentoService,
  ) { }

  ngOnInit(): void { 

    this.filterAndSumByCongregation();
  }

  // Função para filtrar automaticamente os dados pela congregação e realizar a soma total dos valores
  filterAndSumByCongregation(): void {
    this.lancamentoService.getLancamentos().subscribe((data: any) => {
      let dataPerCong: any = [];
      let despesasPerCong: any = [];
      let receitasPerCong: any = [];


      data.forEach((el: any) => {
        if (el.tipo_lanc === "RECEITA") {
          this.dataReceitas.push(el);
        } else if (el.tipo_lanc === "DESPESA") {
          this.dataDespesas.push(el);
        }
      });
    

      this.filteredCongregations.forEach((cong: any ) => {
        despesasPerCong.push(
          this.dataDespesas.filter((el: any) => el.cong === cong)
        );

        receitasPerCong.push(
          this.dataReceitas.filter((el: any) => el.cong === cong)
        )
      });

      despesasPerCong.forEach((cong: any, index: number) =>{
        let valueTemp = 0;
        cong.forEach((res: any) => {
          valueTemp += parseFloat(res.valor)
        })
        this.dataDespesasFiltered.push({congregation: this.filteredCongregations[index], mes: '02', valor: valueTemp,})
        
      });
      

      receitasPerCong.forEach((cong: any, index: number) => {
        let valueTemp = 0;
        cong.forEach((res: any) => {
          valueTemp += parseFloat(res.valor)
        })
        this.dataReceitasFiltered.push({congregation: this.filteredCongregations[index], mes: '02', valor: valueTemp})
      });

      

      const totalValue = this.dataReceitasFiltered.reduce((acc: number, item: any) => {
        console.log(item.valor);
        return acc + parseFloat(item.valor);
      }, 0);
      
      console.log('Valor total:', totalValue); 

     
      this.dataSourceDespesa.data = this.dataDespesasFiltered;
      this.dataSourceReceita.data = this.dataReceitasFiltered;
    });
  }
}
