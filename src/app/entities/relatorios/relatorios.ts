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

export const AREAMAPPING: { [key: string]: Congregation[] } = {
  'TC': [CONGREGATIONS[36]],
  '1': [CONGREGATIONS[5], CONGREGATIONS[13], CONGREGATIONS[25], CONGREGATIONS[12], CONGREGATIONS[8]],
  '2': [CONGREGATIONS[19], CONGREGATIONS[23], CONGREGATIONS[18]],
  '3': [CONGREGATIONS[30], CONGREGATIONS[4], CONGREGATIONS[24], CONGREGATIONS[21]],
  '4': [CONGREGATIONS[27], CONGREGATIONS[28], CONGREGATIONS[3], CONGREGATIONS[26], CONGREGATIONS[1]],
  '5': [CONGREGATIONS[17], CONGREGATIONS[2], CONGREGATIONS[16], CONGREGATIONS[15]],
  '6': [CONGREGATIONS[9], CONGREGATIONS[20], CONGREGATIONS[22], CONGREGATIONS[14], CONGREGATIONS[31], CONGREGATIONS[35]],
  '7': [CONGREGATIONS[0], CONGREGATIONS[29], CONGREGATIONS[33], CONGREGATIONS[11], CONGREGATIONS[7]],
  '8': [CONGREGATIONS[32], CONGREGATIONS[6], CONGREGATIONS[10], CONGREGATIONS[34]],
}

export const FILTROS: string[] = ['Mês', 'Recibo','Valor', 'Tipo Documento', 'Nº Documento'];

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
  private commService: ComunicationService;
  dataReceitasFiltered: any = [];
  dataDespesasFiltered: any = []

  constructor() {
    this.commService = inject(ComunicationService);
  }
  
  dataReceitas: any = [];
  
  file_name!: string;
  report = new jsPDF();
  prepare: any = [];
  dataFiltered: any = [];
  novaLista: any = [];
  receitasPerCong: any = [];

  getDizimistas(data: any): void {
    this.file_name = `RELATÓRIO GERAL - DÍZIMO OBREIROS`

    let dizimistasList = data.filter((el: any) => el.entrada === "ENTRADA DÍZIMO OBREIRO");

    let congregationMap: any = [];

    for (const area of Object.keys(AREAMAPPING)) {
      for (const congregation of AREAMAPPING[area]) {
        congregationMap[congregation] = congregationMap[congregation] || [];
      }
    }

    for (const lancamento of dizimistasList) {
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
            let mes = moment().add(-1, 'months');
            this.dataFiltered.push({
              mes: mes.format('MM'),
              dizimista: dizimista.nome,
              congregation: congregacao.nome,
            });
          }
        }
      }
    }

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
      head: [['MÊS', 'CONGREGAÇÃO', 'DIZIMISTA']],
      body: this.prepare,
      styles: { fontSize: 8 },
      margin: { top: 1.2, left: 0.5, bottom: 0.5, right: 0.5 },
      willDrawPage: (data: any) => setHeaderPageConfigIn(data)
    });
    
    this.report.save(`${this.file_name}.pdf`);

    // const displayedColumns = ['mes', 'congregation', 'dizimista']
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
      head: [[ 'CONGREGAÇÃO', 'VALOR']],
      body: this.prepare,
      styles: { fontSize: 7 },
      margin: { top: 1.2, left: 0.5, bottom: 0.5, right: 0.5 },
      willDrawPage: (data) => setHeaderPageConfigIn(data)
    });

    //this.report.save(`${this.file_name}.pdf`);
    return this.dataFiltered;
  }

  getRelatorioPorPeriodo() {
    this.file_name = `RELATÓRIO DE ENTRADAS - POR PERÍODO`;
    
    this.commService.receitasList$.subscribe(
      {
        next: (data) => {
          this.dataReceitas = data;
        },
        error: (err) => console.log(err),
      }
    )

    const startDate = moment(new Date(2024, 1, 1));
    const endDate = moment(new Date(2024, 5, 30));

    CONGREGATIONS.forEach((cong: string)=> {
      this.receitasPerCong.push(
        this.dataReceitas.filter((el: Lancamento) => {
          const lancMoment = moment(el.data_lan);
          return el.cong === cong && lancMoment.isBetween(startDate, endDate, 'days', '[]')
        }),
      );
    })

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
    return this.dataReceitasFiltered ;
  }

  getRelatoriosPorCongregacao(dataReceita: any, dataDespesa: any) {
    let congName = '';
    let month = null;
    let totalValue = 0;
    this.dataDespesasFiltered = [];
    this.dataReceitasFiltered = [];

    let file_name_in = `REATÓRIO ANALÍTICO DE ENTRADAS - ${congName}`;
    let file_name_out = `RELATÓRIO ANALÍTICO DE SAÍDAS - ${congName}`;
    
    dataReceita.forEach((obj: Lancamento) => {
      congName = obj.cong;
      month = moment(obj.data_lan).format('MM');
      this.dataReceitasFiltered.push({ mes: month, recibo: obj.recibo, congregation: congName, entrada: obj.entrada, dizimista: obj.dizimista, obs: obj.historico, valor: obj.valor })
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


    let dizimistasList = this.dataReceitas.filter((lanc: Lancamento) => 
      {
        const lancMoment = moment(lanc.data_lan);
        return lancMoment.isBetween(startDate, endDate, 'days', '[]') && lanc.entrada === "ENTRADA DÍZIMO OBREIRO" && lanc.cong === congregacaoSelecionada[0];
      });

    dizimistasList.forEach((lanc: Lancamento) => {
      let congName = lanc.cong;
      let month = moment(lanc.data_lan).format('MM');
      this.dataFiltered.push({mes: month, congregation: congName, dizimista: lanc.dizimista});
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

  printFuction(){
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
