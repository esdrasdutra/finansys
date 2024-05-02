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
  CONGREGATIONS = Object.values(Congregation);

  AREAMAPPING: { [key: string]: Congregation[] } = {
    'TC': [this.CONGREGATIONS[36]],
    '1': [this.CONGREGATIONS[5], this.CONGREGATIONS[13], this.CONGREGATIONS[25], this.CONGREGATIONS[12], this.CONGREGATIONS[8]],
    '2': [this.CONGREGATIONS[19], this.CONGREGATIONS[23], this.CONGREGATIONS[18]],
    '3': [this.CONGREGATIONS[30], this.CONGREGATIONS[4], this.CONGREGATIONS[24], this.CONGREGATIONS[21]],
    '4': [this.CONGREGATIONS[27], this.CONGREGATIONS[28], this.CONGREGATIONS[3], this.CONGREGATIONS[26], this.CONGREGATIONS[1]],
    '5': [this.CONGREGATIONS[17], this.CONGREGATIONS[2], this.CONGREGATIONS[16], this.CONGREGATIONS[15]],
    '6': [this.CONGREGATIONS[9], this.CONGREGATIONS[20], this.CONGREGATIONS[22], this.CONGREGATIONS[14], this.CONGREGATIONS[31], this.CONGREGATIONS[35]],
    '7': [this.CONGREGATIONS[0], this.CONGREGATIONS[29], this.CONGREGATIONS[33], this.CONGREGATIONS[11], this.CONGREGATIONS[7]],
    '8': [this.CONGREGATIONS[32], this.CONGREGATIONS[6], this.CONGREGATIONS[10], this.CONGREGATIONS[34]],
  }

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

  reportIn!: jsPDF;
  reportOut!: jsPDF;
  prepareIn: any = [];
  prepareOut: any = [];

  outflows = Object.values(Outflows);

  areas = ['TC', '1', '2', '3', '4', '5', '6', '7', '8']

  dataReceitas: any = [];
  dataDespesas: any = [];

  option: number = 0;
  clicked: number = 0;

  currentMonth = moment().month();
  prevMonth = moment().add(-1, 'months').month();

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
  dirigentes: boolean = false;

  constructor(
    private commService: ComunicationService,
  ) { }

  ngOnInit(): void {
    this.commService.setAreaMapping(this.AREAMAPPING);

    this.commService.despesasList$.subscribe(
      {
        next: (data) => {
          this.dataDespesas = data.filter((el: any) => moment(el.data_lan).month() === this.prevMonth) //|| moment(el.data_lan).month() === 3)
        },
        error: (err) => console.log(err),
      }
    )

    this.commService.receitasList$.subscribe(
      {
        next: (data) => {
          this.dataReceitas = data.filter((el: any) => moment(el.data_lan).month() === this.prevMonth) //|| moment(el.data_lan).month() === 3);
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

  handleDizimoDirigentes() {
    this.dataSourceDespesa.data = [];
    this.dataSourceReceita.data = [];
    this.dataReceitasFiltered = [];
    this.dataDespesasFiltered = [];
    this.dirigentes = !this.dirigentes;
    console.log('10% dos dirigentes?', this.dirigentes);

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
    this.file_name_in = `REATÓRIO ANALÍTICO DE ENTRADAS - TOTAL GERAL`

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
        month = moment(res.data_lan).format('MM');
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
        month = moment(res.data_lan).format('MM');
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

    this.reportIn = new jsPDF({
      orientation: "portrait",
      unit: "cm",
      format: 'a4'
    });

    this.dataReceitasFiltered.forEach((e: any) => {
      let tempObj = [];
      const parsedValue = parseFloat(e.valor);
      const formattedValue = parsedValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
      tempObj.push(e.mes);
      tempObj.push(e.congregation);
      tempObj.push(formattedValue);
      this.prepareIn.push(tempObj);
    });

    const setHeaderPageConfigIn = (data: any) => {
      data.settings.margin.top = 0.5;
      if (data.pageNumber === 1) {
        this.reportIn.setFontSize(12); // Adjust font size as needed
        this.reportIn.text(this.file_name_in, this.reportIn.internal.pageSize.getWidth() / 2, 1, { align: 'center' }); // Adjust text position as needed
      }
    };

    autoTable(this.reportIn, {
      head: [['MÊS', 'CONGREGAÇÃO', 'VALOR']],
      body: this.prepareIn,
      styles: { fontSize: 7 },
      margin: { top: 1.2, left: 0.5, bottom: 0.5, right: 0.5 },
      willDrawPage: (data) => setHeaderPageConfigIn(data)
    });

    this.displayedColumnsIn = ['mes', 'congregation', 'valor'];

    // this.reportIn.save(`${this.file_name_in}.pdf`);

    this.dataSourceDespesa.data = this.dataDespesasFiltered;
    this.dataSourceReceita.data = this.dataReceitasFiltered;
  }

  getDizimoDirigentes(array: any): void {
    this.dataSourceDespesa.data = [];
    this.dataSourceReceita.data = [];
    this.dataReceitasFiltered = [];
    this.dataDespesasFiltered = [];

    this.file_name_in = `REATÓRIO ANALÍTICO DE ENTRADAS - 10% (DIRIGENTES)`

    this.receitasPerCong.length = 0;
    this.despesasPerCong.length = 0;
    let totalReceitas = 0;
    let totalDespesas = 0;
    // console.log(this.dataReceitas.filter((el: any) => el.entrada === 'ENTRADA OFERTA AVULSA'));

    this.dataReceitas = this.dataReceitas.filter((el: any) => el.entrada !== 'ENTRADA OFERTA AVULSA');
 
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
        month = moment(res.data_lan).format('MM');
      });
      this.dataDespesasFiltered.push({ congregation: congName, mes: month, valor: valueTemp, })
    });

    this.receitasPerCong.forEach((cong: any) => {
      let valueTemp = 0;
      let ofertaAvulsaTotal = 0;
      let congName = '';
      let month = null;
      cong.forEach((res: any) => {
        valueTemp += Number.parseFloat(res.valor)
        congName = res.cong
        month = moment(res.data_lan).format('MM');
        if (res.entrada === 'ENTRADA OFERTA AVULSA') {
          ofertaAvulsaTotal = Number.parseFloat(res.valor);
        }
      })
      this.dataReceitasFiltered.push({ congregation: congName, mes: month, valor: valueTemp })
      console.log(ofertaAvulsaTotal);
    });

    this.dataReceitasFiltered.forEach((obj: any) => {
      totalReceitas += obj.valor
    });

    this.dataDespesasFiltered.forEach((obj: any) => {
      totalDespesas += obj.valor
    });

    this.dataReceitasFiltered.push({ congregation: 'TOTAL GERAL', mes: '', valor: totalReceitas });
    this.dataDespesasFiltered.push({ congregation: 'TOTAL GERAL', mes: '', valor: totalDespesas });

    this.reportIn = new jsPDF({
      orientation: "portrait",
      unit: "cm",
      format: 'a4'
    });

    this.dataReceitasFiltered.forEach((e: any) => {
      let tempObj = [];
      const parsedValue = parseFloat(e.valor);
      const formattedValue = parsedValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
      tempObj.push(e.mes);
      tempObj.push(e.congregation);
      tempObj.push(formattedValue);
      this.prepareIn.push(tempObj);
    });

    const setHeaderPageConfigIn = (data: any) => {
      data.settings.margin.top = 0.5;
      if (data.pageNumber === 1) {
        this.reportIn.setFontSize(12); // Adjust font size as needed
        this.reportIn.text(this.file_name_in, this.reportIn.internal.pageSize.getWidth() / 2, 1, { align: 'center' }); // Adjust text position as needed
      }
    };

    autoTable(this.reportIn, {
      head: [['MÊS', 'CONGREGAÇÃO', 'VALOR']],
      body: this.prepareIn,
      styles: { fontSize: 7 },
      margin: { top: 1.2, left: 0.5, bottom: 0.5, right: 0.5 },
      willDrawPage: (data) => setHeaderPageConfigIn(data)
    });

    this.displayedColumnsIn = ['mes', 'congregation', 'valor'];

    // this.reportIn.save(`${this.file_name_in}.pdf`);
    console.log(this.dataReceitasFiltered);

    this.dataSourceDespesa.data = this.dataDespesasFiltered;
    this.dataSourceReceita.data = this.dataReceitasFiltered;
  }

  filterAndSumByArea(area: any): void {
    this.file_name_in = `REATÓRIO ANALÍTICO DE ENTRADAS - ÁREA ${this.option}`

    this.receitasPerCong.length = 0;
    this.despesasPerCong.length = 0;
    let totalDespesas = 0;
    let totalReceitas = 0;
    this.dataDespesasFiltered = [];
    this.dataReceitasFiltered = [];

    area.forEach((cong: any) => {
      this.receitasPerCong.push(
        this.dataReceitas.filter((el: any) => {
          return el.cong === cong
        }),
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
        console.log(res.data_lan);
        month = moment(res.data_lan).format('MM');
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
        month = moment(res.data_lan).format('MM');
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

    this.reportIn = new jsPDF({
      orientation: "portrait",
      unit: "cm",
      format: 'a4'
    })

    this.dataReceitasFiltered.forEach((e: any) => {
      let tempObj = [];
      const parsedValue = parseFloat(e.valor);
      const formattedValue = parsedValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
      tempObj.push(e.mes);
      tempObj.push(e.congregation);
      tempObj.push(formattedValue);
      this.prepareIn.push(tempObj);
    });

    const setHeaderPageConfigIn = (data: any) => {
      data.settings.margin.top = 0.5;
      if (data.pageNumber === 1) {
        this.reportIn.setFontSize(12); // Adjust font size as needed
        this.reportIn.text(this.file_name_in, this.reportIn.internal.pageSize.getWidth() / 2, 1, { align: 'center' }); // Adjust text position as needed
      }
    };

    autoTable(this.reportIn, {
      head: [['MÊS', 'CONGREGAÇÃO', 'VALOR']],
      body: this.prepareIn,
      styles: { fontSize: 7 },
      margin: { top: 1.2, left: 0.5, bottom: 0.5, right: 0.5 },
      willDrawPage: (data) => setHeaderPageConfigIn(data)
    });

    this.displayedColumnsIn = ['mes', 'congregation', 'valor'];
    this.displayedColumnsOut = ['mes', 'congregation', 'valor'];

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

    console.log( this.dataReceitasFiltered);

    this.reportIn = new jsPDF({
      orientation: "landscape",
      unit: "cm",
      format: 'a4'
    });

    //'mes', 'recibo', 'congregation', 'entrada', 'dizimista', 'obs', 'valor'

    this.dataReceitasFiltered.forEach((obj: any) => {
      let valor = parseFloat(obj.valor)
      totalValue += valor
    });

    this.dataReceitasFiltered.push({ mes: '', recibo: '', congregation: 'TOTAL GERAL', entrada: '', dizimista: '', obs: '', valor: totalValue });

    this.dataSourceReceita.data = this.dataReceitasFiltered;

    this.dataReceitasFiltered.forEach((e: any) => {
      let tempObj = [];
      const parsedValue = parseFloat(e.valor);
      const formattedValue = parsedValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
      tempObj.push(e.mes);
      tempObj.push(e.recibo);
      tempObj.push(e.congregation);
      tempObj.push(e.entrada);
      tempObj.push(e.dizimista);
      tempObj.push(e.obs);
      tempObj.push(formattedValue);
      this.prepareIn.push(tempObj);
    });

    const setHeaderPageConfigIn = (data: any) => {
      data.settings.margin.top = 0.5;
      if (data.pageNumber === 1) {
        this.reportIn.setFontSize(12); // Adjust font size as needed
        this.reportIn.text(this.file_name_in, this.reportIn.internal.pageSize.getWidth() / 2, 1, { align: 'center' }); // Adjust text position as needed
      }
    };

    autoTable(this.reportIn, {
      head: [['MÊS', 'RECIBO', 'CONGREGAÇÃO', 'ENTRADA', 'DIZIMISTA', 'OBS:.', 'VALOR']],
      body: this.prepareIn,
      styles: { fontSize: 7 },
      margin: { top: 1.2, left: 0.5, bottom: 0.5, right: 0.5 },
      willDrawPage: (data) => setHeaderPageConfigIn(data)
    });
    // this.reportIn.save(`${this.file_name_in}.pdf`);
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


    this.file_name_out = `RELATÓRIO ANALÍTICO DE SAÍDAS - ${congName}`;

    this.dataDespesasFiltered.forEach((obj: any) => {
      let valor = parseFloat(obj.valor)
      totalValue += valor
    });
    this.dataDespesasFiltered.push({ mes: '', recibo: '', congregation: 'TOTAL GERAL', saida: '', tipo_doc: '', obs: '', valor: totalValue });

    this.dataDespesasFiltered.forEach((e: any) => {
      let tempObj = [];
      const parsedValue = parseFloat(e.valor);
      const formattedValue = parsedValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
      tempObj.push(e.mes);
      tempObj.push(e.recibo);
      tempObj.push(e.congregation);
      tempObj.push(e.entrada);
      tempObj.push(e.dizimista);
      tempObj.push(e.obs);
      tempObj.push(formattedValue);
      this.prepareIn.push(tempObj);
    });

    //this.reportOut.save(`${this.file_name_out}.pdf`);

    this.dataSourceDespesa.data = this.dataDespesasFiltered;
  }


  getDizimistas() {
    const novaLista = [];
    this.file_name_in = `RELATÓRIO GERAL - DÍZIMO OBREIROS`
    let dizimistasList = this.dataReceitas.filter((el: any) => el.entrada === "ENTRADA DÍZIMO OBREIRO");
    const congregationMap: any = {};

    for (const area of Object.keys(this.AREAMAPPING)) {
      for (const congregation of this.AREAMAPPING[area]) {
        congregationMap[congregation] = congregationMap[congregation] || [];
      }
    }

    for (const lancamento of dizimistasList) {
      const congregacao = lancamento.cong;
      const dizimista = congregationMap[congregacao].find(
        (d: any) => d.nome === lancamento.dizimista
      );

      if (!dizimista) {
        congregationMap[congregacao].push({
          nome: lancamento.dizimista,
          valorTotal: lancamento.valor,
          recibos: [lancamento.recibo],
        });
      } else {
        dizimista.valorTotal += lancamento.valor;
        dizimista.recibos.push(lancamento.recibo);
      }
    }

    for (const area of Object.keys(this.AREAMAPPING)) {
      const congregacoes = [];

      for (const congregation of this.AREAMAPPING[area]) {
        congregacoes.push({
          nome: congregation,
          dizimistas: congregationMap[congregation].sort((a: any, b: any) => b.valorTotal - a.valorTotal),
        });
      }

      novaLista.push({
        area,
        congregacoes,
      });
    }

    for (const area of novaLista) {
      for (const congregacao of area.congregacoes) {
        for (const dizimista of congregacao.dizimistas) {
          if (dizimista.nome) {
            this.dataReceitasFiltered.push({
              mes: '03',
              dizimista: dizimista.nome,
              congregation: congregacao.nome,
            });
          }
        }
      }
    }

    this.reportIn = new jsPDF({
      orientation: "portrait",
      unit: "cm",
      format: 'a4'
    })

    this.dataReceitasFiltered.forEach((e: any) => {
      let tempObj = [];
      const parsedValue = parseFloat(e.valor);
      const formattedValue = parsedValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
      tempObj.push(e.mes);
      tempObj.push(e.congregation);
      tempObj.push(e.dizimista);
      this.prepareIn.push(tempObj);
    });

    const setHeaderPageConfigIn = (data: any) => {
      data.settings.margin.top = 0.5;
      if (data.pageNumber === 1) {
        this.reportIn.setFontSize(12); // Adjust font size as needed
        this.reportIn.text(this.file_name_in, this.reportIn.internal.pageSize.getWidth() / 2, 1, { align: 'center' }); // Adjust text position as needed
      }
    };

    autoTable(this.reportIn, {
      head: [['MÊS', 'CONGREGAÇÃO', 'DIZIMISTA']],
      body: this.prepareIn,
      styles: { fontSize: 7 },
      margin: { top: 1.2, left: 0.5, bottom: 0.5, right: 0.5 },
      willDrawPage: (data) => setHeaderPageConfigIn(data)
    });

    this.reportIn.save(`${this.file_name_in}.pdf`);

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
      this.dataDespesasFiltered.push({ mes: month, recibo: obj.recibo, congregation: congName, saida: obj.saida, tipo: obj.tipo_doc, obs: obj.obs, valor: obj.valor })
    });

    this.dataDespesasFiltered = this.dataDespesasFiltered.filter((el: any) => el.saida === tipoDespesa)

    this.dataDespesasFiltered.forEach((obj: any) => {
      let valor = parseFloat(obj.valor)
      totalValue += valor
    });

    this.dataDespesasFiltered.push({ mes: '', recibo: '', congregation: 'TOTAL GERAL', saida: '', tipo: '', obs: '', valor: totalValue });
    // mes: month, recibo: obj.recibo, congregation: congName, saida: obj.saida, dizimista: obj.dizimista, obs: obj.obs, valor: obj.valor
    this.displayedColumnsIn = ['mes', 'recibo', 'congregation', 'entrada', 'dizimista', 'obs', 'valor']

    // mes: month, recibo: obj.recibo, congregation: congName, outflow: obj.saida, dizimista: obj.dizimista, obs: obj.obs, valor: obj.valor
    this.displayedColumnsOut = ['mes', 'recibo', 'congregation', 'saida', 'tipo_doc', 'obs', 'valor']

    this.dataSourceDespesa.data = this.dataDespesasFiltered;
  }

  handleToogle(event: Event, index: number): void {
    const checkbox = event.target as HTMLInputElement;
    const congregation = this.CONGREGATIONS[index];

    this.receitasPerCong.length = 0;
    this.despesasPerCong.length = 0;
    this.dataReceitasFiltered.length = 0;
    this.dataDespesasFiltered.length = 0;

    if (checkbox.checked) {
      this.congSelected.push(congregation);
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
      console.log(this.congSelected);
    } else {
      const indexToRemove = this.congSelected.indexOf(congregation);
      if (indexToRemove >= 0) {
        this.congSelected.splice(indexToRemove, 1);
        console.log(this.congSelected);
      }
      //this.getSumTotal(this.congSelected);
    }
  }

  handleAreaSelection(event: any): void {
    this.congSelected = [];
    this.option = event.value;
    this.AREAMAPPING[this.option].forEach(el => this.congSelected.push(el));
    this.dataSourceDespesa.data = [];
    this.dataSourceReceita.data = [];
    this.filterAndSumByArea(this.congSelected);
  }

  toggleAll(event: MatCheckboxChange) {
    if (event.checked) {
      console.log('SELECIONEI TUDO, FAZ ALGUMA COISA...');
      this.congSelected = [];

      if (this.sumTotal) {
        this.CONGREGATIONS.forEach(el => this.congSelected.push(el));
        this.dataSourceDespesa.data = [];
        this.dataSourceReceita.data = [];
        console.log('CONGREGACOES SELECIONADAS: ', this.congSelected);
        // this.getSumTotal(this.congSelected);

        if (this.dirigentes) {
          this.congSelected = [];
          this.CONGREGATIONS.forEach(el => this.congSelected.push(el));
          this.dataSourceDespesa.data = [];
          this.dataSourceReceita.data = [];
          console.log('CONGREGACOES SELECIONADAS: ', this.congSelected);
          this.getDizimoDirigentes(this.congSelected);
        }
      }

    } else {
      this.congSelected = [];
      this.dataSourceReceita.data = [];
      this.dataReceitasFiltered.length = 0;
      this.dataSourceDespesa.data = [];
      this.dataDespesasFiltered.length = 0;
    }
  }  

  exists(item: string) {
    return this.congSelected.indexOf(item) > -1;
  };

  isIndeterminate() {
    return (this.congSelected.length > 0 && !this.isChecked());
  };

  isChecked() {
    return this.congSelected.length === this.CONGREGATIONS.length;
  };

  downloadPdf() {
    this.reportIn.save(`${this.file_name_in}.pdf`)
  }
}
