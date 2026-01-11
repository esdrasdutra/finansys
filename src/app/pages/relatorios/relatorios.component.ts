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
  reportIn!: jsPDF;
  reportOut!: jsPDF;
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
  file_name_out = '';
  file_name_in = '';
  dirigentes = false;
  selectedMonth: any;
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
  }

  private populateYears() {
    const currentYear = moment().year();
    for (let year = currentYear - 5; year <= currentYear + 5; year++) {
      this.availableYears.push(year);
    }
  }

  /* -------------------------
     Subscriptions / Inicialização
     ------------------------- */
  private initSubscriptions(): void {
    this.commService.receitasList$.subscribe({
      next: (data) => {
        this.dataReceitas = this.filterByCurrentOrPrevMonth(data);
      },
      error: (err) => console.error(err)
    });

    this.commService.despesasList$.subscribe({
      next: (data) => {
        this.dataDespesas = this.filterByCurrentOrPrevMonth(data);
      },
      error: (err) => console.error(err)
    });
  }

  private filterByCurrentOrPrevMonth(list: any[]): any[] {
    return list.filter((el: any) => {
      const d = moment(el.data_lan);
      return d.year() === this.currentMonth.year()
        && (d.month() === this.currentMonth.month() || d.month() === this.prevMonth.month());
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
    this.file_name_in = `REATÓRIO ANALÍTICO DE ENTRADAS - TOTAL GERAL`;

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
    this.reportIn = this.createDoc('portrait');
    this.prepareIn = this.prepareTableRowsFromObjects(receitasSummed, ['mes', 'congregation', 'valor'], 'valor', (o: any) => [o.mes, o.congregation, 'valor']);

    this.buildPdfFromPrepared(this.reportIn, this.file_name_in, ['MÊS', 'CONGREGAÇÃO', 'VALOR'], this.prepareIn, 9);

    this.displayedColumnsIn = ['mes', 'congregation', 'valor'];
    this.dataSourceDespesa.data = despesasSummed;
    this.dataSourceReceita.data = receitasSummed;
  }

  getDizimoDirigentes(array: any): void {
    this.sanitizeTables();
    this.file_name_in = `REATÓRIO ANALÍTICO DE ENTRADAS - 10% (DIRIGENTES)`;

    // remove ofertas avulsas antes de agrupar
    const receitasFiltered = this.dataReceitas.filter((el: any) => el.entrada !== 'ENTRADA OFERTA AVULSA');
    const receitasGrouped = this.groupByCongregation(receitasFiltered);
    const despesasGrouped = this.groupByCongregation(this.dataDespesas);

    const receitasSummed = this.sumPerCong(receitasGrouped, false);
    const despesasSummed = this.sumPerCong(despesasGrouped, false);

    this.finalizeTotals(receitasSummed, despesasSummed);

    this.reportIn = this.createDoc('portrait');
    this.prepareIn = this.prepareTableRowsFromObjects(receitasSummed, ['mes', 'congregation', 'valor'], 'valor', (o: any) => [o.mes, o.congregation, 'valor']);
    this.buildPdfFromPrepared(this.reportIn, this.file_name_in, ['MÊS', 'CONGREGAÇÃO', 'VALOR'], this.prepareIn, 7);

    this.displayedColumnsIn = ['mes', 'congregation', 'valor'];
    this.dataSourceDespesa.data = despesasSummed;
    this.dataSourceReceita.data = receitasSummed;
  }

  filterAndSumByArea(array: any): void {
    this.sanitizeTables();
    this.file_name_in = `REATÓRIO ANALÍTICO DE ENTRADAS - ÁREA ${this.option}`;

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

    this.reportIn = this.createDoc('portrait');
    this.prepareIn = this.prepareTableRowsFromObjects(receitasSummed, ['mes', 'congregation', 'valor'], 'valor', (o: any) => [o.mes, o.congregation, 'valor']);
    this.buildPdfFromPrepared(this.reportIn, this.file_name_in, ['MÊS', 'CONGREGAÇÃO', 'VALOR'], this.prepareIn, 9);

    this.displayedColumnsIn = ['mes', 'congregation', 'valor'];
    this.displayedColumnsOut = ['mes', 'congregation', 'valor'];
    this.dataSourceDespesa.data = despesasSummed;
    this.dataSourceReceita.data = receitasSummed;
  }

  despesasTotal(tipoDespesa: string): void {
    this.sanitizeTables();
    this.file_name_out = `RELATÓRIO GERAL DE DESPESAS - ${tipoDespesa}`;

    // preparar lista completa de despesas no ano corrente (mes formatado)
    const despesasWithMonth = this.dataDespesas.map((obj: any) => ({
      mes: this.monthOf(obj.data_lan),
      recibo: obj.recibo,
      congregation: obj.cong,
      saida: obj.saida,
      tipo_doc: obj.tipo_doc ?? '',
      obs: obj.obs ?? '',
      valor: obj.valor ?? 0
    }));

    const filtered = despesasWithMonth.filter((d: any) => d.saida === tipoDespesa);
    const totalValue = filtered.reduce((s: number, f: any) => s + parseFloat(f.valor ?? 0), 0);
    filtered.push({ mes: '', recibo: '', congregation: 'TOTAL GERAL', saida: '', tipo_doc: '', obs: '', valor: totalValue });

    this.dataDespesasFiltered = filtered;
    this.displayedColumnsOut = ['mes', 'recibo', 'congregation', 'saida', 'tipo_doc', 'obs', 'valor'];
    this.dataSourceDespesa.data = this.dataDespesasFiltered;

    this.reportOut = this.createDoc('landscape');
    this.prepareOut = this.prepareTableRowsFromObjects(this.dataDespesasFiltered, ['mes', 'recibo', 'congregation', 'saida', 'tipo_doc', 'obs', 'valor'], 'valor', (o: any) => [o.mes, o.recibo, o.congregation, o.saida, o.tipo_doc, o.obs, 'valor']);
    this.buildPdfFromPrepared(this.reportOut, this.file_name_out, ['MÊS', 'RECIBO', 'CONGREGAÇÃO', 'SAÍDA', 'TIPO DOC', 'OBS', 'VALOR'], this.prepareOut, 8.5);

    this.reportOut.save(`${this.file_name_out}.pdf`);
  }

  handleToggle(event: Event, index: number): void {
    const checkbox = event.target as HTMLInputElement;
    const congregation = CONGREGATIONS[index];

    if (checkbox.checked) {
      this.congSelected.push(congregation);
      if (this.congSelected.length !== 1) {
        this.getSumTotal(this.congSelected);
      } else {
        this.sanitizeTables();
        console.log(`Selecionando ${this.congSelected}`);

        this.commService.receitasList$.subscribe(
          {
            next: (data) => {
              console.log(data, 'Receitas')
              this.dataReceitas = data.filter((el: any) => {
                const dataLancamento = moment(el.data_lan);
                return (dataLancamento.year() === this.currentMonth.year() - 1 // Verifica se o ano é o corrente
                );
              });
            },
            error: (err) => console.log(err)
          })

        this.commService.despesasList$.subscribe(
          {
            next: (data) => {
              console.log(data, 'Despesas')
              this.dataDespesas = data.filter((el: any) => {
                const dataLancamento = moment(el.data_lan);
                return (dataLancamento.year() === this.currentMonth.year() -1 // Verifica se o ano é o corrente
                );
              });
            },
            error: (err) => console.log(err)
          })

        let receitasByCong = this.dataReceitas.filter((el: any) => {
          return this.congSelected.includes(el.cong);
        });

        let despesasByCong = this.dataDespesas.filter((el: Lancamento) => {
          return this.congSelected.includes(el.cong);
        });

        this.result = this.relatorio.getRelatoriosPorCongregacao(receitasByCong, despesasByCong, this.selectedMonth);

        this.dataSourceReceita.data = this.result[0];
        this.dataSourceDespesa.data = this.result[1];

        this.displayedColumnsOut = ['mes', 'recibo', 'congregation', 'saida', 'tipo_doc', 'obs', 'valor']
        this.displayedColumnsIn = ['mes', 'recibo', 'congregation', 'entrada', 'tipo_doc', 'obs', 'valor']

        this.reportIn = new jsPDF({
          orientation: "landscape",
          unit: "cm",
          format: 'a4'
        });

        this.file_name_in = `REATÓRIO DE ENTRADAS - ${this.congSelected} - ${this.selectedMonth}`;

        this.reportOut = new jsPDF({
          orientation: "landscape",
          unit: "cm",
          format: 'a4'
        });

        this.dataSourceReceita.data.forEach((e: any) => {
          let tempObj = [];
          const parsedValue = parseFloat(e.valor);
          const formattedValue = parsedValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
          tempObj.push(e.mes);
          tempObj.push(e.recibo);
          tempObj.push(e.congregation);
          tempObj.push(e.entrada);
          tempObj.push(e.tipo_doc);
          tempObj.push(e.obs);
          tempObj.push(formattedValue);
          this.prepareIn.push(tempObj);
        });

        this.dataSourceDespesa.data.forEach((e: any) => {
          let tempObj = [];
          const parsedValue = parseFloat(e.valor);
          const formattedValue = parsedValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
          tempObj.push(e.mes);
          tempObj.push(e.congregation);
          tempObj.push(formattedValue);
          this.prepareOut.push(tempObj);
        });

        const setHeaderPageConfigIn = (data: any) => {
          data.settings.margin.top = 0.5;
          if (data.pageNumber === 1) {
            this.reportIn.setFontSize(12); // Adjust font size as needed
            this.reportIn.text(this.file_name_in, this.reportIn.internal.pageSize.getWidth() / 2, 1, { align: 'center' }); // Adjust text position as needed
          }
        };

        ['mes', 'recibo', 'congregation', 'entrada', 'tipo_doc', 'obs', 'valor']

        autoTable(this.reportIn, {
          head: [['MÊS', 'RECIBO', 'CONGREGAÇÃO', 'ENTRADA', 'TIPO DOC.', 'OBS:', 'VALOR']],
          body: this.prepareIn,
          styles: { fontSize: 7 },
          margin: { top: 1.2, left: 0.5, bottom: 0.5, right: 0.5 },
          willDrawPage: (data) => setHeaderPageConfigIn(data)
        });


      }
    } else {
      const idx = this.congSelected.indexOf(congregation);
      if (idx >= 0) this.congSelected.splice(idx, 1);
    }

    // comportamento original: quando há seleção única ou múltipla, recalcula e prepara relatórios
    if (this.congSelected.length === 0) {
      this.sanitizeTables();
      return;
    }

    this.sanitizeTables();
    // recarrega dados do ano corrente para garantir uso da base mais recente
    // (mantive o filtro por ano do código anterior)
    this.commService.receitasList$.subscribe({
      next: (data) => {
        this.dataReceitas = data.filter((el: any) => moment(el.data_lan).year() === this.currentMonth.year());
        this.processSelectionForReport();
      }, error: (err) => console.error(err)
    });
    this.commService.despesasList$.subscribe({
      next: (data) => {
        this.dataDespesas = data.filter((el: any) => moment(el.data_lan).year() === this.currentMonth.year());
        this.processSelectionForReport();
      }, error: (err) => console.error(err)
    });
  }

  private processSelectionForReport() {
    // se ambos já foram carregados, gera relatório (evita chamadas duplicadas)
    if (!this.dataReceitas || !this.dataDespesas) return;

    const receitasByCong = this.dataReceitas.filter((el: any) => this.congSelected.includes(el.cong));
    const despesasByCong = this.dataDespesas.filter((el: any) => this.congSelected.includes(el.cong));

    this.result = this.relatorio.getRelatoriosPorCongregacao(receitasByCong, despesasByCong, this.selectedMonth);

    this.dataSourceReceita.data = this.result[0] ?? [];
    this.dataSourceDespesa.data = this.result[1] ?? [];

    this.displayedColumnsOut = ['mes', 'recibo', 'congregation', 'saida', 'tipo_doc', 'obs', 'valor'];
    this.displayedColumnsIn = ['mes', 'recibo', 'congregation', 'entrada', 'tipo_doc', 'obs', 'valor'];

    // preparar PDF de entradas
    this.reportIn = this.createDoc('landscape');
    this.file_name_in = `REATÓRIO DE ENTRADAS - ${this.congSelected} - ${this.selectedMonth}`;

    this.prepareIn = this.prepareTableRowsFromObjects(this.dataSourceReceita.data, ['mes', 'recibo', 'congregation', 'entrada', 'tipo_doc', 'obs', 'valor'], 'valor', (o: any) => [o.mes, o.recibo, o.congregation, o.entrada, o.tipo_doc, o.obs, 'valor']);
    this.buildPdfFromPrepared(this.reportIn, this.file_name_in, ['MÊS', 'RECIBO', 'CONGREGAÇÃO', 'ENTRADA', 'TIPO DOC.', 'OBS:', 'VALOR'], this.prepareIn, 7);

    // preparar array simples de despesas para visualização
    this.prepareOut = this.prepareTableRowsFromObjects(this.dataSourceDespesa.data, ['mes', 'congregation', 'valor'], 'valor', (o: any) => [o.mes, o.congregation, 'valor']);
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
    if (this.reportIn) this.reportIn.save(`${this.file_name_in}.pdf`);
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
