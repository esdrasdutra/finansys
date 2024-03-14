import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { Congregation } from '../..//enums/congregation.enum';
import { LancamentoService } from '../..//services/lancamentos/lancamento.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-relatorios',
  templateUrl: './relatorios.component.html',
  styleUrls: ['./relatorios.component.sass']
})
export class RelatoriosComponent implements OnInit {

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

  doc = new jsPDF({
    orientation: "landscape",
    unit: "cm",
    format: [29.7, 21]
  });

  dataSourceDespesa = new MatTableDataSource();
  dataSourceReceita = new MatTableDataSource();

  displayedColumnsLancamento = [
    'congregation', 'mes', 'valor',
  ]

  congregations = Object.values(Congregation);

  areaMapping: { [key: number]: Congregation[] } = {
    0: [this.congregations[36]],
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

  option: number = 0;

  despesasPerCong: any = [];
  receitasPerCong: any = [];


  dataDespesasFiltered: any = [];
  dataReceitasFiltered: any = [];

  selected3: string[] = [];

  constructor(
    private lancamentoService: LancamentoService,
  ) { }

  ngOnInit(): void {
    this.dataDespesas = localStorage.getItem('DESPESAS');
    this.dataReceitas = localStorage.getItem('RECEITAS');

    this.dataDespesas = JSON.parse(this.dataDespesas);
    this.dataReceitas = JSON.parse(this.dataReceitas);
  }

  filterAndSumByCongregation(arrayCong: any): void {
    console.log('Function Call with the array:', arrayCong);
    this.receitasPerCong = [];

    arrayCong.forEach((cong: any) => {
      this.receitasPerCong.push(
        this.dataReceitas.filter((el : any) => el.cong === cong),
      );
      this.despesasPerCong.push(
        this.dataDespesas.filter((el: any) => el.cong === cong)
      );
    });
    console.log('RECEITAS PER CONG',this.receitasPerCong);
    console.log('DESPESAS PER CONG', this.despesasPerCong);

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
  }

  filterAndSumByArea(area: number): void {

  }

  handleToogle(item: string, event: MatCheckboxChange): void {
    if (event.checked) {
      this.selected3.push(item);
    } else {
      const index = this.selected3.indexOf(item);
      if (index >= 0) {
        this.selected3.splice(index, 1);
      }
    }
    console.log('Chamando FUNÇÃO DE FILTRAR POR CONGREGACAO');

    this.filterAndSumByCongregation(this.selected3);
  }

  exists(item: string) {
    return this.selected3.indexOf(item) > -1;
  };

  isIndeterminate() {
    return (this.selected3.length > 0 && !this.isChecked());
  };

  isChecked() {
    return this.selected3.length === this.congregations.length;
  };

  toggleAll(event: MatCheckboxChange) {
    if (event.checked) {
      this.congregations.forEach(row => {
        this.selected3.push(row)
      });
    } else {
      this.selected3.length = 0;
    }
  }


  downloadPdf() {
    let prepare: any = [];

    /*     let dataReceitasTC = this.dataReceitas.filter((e: any) => e.cong === "TEMPLO CENTRAL");
    
        dataReceitasTC.forEach((e: any) => {
          var tempObj = [];
          const parsedValue = parseFloat(e.valor);
          const formattedValue = parsedValue.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'});
          tempObj.push(e.cong);
          tempObj.push(new Date(e.data_lan).toISOString().slice(0,10));
          tempObj.push(formattedValue);
          prepare.push(tempObj);
        }) */

    this.dataReceitasFiltered.forEach((e: any) => {
      var tempObj = [];
      // Parse value to ensure it's treated as a number
      const parsedValue = parseFloat(e.valor);
      // Format the value as currency with thousand separators and cents
      const formattedValue = parsedValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
      tempObj.push(e.congregation);
      tempObj.push(e.mes);
      tempObj.push(formattedValue);
      prepare.push(tempObj);
    });
    autoTable(this.doc, {
      head: [['CONGREGAÇÃO', 'MÊS', 'VALOR']],
      body: prepare,
    });

    this.doc.save('RelatórioAnalitico_TC.pdf');
  }
}
