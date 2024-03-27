import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { Congregation } from '../..//enums/congregation.enum';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import moment from 'moment';
import { ComunicationService } from 'src/app/services/comunication.service';
import { Outflows } from 'src/app/enums/outflows.enum';

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

  dataSourceDespesa = new MatTableDataSource();
  dataSourceReceita = new MatTableDataSource();

  displayedColumnsIn: string[] = []
  displayedColumnsOut: string[] = []

  congregations = Object.values(Congregation);

  outflows = Object.values(Outflows);

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

  areas = ['TC', '1', '2', '3', '4', '5', '6', '7', '8']

  dataReceitas: any = [];
  dataDespesas: any = [];

  option: number = 0;
  clicked: number = 0;

  despesasPerCong: any = [];
  receitasPerCong: any = [];

  dataDespesasFiltered: any = [];
  dataReceitasFiltered: any = [];

  congSelected: string[] = [];
  sumTotal: boolean = false;
  filterByArea: boolean = false;
  outflowCenter: string = '';
  file_name_out!: string;
  file_name_in!: string;

  constructor(
    private commService: ComunicationService,
  ) { }

  ngOnInit(): void {
    this.commService.despesasList$.subscribe(
      {
        next: (data) => {
          this.dataDespesas = data.filter((el: any) => moment(el.data_lan).month() === 1)
        },
        error: (err) => console.log(err),
      }
    )

    this.commService.receitasList$.subscribe(
      {
        next: (data) => {
          this.dataReceitas = data.filter((el: any) => moment(el.data_lan).month() === 1);
        },
        error: (err) => console.log(err),
      }
    )
  }

  handleSumTotal() {
    this.sumTotal = !this.sumTotal;
    console.log('É pra somar tudo?', this.sumTotal);
    this.clicked += 1;
    if (this.clicked === 1) {
      //this.getSumTotal();
    }
  }


  handleCustoSelection(event: any) {
    this.outflowCenter = event.value
    this.dataSourceDespesa.data = [];
    this.dataSourceReceita.data = [];
    this.dataReceitasFiltered = [];
    this.dataDespesasFiltered = [];
    this.despesasTotal(this.outflowCenter);
  }

  handleSumByArea() {
    this.filterByArea = !this.filterByArea;
    this.dataSourceDespesa.data = [];
    this.dataSourceReceita.data = [];
    this.dataReceitasFiltered = [];
    this.dataDespesasFiltered = [];
  }

  getSumTotal(array: any): void {
    this.receitasPerCong.length = 0;
    this.despesasPerCong.length = 0;
    let totalReceitas = 0;
    let totalDespesas = 0;

    array.forEach((cong: any) => {
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
      totalReceitas += obj.valor
    });

    this.dataDespesasFiltered.forEach((obj: any) => {
      totalDespesas += obj.valor
    });

    this.dataReceitasFiltered.push({ congregation: 'TOTAL GERAL', mes: '', valor: totalReceitas });
    this.dataDespesasFiltered.push({ congregation: 'TOTAL GERAL', mes: '', valor: totalDespesas });

    this.dataSourceDespesa.data = this.dataDespesasFiltered;
    this.dataSourceReceita.data = this.dataReceitasFiltered;
  }

  filterAndSumByArea(area: any): void {
    this.receitasPerCong.length = 0;
    this.despesasPerCong.length = 0;
    let totalDespesas = 0;
    let totalReceitas = 0;
    this.dataDespesasFiltered = [];
    this.dataReceitasFiltered = [];

    area.forEach((cong: any) => {
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
      totalReceitas += obj.valor
    });

    this.dataDespesasFiltered.forEach((obj: any) => {
      totalDespesas += obj.valor
    });

    this.dataReceitasFiltered.push({ congregation: 'TOTAL GERAL', mes: '', valor: totalReceitas });
    this.dataDespesasFiltered.push({ congregation: 'TOTAL GERAL', mes: '', valor: totalDespesas });

    this.dataSourceDespesa.data = this.dataDespesasFiltered;
    this.dataSourceReceita.data = this.dataReceitasFiltered;
  }

  receitasByCong(array: any): void {
    let congName = '';
    let month = null;
    let totalValue = 0;
    let entrada = '';

    array.forEach((obj: any) => {
      congName = obj.cong;
      month = moment(obj.data_lan).format('MM');
      this.dataReceitasFiltered.push({ mes: month, recibo: obj.recibo, congregation: congName, entrada: obj.entrada, dizimista: obj.dizimista, obs: obj.historico, valor: obj.valor })
    });

    this.file_name_in = `REATÓRIO ANALÍTICO DE ENTRADAS - ${congName}`

    this.dataReceitasFiltered.forEach((obj: any) => {
      let valor = parseFloat(obj.valor)
      totalValue += valor
    });

    this.dataReceitasFiltered.push({ mes: '', recibo: '', congregation: 'TOTAL GERAL', entries: '', dizimista: '', obs: '', valor: totalValue });
    console.log(this.dataReceitasFiltered);

    this.dataSourceReceita.data = this.dataReceitasFiltered;
  }

  despesasByCong(array: any): void {
    let congName = '';
    let month = null;
    let totalValue = 0;

    array.forEach((obj: any) => {
      congName = obj.cong;
      month = moment(obj.data_lan).format('MM');
      this.dataDespesasFiltered.push({ mes: month, recibo: obj.recibo, congregation: congName, saida: obj.saida, tipo_doc: obj.tipo_doc, obs: obj.obs, valor: obj.valor })
    });

    
    this.file_name_out = `RELATÓRIO ANALÍTICO DE SAìDAS - ${congName}`

    this.dataDespesasFiltered.forEach((obj: any) => {
      let valor = parseFloat(obj.valor)
      totalValue += valor
    });
    console.log(this.dataDespesasFiltered);
    this.dataDespesasFiltered.push({ mes: '', recibo: '', congregation: 'TOTAL GERAL', saida: '', tipo_doc: '', obs: '', valor: totalValue });
    this.dataSourceDespesa.data = this.dataDespesasFiltered;
  }

  getDizimistas() {
    let congName = '';
    let month = null;
    let totalValue = 0;
    this.file_name_in = `RELATÓRIO GERAL DE RECEITAS - DÌZIMO OBREIROS`

    let dizimistasList = this.dataReceitas.filter((el: any) => el.entrada === "ENTRADA DÍZIMO OBREIRO");
    dizimistasList.filter((el: any) => { moment(el.data_lan).month() === 1 })

    dizimistasList.forEach((obj: any) => {
      congName = obj.cong;
      month = moment(obj.data_lan).format('MM');
      console.log(month);
      this.dataReceitasFiltered.push({ mes: month, congregation: congName, dizimista: obj.dizimista })
    });

    this.dataReceitasFiltered.forEach((obj: any) => {
      let valor = parseFloat(obj.valor)
      totalValue += valor
    });

    this.displayedColumnsIn = ['mes', 'congregation', 'dizimista']

    this.dataSourceReceita.data = this.dataReceitasFiltered;
  }

  despesasTotal(tipoDespesa: string): void {
    this.file_name_out = `RELATÓRIO GERAL DE DESPESAS - ${tipoDespesa}`
    let congName = '';
    let month = null;
    let totalValue = 0;

    this.dataDespesas.forEach((obj: any) => {
      congName = obj.cong;
      month = moment(obj.data_lan).format('MM');
      this.dataDespesasFiltered.push({ mes: month, recibo: obj.recibo, congregation: congName, outflow: obj.saida, tipo: obj.tipo_doc, obs: obj.obs, valor: obj.valor })
    });

    this.dataDespesasFiltered.forEach((obj: any) => {
      let valor = parseFloat(obj.valor)
      totalValue += valor
    });

    this.dataDespesasFiltered.push({ mes: '', recibo: '', congregation: 'TOTAL GERAL', outflow: '', tipo: '', obs: '', valor: totalValue });
    // mes: month, recibo: obj.recibo, congregation: congName, outflow: obj.saida, dizimista: obj.dizimista, obs: obj.obs, valor: obj.valor
    this.displayedColumnsIn = ['mes', 'recibo', 'congregation', 'entrada', 'dizimista', 'obs', 'valor']

    // mes: month, recibo: obj.recibo, congregation: congName, outflow: obj.saida, dizimista: obj.dizimista, obs: obj.obs, valor: obj.valor
    this.displayedColumnsOut = ['mes', 'recibo', 'congregation', 'saida', 'tipo_doc', 'obs', 'valor']

    this.dataSourceDespesa.data = this.dataDespesasFiltered;
    console.log(this.dataSourceDespesa.data);
  }

  handleToogle(item: string, event: MatCheckboxChange): void {
    this.receitasPerCong.length = 0;
    this.despesasPerCong.length = 0;
    this.dataReceitasFiltered.length = 0;
    this.dataDespesasFiltered.length = 0;

    if (event.checked) {
      this.congSelected.push(item);
      if (this.congSelected.length !== 1) {
        this.getSumTotal(this.congSelected);
      } else {
        console.log('Relatório Analítico Completo da Congregação');
        let receitasByCong = this.dataReceitas.filter((el: any) => {
          return this.congSelected.includes(el.cong);
        });

        let despesasByCong = this.dataDespesas.filter((el: any) => {
          return this.congSelected.includes(el.cong);
        })
        this.receitasByCong(receitasByCong);
        this.despesasByCong(despesasByCong);
        // mes: month, recibo: obj.recibo, congregation: congName, outflow: obj.saida, dizimista: obj.dizimista, obs: obj.obs, valor: obj.valor
        this.displayedColumnsIn = ['mes', 'recibo', 'congregation', 'entrada', 'dizimista', 'obs', 'valor']

        // mes: month, recibo: obj.recibo, congregation: congName, outflow: obj.saida, dizimista: obj.dizimista, obs: obj.obs, valor: obj.valor
        this.displayedColumnsOut = ['mes', 'recibo', 'congregation', 'saida', 'tipo_doc', 'obs', 'valor']
      }
    } else {
      const index = this.congSelected.indexOf(item);
      if (index >= 0) {
        this.congSelected.splice(index, 1);
      }
      this.getSumTotal(this.congSelected);
    }
  }

  handleAreaSelection(event: any): void {
    this.option = event.value;
    console.log(this.option);
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
      console.log('SELECIONEI TUDO, FAZ ALGUMA COISA...')
      this.congSelected = [];
      if (this.filterByArea) {
        this.areaMapping[this.option].forEach(el => this.congSelected.push(el));
        this.dataSourceDespesa.data = [];
        this.dataSourceReceita.data = [];
        this.filterAndSumByArea(this.congSelected);
      }
      if (this.sumTotal) {
        this.congregations.forEach(el => this.congSelected.push(el));
        this.dataSourceDespesa.data = [];
        this.dataSourceReceita.data = [];
        console.log('CONGREGACOES SELECIONADAS: ', this.congSelected);
        this.despesasTotal(this.outflowCenter);
      }
    } else {
      this.congSelected = [];
      this.dataSourceReceita.data = [];
      this.dataReceitasFiltered.length = 0;
      this.dataSourceDespesa.data = [];
      this.dataDespesasFiltered.length = 0;
    }
  }

  downloadPdf() {
    var docIn = new jsPDF({
      orientation: "landscape",
      unit: "cm",
      format: 'a4'
    });

    var docOut = new jsPDF({
      orientation: "landscape",
      unit: "cm",
      format: 'a4'
    });

    let prepareIn: any = [];
    let prepareOut: any = [];
    // ['mes', 'congregation', 'dizimista']
    // this.displayedColumns = ['mes', 'recibo', 'congregation', 'entrada', 'dizimista', 'obs', 'valor']
    // mes: month, recibo: obj.recibo, congregation: congName, outflow: obj.saida, dizimista: obj.dizimista, obs: obj.obs, valor: obj.valor

    this.dataReceitasFiltered.forEach((e: any) => {
      let tempObj: any = [];
      const parsedValue = parseFloat(e.valor);
      const formattedValue = parsedValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
      tempObj.push(e.mes);
      tempObj.push(e.recibo);
      tempObj.push(e.congregation);
      tempObj.push(e.entrada);
      tempObj.push(e.dizimista);
      tempObj.push(e.obs);
      tempObj.push(formattedValue);
      prepareIn.push(tempObj);
    });

    this.dataDespesasFiltered.forEach((e: any) => {
      let tempObj: any = [];
      const parsedValue = parseFloat(e.valor);
      const formattedValue = parsedValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
      tempObj.push(e.mes);
      tempObj.push(e.recibo);
      tempObj.push(e.congregation);
      tempObj.push(e.saida);
      tempObj.push(e.tipo_doc);
      tempObj.push(e.obs);
      tempObj.push(formattedValue);
      prepareOut.push(tempObj);
    });

    const setHeaderPageConfigIn = (data: any) => {
      data.settings.margin.top = 0.5;
      if (data.pageNumber === 1) {
        docIn.setFontSize(12); // Adjust font size as needed
        docIn.text(this.file_name_in, docIn.internal.pageSize.getWidth() / 2, 1, { align: 'center' }); // Adjust text position as needed
      } else {
      }
    };

    const setHeaderPageConfigOut = (data: any) => {
      data.settings.margin.top = 0.5;
      if (data.pageNumber === 1) {
        docOut.setFontSize(12); // Adjust font size as needed
        docOut.text(this.file_name_out, docOut.internal.pageSize.getWidth() / 2, 1, { align: 'center' }); // Adjust text position as needed
      } else {
      }
    };

    autoTable(docIn, {
      // ['mes', 'recibo', 'congregation', 'entrada', 'dizimista', 'obs', 'valor']
      head: [['MÊS', 'RECIBO', 'CONGREGAÇÃO', 'ENTRADA', 'DIZIMISTA', 'HISTORICO', 'VALOR']],
      body: prepareIn,
      styles: { fontSize: 6 },
      margin: { top: 1.2, left: 0.5, bottom: 0.5, right: 0.5 },
      willDrawPage: (data) => setHeaderPageConfigIn(data)
    });

    autoTable(docOut, {
      // ['mes', 'recibo', 'congregation', 'entrada', 'dizimista', 'obs', 'valor']
      head: [['MÊS', 'RECIBO', 'CONGREGAÇÃO', 'SAÍDA', 'TIPO DOC.', 'HISTORICO', 'VALOR']],
      body: prepareOut,
      styles: { fontSize: 6 },
      margin: { top: 1.2, left: 0.5, bottom: 0.5, right: 0.5 },
      willDrawPage: (data) => setHeaderPageConfigOut(data)
    });

    docIn.save(`${this.file_name_in}.pdf`);
    docOut.save(`${this.file_name_out}.pdf`);
  }
}
