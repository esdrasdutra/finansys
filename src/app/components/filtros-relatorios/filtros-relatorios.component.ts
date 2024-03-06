import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Congregation } from 'src/app/enums/congregation.enum';
import { LancamentoService } from 'src/app/services/lancamentos/lancamento.service';
import 'jspdf-autotable';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
    'mes': 'MÊS'
  };

  doc = new jsPDF();

  dataSourceDespesa = new MatTableDataSource();
  dataSourceReceita = new MatTableDataSource();

  displayedColumnsLancamento = [
    'congregation', 'mes', 'valor',
  ]
  
  congregations = Object.values(Congregation);

  areaMapping: { [key: number]: Congregation[] } = {
    0: [],
    1: [this.congregations[5], this.congregations[13], this.congregations[25], this.congregations[12], this.congregations[8]],
    2: [this.congregations[19], this.congregations[23], this.congregations[18]],
    3: [this.congregations[30], this.congregations[4], this.congregations[24], this.congregations[21]],
    4: [this.congregations[27], this.congregations[28], this.congregations[3], this.congregations[26], this.congregations[1]],
    5: [this.congregations[17], this.congregations[2], this.congregations[16], this.congregations[15]],
    6: [this.congregations[9], this.congregations[20], this.congregations[22], this.congregations[14], this.congregations[31], this.congregations[35]],
    7: [this.congregations[0], this.congregations[29], this.congregations[33], this.congregations[11], this.congregations[7]],
    8: [this.congregations[32], this.congregations[6], this.congregations[10], this.congregations[34]],
  }

  dataReceitas: any = [];
  dataDespesas: any = [];

  
  despesasPerCong: any = [];
  receitasPerCong: any = [];


  dataDespesasFiltered: any = [];
  dataReceitasFiltered: any = [];

  constructor(
    private lancamentoService: LancamentoService,
  ) { }

  ngOnInit(): void {
    this.filterAndSumByCongregation(0);
  }

  // Função para filtrar automaticamente os dados pela congregação e realizar a soma total dos valores
  filterAndSumByCongregation(area: number): void {
    console.log(this.areaMapping[area]);
    this.lancamentoService.getLancamentos().subscribe((data: any) => {
      data.forEach((el: any) => {
        if (el.tipo_lanc === "RECEITA" && el.entrada !== "ENTRADA OFERTA AVULSA") {
          this.dataReceitas.push(el);
        } else if (el.tipo_lanc === "DESPESA") {
          this.dataDespesas.push(el);
        }
      });

      this.congregations.forEach((cong: any) => {
        this.receitasPerCong.push(
          this.dataReceitas.filter((el: any) => el.cong === cong)
        )

        this.despesasPerCong.push(
          this.dataDespesas.filter((el: any) => el.cong === cong)
        );
      });

      this.despesasPerCong.forEach((cong: any, index: number) => {
        let valueTemp = 0;
        cong.forEach((res: any) => {
          valueTemp += parseFloat(res.valor)
        });

        this.dataDespesasFiltered.push({ congregation: this.congregations[index], mes: '02', valor: valueTemp, })
      });

      this.receitasPerCong.forEach((cong: any, index: number) => {
        let valueTemp = 0;
        cong.forEach((res: any) => {
          valueTemp += parseFloat(res.valor)
        })
        this.dataReceitasFiltered.push({ congregation: this.congregations[index], mes: '02', valor: valueTemp })
      });

      this.dataSourceDespesa.data = this.dataDespesasFiltered;
      this.dataSourceReceita.data = this.dataReceitasFiltered;
    });
  }

  downloadPdf() {
    console.log('IMPRIMINDO ISSO');
    let prepare: any = [];
    this.dataReceitasFiltered.forEach((e:any)=>{
      var tempObj =[];
      tempObj.push(e.congregation);
      tempObj.push(e.mes);
      tempObj.push(e.valor);
      prepare.push(tempObj);
    });
    autoTable(this.doc, {
      head: [['CONGREGAÇÃO', 'MÊS', 'VALOR']],
      body: prepare      
    });
    this.doc.save('Relatório_Cong.pdf');
  }

}
