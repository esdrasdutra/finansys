import { Injectable } from '@angular/core';
import { matSelectAnimations } from '@angular/material/select';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import moment from 'moment';
import { Congregation } from 'src/app/enums/congregation.enum';
import { Lancamento } from 'src/app/models/Lancamento';

// Essas constantes estavam em `relatorios.ts`, mas são mais adequadas aqui
// ou em um arquivo de constantes dedicado se usadas em mais lugares.
const MESES = [
  'JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO',
  'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO'
];

// Definindo o Mapeamento de Área aqui para ser auto-contido.
const AREAMAPPING: { [key: string]: Congregation[] } = {
    'TC': [Congregation.SEDE],
    '1': [Congregation.ESCUDO_DA_FE, Congregation.FRUTOS_DA_FE_II, Congregation.LIRIOS_DOS_VALES, Congregation.LUZ_E_VIDA, Congregation.NOVA_VIDA],
    '2': [Congregation.MONTE_DAS_OLIVEIRAS, Congregation.MONTE_HOREBE, Congregation.NOVA_ALIANCA],
    '3': [Congregation.DEUS_FORTE, Congregation.MONTE_SINAI, Congregation.NOVA_JERUSALEM, Congregation.ROCHA_ETERNA],
    '4': [Congregation.BETEL, Congregation.CONQUISTA, Congregation.PERSEVERANCA, Congregation.PORTA_DAS_OVELHAS, Congregation.PROMESSA_DE_DEUS],
    '5': [Congregation.CHAMA_VIVA, Congregation.MAR_DE_CRISTAL, Congregation.MARANATA, Congregation.MONTE_CARMELO],
    '6': [Congregation.GETSEMANI, Congregation.MANANCIAL, Congregation.MONTE_MORIA, Congregation.MONTE_TABOR, Congregation.ROSA_DE_SARON, Congregation.VIVENCIA_CRISTA],
    '7': [Congregation.ALTO_REFUGIO, Congregation.FRUTOS_DA_FE, Congregation.LIBERDADE, Congregation.REDENCAO, Congregation.MORIA_II],
    '8': [Congregation.MONTE_SIAO, Congregation.FILADELFIA, Congregation.HERANCA_DE_CRISTO, Congregation.SHALOM, Congregation.SHEKINAH],
};


@Injectable({
  providedIn: 'root'
})
export class RelatorioService {

  constructor() { }

  public gerarPdfPorPeriodo(receitas: Lancamento[], selectedYear: number): void {
    const doc = this.createDoc('landscape');    
    const meses = MESES.slice(0, 11);
    // 1. Processa e agrupa os dados
    const resultsByArea = this.processarReceitasPorArea(receitas, selectedYear, meses );

    // 2. Gera as páginas do PDF
    const columns = ['Congregação', ...meses, 'TOTAL'];
    console.log('Colunas do relatório:', columns);

    Object.keys(AREAMAPPING).forEach((areaKey, idx) => {
      const congsDaArea = AREAMAPPING[areaKey];
      const resultadosDaArea = resultsByArea[areaKey] || [];
      console.log('Área:', areaKey, 'Congregações:', congsDaArea, 'Resultados:', resultadosDaArea);

      if (resultadosDaArea.length === 0) {
        return; // Pula a área se não houver dados
      }
      
      if (idx > 0 && doc.getNumberOfPages() > 0) doc.addPage();

      const congregationsData: Record<string, any> = {};

      congsDaArea.forEach(congName => {
        congregationsData[congName] = {
          congregation: congName,
        };
      });

      resultadosDaArea.forEach((item: any) => {
        const cong = item.congregation;
        if (!congregationsData[cong]) return;

        const target = congregationsData[cong];
        const v = Number(item.valor ?? 0);

        switch (item.mes) {
            case '1': target.jan = v; break;
            case '2': target.fev = v; break;
            case '3': target.mar = v; break;
            case '4': target.abr = v; break;
            case '5': target.mai = v; break;
            case '6': target.jun = v; break;
            case '7': target.jul = v; break;
            case '8': target.ago = v; break;
            case '9': target.set = v; break;
            case '10': target.out = v; break;
            case '11': target.nov = v; break;
            default: break;
        }
        target.total += v;
      });

      const rows = Object.values(congregationsData)
        .filter((c: any) => c.total !== 0)
        .map((c: any) => ([
          c.congregation,
          this.formatCurrency(c.jan ?? 0),
          this.formatCurrency(c.fev ?? 0),
          this.formatCurrency(c.mar ?? 0),
          this.formatCurrency(c.abr ?? 0),
          this.formatCurrency(c.mai ?? 0),
          this.formatCurrency(c.jun ?? 0),
          this.formatCurrency(c.jul ?? 0),
          this.formatCurrency(c.ago ?? 0),
          this.formatCurrency(c.set ?? 0),
          this.formatCurrency(c.out ?? 0),
          this.formatCurrency(c.nov ?? 0),
          this.formatCurrency(c.total ?? 0),
        ]));

      if (!rows.length) {
        const pages = doc.getNumberOfPages();
        if (pages > 1) doc.deletePage(pages);
        return;
      }

      autoTable(doc, {
        head: [columns],
        body: rows,
        tableWidth: 'auto',
        styles: { fontSize: 8, cellWidth: 'auto', overflow: 'ellipsize' },
        margin: { top: 1.2, left: 0.5, right: 0.5, bottom: 0.5 },
        willDrawPage: (data: any) => {
          doc.setTextColor(100);
          data.settings.margin = { top: 1.2, left: 0.5, right: 0.5, bottom: 0.5 };
          doc.setFontSize(9);
          doc.text(`RELATÓRIO ANUAL - ÁREA ${areaKey}`, doc.internal.pageSize.getWidth() / 2, 1.0, { align: 'center' });
        }
      });
    });
    
    // 3. Abre o PDF em uma nova aba
    const pdfData = doc.output('dataurlstring');
    window.open(pdfData, '_blank');
  }

  private processarReceitasPorArea(receitas: Lancamento[], year: number, meses: string[]): Record<string, any[]> {
    const relatorioMensal: Record<string, any[]> = {};

    receitas.forEach((lancamento: Lancamento) => {
      const lancMoment = moment(lancamento.data_lan);
      const mes = lancMoment.format('M');

      if (lancMoment.year() == year && meses.includes(MESES[parseInt(mes) - 1])) {
        if (!relatorioMensal[mes]) {
          relatorioMensal[mes] = []; 
        }

        const registroExistente = relatorioMensal[mes].find(item => item.congregation === lancamento.cong);

        if (registroExistente) {
          registroExistente.valor += parseFloat(lancamento.valor);
        } else {
          relatorioMensal[mes].push({
            congregation: lancamento.cong,
            mes: mes,
            valor: parseFloat(lancamento.valor),
          });
        }
      }
    });

    const resultadosPorArea: Record<string, any[]> = {};
    const resultadosMensais = Object.values(relatorioMensal);

    resultadosMensais.forEach((mes: any[]) => {
        mes.forEach((congr: any) => {
            for (const area in AREAMAPPING) {
                if (AREAMAPPING[area].some(c => c === congr.congregation)) {
                    if (!resultadosPorArea[area]) {
                        resultadosPorArea[area] = [];
                    }
                    resultadosPorArea[area].push(congr);
                    break; 
                }
            }
        });
    });
    return resultadosPorArea;
  }

  private createDoc(orientation: 'portrait' | 'landscape'): jsPDF {
    return new jsPDF({ orientation, unit: 'cm', format: 'a4' });
  }

  private formatCurrency(value: number | string): string {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
}
