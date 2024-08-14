import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ComunicationService } from 'src/app/services/comunication.service';
import { Outflows } from 'src/app/enums/outflows.enum';
import { AREAMAPPING, AREAS, COLUMNMAPPING, CONGREGATIONS, FILTROS, MESES} from 'src/app/entities/relatorios/relatorios';
import { RelatorioAnalitico } from 'src/app/entities/relatorios/relatorios';
import moment from 'moment';
import { Lancamento } from 'src/app/models/Lancamento';
import { LancamentoAddComponent } from 'src/app/components/lancamento-add/lancamento-add.component';

@Component({
  selector: 'app-relatorios',
  templateUrl: './relatorios.component.html',
  styleUrls: ['./relatorios.component.sass']
})
export class RelatoriosComponent implements OnInit {
  areaMapping = AREAMAPPING;
  congregations = CONGREGATIONS;
  columnMapping = COLUMNMAPPING;
  areas = AREAS;
  filtros = FILTROS;
  meses = MESES;
  
  relatorio = new RelatorioAnalitico();
  dataSourceDespesa!: MatTableDataSource<any>;
  dataSourceReceita!: MatTableDataSource<any>;

  displayedColumnsIn: string[] = []
  displayedColumnsOut: string[] = []

  reportIn!: jsPDF;
  reportOut!: jsPDF;
  prepareIn: any = [];
  prepareOut: any = [];

  outflows = Object.values(Outflows);

  dataReceitas: any = [];
  dataDespesas: any = [];

  option: number = 0;
  clicked: number = 0;

  currentMonth = moment().month();
  prevMonth = moment().add(-1, 'months').month();

  despesasPerCong: Lancamento[] = [];
  receitasPerCong: Lancamento[] = [];

  dataDespesasFiltered: any = [];
  dataReceitasFiltered: any = [];

  congSelected: string[] = [];
  sumTotal: boolean = false;
  filterByArea: boolean = false;
  outflowCenter: string = '';
  file_name_out!: string;
  file_name_in!: string;
  dirigentes: boolean = false;
  selectedMonth: any;

  constructor(
    private commService: ComunicationService,
  ) { }

  ngOnInit(): void {
    this.commService.receitasList$.subscribe(
      {
        next: (data) => {
          this.dataReceitas = data.filter((el: any) => moment(el.data_lan).month() === this.prevMonth);
        },
        error: (err) => console.log(err),
      }
    )

    this.commService.despesasList$.subscribe(
      {
        next: (data) => {
          this.dataDespesas = data.filter((el: any) => moment(el.data_lan).month() === this.prevMonth);
        },
        error: (err) => console.log(err),
      }
    )
  }

  sanitizeTables(){    
    this.dataSourceReceita = new MatTableDataSource<Lancamento[]>;
    this.dataSourceDespesa = new MatTableDataSource<Lancamento[]>;    
    this.dataReceitasFiltered = [];
    this.dataDespesasFiltered = [];
    this.receitasPerCong.length = 0;
    this.despesasPerCong.length = 0;
    this.prepareIn = [];
    this.prepareOut = [];
  }

  handleDizimistas() {
    this.relatorio.getDizimistas(this.dataReceitas);
  }

  handlePeriodo() {
    this.sanitizeTables();
    const results = this.relatorio.getRelatorioPorPeriodo();

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "cm",
      format: 'a4'
    });

    let startY = 1;
    let currentArea = '';

    const setHeaderPageConfigIn = (data: any) => {
      data.settings.margin.top = 1;
      if (data.pageNumber === 1) {
        doc.setFontSize(10);
        doc.text('RELATÓRIO SEMESTRAL DE ENTRADAS', doc.internal.pageSize.getWidth() / 2, 1, { align: 'center' });
      }
    };

      // Gerar o PDF como um Data URL
  const pdfData = doc.output('dataurlstring');

  // Abrir o PDF em uma nova aba
  window.open(pdfData, '_blank');

    //doc.save('RELATÓRIO SEMESTRAL DE ENTRADAS.pdf');

  }

  handleSumTotal() {
    this.sumTotal = !this.sumTotal;
  }

  handleDizimoDirigentes() {
    this.dirigentes = !this.dirigentes;
    console.log('10% dos dirigentes?', this.dirigentes);
    this.sanitizeTables();
    //this.relatorio.getDizimoDirigentes(this.dataReceitas);
    console.log(this.relatorio.getDizimoDirigentes(this.dataReceitas));
  }

  handleCustoSelection(event: any) {
    this.outflowCenter = event.value
    this.despesasTotal(this.outflowCenter);
  }

  handleSumByArea() {
    this.filterByArea = !this.filterByArea;
  }

  getSumTotal(array: any): void {
    this.sanitizeTables();

    this.file_name_in = `REATÓRIO ANALÍTICO DE ENTRADAS - TOTAL GERAL`;
    
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
      styles: { fontSize: 9 },
      margin: { top: 1.2, left: 0.5, bottom: 0.5, right: 0.5 },
      willDrawPage: (data) => setHeaderPageConfigIn(data)
    });

    this.displayedColumnsIn = ['mes', 'congregation', 'valor'];
    this.dataSourceDespesa.data = this.dataDespesasFiltered;
    this.dataSourceReceita.data = this.dataReceitasFiltered;
  }

  getDizimoDirigentes(array: any): void {
    this.sanitizeTables();

    let totalReceitas = 0;
    let totalDespesas = 0;
    
    this.file_name_in = `REATÓRIO ANALÍTICO DE ENTRADAS - 10% (DIRIGENTES)`
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

  filterAndSumByArea(array: any): void {
    this.sanitizeTables();

    this.file_name_in = `REATÓRIO ANALÍTICO DE ENTRADAS - ÁREA ${this.option}`
    let totalDespesas = 0;
    let totalReceitas = 0;

    array.forEach((cong: any) => {
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
      styles: { fontSize: 9 },
      margin: { top: 1.2, left: 0.5, bottom: 0.5, right: 0.5 },
      willDrawPage: (data) => setHeaderPageConfigIn(data)
    });

    this.displayedColumnsIn = ['mes', 'congregation', 'valor'];
    this.displayedColumnsOut = ['mes', 'congregation', 'valor'];

    this.dataSourceDespesa.data = this.dataDespesasFiltered;
    this.dataSourceReceita.data = this.dataReceitasFiltered;
  }

  receitasByCong(array: any, mes: string): void {
    this.sanitizeTables();

    let data = array.filter((obj: Lancamento) => this.meses[moment(obj.data_lan).month()] === mes)

    let congName = '';
    let month = '';
    let totalValue = 0;

    data.forEach((obj: any) => {
      congName = obj.cong;
      month = moment(obj.data_lan).format('MM');
      this.dataReceitasFiltered.push({mes: month, recibo: obj.recibo, congregation: congName, entrada: obj.entrada, dizimista: obj.dizimista, obs: obj.historico, valor: obj.valor});
    });

    this.file_name_in = `REATÓRIO ANALÍTICO DE ENTRADAS - ${congName} / ${mes}`;

    this.dataReceitasFiltered.forEach((obj: any) => {
      let valor = Number.parseFloat(obj.valor)
      totalValue += valor
    });

    this.dataReceitasFiltered.push({ mes: '', recibo: '', congregation: 'TOTAL GERAL', entrada: '', dizimista: '', obs: '', valor: totalValue });
    // mes: month, recibo: obj.recibo, congregation: congName, outflow: obj.saida, dizimista: obj.dizimista, obs: obj.obs, valor: obj.valor
    this.displayedColumnsIn = ['mes', 'recibo', 'congregation', 'entrada', 'dizimista', 'obs', 'valor']

    this.dataSourceReceita.data = this.dataReceitasFiltered;

    this.reportIn = new jsPDF({
      orientation: "landscape",
      unit: "cm",
      format: 'a4'
    });

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
      console.log(parsedValue);
      console.log(formattedValue);      
      this.prepareIn.push(tempObj);
    });   

    const setHeaderPageConfigIn = (data: any) => {
      data.settings.margin.top = 0.5;
      if (data.pageNumber === 1) {
        this.reportIn.setFontSize(12);
        this.reportIn.text(this.file_name_in, this.reportIn.internal.pageSize.getWidth() / 2, 1, { align: 'center' });
      }
    };

    autoTable(this.reportIn, {
      head: [['MÊS', 'RECIBO', 'CONGREGAÇÃO', 'ENTRADA', 'DIZIMISTA', 'OBS:.', 'VALOR']],
      body: this.prepareIn,
      styles: { fontSize: 6.5 },
      margin: { top: 1.2, left: 0.5, bottom: 0.5, right: 0.5 },
      willDrawPage: (data) => setHeaderPageConfigIn(data)
    });
    this.reportIn.save(`${this.file_name_in}.pdf`);
  }

  despesasByCong(array: any): void {
    this.sanitizeTables();

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
      tempObj.push(e.saida);
      tempObj.push(e.dizimista);
      tempObj.push(e.obs);
      tempObj.push(formattedValue);
      this.prepareIn.push(tempObj);
    });

    //this.reportOut.save(`${this.file_name_out}.pdf`);
    this.dataSourceDespesa = new MatTableDataSource<Lancamento[]>(this.dataDespesasFiltered);
    
    //console.log('DATASOURCE DESPESA: ',this.dataSourceDespesa.data);
  }

  despesasTotal(tipoDespesa: string): void {
    this.file_name_out = `RELATÓRIO GERAL DE DESPESAS - ${tipoDespesa}`
    let congName = '';
    let month = null;
    let totalValue = 0;

    this.reportIn = new jsPDF({
      orientation: "landscape",
      unit: "cm",
      format: 'a4',
    })

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

    // mes: month, recibo: obj.recibo, congregation: congName, outflow: obj.saida, dizimista: obj.dizimista, obs: obj.obs, valor: obj.valor
    this.displayedColumnsOut = ['mes', 'recibo', 'congregation', 'saida', 'tipo_doc', 'obs', 'valor']

    this.dataSourceDespesa.data = this.dataDespesasFiltered;

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
      this.prepareOut.push(tempObj);
    });

    const setHeaderPageConfigIn = (data: any) => {
      this.reportOut.setTextColor(100);
      data.settings.margin.top = 0.5;
      if (data.pageNumber === 1) {
        this.reportOut.setFontSize(12);
        this.reportOut.text(this.file_name_out, this.reportOut.internal.pageSize.getWidth() / 2, 1, { align: 'center' });
      }
    };

    autoTable(this.reportOut, {
      head: [['MÊS', 'REBICO', 'CONGREGAÇÃO', 'SAÍDA', 'TIPO DOC', 'OBS:.', 'VALOR']],
      body: this.prepareOut,
      styles: { fontSize: 8.5
       },
      margin: { top: 1.2, left: 0.5, bottom: 0.5, right: 0.5 },
      willDrawPage: (data: any) => setHeaderPageConfigIn(data)
    });

    console.log(this.prepareOut)
    
    //this.reportOut.save(`${this.file_name_out}.pdf`);

  }

  handleToggle(event: Event, index: number): void {
    const checkbox = event.target as HTMLInputElement;
    const congregation = CONGREGATIONS[index];
    let receitaPorCong: Lancamento[] = []

    this.commService.receitasList$.subscribe(
      {
        next: (data) => {
          receitaPorCong = data
        },
        error: (err) => console.log(err),
      }
    );

   receitaPorCong = receitaPorCong.filter((el: any) => {
      return this.meses[moment(el.data_lan).month()] === this.selectedMonth
    });

    if (checkbox.checked) {
      console.log(this.congSelected.length);
      this.congSelected.push(congregation);
      if (this.congSelected.length > 1) {
        this.getSumTotal(this.congSelected);
      }
      if (this.congSelected.length === 1) {
        let receitasByCong = receitaPorCong.filter((el: Lancamento) => {
          return this.congSelected.includes(el.cong);
        });

        let despesasByCong = receitaPorCong.filter((el: Lancamento) => {
          return this.congSelected.includes(el.cong);
        });
        
        this.receitasByCong(receitasByCong, this.meses[index]);        
        this.despesasByCong(despesasByCong);

        // mes: month, recibo: obj.recibo, congregation: congName, outflow: obj.saida, dizimista: obj.dizimista, obs: obj.obs, valor: obj.valor
        this.displayedColumnsOut = ['mes', 'recibo', 'congregation', 'saida', 'tipo_doc', 'obs', 'valor']

      }
    } else {
      console.log(this.congSelected.length);
      const indexToRemove = this.congSelected.indexOf(congregation);
      console.log('Index to Remove', indexToRemove)
      if (indexToRemove >= 0) {
        this.congSelected.splice(indexToRemove, 1);
        console.log('CHECKBOX NOT CHECKED, REMOVE CONG');
      }
    }
  }

  handleAreaSelection(event: any): void {
    this.congSelected = [];
    this.option = event.value;
    AREAMAPPING[this.option].forEach((el: any) => this.congSelected.push(el));
    this.dataSourceDespesa.data = [];
    this.dataSourceReceita.data = [];
    this.filterAndSumByArea(this.congSelected);
  }

  toggleAll(event: Event) {
    const checkbox = event.target as HTMLInputElement;

    if (checkbox.checked) {
      console.log('SELECIONEI TUDO, FAZ ALGUMA COISA...');
      this.congSelected = [];

      if (this.sumTotal) {
        CONGREGATIONS.forEach((el: any) => this.congSelected.push(el));
        this.dataSourceDespesa.data = [];
        this.dataSourceReceita.data = [];
        console.log('CONGREGACOES SELECIONADAS: ', this.congSelected);
        this.getSumTotal(this.congSelected);

        if (this.dirigentes) {
          this.congSelected = [];
          CONGREGATIONS.forEach((el: any) => this.congSelected.push(el));
          this.dataSourceDespesa.data = [];
          this.dataSourceReceita.data = [];
          console.log('CONGREGACOES SELECIONADAS: ', this.congSelected);
          this.handleDizimoDirigentes()
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
    return this.congSelected.length === CONGREGATIONS.length;
  };

  downloadPdf() {
    this.reportIn.save(`${this.file_name_in}.pdf`)
  }

  onKey(event: Event) {
    const inputValue = event.target as HTMLInputElement;
    console.log(inputValue.value);
  }
}
