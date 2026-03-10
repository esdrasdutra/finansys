import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ComunicationService } from 'src/app/services/comunication.service';
import { Outflows } from 'src/app/enums/outflows.enum';
import { AREAMAPPING, AREAS, COLUMNMAPPING, CONGREGATIONS, FILTROS, MESES } from 'src/app/entities/relatorios/relatorios';
import { RelatorioAnalitico } from 'src/app/entities/relatorios/relatorios';
import moment from 'moment';
import { Lancamento } from 'src/app/models/Lancamento';
import { take } from 'rxjs';
import { RelatorioService } from 'src/app/services/relatorios/relatorio.service';

interface ReportConfig {
  type: 'despesasTotal';
  payload: {
    tipoDespesa: string;
  };
}

interface ReportData {
  title: string;
  data: any[];
  columns: string[];
  type: 'receita' | 'despesa';
}

@Component({
  selector: 'app-relatorios',
  templateUrl: './relatorios.component.html',
  styleUrls: ['./relatorios.component.sass']
})
export class RelatoriosComponent implements OnInit {
  // constantes/enum
  areaMapping = AREAMAPPING;
  congregations = CONGREGATIONS;
  columnMapping = COLUMNMAPPING;
  areas = AREAS;
  filtros = FILTROS;
  meses = MESES;
  outflows = Object.values(Outflows);

  // estado / UI
  relatorio = new RelatorioAnalitico();
  dataSourceDespesa = new MatTableDataSource<any>([]);
  dataSourceReceita = new MatTableDataSource<any>([]);
  displayedColumnsIn: string[] = [];
  displayedColumnsOut: string[] = [];

  // pdfs / preparação
  private currentReportIn: jsPDF | null = null;
  private currentReportOut: jsPDF | null = null;
  private currentReportNameIn: string = '';
  private currentReportNameOut: string = '';
  prepareIn: any[] = [];
  prepareOut: any[] = [];

  // dados brutos e filtrados
  dataReceitas: any[] = [];
  dataDespesas: any[] = [];
  dataReceitasFiltered: any[] = [];
  dataDespesasFiltered: any[] = [];

  // auxiliares
  receitasPerCong: Lancamento[] = [];
  despesasPerCong: Lancamento[] = [];
  result: any = [];
  congSelected: string[] = [];
  sumTotal = false;
  filterByArea = false;
  outflowCenter = '';
  dirigentes = false;
  selectedMonth: any;               // usado em outros relatórios
  selectedMonths: string[] = [];    // meses escolhidos para o relatório anual detalhado
  selectedYear!: number;
  availableYears: number[] = [];

  // datas correntes
  currentMonth = moment();
  prevMonth = moment().add(-1, 'months');
  option: any;

  constructor(
    private commService: ComunicationService,
    private relatorioService: RelatorioService
  ) { }

  ngOnInit(): void {
    this.initSubscriptions();
    this.populateYears();
    this.selectedYear = this.currentMonth.year();
    // ao iniciar seleciona todos os meses por padrão para manter comportamento anterior
    this.selectedMonths = [...this.meses];
  }

  private populateYears(): void {
    const startYear = moment().year() - 5;
    const endYear = moment().year() + 1;
    for (let year = startYear; year <= endYear; year++) {
      this.availableYears.push(year);
    }
  }

  private filterBySelectedYear(list: any[]): any[] {
    return list.filter((el: any) => {
      const d = moment(el.data_lan);
      return d.year() === this.selectedYear;
    });
  }

  /* -------------------------
     Subscriptions / Inicialização
     ------------------------- */
  private initSubscriptions(): void {
    this.commService.getAllReceitas().subscribe({
      next: (data) => {
        this.dataReceitas = this.filterBySelectedYear(data);
      },
      error: (err) => console.error(err)
    });

    this.commService.getAllDespesas().subscribe({
      next: (data) => {
        this.dataDespesas = this.filterBySelectedYear(data);
      },
      error: (err) => console.error(err)
    });
  }

  /* -------------------------
     Utilitários
     ------------------------- */
  private sanitizeTables() {
    this.dataSourceReceita = new MatTableDataSource<any>([]);
    this.dataSourceDespesa = new MatTableDataSource<any>([]);
    this.dataReceitasFiltered = [];
    this.dataDespesasFiltered = [];
    this.receitasPerCong = [];
    this.despesasPerCong = [];
    this.prepareIn = [];
    this.prepareOut = [];
    this.result = [];
  }

  private formatCurrency(value: number | string): string {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  private monthOf(dateStr: string): string {
    return moment(dateStr).format('MM');
  }

  /**
   * Inclui/Remove um mês da lista de seleção para o relatório anual detalhado.
   */
  toggleMonthSelection(event: any): void {
    const mes = event.target.value;
    if (event.target.checked) {
      if (!this.selectedMonths.includes(mes)) {
        this.selectedMonths.push(mes);
      }
    } else {
      this.selectedMonths = this.selectedMonths.filter(m => m !== mes);
    }
  }

  private createDoc(orientation: 'portrait' | 'landscape' = 'portrait'): jsPDF {
    return new jsPDF({ orientation, unit: 'cm', format: 'a4' });
  }

  private setHeader(doc: jsPDF, title: string, fontSize = 12) {
    return (data: any) => {
      data.settings.margin.top = 0.5;
      if (data.pageNumber === 1) {
        doc.setFontSize(fontSize);
        doc.text(title, doc.internal.pageSize.getWidth() / 2, 1, { align: 'center' });
      }
    };
  }

  private prepareTableRowsFromObjects(array: any[], columns: string[], valueField = 'valor', mapFields?: (o: any) => any[]) {
    const rows: any[] = [];
    array.forEach((e: any) => {
      const parsed = parseFloat(e[valueField] ?? 0);
      const formatted = this.formatCurrency(parsed);
      if (mapFields) {
        rows.push(mapFields(e).map((v: any) => (v === valueField ? formatted : v)));
      } else {
        const row = columns.map((c) => (c === valueField ? formatted : e[c] ?? ''));
        rows.push(row);
      }
    });
    return rows;
  }

  /* -------------------------
     Relatórios: Período anual (handlePeriodo)
     ------------------------- */
  handlePeriodo() {
    this.sanitizeTables();

    // 1. Pega o valor mais recente da lista de receitas
    this.commService.receitasList$.pipe(
      take(1) // Usa take(1) para pegar o valor atual e fazer unsubscribe automaticamente!
    ).subscribe(receitas => {
      // 2. Passa os dados para o serviço, que tem a responsabilidade de processá-los
      if (receitas && receitas.length > 0) {
        this.relatorioService.gerarPdfPorPeriodo(receitas, this.selectedYear);
      } else {
        console.warn("Não há dados de receita para gerar o relatório.");
        // Opcional: mostrar uma mensagem para o usuário
      }
    });
  }

  handleRelatorioAnualCompleto(): void {
    this.sanitizeTables();

    // 1. Pega o valor mais recente da lista de receitas
    this.commService.receitasList$.pipe(
      take(1) // Usa take(1) para pegar o valor atual e fazer unsubscribe automaticamente!
    ).subscribe(receitas => {
      // 2. Passa os dados para o serviço, que tem a responsabilidade de processá-los
      if (receitas && receitas.length > 0) {

        this.commService.despesasList$.pipe(
          take(1)
        ).subscribe(despesas => {
          if (despesas && despesas.length > 0) {
            console.log(despesas);
            this.relatorioService.gerarPdfAnualLancamentos(receitas, despesas, this.selectedYear);
          } else {
            console.warn("Não há dados de despesa para gerar o relatório anual completo.");
            // Opcional: mostrar uma mensagem para o usuário
          }
        });
        //this.relatorioService.gerarPdfPorPeriodo(receitas, this.selectedYear);
      } else {
        console.warn("Não há dados de receita para gerar o relatório.");
        // Opcional: mostrar uma mensagem para o usuário
      }
    });
  }

  handleRelatorioAnualDetalhado(): void {
    this.sanitizeTables();
    this.commService.receitasList$.pipe(
      take(1)
    ).subscribe(receitas => {
      if (receitas && receitas.length > 0) {
        this.commService.despesasList$.pipe(
          take(1)
        ).subscribe(despesas => {
          if (despesas && despesas.length > 0) {
            this.relatorioService.gerarPdfAnualDetalhado(
              receitas,
              despesas,
              this.selectedYear,
              this.selectedMonths
            );
          } else {
            console.warn("Não há dados de despesa para gerar o relatório anual detalhado.");
          }
        });
      } else {
        console.warn("Não há dados de receita para gerar o relatório.");
      }
    });
  }

  /* -------------------------
     Helpers para somas e preparações (usados por getSumTotal, filterAndSumByArea, getDizimoDirigentes)
     ------------------------- */
  private groupByCongregation(list: any[]): Record<string, any[]> {
    return list.reduce((acc: Record<string, any[]>, cur: any) => {
      const key = cur.cong ?? cur.congregation ?? '';
      acc[key] = acc[key] || [];
      acc[key].push(cur);
      return acc;
    }, {});
  }

  private sumPerCong(listByCong: Record<string, any[]>, skipAvulsa = false): any[] {
    const result: any[] = [];
    Object.keys(listByCong).forEach((cong) => {
      const items = listByCong[cong]
        .filter((it) => !(skipAvulsa && it.entrada === 'ENTRADA OFERTA AVULSA'));
      const total = items.reduce((s: number, i: any) => s + Number.parseFloat(i.valor ?? 0), 0);
      const month = items.length ? this.monthOf(items[0].data_lan) : '';
      result.push({ congregation: cong, mes: month, valor: total });
    });
    return result;
  }

  private finalizeTotals(receitas: any[], despesas: any[]) {
    const totalReceitas = receitas.reduce((s, r) => s + (Number(r.valor) || 0), 0);
    const totalDespesas = despesas.reduce((s, r) => s + (Number(r.valor) || 0), 0);
    receitas.push({ congregation: 'TOTAL GERAL', mes: '', valor: totalReceitas });
    despesas.push({ congregation: 'TOTAL GERAL', mes: '', valor: totalDespesas });
  }

  private buildPdfFromPrepared(doc: jsPDF, title: string, head: string[], bodyRows: any[][], fontSize = 9) {
    const setHeader = this.setHeader(doc, title);
    autoTable(doc, {
      head: [head],
      body: bodyRows,
      styles: { fontSize },
      margin: { top: 1.2, left: 0.5, bottom: 0.5, right: 0.5 },
      willDrawPage: (data) => setHeader(data)
    });
  }

  private generateReport(config: ReportConfig): ReportData {
    switch (config.type) {
      case 'despesasTotal':
        const despesasWithMonth = this.dataDespesas.map((obj: any) => ({
          mes: this.monthOf(obj.data_lan),
          recibo: obj.recibo,
          congregation: obj.cong,
          saida: obj.saida,
          tipo_doc: obj.tipo_doc ?? '',
          obs: obj.obs ?? '',
          valor: obj.valor ?? 0
        }));

        const filtered = despesasWithMonth.filter((d: any) => d.saida === config.payload.tipoDespesa);
        const totalValue = filtered.reduce((s: number, f: any) => s + parseFloat(f.valor ?? 0), 0);
        filtered.push({ mes: '', recibo: '', congregation: 'TOTAL GERAL', saida: '', tipo_doc: '', obs: '', valor: totalValue });

        return {
          title: `RELATÓRIO GERAL DE DESPESAS - ${config.payload.tipoDespesa}`,
          data: filtered,
          columns: ['mes', 'recibo', 'congregation', 'saida', 'tipo_doc', 'obs', 'valor'],
          type: 'despesa'
        };
      default:
        throw new Error('Tipo de relatório não suportado');
    }
  }

  private displayReport(reportData: ReportData) {
    if (reportData.type === 'receita') {
      this.dataSourceReceita.data = reportData.data;
      this.displayedColumnsIn = reportData.columns;
    } else {
      this.dataSourceDespesa.data = reportData.data;
      this.displayedColumnsOut = reportData.columns;
    }

    // Prepare for PDF generation
    const report = this.createDoc('landscape');
    const preparedData = this.prepareTableRowsFromObjects(reportData.data, reportData.columns, 'valor', (o: any) => reportData.columns.map(col => col === 'valor' ? 'valor' : o[col]));
    
    const header = reportData.columns.map(c => this.columnMapping[c] || c.toUpperCase());

    this.buildPdfFromPrepared(report, reportData.title, header, preparedData, 8.5);

    if (reportData.type === 'receita') {
      this.currentReportIn = report;
      this.currentReportNameIn = reportData.title;
    } else {
      this.currentReportOut = report;
      this.currentReportNameOut = reportData.title;
    }
  }

  /* -------------------------
     Implementações que expõem ações ao template
     ------------------------- */
  handleDizimistas() {
    this.sanitizeTables();
    this.relatorio.getDizimistas(this.selectedMonth);
  }

  handleSumTotal() {
    this.sumTotal = !this.sumTotal;
  }

  handleDizimoDirigentes() {
    this.dirigentes = !this.dirigentes;
    this.sanitizeTables();
    // getDizimoDirigentes retorna alguma estrutura, mas a versão anterior apenas logava e populava filtros,
    // aqui chamamos e processamos via método de preparação para tabela se necessário
    // Mantive comportamento original de log
    console.log(this.relatorio.getDizimoDirigentes(this.dataReceitas));
  }

  handleCustoSelection(event: any) {
    this.outflowCenter = event.value;
    this.despesasTotal(this.outflowCenter);
  }

  handleSumByArea() {
    this.filterByArea = !this.filterByArea;
  }

  getSumTotal(array: any[]): void {
    this.sanitizeTables();
    this.currentReportNameIn = `REATÓRIO ANALÍTICO DE ENTRADAS - TOTAL GERAL`;

    // agrupamento das listas por congregação
    const receitasGrouped = this.groupByCongregation(this.dataReceitas);
    const despesasGrouped = this.groupByCongregation(this.dataDespesas);

    // filtrar apenas as congregações selecionadas
    const receitasFilteredBySelection: Record<string, any[]> = {};
    const despesasFilteredBySelection: Record<string, any[]> = {};
    array.forEach((cong: any) => {
      receitasFilteredBySelection[cong] = receitasGrouped[cong] ?? [];
      despesasFilteredBySelection[cong] = despesasGrouped[cong] ?? [];
    });

    const receitasSummed = this.sumPerCong(receitasFilteredBySelection);
    const despesasSummed = this.sumPerCong(despesasFilteredBySelection);

    this.finalizeTotals(receitasSummed, despesasSummed);

    // preparar PDF/tabela
    this.currentReportIn = this.createDoc('portrait');
    this.prepareIn = this.prepareTableRowsFromObjects(receitasSummed, ['mes', 'congregation', 'valor'], 'valor', (o: any) => [o.mes, o.congregation, 'valor']);

    this.buildPdfFromPrepared(this.currentReportIn, this.currentReportNameIn, ['MÊS', 'CONGREGAÇÃO', 'VALOR'], this.prepareIn, 9);

    this.displayedColumnsIn = ['mes', 'congregation', 'valor'];
    this.dataSourceDespesa.data = despesasSummed;
    this.dataSourceReceita.data = receitasSummed;
  }

  getDizimoDirigentes(array: any): void {
    this.sanitizeTables();
    this.currentReportNameIn = `REATÓRIO ANALÍTICO DE ENTRADAS - 10% (DIRIGENTES)`;

    // remove ofertas avulsas antes de agrupar
    const receitasFiltered = this.dataReceitas.filter((el: any) => el.entrada !== 'ENTRADA OFERTA AVULSA');
    const receitasGrouped = this.groupByCongregation(receitasFiltered);
    const despesasGrouped = this.groupByCongregation(this.dataDespesas);

    const receitasSummed = this.sumPerCong(receitasGrouped, false);
    const despesasSummed = this.sumPerCong(despesasGrouped, false);

    this.finalizeTotals(receitasSummed, despesasSummed);

    this.currentReportIn = this.createDoc('portrait');
    this.prepareIn = this.prepareTableRowsFromObjects(receitasSummed, ['mes', 'congregation', 'valor'], 'valor', (o: any) => [o.mes, o.congregation, 'valor']);
    this.buildPdfFromPrepared(this.currentReportIn, this.currentReportNameIn, ['MÊS', 'CONGREGAÇÃO', 'VALOR'], this.prepareIn, 7);

    this.displayedColumnsIn = ['mes', 'congregation', 'valor'];
    this.dataSourceDespesa.data = despesasSummed;
    this.dataSourceReceita.data = receitasSummed;
  }

  filterAndSumByArea(array: any): void {
    this.sanitizeTables();
    this.currentReportNameIn = `REATÓRIO ANALÍTICO DE ENTRADAS - ÁREA ${this.option}`;

    const receitasGrouped = this.groupByCongregation(this.dataReceitas);
    const despesasGrouped = this.groupByCongregation(this.dataDespesas);

    const receitasFilteredBySelection: Record<string, any[]> = {};
    const despesasFilteredBySelection: Record<string, any[]> = {};
    array.forEach((cong: any) => {
      receitasFilteredBySelection[cong] = receitasGrouped[cong] ?? [];
      despesasFilteredBySelection[cong] = despesasGrouped[cong] ?? [];
    });

    const receitasSummed = this.sumPerCong(receitasFilteredBySelection);
    const despesasSummed = this.sumPerCong(despesasFilteredBySelection);
    this.finalizeTotals(receitasSummed, despesasSummed);

    this.currentReportIn = this.createDoc('portrait');
    this.prepareIn = this.prepareTableRowsFromObjects(receitasSummed, ['mes', 'congregation', 'valor'], 'valor', (o: any) => [o.mes, o.congregation, 'valor']);
    this.buildPdfFromPrepared(this.currentReportIn, this.currentReportNameIn, ['MÊS', 'CONGREGAÇÃO', 'VALOR'], this.prepareIn, 9);

    this.displayedColumnsIn = ['mes', 'congregation', 'valor'];
    this.displayedColumnsOut = ['mes', 'congregation', 'valor'];
    this.dataSourceDespesa.data = despesasSummed;
    this.dataSourceReceita.data = receitasSummed;
  }

  despesasTotal(tipoDespesa: string): void {
    this.sanitizeTables();
    const reportData = this.generateReport({ type: 'despesasTotal', payload: { tipoDespesa } });
    this.displayReport(reportData);
  }

  handleToggle(event: Event, index: number): void {
    const checkbox = event.target as HTMLInputElement;
    const congregation = CONGREGATIONS[index];

    if (checkbox.checked) {
      this.congSelected.push(congregation);
      console.log(congregation, 'adicionada à seleção.');
    } else {
      const idx = this.congSelected.indexOf(congregation);
      if (idx >= 0) {
        this.congSelected.splice(idx, 1);
      }
    }
    
    this.runReportForSelection();
  }

  private runReportForSelection() {
    if (this.congSelected.length === 0) {
      this.sanitizeTables();
      return;
    }

    if (this.sumTotal || this.congSelected.length > 1) {
      this.getSumTotal(this.congSelected);
    } else if (this.congSelected.length === 1) {
      console.log('TODO: Implement getDetailedCongregationReport for single selection');
      // this.getDetailedCongregationReport(this.congSelected[0]);
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
      this.congSelected = [];
      if (this.sumTotal) {
        CONGREGATIONS.forEach((el: any) => this.congSelected.push(el));
        this.getSumTotal(this.congSelected);
        if (this.dirigentes) {
          this.congSelected = [];
          CONGREGATIONS.forEach((el: any) => this.congSelected.push(el));
          this.dataSourceDespesa.data = [];
          this.dataSourceReceita.data = [];
          this.handleDizimoDirigentes();
        }
      }
    } else {
      this.sanitizeTables();
    }
  }

  exists(item: string) {
    return this.congSelected.indexOf(item) > -1;
  }

  isIndeterminate() {
    return (this.congSelected.length > 0 && !this.isChecked());
  }

  isChecked() {
    return this.congSelected.length === CONGREGATIONS.length;
  }

  downloadPdf() {
    if (this.currentReportIn) {
      this.currentReportIn.save(`${this.currentReportNameIn}.pdf`);
    }
    if (this.currentReportOut) {
      this.currentReportOut.save(`${this.currentReportNameOut}.pdf`);
    }
  }

  handleRelatorioVertical() {
    this.sanitizeTables();

    // 1. Pega o valor mais recente da lista de receitas
    this.commService.receitasList$.pipe(
      take(1) // Usa take(1) para pegar o valor atual e fazer unsubscribe automaticamente!
    ).subscribe(receitas => {
      // 2. Passa os dados para o serviço, que tem a responsabilidade de processá-los
      if (receitas && receitas.length > 0) {
        this.relatorioService.gerarPdfPorCongregacaoVertical(receitas, this.selectedYear);
      } else {
        console.warn("Não há dados de receita para gerar o relatório.");
        // Opcional: mostrar uma mensagem para o usuário
      }
    });
  }

  onKey(event: Event) {
    const inputValue = event.target as HTMLInputElement;
    console.log(inputValue.value);
  }
}
