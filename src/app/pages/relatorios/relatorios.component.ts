import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import { ComunicationService } from 'src/app/services/comunication.service';
import { Outflows } from 'src/app/enums/outflows.enum';
import { AREAMAPPING, AREAS, COLUMNMAPPING, CONGREGATIONS} from 'src/app/entities/relatorios/relatorios';
import { RelatorioAnalitico } from 'src/app/entities/relatorios/relatorios';
import moment from 'moment';
import { Lancamento } from 'src/app/models/Lancamento';

const MY_FORMATS = {
  parse: {
    dateInput: 'MM/YYYY',
  },
  display: {
    dateInput: 'MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};
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

  dataReceitas: Lancamento[] = [];
  dataDespesas: Lancamento[] = [];

  option: number = 0;
  clicked: number = 0;

  currentMonth = moment().month();
  prevMonth = moment().add(-1, 'months').month();

  despesasPerCong: any = [];
  receitasPerCong: any = [];

  dataDespesasFiltered: any = [];
  dataReceitasFiltered: any = [];

  result: any = [];

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
    console.log(this.congSelected);

    this.relatorio.getDizimistasPorCongregacao(this.congSelected);
  }

  handlePeriodo() {
    this.relatorio.getRelatorioPorPeriodo();
  }

  handleSumTotal() {
    this.sumTotal = !this.sumTotal;
    console.log('É pra somar tudo?', this.sumTotal);
  }

  sanitizeTables(){    
    this.dataSourceDespesa.data = [];
    this.dataSourceReceita.data = [];
    this.dataReceitasFiltered = [];
    this.dataDespesasFiltered = [];
    this.receitasPerCong.length = 0;
    this.despesasPerCong.length = 0;
    this.prepareIn = [];
    this.prepareOut = [];
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

  filterAndSumByArea(area: any): void {
    this.sanitizeTables();

    this.file_name_in = `REATÓRIO ANALÍTICO DE ENTRADAS - ÁREA ${this.option}`
    let totalDespesas = 0;
    let totalReceitas = 0;

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

    if (checkbox.checked) {
      this.sanitizeTables();
      this.congSelected.push(congregation);
      console.log(`Selecionando ${this.congSelected}`);
      if (this.congSelected.length !== 1) {
        this.getSumTotal(this.congSelected);
      } else {        
        this.sanitizeTables();
        console.log(this.dataDespesasFiltered, this.dataReceitasFiltered);

        console.log(`Relatório Analítico Completo da Congregação ${this.congSelected}`);
        let receitasByCong = this.dataReceitas.filter((el: any) => {
          return this.congSelected.includes(el.cong);
        });

        let despesasByCong = this.dataDespesas.filter((el: any) => {
          return this.congSelected.includes(el.cong);
        });

        this.result = this.relatorio.getRelatoriosPorCongregacao(receitasByCong, despesasByCong);
        this.dataSourceReceita.data = this.result[0];
        this.dataSourceDespesa.data = this.result[1];

        console.log('Chamando no Selecionar', this.result);

        // mes: month, recibo: obj.recibo, congregation: congName, outflow: obj.saida, dizimista: obj.dizimista, obs: obj.obs, valor: obj.valor
        this.displayedColumnsIn = ['mes', 'recibo', 'congregation', 'entrada', 'dizimista', 'obs', 'valor']

        // mes: month, recibo: obj.recibo, congregation: congName, outflow: obj.saida, dizimista: obj.dizimista, obs: obj.obs, valor: obj.valor
        this.displayedColumnsOut = ['mes', 'recibo', 'congregation', 'saida', 'tipo_doc', 'obs', 'valor']
      }
    } else {
      this.sanitizeTables();
      console.log(`Deselected ${this.congSelected}`);
      console.log('Chamando no Deselect', this.result);

      const indexToRemove = this.congSelected.indexOf(congregation);
      if (indexToRemove >= 0) {
        this.congSelected.splice(indexToRemove, 1);
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
      this.sanitizeTables();
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
