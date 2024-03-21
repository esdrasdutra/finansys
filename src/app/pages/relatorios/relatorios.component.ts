import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { Congregation } from '../..//enums/congregation.enum';
import { LancamentoService } from '../..//services/lancamentos/lancamento.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import moment from 'moment';

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
    orientation: "portrait",
    unit: "cm",
    format: 'a4'
  });

  dataSourceDespesa = new MatTableDataSource();
  dataSourceReceita = new MatTableDataSource();

  displayedColumnsLancamento = [
    'congregation', 'mes', 'valor',
  ]

  congregations = Object.values(Congregation);

  areaMapping: { [key: string]: Congregation[] } = {
    'TC': [this.congregations[36]],
    '1': [this.congregations[5], this.congregations[13], this.congregations[25], this.congregations[12], this.congregations[8]],
    '2': [this.congregations[19], this.congregations[23], this.congregations[18]],
    '3': [this.congregations[30], this.congregations[4], this.congregations[24], this.congregations[21]],
    '4': [this.congregations[27], this.congregations[28], this.congregations[3], this.congregations[26], this.congregations[1]],
    '5': [this.congregations[17], this.congregations[2], this.congregations[16], this.congregations[15]],
    '6': [this.congregations[9], this.congregations[20], this.congregations[22], this.congregations[14], this.congregations[31], this.congregations[35]],
    '7': [this.congregations[0], this.congregations[29], this.congregations[33], this.congregations[11], this.congregations[7]],
    '8': [this.congregations[32], this.congregations[6], this.congregations[10], this.congregations[34]],
  }

  areas = ['TC', 1, 2, 3, 4, 5, 6, 7, 8]

  dataReceitas: any = [];
  dataDespesas: any = [];

  option: number = 0;

  despesasPerCong: any = [];
  receitasPerCong: any = [];

  dataDespesasFiltered: any = [];
  dataReceitasFiltered: any = [];

  congSelected: string[] = [];
  dataReceitasByArray: any;
  sumTotal: boolean = true;
  filterByArea: boolean = false;

  constructor() { }

  ngOnInit(): void {
    this.dataDespesas = localStorage.getItem('DESPESAS');
    this.dataReceitas = localStorage.getItem('RECEITAS');

    let today = Date.now()

    this.dataDespesas = JSON.parse(this.dataDespesas).filter((el: any) => moment(el.data_lan).month() === moment(today).month());
    this.dataReceitas = JSON.parse(this.dataReceitas).filter((el: any) => moment(el.data_lan).month() === moment(today).month());
  }

  filterAndSumByCongregation(arrayCong: any): void {
    this.receitasPerCong.length = 0;
    this.despesasPerCong.length = 0;

    arrayCong.forEach((cong: any) => {
      this.receitasPerCong.push(
        this.dataReceitas.filter((el: any) => el.cong === cong),
      );

      this.despesasPerCong.push(
        this.dataDespesas.filter((el: any) => el.cong === cong)
      );
    });

    this.despesasPerCong.forEach((cong: any) => {
      let valueTemp = 0;
      let congName = '';
      let month = null;
      cong.forEach((res: any) => {
        valueTemp += parseFloat(res.valor)
        congName = res.cong
        month = res.data_lan
      });
      this.dataDespesasFiltered.push({ congregation: congName, mes: month, valor: valueTemp, })
    });
    
    let totalValue = 0;

    this.receitasPerCong.forEach((cong: any) => {
      let valueTemp = 0;
      let congName = '';
      let month = null;
      cong.forEach((res: any) => {
        valueTemp += parseFloat(res.valor)
        congName = res.cong
        month = res.data_lan
      })
      this.dataReceitasFiltered.push({ congregation: congName, mes: month, valor: valueTemp })
    });

    this.dataReceitasFiltered.forEach((obj: any) => {
      totalValue += obj.valor
    });

    this.dataReceitasFiltered.push({congregation: 'TOTAL', mes: '03', valor: totalValue});

    this.dataSourceDespesa.data = this.dataDespesasFiltered;
    this.dataSourceReceita.data = this.dataReceitasFiltered;
  }

  filterAndSumByArea(area: number): void { }

  handleToogle(item: string, event: MatCheckboxChange): void {
    this.receitasPerCong.length = 0;
    this.despesasPerCong.length = 0;
    this.dataReceitasFiltered.length = 0;
    this.dataDespesasFiltered.length = 0;

    if (event.checked) {
      this.congSelected.push(item);
      if (this.congSelected.length !== 1) {
        this.filterAndSumByCongregation(this.congSelected);
      } else {
        console.log('Relatório Analítico Completo da Congregação');
        this.dataReceitasByArray = this.dataReceitas.filter((el: any) => {
          return this.congSelected.includes(el.cong);
        });
        console.log(this.dataReceitasByArray);
      }
    } else {
      const index = this.congSelected.indexOf(item);
      if (index >= 0) {
        this.congSelected.splice(index, 1);
      }
    }
    console.log(this.congSelected.length);
  }

  handleAreaSelection(event: any): void {
    this.option = event.value;
  }

  exists(item: string) {
    return this.congSelected.indexOf(item) > -1;
  };

  isIndeterminate() {
    return (this.congSelected.length > 0 && !this.isChecked());
  };

  isChecked() {
    return this.congSelected.length === this.congregations.length;
  };

  toggleAll(event: MatCheckboxChange) {
    if (event.checked) {
      this.congSelected = [];
      this.congregations.forEach(row => {
        this.congSelected.push(row);
      });
      this.dataSourceDespesa.data = [];
      this.dataSourceReceita.data = [];
      this.filterAndSumByCongregation(this.congSelected);
    } else {
      this.congSelected = [];
      this.dataSourceReceita.data = [];
      this.dataReceitasFiltered.length = 0;
      this.dataSourceDespesa.data = [];
      this.dataDespesasFiltered.length = 0;
    }
  }

  downloadPdf() {
    let prepare: any = [];

    if (this.sumTotal) {
      let totalValue = 0;
      
    this.dataReceitasFiltered.forEach((e: any) => {      
      let tempObj: any = [];
      const parsedValue = parseFloat(e.valor);
      totalValue += parsedValue;
      const formattedValue = parsedValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
      tempObj.push(e.congregation);
      tempObj.push(moment(e.data_lan).format('MM'));
      tempObj.push(formattedValue);
      prepare.push(tempObj);
    });

    autoTable(this.doc, {
      head: [['CONGREGAÇÃO', 'MÊS', 'VALOR']],
      body: prepare,
    });

    this.doc.save('RelatórioAnalíticoGeral.pdf');
    }

    /*let dataReceitasTC = this.dataReceitas.filter((e: any) => e.cong === "TEMPLO CENTRAL");    
        dataReceitasTC.forEach((e: any) => {
          var tempObj = [];
          const parsedValue = parseFloat(e.valor);
          const formattedValue = parsedValue.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'});
          tempObj.push(e.cong);
          tempObj.push(new Date(e.data_lan).toISOString().slice(0,10));
          tempObj.push(formattedValue);
          prepare.push(tempObj);
        }) */
  }
}
