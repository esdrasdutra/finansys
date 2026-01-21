import { Injectable } from '@angular/core';
import { Lancamento } from '../models/Lancamento';
import { Account } from '../enums/account.enum';
import { Congregation } from '../enums/congregation.enum';
import { DocType } from '../enums/doc-type.enum';
import { Inflows } from '../enums/inflows.enum';
import { Outflows } from '../enums/outflows.enum';
import { LaunchType } from '../enums/launch-type.enm';
import { Supliers } from '../enums/supliers.enum';

@Injectable({
  providedIn: 'root'
})
export class CsvParserService {

  constructor() { }

  parseCsvData(csvString: string): Lancamento[] {
    const lancamentos: Lancamento[] = [];
    const lines = csvString.split('\n');

    // Find the header line (Mês,RECIBO,Dt. Lançamento,...)
    let headerIndex = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('Mês,RECIBO,Dt. Lançamento')) {
        headerIndex = i;
        break;
      }
    }

    if (headerIndex === -1) {
      console.error('CSV header not found.');
      return [];
    }

    const headers = lines[headerIndex].split(',').map(header => header.trim());
    const dataLines = lines.slice(headerIndex + 1);

    for (const line of dataLines) {
      if (line.trim() === '' || line.includes('#ERROR!')) {
        continue; // Skip empty lines and error lines
      }

      const values = this.parseCsvLine(line);
      // Ensure we have enough values to match headers
      if (values.length < headers.length) {
        continue;
      }

      const lancamento: Partial<Lancamento> = {};

      headers.forEach((header, index) => {
        const value = values[index];

        switch (header) {
          case 'Mês':
            lancamento.mes = parseInt(value, 10);
            break;
          case 'RECIBO':
            lancamento.recibo = value;
            break;
          case 'Dt. Lançamento':
            lancamento.data_lan = this.parseDate(value);
            break;
          case 'Dt. Vec.':
            lancamento.data_ven = this.parseDate(value);
            break;
          case 'TIPO DOC.':
            lancamento.tipo_doc = this.mapDocType(value);
            break;
          case 'Nº DOC.':
            lancamento.num_doc = value;
            break;
          case 'ENTRADAS / SAÍDAS':
            // This field will be inferred or used for history in the future,
            // for now it's part of the logic to determine tipo_lanc
            // lancamento.entrada_saida = value; // No direct mapping in Lancamento model
            break;
          case 'FORNECEDORES':
            const mappedCongregation = this.mapCongregation(value);
            const mappedSupplier = this.mapSupplier(value);
            if (mappedCongregation !== value) { // If it was mapped to an enum, it's a congregation
                lancamento.cong = mappedCongregation;
            } else if (mappedSupplier !== value) { // If it was mapped to an enum, it's a supplier
                lancamento.forn = mappedSupplier;
            } else { // If not found in enums, treat as raw string for now
                lancamento.cong = value; // Default to cong if not found in enums
            }
            break;
          case 'CÓD. DIZIMISTA':
            lancamento.cod_dizimista = value;
            break;
          case 'NOME DIZIMISTA':
            lancamento.dizimista = value;
            break;
          case 'FUNÇÃO':
            lancamento.funcao = value;
            break;
          case 'OBS.':
            lancamento.obs = value;
            break;
          case 'Valor':
            lancamento.valor = this.parseValue(value);
            break;
          case 'Conta':
            lancamento.conta = this.mapAccount(value);
            break;
          case 'Pago?':
            // This is 'SIM' or 'NÃO' usually. Could be mapped to a boolean or status_lanc
            // For now, it's part of the overall status_lanc if needed.
            break;
          case 'TIPO LANÇ.':
            lancamento.tipo_lanc = this.mapLaunchType(value);
            break;
          case 'HISTÓRICO':
            lancamento.historico = value;
            break;
          case 'SITUAÇÃO':
            lancamento.situacao = value;
            lancamento.status_lanc = value; // Assuming SITUAÇÃO maps to status_lanc
            break;
          default:
            // console.warn(`Unknown header: ${header}`);
            break;
        }
      });

      // After parsing, if it's a "DESPESA" but value is positive, make it negative.
      // Or if "RECEITA" and value is negative, make it positive.
      // The CSV seems to handle this with "R$ (X,XX)" for expenses, so parsing should yield correct sign.
      if (lancamento.tipo_lanc === LaunchType.DESPESA && (lancamento.valor && lancamento.valor > 0)) {
        lancamento.valor = -lancamento.valor;
      } else if (lancamento.tipo_lanc === LaunchType.RECEITA && (lancamento.valor && lancamento.valor < 0)) {
        lancamento.valor = -lancamento.valor;
      }


      lancamentos.push(lancamento as Lancamento);
    }

    return lancamentos;
  }

  private parseCsvLine(line: string): string[] {
    const values: string[] = [];
    let inQuote = false;
    let current = '';
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuote = !inQuote;
      } else if (char === ',' && !inQuote) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim()); // Add the last value
    return values;
  }

  private parseDate(dateString: string): Date | undefined {
    // Example: "2-jan.-23" or "2-jan-23"
    // Convert to "YYYY-MM-DD" or similar parsable format
    const parts = dateString.split('-');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const monthMap: { [key: string]: number } = {
        'jan.': 0, 'jan': 0,
        'fev.': 1, 'fev': 1,
        'mar.': 2, 'mar': 2,
        'abr.': 3, 'abr': 3,
        'mai.': 4, 'mai': 4,
        'jun.': 5, 'jun': 5,
        'jul.': 6, 'jul': 6,
        'ago.': 7, 'ago': 7,
        'set.': 8, 'set': 8,
        'out.': 9, 'out': 9,
        'nov.': 10, 'nov': 10,
        'dez.': 11, 'dez': 11,
      };
      const month = monthMap[parts[1].toLowerCase()];
      let year = parseInt(parts[2], 10);

      // Handle "23" for "2023" assuming 21st century
      if (year < 100) {
        year += 2000;
      }
      if (!isNaN(day) && month !== undefined && !isNaN(year)) {
        return new Date(year, month, day);
      }
    }
    return undefined;
  }

  private parseValue(valueString: string): number | undefined {
    // Example: " R$ 420,00 " or " R$ (13,00)"
    if (!valueString) return undefined;

    let cleanValue = valueString.replace('R$', '').trim();
    let isNegative = false;

    if (cleanValue.startsWith('(') && cleanValue.endsWith(')')) {
      isNegative = true;
      cleanValue = cleanValue.substring(1, cleanValue.length - 1);
    }

    cleanValue = cleanValue.replace(/\./g, '').replace(',', '.'); // Remove thousands separator, change decimal comma to dot

    const value = parseFloat(cleanValue);
    if (isNaN(value)) {
        return undefined;
    }
    return isNegative ? -value : value;
  }

  private mapAccount(accountString: string): Account {
    // Normalize "CAIXA IGREJA" to "CONTA IGREJA"
    const normalizedString = accountString.toUpperCase().includes('CAIXA IGREJA') ? Account.ACC_01 : accountString.toUpperCase();

    for (const key in Account) {
      if (Object.prototype.hasOwnProperty.call(Account, key)) {
        const enumValue = Account[key as keyof typeof Account];
        if (typeof enumValue === 'string' && enumValue.toUpperCase() === normalizedString) {
          return enumValue;
        }
      }
    }
    return Account.ACC_00; // Default or unknown
  }

  private mapCongregation(congregationString: string): Congregation | string {
    const normalizedString = congregationString.toUpperCase();
    for (const key in Congregation) {
      if (Object.prototype.hasOwnProperty.call(Congregation, key)) {
        const enumValue = Congregation[key as keyof typeof Congregation];
        if (typeof enumValue === 'string' && enumValue.toUpperCase() === normalizedString) {
          return enumValue;
        }
      }
    }
    return congregationString; // Return original string if not found in enum
  }

  private mapSupplier(supplierString: string): Supliers | string {
    const normalizedString = supplierString.toUpperCase();
    for (const key in Supliers) {
      if (Object.prototype.hasOwnProperty.call(Supliers, key)) {
        const enumValue = Supliers[key as keyof typeof Supliers];
        if (typeof enumValue === 'string' && enumValue.toUpperCase() === normalizedString) {
          return enumValue;
        }
      }
    }
    return supplierString; // Return original string if not found in enum
  }

  private mapDocType(docTypeString: string): DocType | string {
    const normalizedString = docTypeString.toUpperCase();
    for (const key in DocType) {
      if (Object.prototype.hasOwnProperty.call(DocType, key)) {
        const enumValue = DocType[key as keyof typeof DocType];
        if (typeof enumValue === 'string' && enumValue.toUpperCase() === normalizedString) {
          return enumValue;
        }
      }
    }
    return docTypeString; // Return original string if not found in enum
  }

  private mapLaunchType(launchTypeString: string): LaunchType | string {
    const normalizedString = launchTypeString.toUpperCase();
    for (const key in LaunchType) {
      if (Object.prototype.hasOwnProperty.call(LaunchType, key)) {
        const enumValue = LaunchType[key as keyof typeof LaunchType];
        if (typeof enumValue === 'string' && enumValue.toUpperCase() === normalizedString) {
          return enumValue;
        }
      }
    }
    return launchTypeString; // Return original string if not found in enum
  }
}
