 | slice:5:7

 'mes', 'recibo', 'congregation', 'saida', 'tipo_doc', 'obs', 'valor'

 dizimistasList.forEach((obj: any) => {
    congName = obj.cong;
    month = moment(obj.data_lan).format('MM');
    this.dataReceitasFiltered.push({ mes: month, congregation: congName, dizimista: obj.dizimista})
  });

  this.dataReceitasFiltered.forEach((obj: any) => {
    let valor = parseFloat(obj.valor)
    totalValue += valor
  });

  this.displayedColumns = ['mes', 'congregation', 'dizimista']

  this.dataSourceReceita.data = this.dataReceitasFiltered;