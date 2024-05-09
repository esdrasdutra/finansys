import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatCheckboxChange } from '@angular/material/checkbox';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import moment from 'moment';
import { ComunicationService } from 'src/app/services/comunication.service';
import { Outflows } from 'src/app/enums/outflows.enum';
import { AREAMAPPING, AREAS, COLUMNMAPPING, CONGREGATIONS} from 'src/app/entities/relatorios/relatorios';
import { RelatorioAnalitico } from 'src/app/entities/relatorios/relatorios';
import { Congregation } from 'src/app/enums/congregation.enum';

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

  
  relatorio = new RelatorioAnalitico();
  dataSourceDespesa = new MatTableDataSource();
  dataSourceReceita = new MatTableDataSource();

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

  handleDizimistas() {
    this.relatorio.getDizimistas(this.dataReceitas);
  }

  handleSumTotal() {
    this.sumTotal = !this.sumTotal;
    console.log('É pra somar tudo?', this.sumTotal);
  }

  handleDizimoDirigentes() {
    this.dataSourceDespesa.data = [];
    this.dataSourceReceita.data = [];
    this.dataReceitasFiltered = [];
    this.dataDespesasFiltered = [];
    this.dirigentes = !this.dirigentes;
    console.log('10% dos dirigentes?', this.dirigentes);
    this.relatorio.getDizimoDirigentes(this.dataReceitas);
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

  handleToggle(event: Event, index: number): void {
    const checkbox = event.target as HTMLInputElement;
    const congregation = CONGREGATIONS[index];

    console.log(index, checkbox);

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
        // this.getSumTotal(this.congSelected);

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
}
