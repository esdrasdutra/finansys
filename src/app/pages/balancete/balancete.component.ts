import { Component, OnInit } from '@angular/core';
import { COLUMNMAPPING, MESES } from 'src/app/entities/relatorios/relatorios';
import { MatButtonToggleGroup, MatButtonToggleModule } from '@angular/material/button-toggle';
import { Lancamento } from 'src/app/models/Lancamento';
import { ComunicationService } from 'src/app/services/comunication.service';
import { LancamentoService } from 'src/app/services/lancamentos/lancamento.service';
import { Inflows } from 'src/app/enums/inflows.enum';
import { Outflows } from 'src/app/enums/outflows.enum';

interface EntradaDados {
  receitas: string;
  total: number | string; // Pode ser um número antes da formatação ou uma string após a formatação
  percentual: string;
  [key: string]: any; // Para armazenar os meses dinamicamente
}


@Component({
  selector: 'app-balancete',
  templateUrl: './balancete.component.html',
  styleUrls: ['./balancete.component.sass'],
})
export class BalanceteComponent implements OnInit {
  columnMapping = COLUMNMAPPING;

  meses = MESES;

  dataDespesas!: Lancamento[];
  dataReceitas!: Lancamento[];
  dadosBrutos: any = [];

  totais = {}

  dataSourceDespesas: any = [];

  dataSourceReceitas: any = [];

  displayColumns = ['receitas', ...this.meses, 'total', 'percentual'];

  constructor(
    private commService: ComunicationService,
    private lancamentoService: LancamentoService,
  ) {}

  isSticky(buttonToggleGroup: MatButtonToggleGroup, id: string) {
    return (buttonToggleGroup.value || []).indexOf(id) !== -1;
  }

  ngOnInit(): void {
    this.lancamentoService.getAll().subscribe(
      {
        next: (data) => {
          this.commService.setLancamentos(data, 'Balancete')
        },
        error: (err) => console.log(err),
      });

    this.commService.lancamentosList$.subscribe(data => {
      this.dadosBrutos = data
    });

    this.dataSourceReceitas = Object.values(this.formatarDados(this.dadosBrutos.entradas, Inflows));
    this.dataSourceDespesas = Object.values(this.formatarDados(this.dadosBrutos.saidas, Outflows));

    
  }

  formatarDados(dados: any [], type: typeof Inflows | typeof Outflows): Record <string, EntradaDados> {    
    let dadosPorTipo: Record<string, EntradaDados> = {};

    let totalPorMes: Record<string, number> = {}; // Armazena a soma de cada mês
    let totalToPercent: number = 0;
    let somaTotal: number = 0; // Armazena a soma total da coluna "Total"
    let percentual: number = 0;

    // Inicializa o total por mês para cada mês no ano
    this.meses.forEach((mes: string) => {
      totalPorMes[mes] = 0;
    });

    // Primeiro, calcular o total geral para percentuais
    dados.forEach((res: any) => {
      totalToPercent += res.valor_total;
    });

    // Iterar sobre cada tipo de entrada
    Object.values(type).forEach((entries: string) => {
      // Inicializa o objeto para armazenar os dados da entrada atual
      if (!dadosPorTipo[entries]) {
        dadosPorTipo[entries] = { receitas: entries, total: 0, percentual: '' };
      }

      // Itera sobre os dados brutos e processa cada entrada
      dados.forEach((res: any) => {
        let identifier = res.entrada ? res.entrada : res.saida;
        if (entries === identifier) {
          // Inicializa o array para armazenar os dados do mês correspondente
          if (!dadosPorTipo[entries][this.meses[res.mes - 1]]) {
            dadosPorTipo[entries][this.meses[res.mes - 1]] = [];
          }

          // Adiciona o valor total ao total acumulado da entrada
          dadosPorTipo[entries].total += res.valor_total;


          // Soma o valor total ao mês correspondente para a nova linha de somas
          totalPorMes[this.meses[res.mes - 1]] += res.valor_total;

          // Formata o valor para o formato BRL e adiciona no array do mês
          const formattedValue = res.valor_total.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          });
          dadosPorTipo[entries][this.meses[res.mes - 1]].push(formattedValue);
        }
      });

      // Calcula o percentual de participação e formata
      const totalUnformatted = dadosPorTipo[entries].total as number; // Garantindo que 'total' é um número aqui
      somaTotal += totalUnformatted;

      dadosPorTipo[entries].total = totalUnformatted > 0
        ? totalUnformatted.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
        : '  -  ';

      percentual = ((totalUnformatted / totalToPercent) * 100)
      dadosPorTipo[entries].percentual = percentual > 0 ? percentual.toFixed(1) + '%' : '  -  '
    });

    dadosPorTipo['Total'] = { receitas: 'Total', total: '', percentual: '' };

    // Formata a soma total de cada mês e adiciona à linha 'Total', verificando se há valores para aquele mês
    this.meses.forEach((mes: string) => {
      const totalMes = totalPorMes[mes];
      const formattedTotalMes = totalMes > 0
        ? totalMes.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
        : '  -  '; // Exibe 'R$ -' quando não houver valor acumulado
      dadosPorTipo['Total'][mes] = formattedTotalMes;
    });

    Object.values(type).forEach((entries: string) => {
      this.meses.forEach((mes: string) => {
        if (!dadosPorTipo[entries][mes] || dadosPorTipo[entries][mes].length === 0) {
          dadosPorTipo[entries][mes] = '  -  '; // Insere "R$ -" se não houver registros
        }
      });
    });

    // Formata o total da coluna "Total" na linha 'Total'
    dadosPorTipo['Total'].total = somaTotal > 0
      ? somaTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
      : '  -  '; // Exibe "R$ -" se não houver soma total

    // Opcional: Se for necessário remover entradas como '-', '0', pode-se ajustar a lógica na origem dos dados brutos,
    // mas caso precise de remoção, garantir que não sejam consideradas:
    delete dadosPorTipo['-'];    
    
    return dadosPorTipo;
  }
}
