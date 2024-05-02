import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatCheckboxChange } from '@angular/material/checkbox';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import moment from 'moment';
import { ComunicationService } from 'src/app/services/comunication.service';
import { Outflows } from 'src/app/enums/outflows.enum';
import { Lancamento } from 'src/app/models/Lancamento';
import { Congregation } from 'src/app/enums/congregation.enum';

@Component({
  selector: 'app-dizimistas',
  templateUrl: './dizimistas.component.html',
  styleUrls: ['./dizimistas.component.sass']
})
export class DizimistasComponent {
  CONGREGATIONS = Object.values(Congregation);

  AREAMAPPING: { [key: string]: Congregation[] } = {
    'TC': [this.CONGREGATIONS[36]],
    '1': [this.CONGREGATIONS[5], this.CONGREGATIONS[13], this.CONGREGATIONS[25], this.CONGREGATIONS[12], this.CONGREGATIONS[8]],
    '2': [this.CONGREGATIONS[19], this.CONGREGATIONS[23], this.CONGREGATIONS[18]],
    '3': [this.CONGREGATIONS[30], this.CONGREGATIONS[4], this.CONGREGATIONS[24], this.CONGREGATIONS[21]],
    '4': [this.CONGREGATIONS[27], this.CONGREGATIONS[28], this.CONGREGATIONS[3], this.CONGREGATIONS[26], this.CONGREGATIONS[1]],
    '5': [this.CONGREGATIONS[17], this.CONGREGATIONS[2], this.CONGREGATIONS[16], this.CONGREGATIONS[15]],
    '6': [this.CONGREGATIONS[9], this.CONGREGATIONS[20], this.CONGREGATIONS[22], this.CONGREGATIONS[14], this.CONGREGATIONS[31], this.CONGREGATIONS[35]],
    '7': [this.CONGREGATIONS[0], this.CONGREGATIONS[29], this.CONGREGATIONS[33], this.CONGREGATIONS[11], this.CONGREGATIONS[7]],
    '8': [this.CONGREGATIONS[32], this.CONGREGATIONS[6], this.CONGREGATIONS[10], this.CONGREGATIONS[34]],
  }
  
  file_name_in = '';
  reportIn: any;
  dataDespesas: Lancamento[] = [];
  dataReceitas: Lancamento[] = [];
  dataReceitasFiltered: any;
  prepareIn: any;
  displayedColumnsIn: string[] = [''];
  dataSourceReceita: any;
  constructor(
    private commService: ComunicationService,
  ) { }

  ngOnInit(): void {
    this.commService.despesasList$.subscribe(
      {
        next: (data) => {
          this.dataDespesas = data.filter((el: any) => moment(el.data_lan).month() === 2) //|| moment(el.data_lan).month() === 3)
        },
        error: (err) => console.log(err),
      }
    )

    this.commService.receitasList$.subscribe(
      {
        next: (data) => {
          this.dataReceitas = data.filter((el: any) => moment(el.data_lan).month() === 2) //|| moment(el.data_lan).month() === 3);
        },
        error: (err) => console.log(err),
      }
    )
  }

  getDizimistas() {
    const novaLista = [];
    this.file_name_in = `RELATÓRIO GERAL - DÍZIMO OBREIROS`
    let dizimistasList = this.dataReceitas.filter((el: any) => el.entrada === "ENTRADA DÍZIMO OBREIRO");
    const congregationMap: any = {};

    for (const area of Object.keys(this.AREAMAPPING)) {
      for (const congregation of this.AREAMAPPING[area]) {
        congregationMap[congregation] = congregationMap[congregation] || [];
      }
    }

    for (const lancamento of dizimistasList) {
      const congregacao = lancamento.cong;
      const dizimista = congregationMap[congregacao].find(
        (d: any) => d.nome === lancamento.dizimista
      );

      if (!dizimista) {
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

    for (const area of Object.keys(this.AREAMAPPING)) {
      const congregacoes = [];

      for (const congregation of this.AREAMAPPING[area]) {
        congregacoes.push({
          nome: congregation,
          dizimistas: congregationMap[congregation].sort((a: any, b: any) => b.valorTotal - a.valorTotal),
        });
      }

      novaLista.push({
        area,
        congregacoes,
      });
    }

    for (const area of novaLista) {
      for (const congregacao of area.congregacoes) {
        for (const dizimista of congregacao.dizimistas) {
          if (dizimista.nome) {
          this.dataReceitasFiltered.push({
            mes: '03',
            dizimista: dizimista.nome,
            congregation: congregacao.nome,
          });
          }
        }
      }
    }

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
      tempObj.push(e.dizimista);
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
      head: [['MÊS', 'CONGREGAÇÃO', 'DIZIMISTA']],
      body: this.prepareIn,
      styles: { fontSize: 7 },
      margin: { top: 1.2, left: 0.5, bottom: 0.5, right: 0.5 },
      willDrawPage: (data) => setHeaderPageConfigIn(data)
    });

    this.reportIn.save(`${this.file_name_in}.pdf`);

    this.displayedColumnsIn = ['mes', 'congregation', 'dizimista']

    this.dataSourceReceita.data = this.dataReceitasFiltered;

  }


}
