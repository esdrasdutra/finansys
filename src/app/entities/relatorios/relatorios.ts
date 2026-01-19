import { inject } from "@angular/core";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import moment from "moment";
import { LancamentoAddComponent } from "src/app/components/lancamento-add/lancamento-add.component";
import { Congregation } from "src/app/enums/congregation.enum";
import { Lancamento } from "src/app/models/Lancamento";
import { ComunicationService } from "src/app/services/comunication.service";

export const CONGREGATIONS = Object.values(Congregation);

export const AREAS = ['TC', '1', '2', '3', '4', '5', '6', '7', '8'];

// Definindo o Mapeamento de Área aqui para ser auto-contido.
export const AREAMAPPING: { [key: string]: Congregation[] } = {
    'TC': [Congregation.TEMPLO_CENTRAL],
    '1': [Congregation.ESCUDO_DA_FE, Congregation.FRUTOS_DA_FE_II, Congregation.LIRIOS_DOS_VALES, Congregation.LUZ_E_VIDA, Congregation.NOVA_VIDA],
    '2': [Congregation.MONTE_DAS_OLIVEIRAS, Congregation.MONTE_HOREBE, Congregation.NOVA_ALIANCA],
    '3': [Congregation.DEUS_FORTE, Congregation.MONTE_SINAI, Congregation.NOVA_JERUSALEM, Congregation.ROCHA_ETERNA],
    '4': [Congregation.BETEL, Congregation.CONQUISTA, Congregation.PERSEVERANCA, Congregation.PORTA_DAS_OVELHAS, Congregation.PROMESSA_DE_DEUS],
    '5': [Congregation.CHAMA_VIVA, Congregation.MAR_DE_CRISTAL, Congregation.MARANATA, Congregation.MONTE_CARMELO],
    '6': [Congregation.GETSEMANI, Congregation.MANANCIAL, Congregation.MONTE_MORIA, Congregation.MONTE_TABOR, Congregation.ROSA_DE_SARON, Congregation.VIVENCIA_CRISTA],
    '7': [Congregation.ALTO_REFUGIO, Congregation.FRUTOS_DA_FE, Congregation.LIBERDADE, Congregation.REDENCAO, Congregation.MORIA_II],
    '8': [Congregation.MONTE_SIAO, Congregation.FILADELFIA, Congregation.HERANCA_DE_CRISTO, Congregation.SHALOM, Congregation.SHEKINAH],
};

export const FILTROS: string[] = ['Mês', 'Recibo', 'Valor', 'Tipo Documento', 'Nº Documento'];

export const MESES = [
  'JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO',
  'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO'
];

export const COLUMNMAPPING: { [key: string]: string } = {
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

export class RelatorioAnalitico {
  currentMonth = moment();

  private commService: ComunicationService;
  dataReceitasFiltered: any = [];
  dataDespesasFiltered: any = []

  constructor() {
    this.commService = inject(ComunicationService);
  }

  dataReceitas: any = [];
  dizimistasList: any = [];

  file_name!: string;
  report = new jsPDF();
  prepare: any = [];
  dataFiltered: any = [];
  novaLista: any = [];
  receitasPerCong: any = [];

  getDizimistas(selectedMonth: string, selectedCong?: string): void {

    console.log(this.dataFiltered.length, selectedMonth);

    this.commService.receitasList$.subscribe(
      {
        next: (data) => {
          this.dataReceitas = data.filter((el: any) => {
            const dataLancamento = moment(el.data_lan);
            return (
              (MESES[dataLancamento.month()] === selectedMonth) &&
              dataLancamento.year() === this.currentMonth.year() - 1 // Verifica se o ano é o corrente
            );
          });
        },
        error: (err) => console.log(err),
      }
    )

    this.file_name = `RELATÓRIO GERAL - DÍZIMO OBREIROS - ${selectedMonth}`

    this.dizimistasList = this.dataReceitas.filter((el: any) => el.entrada === "ENTRADA DÍZIMO OBREIRO");

    console.log(this.dizimistasList);

    let congregationMap: any = [];

    for (const area of Object.keys(AREAMAPPING)) {
      for (const congregation of AREAMAPPING[area]) {
        congregationMap[congregation] = congregationMap[congregation] || [];
      }
    }

    for (const lancamento of this.dizimistasList) {
      const congregacao = lancamento.cong;

      let dizimista;

      dizimista = congregationMap[congregacao]?.find(
        (d: any) => d.nome === lancamento.dizimista
      );

      if (!dizimista) {
        if (!congregationMap[congregacao]) {
          congregationMap[congregacao] = [];
        }
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

    for (const area of Object.keys(AREAMAPPING)) {
      const congregacoes = [];

      for (const congregation of AREAMAPPING[area]) {
        congregacoes.push({
          nome: congregation,
          dizimistas: congregationMap[congregation].sort((a: any, b: any) => b.valorTotal - a.valorTotal),
        });
      }

      this.novaLista.push({
        area,
        congregacoes,
      });
    }

    for (const area of this.novaLista) {
      for (const congregacao of area.congregacoes) {
        for (const dizimista of congregacao.dizimistas) {
          if (dizimista.nome) {
            this.dataFiltered.push({
              mes: selectedMonth,
              dizimista: dizimista.nome,
              congregation: congregacao.nome,
            });
          }
        }
      }
    }

    console.log(this.dataFiltered);


    this.report = new jsPDF({
      orientation: "portrait",
      unit: "cm",
      format: 'a4',
    });

    this.dataFiltered.forEach((e: any) => {
      let tempObj = [];
      tempObj.push(e.mes);
      tempObj.push(e.congregation);
      tempObj.push(e.dizimista);
      this.prepare.push(tempObj);
    });

    const setHeaderPageConfigIn = (data: any) => {
      this.report.setTextColor(100);
      data.settings.margin.top = 0.5;
      if (data.pageNumber === 1) {
        this.report.setFontSize(12);
        this.report.text(this.file_name, this.report.internal.pageSize.getWidth() / 2, 1, { align: 'center' });
      }
    };


    autoTable(this.report, {
      head: [['MÊS', 'CONGREGAÇÃO', 'DIZIMISTA']],
      body: this.prepare,
      styles: { fontSize: 8 },
      margin: { top: 1.2, left: 0.5, bottom: 0.5, right: 0.5 },
      willDrawPage: (data: any) => setHeaderPageConfigIn(data)
    });

    this.report.save(`${this.file_name}.pdf`);

    const displayedColumns = ['mes', 'congregation', 'dizimista']
  }

  getDizimoDirigentes(data: any): Lancamento[] {
    let totalReceitas = 0;
    let totalAvulsas = 0
    this.file_name = `REATÓRIO ANALÍTICO DE ENTRADAS - 10% (DIRIGENTES)`;

    CONGREGATIONS.forEach((cong: any) => {
      this.receitasPerCong.push(
        data.filter((el: any) => el.cong === cong),
      );
    });

    this.receitasPerCong?.forEach((cong: any) => {
      let valueTemp = 0;
      let ofertaAvulsaTotal = 0;
      let congName = '';
      let month = null;
      cong.forEach((res: any) => {
        valueTemp += Number.parseFloat(res.valor)
        congName = res.cong
        month = moment(res.data_lan).format('MM');
      });
      this.dataFiltered.push({ congregation: congName, valor: valueTemp });
    })

    this.dataFiltered.forEach((obj: any) => {
      totalReceitas += Number.parseFloat(obj.valor)
    });

    this.dataFiltered.push({ congregation: 'TOTAL GERAL', valor: totalReceitas });

    this.report = new jsPDF({
      orientation: "portrait",
      unit: "cm",
      format: 'a4'
    });

    this.dataFiltered.forEach((e: any) => {
      let tempObj = [];
      const parsedValue = parseFloat(e.valor);
      const formattedValue = parsedValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
      tempObj.push(e.congregation);
      tempObj.push(formattedValue);
      this.prepare.push(tempObj);
    });

    const setHeaderPageConfigIn = (data: any) => {
      data.settings.margin.top = 0.5;
      if (data.pageNumber === 1) {
        this.report.setFontSize(12); // Adjust font size as needed
        this.report.text(this.file_name, this.report.internal.pageSize.getWidth() / 2, 1, { align: 'center' }); // Adjust text position as needed
      }
    };

    autoTable(this.report, {
      head: [['CONGREGAÇÃO', 'VALOR']],
      body: this.prepare,
      styles: { fontSize: 7 },
      margin: { top: 1.2, left: 0.5, bottom: 0.5, right: 0.5 },
      willDrawPage: (data) => setHeaderPageConfigIn(data)
    });

    //this.report.save(`${this.file_name}.pdf`);
    return this.dataFiltered;
  }

  formatarParaTabela(dadosPorArea: any) {
    const prepareIn: any = [];
    const somasMensais: any = {}; // Objeto para armazenar as somas por mês


    // Iterar sobre cada área nos dados
    for (const area in dadosPorArea) {
      // Iterar sobre cada entrada (congregation, mes, valor) na área
      dadosPorArea[area].forEach((entrada: any) => {
        const parsedValue = parseFloat(entrada.valor);
        const formattedValue = parsedValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

        // Criar o array temporário com os dados formatados
        const tempObj = [{
          mes: entrada.mes,
          cong: entrada.congregation,
          val: formattedValue,}
        ];

        // Adicionar o array temporário ao prepareIn
        prepareIn.push(tempObj);

        // Calcular as somas mensais
        if (!somasMensais[entrada.mes]) {
          somasMensais[entrada.mes] = 0;
        }
        somasMensais[entrada.mes] += parsedValue;
      });

      // Adicionar a linha de somas ao prepareIn
      const linhaSomas = ['Total', '', '', '']; // Linha para exibir "Somas" na primeira coluna
      for (const mes in somasMensais) {
        const somaFormatada = somasMensais[mes].toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        linhaSomas[Number(mes)] = somaFormatada; // Adicionar a soma formatada na coluna correspondente ao mês
      }
      prepareIn.push(linhaSomas);
    }

    const tableData: any = {};

    const sums = prepareIn.pop(); // Remove a linha de somas

    prepareIn.forEach((item: any[]) => {
      const congregation = item[1];
      const value = item[2];

      if (!tableData[congregation]) {
        tableData[congregation] = [];
      }

      tableData[congregation].push(value);
    });

    // Adiciona as somas à última linha
    const tableArray = Object.entries(tableData).map(([congregation, values]) => [congregation, values]);
    tableArray.push(['Somas', ...sums.slice(1)]);

    return prepareIn;
  }

  formatarParaTabelaComSomas(dadosPorArea: any) {
    const prepareIn: any = [];
    const somasMensais: any = {}; // Objeto para armazenar as somas por mês

    const header = ['Congregação', 'Área', 'JAN', 'FEV', 'MAR'];
    prepareIn.push(header);

    // Objeto para armazenar os totais por congregação
    const congregacoes: any = {};

    // Iterar sobre cada área nos dados
    for (const area in dadosPorArea) {

      // Iterar sobre cada entrada (congregation, mes, valor) na área
      dadosPorArea[area].forEach((entrada: any) => {
        const parsedValue = parseFloat(entrada.valor);
        const formattedValue = parsedValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

        // Criar o objeto para a linha
        const linha = {
          Congregação: entrada.congregation,
          area: area,
          JAN: entrada.mes === '01' ? formattedValue : '',
          FEV: entrada.mes === '02' ? formattedValue : '',
          MAR: entrada.mes === '03' ? formattedValue : '',
        };

        // Adicionar a linha ao prepareIn
        prepareIn.push(Object.values(linha));

        console.log('MEIO DO PROCESSO: ', prepareIn);

        // Calcular as somas mensais
        if (!somasMensais[entrada.mes]) {
          somasMensais[entrada.mes] = 0;
        }
        somasMensais[entrada.mes] += parsedValue;

        // Inicializar o objeto de totais por congregação
        if (!congregacoes[entrada.congregation]) {
          congregacoes[entrada.congregation] = {
            JAN: 0,
            FEV: 0,
            MAR: 0,
          };
        }

        // Acumular os valores para cada congregação
        if (entrada.mes === '01') {
          congregacoes[entrada.congregation].JAN += parsedValue;
        } else if (entrada.mes === '02') {
          congregacoes[entrada.congregation].FEV += parsedValue;
        } else if (entrada.mes === '03') {
          congregacoes[entrada.congregation].MAR += parsedValue;
        }
      });
    }

    // Calcular os totais por congregação e adicionar à tabela
    prepareIn.forEach((linha: any) => {
      if (Array.isArray(linha) && linha[0] !== 'Congregação') {
        const congregacao = linha[0];
        const total = congregacoes[congregacao].JAN + congregacoes[congregacao].FEV + congregacoes[congregacao].MAR;
        linha[4] = total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
      }
    });

    // Adicionar a linha de somas ao final da tabela
    const linhaSomas = ['Somas'];
    linhaSomas.push(
      somasMensais['01'] ? somasMensais['01'].toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'R$ 0,00',
      somasMensais['02'] ? somasMensais['02'].toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'R$ 0,00',
      somasMensais['03'] ? somasMensais['03'].toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'R$ 0,00',
      '' // O total da soma não é necessário aqui
    );
    prepareIn.push(linhaSomas);

    return prepareIn;
  }

  getRelatoriosPorCongregacao(dataReceita: any, dataDespesa: any, selectedMonth: string) {

    let congName = '';
    let month = null;
    let totalValue = 0;
    this.dataDespesasFiltered = [];
    this.dataReceitasFiltered = [];

    let file_name_in = `REATÓRIO ANALÍTICO DE ENTRADAS - ${congName}`;
    let file_name_out = `RELATÓRIO ANALÍTICO DE SAÍDAS - ${congName}`;

    dataReceita.forEach((obj: Lancamento) => {
      congName = obj.cong;
      month = MESES[moment(obj.data_lan).month()];
      if (month === selectedMonth) {
        this.dataReceitasFiltered.push({ mes: month, recibo: obj.recibo, congregation: congName, entrada: obj.entrada, dizimista: obj.dizimista, obs: obj.historico, valor: obj.valor })
      }
    });

    this.dataReceitasFiltered.forEach((obj: any) => {
      let valor = parseFloat(obj.valor)
      totalValue += valor
    });

    this.dataReceitasFiltered.push({ mes: '', recibo: '', congregation: 'TOTAL GERAL', entrada: '', dizimista: '', obs: '', valor: totalValue });

    dataDespesa.forEach((obj: any) => {
      congName = obj.cong;
      month = moment(obj.data_lan).format('MM');
      this.dataDespesasFiltered.push({ mes: month, recibo: obj.recibo, congregation: congName, saida: obj.saida, tipo_doc: obj.tipo_doc, obs: obj.obs, valor: obj.valor })
    });

    this.dataDespesasFiltered.forEach((obj: any) => {
      let valor = parseFloat(obj.valor)
      totalValue += valor
    });

    this.dataDespesasFiltered.push({ mes: '', recibo: '', congregation: 'TOTAL GERAL', saida: '', tipo_doc: '', obs: '', valor: totalValue });


    return [this.dataReceitasFiltered, this.dataDespesasFiltered];
  }

  getDizimistasPorCongregacao(congregacaoSelecionada: string[]): void {
    this.file_name = `RELATÓRIO GERAL - DÍZIMO OBREIROS ${congregacaoSelecionada}`

    this.commService.receitasList$.subscribe(
      {
        next: (data) => {
          this.dataReceitas = data;
        },
        error: (err) => console.log(err),
      }
    )

    const startDate = moment(new Date(2024, 1, 1));
    const endDate = moment(new Date(2024, 7, 31));


    let dizimistasList = this.dataReceitas.filter((lanc: Lancamento) => {
      const lancMoment = moment(lanc.data_lan);
      return lancMoment.isBetween(startDate, endDate, 'days', '[]') && lanc.entrada === "ENTRADA DÍZIMO OBREIRO" && lanc.cong === congregacaoSelecionada[0];
    });

    dizimistasList.forEach((lanc: Lancamento) => {
      let congName = lanc.cong;
      let month = moment(lanc.data_lan).format('MM');
      this.dataFiltered.push({ mes: month, congregation: congName, dizimista: lanc.dizimista });
    });

    this.report = new jsPDF({
      orientation: "portrait",
      unit: "cm",
      format: 'a4',
    })

    this.dataFiltered.forEach((e: any) => {
      let tempObj = [];
      tempObj.push(e.mes);
      tempObj.push(e.congregation);
      tempObj.push(e.dizimista);
      this.prepare.push(tempObj);
    });

    const setHeaderPageConfigIn = (data: any) => {
      this.report.setTextColor(100);
      data.settings.margin.top = 0.5;
      if (data.pageNumber === 1) {
        this.report.setFontSize(12);
        this.report.text(this.file_name, this.report.internal.pageSize.getWidth() / 2, 1, { align: 'center' });
      }
    };


    autoTable(this.report, {
      head: [['MES', 'CONGREGAÇÃO', 'DIZIMISTA']],
      body: this.prepare,
      styles: { fontSize: 8 },
      margin: { top: 1.2, left: 0.5, bottom: 0.5, right: 0.5 },
      willDrawPage: (data: any) => setHeaderPageConfigIn(data)
    });

    this.report.save(`${this.file_name}.pdf`);

    // const displayedColumns = ['mes', 'congregation', 'dizimista']
  }

  printFuction() {
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
      //this.prepareIn.push(tempObj);
    });
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
      //this.prepareIn.push(tempObj);
    });
  }

}
