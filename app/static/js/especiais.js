/**
 * BRIGADA-IA — Especiais Module (Setor Açougue)
 * Mapa Bovino Anatômico Ilustrado em Alta Resolução &
 * Componente Interativo com Destaque de Cortes e Integração com Códigos Especiais.
 */

window.BrigadaEspeciais = {
  activeCut: null,
  activeTierFilter: 'all',
  searchQuery: '',
  activeCatFilter: 'TODOS',

  // Catálogo Oficial dos 137 Códigos Bovinos
  codigosEspeciais: [
  {
    "codigo": "1068",
    "descricao": "FRANGO INTEIRO RESF NATTO",
    "categoria": "AVES RESFRIADAS",
    "codigo_base": "10013",
    "corte_bovino": "aves"
  },
  {
    "codigo": "1190",
    "descricao": "FRANGO INTEIRO RESF MAURICEA",
    "categoria": "AVES RESFRIADAS",
    "codigo_base": "11914",
    "corte_bovino": "aves"
  },
  {
    "codigo": "1439",
    "descricao": "BANANINHA CONGELADA FRIBOI",
    "categoria": "BOVINO CONGELADO",
    "codigo_base": null,
    "corte_bovino": "costela"
  },
  {
    "codigo": "1800",
    "descricao": "ASA / COXA COM SOBRE FG RESF MAURICEA KG",
    "categoria": "AVES RESFRIADAS",
    "codigo_base": "20043",
    "corte_bovino": "aves"
  },
  {
    "codigo": "1801",
    "descricao": "CORAÇÃO DE FG RESF MAURICEA KG",
    "categoria": "AVES RESFRIADAS",
    "codigo_base": "20048",
    "corte_bovino": "aves"
  },
  {
    "codigo": "1829",
    "descricao": "BIFE DE CUPIM FRIBOI",
    "categoria": "BOVINO CONGELADO",
    "codigo_base": null,
    "corte_bovino": "cupim"
  },
  {
    "codigo": "1830",
    "descricao": "ARANHA CONGELADA FRIBOI",
    "categoria": "BOVINO CONGELADO",
    "codigo_base": null,
    "corte_bovino": "alcatra"
  },
  {
    "codigo": "1833",
    "descricao": "COSTELA TIRAS FRIBOI",
    "categoria": "BOVINO CONGELADO",
    "codigo_base": null,
    "corte_bovino": "costela"
  },
  {
    "codigo": "1835",
    "descricao": "PEITO BOV FRIBOI RESF PEÇA",
    "categoria": "BOVINO RESFRIADO",
    "codigo_base": null,
    "corte_bovino": "peito"
  },
  {
    "codigo": "1837",
    "descricao": "COXÃO MOLE FRIBOI RESF PEÇA",
    "categoria": "BOVINO RESFRIADO",
    "codigo_base": null,
    "corte_bovino": "coxão-mole"
  },
  {
    "codigo": "1851",
    "descricao": "FRALDINHA FRIBOI RESF PEÇA",
    "categoria": "BOVINO RESFRIADO",
    "codigo_base": null,
    "corte_bovino": "fraldinha"
  },
  {
    "codigo": "1852",
    "descricao": "CAPA DE FILÉ FRIBOI RESF PEÇA",
    "categoria": "BOVINO RESFRIADO",
    "codigo_base": null,
    "corte_bovino": "capa-de-filé"
  },
  {
    "codigo": "1869",
    "descricao": "OSSO PATINHO CONG PEÇA FRIBOI",
    "categoria": "BOVINO CONGELADO",
    "codigo_base": null,
    "corte_bovino": "patinho"
  },
  {
    "codigo": "1873",
    "descricao": "BUCHO CONGELADO FRIBOI",
    "categoria": "VÍSCERAS BOVINAS",
    "codigo_base": null,
    "corte_bovino": "vísceras"
  },
  {
    "codigo": "1903",
    "descricao": "PICADINHO BOVINO KG",
    "categoria": "BOVINO RESFRIADO",
    "codigo_base": "19836",
    "corte_bovino": "acém"
  },
  {
    "codigo": "1942",
    "descricao": "FILÉ DE PEITO RESF MAURICEA KG",
    "categoria": "AVES RESFRIADAS",
    "codigo_base": "20046",
    "corte_bovino": "peito"
  },
  {
    "codigo": "1943",
    "descricao": "COXA DE FG RESF MAURICEA KG",
    "categoria": "AVES RESFRIADAS",
    "codigo_base": "20047",
    "corte_bovino": "aves"
  },
  {
    "codigo": "1944",
    "descricao": "MOELA FG RESF MAURICEA KG",
    "categoria": "AVES RESFRIADAS",
    "codigo_base": "20048",
    "corte_bovino": "aves"
  },
  {
    "codigo": "1945",
    "descricao": "COXINHA DA ASA FG RESF MAURICEA KG",
    "categoria": "AVES RESFRIADAS",
    "codigo_base": "20049",
    "corte_bovino": "aves"
  },
  {
    "codigo": "1946",
    "descricao": "PEITO FG RESF MAURICEA KG",
    "categoria": "AVES RESFRIADAS",
    "codigo_base": "20050",
    "corte_bovino": "peito"
  },
  {
    "codigo": "1947",
    "descricao": "FÍGADO DE FG RESF MAURICEA KG",
    "categoria": "AVES RESFRIADAS",
    "codigo_base": "20051",
    "corte_bovino": "aves"
  },
  {
    "codigo": "1948",
    "descricao": "SOBRECOXA FG RESF MAURICEA KG",
    "categoria": "AVES RESFRIADAS",
    "codigo_base": "20052",
    "corte_bovino": "aves"
  },
  {
    "codigo": "1985",
    "descricao": "PALETA FRIBOI RESF PEÇA",
    "categoria": "BOVINO RESFRIADO",
    "codigo_base": null,
    "corte_bovino": "paleta"
  },
  {
    "codigo": "2012",
    "descricao": "CARNE DE SOL PEDAÇO / COXÃO MOLE PED",
    "categoria": "CARNE DE SOL",
    "codigo_base": null,
    "corte_bovino": "coxão-mole"
  },
  {
    "codigo": "2013",
    "descricao": "CARNE DE SOL PALETA PEDAÇO",
    "categoria": "CARNE DE SOL",
    "codigo_base": null,
    "corte_bovino": "paleta"
  },
  {
    "codigo": "2015",
    "descricao": "COSTELA DO CHEFF / COSTELA MINGA PEDAÇO",
    "categoria": "BOVINO CONGELADO",
    "codigo_base": null,
    "corte_bovino": "costela"
  },
  {
    "codigo": "2058",
    "descricao": "PEITO BOV RESF C/ OSSO",
    "categoria": "DIANTEIRO RESFRIADO",
    "codigo_base": "20438",
    "corte_bovino": "peito"
  },
  {
    "codigo": "2059",
    "descricao": "PALETA BOV RESF C/ OSSO",
    "categoria": "DIANTEIRO RESFRIADO",
    "codigo_base": "20439",
    "corte_bovino": "paleta"
  },
  {
    "codigo": "2060",
    "descricao": "ACÉM BOV RESF C/ OSSO",
    "categoria": "DIANTEIRO RESFRIADO",
    "codigo_base": "20441",
    "corte_bovino": "acém"
  },
  {
    "codigo": "2062",
    "descricao": "CHAMBARIL DIANTEIRO BOV KG",
    "categoria": "DIANTEIRO RESFRIADO",
    "codigo_base": "20443",
    "corte_bovino": "chambaril"
  },
  {
    "codigo": "2136",
    "descricao": "MOCOTÓ BOV CG KG",
    "categoria": "VÍSCERAS BOVINAS",
    "codigo_base": "24702",
    "corte_bovino": "chambaril"
  },
  {
    "codigo": "2217",
    "descricao": "FILÉ MIGNON BOV RESF MASTERBOI KG",
    "categoria": "LINHA NACIONAL / BASE",
    "codigo_base": "20770",
    "corte_bovino": "filé-mignon"
  },
  {
    "codigo": "2218",
    "descricao": "MAMINHA BOV RESF MASTERBOI",
    "categoria": "LINHA NACIONAL / BASE",
    "codigo_base": "20771",
    "corte_bovino": "maminha"
  },
  {
    "codigo": "2219",
    "descricao": "MÚSCULO BOV RESF MASTERBOI KG",
    "categoria": "BOVINO RESFRIADO",
    "codigo_base": "20772",
    "corte_bovino": "chambaril"
  },
  {
    "codigo": "2220",
    "descricao": "PICANHA BOV RESF MASTERBOI",
    "categoria": "LINHA NACIONAL / BASE",
    "codigo_base": "20773",
    "corte_bovino": "picanha"
  },
  {
    "codigo": "2221",
    "descricao": "LAGARTO BOV RESF MASTERBOI KG",
    "categoria": "BOVINO RESFRIADO",
    "codigo_base": "20774",
    "corte_bovino": "lagarto"
  },
  {
    "codigo": "2222",
    "descricao": "MIOLO ALCATRA / CORAÇÃO DA ALCATRA PEÇA",
    "categoria": "BOVINO RESFRIADO",
    "codigo_base": "20776",
    "corte_bovino": "alcatra"
  },
  {
    "codigo": "2223",
    "descricao": "FRALDINHA BOV RESF MASTERBOI",
    "categoria": "LINHA NACIONAL / BASE",
    "codigo_base": "20777",
    "corte_bovino": "fraldinha"
  },
  {
    "codigo": "2224",
    "descricao": "CONTRA FILÉ BOV RESF PEÇA MASTERBOI",
    "categoria": "BOVINO RESFRIADO",
    "codigo_base": "20778",
    "corte_bovino": "contrafilé"
  },
  {
    "codigo": "2225",
    "descricao": "CAPA DE FILÉ BOV RESF MASTERBOI",
    "categoria": "LINHA NACIONAL / BASE",
    "codigo_base": "20797",
    "corte_bovino": "capa-de-filé"
  },
  {
    "codigo": "2226",
    "descricao": "COXÃO MOLE PEÇA RESFRIADO",
    "categoria": "BOVINO RESFRIADO",
    "codigo_base": "20775",
    "corte_bovino": "coxão-mole"
  },
  {
    "codigo": "2227",
    "descricao": "PATINHO BOV RESF PEÇA MASTERBOI",
    "categoria": "BOVINO RESFRIADO",
    "codigo_base": "20796",
    "corte_bovino": "patinho"
  },
  {
    "codigo": "2228",
    "descricao": "COSTELA BOVINA RESF / CHÃ DE FORA PEÇA",
    "categoria": "BOVINO RESFRIADO",
    "codigo_base": "23520",
    "corte_bovino": "costela"
  },
  {
    "codigo": "2238",
    "descricao": "MOCOTÓ BOV INT CG KG",
    "categoria": "VÍSCERAS BOVINAS",
    "codigo_base": "20808",
    "corte_bovino": "chambaril"
  },
  {
    "codigo": "2239",
    "descricao": "BUCHO BOV INT CG KG",
    "categoria": "VÍSCERAS BOVINAS",
    "codigo_base": "20809",
    "corte_bovino": "vísceras"
  },
  {
    "codigo": "2240",
    "descricao": "RABADA BOV INT CG KG",
    "categoria": "VÍSCERAS BOVINAS",
    "codigo_base": "20810",
    "corte_bovino": "rabo"
  },
  {
    "codigo": "2257",
    "descricao": "CARRÉ SUÍNO CONGELADO PEÇA",
    "categoria": "SUÍNO CONGELADO",
    "codigo_base": "20916",
    "corte_bovino": "suíno"
  },
  {
    "codigo": "2258",
    "descricao": "CARRÉ SUÍNO SEARA PEDAÇO KG",
    "categoria": "SUÍNO CONGELADO",
    "codigo_base": "20917",
    "corte_bovino": "suíno"
  },
  {
    "codigo": "2259",
    "descricao": "BISTECA SUÍNA CG FATIADA KG",
    "categoria": "SUÍNO CONGELADO",
    "codigo_base": "20918",
    "corte_bovino": "suíno"
  },
  {
    "codigo": "2273",
    "descricao": "COXÃO MOLE BOV RESF PEDAÇO",
    "categoria": "BOVINO RESFRIADO",
    "codigo_base": "20983",
    "corte_bovino": "coxão-mole"
  },
  {
    "codigo": "2274",
    "descricao": "COXÃO MOLE BOV RESF FATIADO",
    "categoria": "BOVINO RESFRIADO",
    "codigo_base": "20984",
    "corte_bovino": "coxão-mole"
  },
  {
    "codigo": "2277",
    "descricao": "FÍGADO BOVINO PEÇA CG / LAGARTO FATIADO",
    "categoria": "BOVINO / VÍSCERAS",
    "codigo_base": "20807",
    "corte_bovino": "lagarto"
  },
  {
    "codigo": "2278",
    "descricao": "LAGARTO BOV RESF PEDAÇO",
    "categoria": "BOVINO RESFRIADO",
    "codigo_base": "21012",
    "corte_bovino": "lagarto"
  },
  {
    "codigo": "2526",
    "descricao": "FILÉ MIGNON PORCIONADO MASTERBOI",
    "categoria": "TRASEIRO ESPECIAL",
    "codigo_base": "21913",
    "corte_bovino": "filé-mignon"
  },
  {
    "codigo": "2527",
    "descricao": "FILÉ MIGNON MASTERBOI PEDAÇO",
    "categoria": "TRASEIRO ESPECIAL",
    "codigo_base": "21914",
    "corte_bovino": "filé-mignon"
  },
  {
    "codigo": "2528",
    "descricao": "BIFE FILÉ MIGNON MASTERBOI",
    "categoria": "TRASEIRO ESPECIAL",
    "codigo_base": "21915",
    "corte_bovino": "filé-mignon"
  },
  {
    "codigo": "2529",
    "descricao": "BIFE FILÉ PARMEGIANA MASTERBOI",
    "categoria": "TRASEIRO ESPECIAL",
    "codigo_base": "21916",
    "corte_bovino": "filé-mignon"
  },
  {
    "codigo": "2530",
    "descricao": "STROGONOFF MIGNON MASTERBOI",
    "categoria": "TRASEIRO ESPECIAL",
    "codigo_base": "21917",
    "corte_bovino": "filé-mignon"
  },
  {
    "codigo": "2531",
    "descricao": "MEDALHÃO MIGNON MASTERBOI",
    "categoria": "TRASEIRO ESPECIAL",
    "codigo_base": "21918",
    "corte_bovino": "filé-mignon"
  },
  {
    "codigo": "2532",
    "descricao": "PICANHA MASTERBOI PEDAÇO",
    "categoria": "LINHA GRILL / CHURRASCO",
    "codigo_base": "21919",
    "corte_bovino": "picanha"
  },
  {
    "codigo": "2533",
    "descricao": "BIFE DE PICANHA MASTERBOI",
    "categoria": "LINHA GRILL / CHURRASCO",
    "codigo_base": "21920",
    "corte_bovino": "picanha"
  },
  {
    "codigo": "2535",
    "descricao": "PICANHA NOBRE MASTERBOI",
    "categoria": "LINHA GRILL / CHURRASCO",
    "codigo_base": null,
    "corte_bovino": "picanha"
  },
  {
    "codigo": "2536",
    "descricao": "MAMINHA MASTERBOI PEDAÇO",
    "categoria": "BOVINO RESFRIADO",
    "codigo_base": "21935",
    "corte_bovino": "maminha"
  },
  {
    "codigo": "2537",
    "descricao": "BIFE DE MAMINHA MASTERBOI",
    "categoria": "TRASEIRO ESPECIAL",
    "codigo_base": "21936",
    "corte_bovino": "maminha"
  },
  {
    "codigo": "2538",
    "descricao": "MAMINHA SANFONADA MASTERBOI",
    "categoria": "TRASEIRO ESPECIAL",
    "codigo_base": "21937",
    "corte_bovino": "maminha"
  },
  {
    "codigo": "2539",
    "descricao": "MAMINHA GRILL MASTERBOI KG",
    "categoria": "LINHA GRILL",
    "codigo_base": "21938",
    "corte_bovino": "maminha"
  },
  {
    "codigo": "2540",
    "descricao": "MAMINHA NOBRE MASTERBOI",
    "categoria": "BOVINO RESFRIADO",
    "codigo_base": "21939",
    "corte_bovino": "maminha"
  },
  {
    "codigo": "2542",
    "descricao": "CORAÇÃO DA ALCATRA PEDAÇO",
    "categoria": "BOVINO RESFRIADO",
    "codigo_base": "21941",
    "corte_bovino": "alcatra"
  },
  {
    "codigo": "2543",
    "descricao": "STEAK DO AÇOUGUEIRO MASTERBOI",
    "categoria": "CORTES ESPECIAIS",
    "codigo_base": "21942",
    "corte_bovino": "alcatra"
  },
  {
    "codigo": "2544",
    "descricao": "BIFE DE ALCATRA MASTERBOI",
    "categoria": "TRASEIRO TRADICIONAL",
    "codigo_base": "21943",
    "corte_bovino": "alcatra"
  },
  {
    "codigo": "2545",
    "descricao": "ALCATRA MASTERBOI ESPECIAL",
    "categoria": "TRASEIRO ESPECIAL",
    "codigo_base": "21944",
    "corte_bovino": "alcatra"
  },
  {
    "codigo": "2546",
    "descricao": "ALCATRA GRILL MASTERBOI KG",
    "categoria": "LINHA GRILL",
    "codigo_base": "21945",
    "corte_bovino": "alcatra"
  },
  {
    "codigo": "2547",
    "descricao": "ALCATRA BABY BEEF MASTERBOI",
    "categoria": "TRASEIRO ESPECIAL",
    "codigo_base": "21946",
    "corte_bovino": "alcatra"
  },
  {
    "codigo": "2548",
    "descricao": "BOMBOM DA ALCATRA MASTERBOI",
    "categoria": "TRASEIRO ESPECIAL",
    "codigo_base": "21947",
    "corte_bovino": "alcatra"
  },
  {
    "codigo": "2549",
    "descricao": "BABY BEEF MASTERBOI FRACIONADO",
    "categoria": "TRASEIRO ESPECIAL",
    "codigo_base": "21948",
    "corte_bovino": "alcatra"
  },
  {
    "codigo": "2550",
    "descricao": "BOMBOM ALCATRA PORCIONADO MASTERBOI",
    "categoria": "TRASEIRO ESPECIAL",
    "codigo_base": "21949",
    "corte_bovino": "alcatra"
  },
  {
    "codigo": "2551",
    "descricao": "MEDALHÃO ALCATRA MASTERBOI",
    "categoria": "TRASEIRO ESPECIAL",
    "codigo_base": "21950",
    "corte_bovino": "alcatra"
  },
  {
    "codigo": "2552",
    "descricao": "STROGONOFF ALCATRA MASTERBOI",
    "categoria": "TRASEIRO ESPECIAL",
    "codigo_base": "21951",
    "corte_bovino": "alcatra"
  },
  {
    "codigo": "2553",
    "descricao": "CONTRA FILÉ PORCIONADO MASTERBOI",
    "categoria": "BOVINO RESFRIADO",
    "codigo_base": "21952",
    "corte_bovino": "contrafilé"
  },
  {
    "codigo": "2554",
    "descricao": "CONTRA FILÉ MASTERBOI PEDAÇO",
    "categoria": "BOVINO RESFRIADO",
    "codigo_base": "21953",
    "corte_bovino": "contrafilé"
  },
  {
    "codigo": "2555",
    "descricao": "BIFE DE CONTRA FILÉ MASTERBOI",
    "categoria": "TRASEIRO TRADICIONAL",
    "codigo_base": "21954",
    "corte_bovino": "contrafilé"
  },
  {
    "codigo": "2557",
    "descricao": "BIFE DE CHORIZO MASTERBOI",
    "categoria": "LINHA GRILL",
    "codigo_base": null,
    "corte_bovino": "contrafilé"
  },
  {
    "codigo": "2558",
    "descricao": "MIOLO DO CONTRA FILÉ MASTERBOI",
    "categoria": "BOVINO RESFRIADO",
    "codigo_base": "21957",
    "corte_bovino": "contrafilé"
  },
  {
    "codigo": "2559",
    "descricao": "BIFE LIGHT CONTRA FILÉ MASTERBOI",
    "categoria": "BOVINO RESFRIADO",
    "codigo_base": "21958",
    "corte_bovino": "contrafilé"
  },
  {
    "codigo": "2560",
    "descricao": "COXÃO MOLE MASTERBOI",
    "categoria": "BOVINO RESFRIADO",
    "codigo_base": null,
    "corte_bovino": "coxão-mole"
  },
  {
    "codigo": "2561",
    "descricao": "BIFE DE COXÃO MOLE MASTERBOI",
    "categoria": "TRASEIRO TRADICIONAL",
    "codigo_base": "21960",
    "corte_bovino": "coxão-mole"
  },
  {
    "codigo": "2562",
    "descricao": "BIFE COXÃO MOLE LIGHT MASTERBOI",
    "categoria": "TRASEIRO ESPECIAL",
    "codigo_base": "21961",
    "corte_bovino": "coxão-mole"
  },
  {
    "codigo": "2563",
    "descricao": "BIFE PARIS COXÃO MOLE MASTERBOI",
    "categoria": "TRASEIRO ESPECIAL",
    "codigo_base": "21962",
    "corte_bovino": "coxão-mole"
  },
  {
    "codigo": "2564",
    "descricao": "STROGONOFF COXÃO MOLE MASTERBOI",
    "categoria": "TRASEIRO ESPECIAL",
    "codigo_base": "21963",
    "corte_bovino": "coxão-mole"
  },
  {
    "codigo": "2565",
    "descricao": "BROCHETE COXÃO MOLE MASTERBOI",
    "categoria": "CORTES ESPECIAIS",
    "codigo_base": null,
    "corte_bovino": "coxão-mole"
  },
  {
    "codigo": "2566",
    "descricao": "ASSADO CAMPESTRE MASTERBOI",
    "categoria": "CORTES ESPECIAIS",
    "codigo_base": null,
    "corte_bovino": "costela"
  },
  {
    "codigo": "2567",
    "descricao": "CORTE ORIENTAL MASTERBOI",
    "categoria": "CORTES ESPECIAIS",
    "codigo_base": null,
    "corte_bovino": "coxão-mole"
  },
  {
    "codigo": "2568",
    "descricao": "CORTE ESPIRAL MASTERBOI",
    "categoria": "CORTES ESPECIAIS",
    "codigo_base": null,
    "corte_bovino": "coxão-mole"
  },
  {
    "codigo": "2569",
    "descricao": "FLATBEEF MASTERBOI",
    "categoria": "CORTES ESPECIAIS",
    "codigo_base": "21968",
    "corte_bovino": "paleta"
  },
  {
    "codigo": "2570",
    "descricao": "STEAK DO MIOLO MASTERBOI",
    "categoria": "CORTES ESPECIAIS",
    "codigo_base": null,
    "corte_bovino": "alcatra"
  },
  {
    "codigo": "2571",
    "descricao": "COXÃO MOLE PORCIONADO MASTERBOI",
    "categoria": "BOVINO RESFRIADO",
    "codigo_base": null,
    "corte_bovino": "coxão-mole"
  },
  {
    "codigo": "2572",
    "descricao": "COXÃO MOLE MOÍDO MASTERBOI",
    "categoria": "BOVINO RESFRIADO",
    "codigo_base": null,
    "corte_bovino": "coxão-mole"
  },
  {
    "codigo": "2573",
    "descricao": "PATINHO PEDAÇO MASTERBOI",
    "categoria": "PEDAÇOS",
    "codigo_base": "21972",
    "corte_bovino": "patinho"
  },
  {
    "codigo": "2574",
    "descricao": "PATINHO MOÍDO MASTERBOI",
    "categoria": "BOVINO RESFRIADO",
    "codigo_base": "21973",
    "corte_bovino": "patinho"
  },
  {
    "codigo": "2575",
    "descricao": "BIFE DE PATINHO MASTERBOI",
    "categoria": "TRASEIRO TRADICIONAL",
    "codigo_base": "21974",
    "corte_bovino": "patinho"
  },
  {
    "codigo": "2576",
    "descricao": "DUCKBEEF MASTERBOI",
    "categoria": "CORTES ESPECIAIS",
    "codigo_base": "21975",
    "corte_bovino": "patinho"
  },
  {
    "codigo": "2577",
    "descricao": "FLANBEEF PATINHO MASTERBOI",
    "categoria": "CORTES ESPECIAIS",
    "codigo_base": "21976",
    "corte_bovino": "patinho"
  },
  {
    "codigo": "2578",
    "descricao": "ESCALOPE MASTERBOI",
    "categoria": "CORTES ESPECIAIS",
    "codigo_base": "21977",
    "corte_bovino": "patinho"
  },
  {
    "codigo": "2579",
    "descricao": "STROGONOFF DE PATINHO MASTERBOI",
    "categoria": "TRASEIRO ESPECIAL",
    "codigo_base": "21978",
    "corte_bovino": "patinho"
  },
  {
    "codigo": "2580",
    "descricao": "PATINHO MASTERBOI PORCIONADO",
    "categoria": "BOVINO RESFRIADO",
    "codigo_base": "21979",
    "corte_bovino": "patinho"
  },
  {
    "codigo": "2581",
    "descricao": "COXÃO DURO PEDAÇO / CHÃ DE FORA PED",
    "categoria": "PEDAÇOS",
    "codigo_base": "21980",
    "corte_bovino": "coxão-duro"
  },
  {
    "codigo": "2582",
    "descricao": "BIFE COXÃO DURO / BIFE CHÃ DE FORA",
    "categoria": "TRASEIRO TRADICIONAL",
    "codigo_base": "21981",
    "corte_bovino": "coxão-duro"
  },
  {
    "codigo": "2583",
    "descricao": "BIFE PARA ROLÊ COXÃO DURO",
    "categoria": "TRASEIRO ESPECIAL",
    "codigo_base": "21982",
    "corte_bovino": "coxão-duro"
  },
  {
    "codigo": "2584",
    "descricao": "REDBEEF MASTERBOI",
    "categoria": "CORTES ESPECIAIS",
    "codigo_base": "21983",
    "corte_bovino": "coxão-duro"
  },
  {
    "codigo": "2585",
    "descricao": "STRETTO MASTERBOI",
    "categoria": "CORTES ESPECIAIS",
    "codigo_base": "21984",
    "corte_bovino": "coxão-duro"
  },
  {
    "codigo": "2586",
    "descricao": "BIFE DE PANELA PAULISTA",
    "categoria": "TRASEIRO ESPECIAL",
    "codigo_base": "21985",
    "corte_bovino": "coxão-duro"
  },
  {
    "codigo": "2587",
    "descricao": "CUBOS COXÃO DURO MASTERBOI",
    "categoria": "CUBOS",
    "codigo_base": "21986",
    "corte_bovino": "coxão-duro"
  },
  {
    "codigo": "2588",
    "descricao": "COXÃO DURO MOÍDO MASTERBOI",
    "categoria": "BOVINO RESFRIADO",
    "codigo_base": "21987",
    "corte_bovino": "coxão-duro"
  },
  {
    "codigo": "2589",
    "descricao": "COXÃO DURO PORCIONADO MASTERBOI",
    "categoria": "BOVINO RESFRIADO",
    "codigo_base": "21988",
    "corte_bovino": "coxão-duro"
  },
  {
    "codigo": "2590",
    "descricao": "LAGARTO MASTERBOI PEDAÇO",
    "categoria": "BOVINO RESFRIADO",
    "codigo_base": "21989",
    "corte_bovino": "lagarto"
  },
  {
    "codigo": "2591",
    "descricao": "BIFE DE LAGARTO MASTERBOI",
    "categoria": "TRASEIRO TRADICIONAL",
    "codigo_base": "21990",
    "corte_bovino": "lagarto"
  },
  {
    "codigo": "2592",
    "descricao": "BIFE LAGARTO PALHA MASTERBOI",
    "categoria": "TRASEIRO ESPECIAL",
    "codigo_base": "21991",
    "corte_bovino": "lagarto"
  },
  {
    "codigo": "2593",
    "descricao": "ESCABECHE MASTERBOI",
    "categoria": "CORTES ESPECIAIS",
    "codigo_base": "21992",
    "corte_bovino": "lagarto"
  },
  {
    "codigo": "2594",
    "descricao": "PICADINHO MAGRO MASTERBOI",
    "categoria": "CORTES ESPECIAIS",
    "codigo_base": "21993",
    "corte_bovino": "acém"
  },
  {
    "codigo": "2595",
    "descricao": "LAGARTO PARA RECHEAR MASTERBOI",
    "categoria": "LAGARTO ESPECIAL",
    "codigo_base": "21994",
    "corte_bovino": "lagarto"
  },
  {
    "codigo": "2596",
    "descricao": "LAGARTO SANFONADO MASTERBOI",
    "categoria": "LAGARTO ESPECIAL",
    "codigo_base": "21995",
    "corte_bovino": "lagarto"
  },
  {
    "codigo": "2597",
    "descricao": "LAGARTO ESPECIAL MASTERBOI",
    "categoria": "LAGARTO ESPECIAL",
    "codigo_base": "21996",
    "corte_bovino": "lagarto"
  },
  {
    "codigo": "2598",
    "descricao": "LAGARTO PORCIONADO MASTERBOI",
    "categoria": "BOVINO RESFRIADO",
    "codigo_base": "21997",
    "corte_bovino": "lagarto"
  },
  {
    "codigo": "2599",
    "descricao": "FRALDINHA PEDAÇO MASTERBOI",
    "categoria": "BOVINO RESFRIADO",
    "codigo_base": "21998",
    "corte_bovino": "fraldinha"
  },
  {
    "codigo": "2600",
    "descricao": "FRALDINHA GRILL MASTERBOI",
    "categoria": "LINHA GRILL",
    "codigo_base": "21999",
    "corte_bovino": "fraldinha"
  },
  {
    "codigo": "2601",
    "descricao": "FRALDINHA NOBRE MASTERBOI",
    "categoria": "LINHA GRILL",
    "codigo_base": "22000",
    "corte_bovino": "fraldinha"
  },
  {
    "codigo": "2602",
    "descricao": "STEAK VIRGÍNIA MASTERBOI",
    "categoria": "TRASEIRO ESPECIAL",
    "codigo_base": "22001",
    "corte_bovino": "fraldinha"
  },
  {
    "codigo": "2603",
    "descricao": "FRALDA PORCIONADA MASTERBOI",
    "categoria": "BOVINO RESFRIADO",
    "codigo_base": "22002",
    "corte_bovino": "fraldinha"
  },
  {
    "codigo": "2604",
    "descricao": "MÚSCULO PEDAÇO MASTERBOI",
    "categoria": "MÚSCULO ESPECIAL",
    "codigo_base": "22003",
    "corte_bovino": "chambaril"
  },
  {
    "codigo": "2605",
    "descricao": "MÚSCULO MOLE ESPECIAL MASTERBOI",
    "categoria": "MÚSCULO ESPECIAL",
    "codigo_base": "22004",
    "corte_bovino": "chambaril"
  },
  {
    "codigo": "2606",
    "descricao": "MÚSCULO MOLE FATIADO MASTERBOI",
    "categoria": "MÚSCULO ESPECIAL",
    "codigo_base": "22005",
    "corte_bovino": "chambaril"
  },
  {
    "codigo": "2607",
    "descricao": "MÚSCULO TORTUGUITA MASTERBOI",
    "categoria": "MÚSCULO ESPECIAL",
    "codigo_base": "22006",
    "corte_bovino": "chambaril"
  },
  {
    "codigo": "2608",
    "descricao": "MÚSCULO PICADINHO MASTERBOI",
    "categoria": "MÚSCULO ESPECIAL",
    "codigo_base": "22007",
    "corte_bovino": "acém"
  },
  {
    "codigo": "2609",
    "descricao": "MÚSCULO MOÍDO MASTERBOI",
    "categoria": "BOVINO RESFRIADO",
    "codigo_base": "22008",
    "corte_bovino": "chambaril"
  },
  {
    "codigo": "2610",
    "descricao": "STEAK TORTUGUITA MASTERBOI",
    "categoria": "CORTES ESPECIAIS",
    "codigo_base": "22009",
    "corte_bovino": "chambaril"
  },
  {
    "codigo": "2613",
    "descricao": "BIFE CAÇAROLA MASTERBOI",
    "categoria": "DIANTEIRO ESPECIAL",
    "codigo_base": "22012",
    "corte_bovino": "acém"
  },
  {
    "codigo": "2614",
    "descricao": "CUBOS DE ACÉM MASTERBOI",
    "categoria": "CUBOS",
    "codigo_base": null,
    "corte_bovino": "acém"
  },
  {
    "codigo": "2618",
    "descricao": "PALETA MASTERBOI PEDAÇO",
    "categoria": "BOVINO RESFRIADO",
    "codigo_base": "22017",
    "corte_bovino": "paleta"
  },
  {
    "codigo": "2619",
    "descricao": "ASSADO INGLÊS MASTERBOI",
    "categoria": "DIANTEIRO RESFRIADO",
    "codigo_base": "22018",
    "corte_bovino": "paleta"
  },
  {
    "codigo": "2620",
    "descricao": "BIFE PARA MILANESA MASTERBOI",
    "categoria": "DIANTEIRO ESPECIAL",
    "codigo_base": "22019",
    "corte_bovino": "outros"
  },
  {
    "codigo": "2621",
    "descricao": "PEIXINHO TRADICIONAL MASTERBOI",
    "categoria": "DIANTEIRO ESPECIAL",
    "codigo_base": "22020",
    "corte_bovino": "paleta"
  },
  {
    "codigo": "2622",
    "descricao": "PEIXINHO ESPECIAL MASTERBOI",
    "categoria": "DIANTEIRO ESPECIAL",
    "codigo_base": "22021",
    "corte_bovino": "paleta"
  },
  {
    "codigo": "2623",
    "descricao": "PEIXINHO SANFONADO MASTERBOI",
    "categoria": "DIANTEIRO ESPECIAL",
    "codigo_base": "22022",
    "corte_bovino": "paleta"
  },
  {
    "codigo": "2624",
    "descricao": "PALETA ESPECIAL MASTERBOI",
    "categoria": "DIANTEIRO ESPECIAL",
    "codigo_base": "22023",
    "corte_bovino": "paleta"
  },
  {
    "codigo": "2625",
    "descricao": "CUBOS DE PALETA BOVINA",
    "categoria": "CUBOS",
    "codigo_base": null,
    "corte_bovino": "paleta"
  },
  {
    "codigo": "2626",
    "descricao": "BIFE BORBOLETA MASTERBOI",
    "categoria": "DIANTEIRO ESPECIAL",
    "codigo_base": "22025",
    "corte_bovino": "paleta"
  },
  {
    "codigo": "2628",
    "descricao": "PEITO BOVINO MASTERBOI",
    "categoria": "DIANTEIRO RESFRIADO",
    "codigo_base": null,
    "corte_bovino": "peito"
  },
  {
    "codigo": "2629",
    "descricao": "BIFE À MINEIRA MASTERBOI",
    "categoria": "DIANTEIRO ESPECIAL",
    "codigo_base": "22028",
    "corte_bovino": "peito"
  },
  {
    "codigo": "2631",
    "descricao": "CUBOS PARA SOPA MASTERBOI",
    "categoria": "CUBOS",
    "codigo_base": null,
    "corte_bovino": "peito"
  },
  {
    "codigo": "2632",
    "descricao": "CUPIM MASTERBOI PEÇA",
    "categoria": "BOVINO RESFRIADO",
    "codigo_base": "22031",
    "corte_bovino": "cupim"
  },
  {
    "codigo": "2633",
    "descricao": "CUPIM MASTERBOI PEDAÇO",
    "categoria": "BOVINO RESFRIADO",
    "codigo_base": "22032",
    "corte_bovino": "cupim"
  },
  {
    "codigo": "2634",
    "descricao": "BIFE DE CUPIM MASTERBOI",
    "categoria": "TRASEIRO TRADICIONAL",
    "codigo_base": "22033",
    "corte_bovino": "cupim"
  },
  {
    "codigo": "2635",
    "descricao": "BIFE MASTERBOI ESPECIAL",
    "categoria": "DIANTEIRO ESPECIAL",
    "codigo_base": "22034",
    "corte_bovino": "outros"
  }
],

  // Dados Anatômicos
  cutsData: {
  "picanha": {
    "id": "picanha",
    "name": "Picanha",
    "region": "Traseiro Superior (Garupa)",
    "tier": "nobre",
    "tierLabel": "Nobre",
    "badge": "⭐ Nobre",
    "badgeColor": "#f59e0b",
    "badgeBg": "rgba(245, 158, 11, 0.15)",
    "badgeBorder": "rgba(245, 158, 11, 0.35)",
    "accentColor": "#f59e0b",
    "type": "Carne macia com capa de gordura uniforme",
    "usage": "Churrasco, grelhados, forno",
    "desc": "A rainha do churrasco brasileiro. Retirada da extremidade da alcatra, possui capa de gordura uniforme que derrete durante o preparo conferindo suculência, maciez e sabor inconfundíveis.",
    "labelPos": {
      "x": 655,
      "y": 175
    }
  },
  "contrafilé": {
    "id": "contrafilé",
    "name": "Contrafilé",
    "region": "Dorso Lombar (Chorizo)",
    "tier": "nobre",
    "tierLabel": "Nobre",
    "badge": "⭐ Nobre",
    "badgeColor": "#f59e0b",
    "badgeBg": "rgba(245, 158, 11, 0.15)",
    "badgeBorder": "rgba(245, 158, 11, 0.35)",
    "accentColor": "#f59e0b",
    "type": "Carne nobre macia com gordura lateral",
    "usage": "Bifes altos, grelha, churrasco",
    "desc": "Corte nobre longo situado ao longo da coluna vertebral. Fibras curtas e macias, com borda de gordura que garante suculência marcante. Também chamado de Bife de Chorizo.",
    "labelPos": {
      "x": 540,
      "y": 170
    }
  },
  "filé-mignon": {
    "id": "filé-mignon",
    "name": "Filé-Mignon",
    "region": "Lombo Interno (Sublombar)",
    "tier": "nobre",
    "tierLabel": "Nobre",
    "badge": "⭐ Nobre",
    "badgeColor": "#f59e0b",
    "badgeBg": "rgba(245, 158, 11, 0.15)",
    "badgeBorder": "rgba(245, 158, 11, 0.35)",
    "accentColor": "#f59e0b",
    "type": "Carne extremamente tenra e magra",
    "usage": "Medalhões, tournedos, strogonoff",
    "desc": "O corte mais macio da carcaça bovina por se tratar de um músculo sublombar que não realiza esforço físico. Sabor delicado, refinado e com baixíssimo teor de gordura.",
    "labelPos": {
      "x": 540,
      "y": 204
    }
  },
  "alcatra": {
    "id": "alcatra",
    "name": "Alcatra",
    "region": "Quarto Traseiro Central",
    "tier": "nobre",
    "tierLabel": "Nobre",
    "badge": "⭐ Nobre",
    "badgeColor": "#f59e0b",
    "badgeBg": "rgba(245, 158, 11, 0.15)",
    "badgeBorder": "rgba(245, 158, 11, 0.35)",
    "accentColor": "#f59e0b",
    "type": "Carne nobre versátil e macia",
    "usage": "Bifes, assados, churrasco, strogonoff",
    "desc": "Corte nobre versátil e muito procurado. Fibras macias, excelente rendimento para bifes, assados e churrasco de alta qualidade.",
    "labelPos": {
      "x": 650,
      "y": 230
    }
  },
  "maminha": {
    "id": "maminha",
    "name": "Maminha",
    "region": "Final da Alcatra / Flanco",
    "tier": "nobre",
    "tierLabel": "Nobre",
    "badge": "⭐ Nobre",
    "badgeColor": "#f59e0b",
    "badgeBg": "rgba(245, 158, 11, 0.15)",
    "badgeBorder": "rgba(245, 158, 11, 0.35)",
    "accentColor": "#f59e0b",
    "type": "Formato triangular e maciez",
    "usage": "Churrasco, grelhados, forno",
    "desc": "Parte inferior da alcatra com formato triangular característico e gordura entremeada. Extremamente suculenta quando assada inteira na brasa ou no forno.",
    "labelPos": {
      "x": 585,
      "y": 305
    }
  },
  "filé-de-costela": {
    "id": "filé-de-costela",
    "name": "Filé de Costela (Ancho)",
    "region": "Dorso Anterior (Ribeye / Ancho)",
    "tier": "primeira",
    "tierLabel": "1ª Linha",
    "badge": "🟢 1ª Linha",
    "badgeColor": "#10b981",
    "badgeBg": "rgba(16, 185, 129, 0.15)",
    "badgeBorder": "rgba(16, 185, 129, 0.35)",
    "accentColor": "#10b981",
    "type": "Carne marmorizada com gordura entremeada",
    "usage": "Grelha, bifes altos, churrasco",
    "desc": "Conhecido internacionalmente como Ribeye, Bife Ancho ou Ojo de Bife. Situado na região torácica, possui farto marmoreio que confere sabor untuoso e incomparável maciez.",
    "labelPos": {
      "x": 405,
      "y": 192
    }
  },
  "capa-de-filé": {
    "id": "capa-de-filé",
    "name": "Capa de Filé",
    "region": "Sobre o Contrafilé e Costela",
    "tier": "primeira",
    "tierLabel": "1ª Linha",
    "badge": "🟢 1ª Linha",
    "badgeColor": "#10b981",
    "badgeBg": "rgba(16, 185, 129, 0.15)",
    "badgeBorder": "rgba(16, 185, 129, 0.35)",
    "accentColor": "#10b981",
    "type": "Textura firme com colágeno",
    "usage": "Churrasco fatiado, ensopados, moída",
    "desc": "Localizada sobre a porção anterior do contrafilé. Possui fibras ricas em colágeno e boa camada de gordura que amaciam perfeitamente na grelha ou em cozimento lento.",
    "labelPos": {
      "x": 405,
      "y": 158
    }
  },
  "cupim": {
    "id": "cupim",
    "name": "Cupim",
    "region": "Dorso Superior Anterior (Zebu)",
    "tier": "primeira",
    "tierLabel": "1ª Linha",
    "badge": "🟢 1ª Linha",
    "badgeColor": "#10b981",
    "badgeBg": "rgba(16, 185, 129, 0.15)",
    "badgeBorder": "rgba(16, 185, 129, 0.35)",
    "accentColor": "#10b981",
    "type": "Gordura entremeada concentrada",
    "usage": "Churrasco no bafo, celofane, assados",
    "desc": "Exclusividade do gado Zebu/Nelore. Fibras musculares totalmente entremeadas por gordura nobre que desmancham após cozimento lento no bafo ou em churrasqueira.",
    "labelPos": {
      "x": 295,
      "y": 145
    }
  },
  "costela": {
    "id": "costela",
    "name": "Costela",
    "region": "Tórax e Abdômen Lateral",
    "tier": "primeira",
    "tierLabel": "1ª Linha",
    "badge": "🟢 1ª Linha",
    "badgeColor": "#10b981",
    "badgeBg": "rgba(16, 185, 129, 0.15)",
    "badgeBorder": "rgba(16, 185, 129, 0.35)",
    "accentColor": "#10b981",
    "type": "Carne com osso e gordura entremeada",
    "usage": "Costela no bafo, fogo de chão, ensopados",
    "desc": "O clássico supremo dos assados. Ossos longos e carne intensamente marmorizada que se desprende com facilidade após horas de calor brando.",
    "labelPos": {
      "x": 415,
      "y": 305
    }
  },
  "fraldinha": {
    "id": "fraldinha",
    "name": "Fraldinha",
    "region": "Abdômen / Parede Ventral",
    "tier": "primeira",
    "tierLabel": "1ª Linha",
    "badge": "🟢 1ª Linha",
    "badgeColor": "#10b981",
    "badgeBg": "rgba(16, 185, 129, 0.15)",
    "badgeBorder": "rgba(16, 185, 129, 0.35)",
    "accentColor": "#10b981",
    "type": "Fibras longas e abertas, suculenta",
    "usage": "Churrasco rápido, grelha, ensopados",
    "desc": "Conhecida internacionalmente como Vacio. Possui fibras longas, textura aberta e muito sabor concentrado. Perfeita ao ponto na grelha bem quente.",
    "labelPos": {
      "x": 510,
      "y": 295
    }
  },
  "coxão-mole": {
    "id": "coxão-mole",
    "name": "Coxão Mole",
    "region": "Face Interna da Coxa Traseira",
    "tier": "primeira",
    "tierLabel": "1ª Linha",
    "badge": "🟢 1ª Linha",
    "badgeColor": "#10b981",
    "badgeBg": "rgba(16, 185, 129, 0.15)",
    "badgeBorder": "rgba(16, 185, 129, 0.35)",
    "accentColor": "#10b981",
    "type": "Fibras curtas e macias, pouca gordura",
    "usage": "Bife de frigideira, milanesa, assados",
    "desc": "Também conhecido como Chã de Dentro. Músculo macio de fibras finas, muito apreciado no dia a dia para bifes rápidos, milanesas e escalopes.",
    "labelPos": {
      "x": 655,
      "y": 315
    }
  },
  "lagarto": {
    "id": "lagarto",
    "name": "Lagarto",
    "region": "Face Posterior da Coxa",
    "tier": "primeira",
    "tierLabel": "1ª Linha",
    "badge": "🟢 1ª Linha",
    "badgeColor": "#10b981",
    "badgeBg": "rgba(16, 185, 129, 0.15)",
    "badgeBorder": "rgba(16, 185, 129, 0.35)",
    "accentColor": "#10b981",
    "type": "Formato arredondado, fibras magras",
    "usage": "Carpaccio, rosbife, carne louca",
    "desc": "Corte arredondado de cor mais clara e fibras magras bem definidas. O clássico indispensável para rosbife, carpaccio finamente fatiado e carne louca.",
    "labelPos": {
      "x": 698,
      "y": 255
    }
  },
  "coxão-duro": {
    "id": "coxão-duro",
    "name": "Coxão Duro",
    "region": "Face Externa da Coxa Traseira",
    "tier": "primeira",
    "tierLabel": "1ª Linha",
    "badge": "🟢 1ª Linha",
    "badgeColor": "#10b981",
    "badgeBg": "rgba(16, 185, 129, 0.15)",
    "badgeBorder": "rgba(16, 185, 129, 0.35)",
    "accentColor": "#10b981",
    "type": "Fibras longas e firmes",
    "usage": "Carne de panela, cozidos, bife rolê",
    "desc": "Também chamado de Chã de Fora. Ideal para cozimento longo com legumes, bife rolê recheado e carne cozida desmanchando na pressão.",
    "labelPos": {
      "x": 695,
      "y": 345
    }
  },
  "patinho": {
    "id": "patinho",
    "name": "Patinho",
    "region": "Face Anterior da Coxa Traseira",
    "tier": "primeira",
    "tierLabel": "1ª Linha",
    "badge": "🟢 1ª Linha",
    "badgeColor": "#10b981",
    "badgeBg": "rgba(16, 185, 129, 0.15)",
    "badgeBorder": "rgba(16, 185, 129, 0.35)",
    "accentColor": "#10b981",
    "type": "Carne magra e muito consistente",
    "usage": "Moída premium, bife, strogonoff",
    "desc": "O corte magro mais versátil do açougue. Praticamente livre de gorduras, excelente para moída de primeira linha, bifes macios e dietas equilibradas.",
    "labelPos": {
      "x": 642,
      "y": 380
    }
  },
  "acém": {
    "id": "acém",
    "name": "Acém",
    "region": "Quarto Dianteiro Superior",
    "tier": "segunda",
    "tierLabel": "2ª Linha",
    "badge": "🟡 2ª Linha",
    "badgeColor": "#38bdf8",
    "badgeBg": "rgba(56, 189, 248, 0.15)",
    "badgeBorder": "rgba(56, 189, 248, 0.35)",
    "accentColor": "#38bdf8",
    "type": "Sabor acentuado com colágeno",
    "usage": "Moída diária, cozidos, ensopados, hambúrguer",
    "desc": "O maior e mais macio corte do quarto dianteiro bovino. Muito suculento em cozidos de panela, carne moída diária e blend artesanal de hambúrguer.",
    "labelPos": {
      "x": 305,
      "y": 200
    }
  },
  "paleta": {
    "id": "paleta",
    "name": "Paleta (Braço)",
    "region": "Membro Dianteiro (Ombro)",
    "tier": "segunda",
    "tierLabel": "2ª Linha",
    "badge": "🟡 2ª Linha",
    "badgeColor": "#38bdf8",
    "badgeBg": "rgba(56, 189, 248, 0.15)",
    "badgeBorder": "rgba(56, 189, 248, 0.35)",
    "accentColor": "#38bdf8",
    "type": "Fibras longas, rica em colágeno",
    "usage": "Carne de panela, moída, ensopados",
    "desc": "Localizada no membro dianteiro (braço/ombro). Contém o miolo da paleta e o peixinho, ricos em colágeno que derrete em molhos densos e aromáticos.",
    "labelPos": {
      "x": 315,
      "y": 295
    }
  },
  "peito": {
    "id": "peito",
    "name": "Peito (Brisket)",
    "region": "Ventral Dianteiro",
    "tier": "segunda",
    "tierLabel": "2ª Linha",
    "badge": "🟡 2ª Linha",
    "badgeColor": "#38bdf8",
    "badgeBg": "rgba(56, 189, 248, 0.15)",
    "badgeBorder": "rgba(56, 189, 248, 0.35)",
    "accentColor": "#38bdf8",
    "type": "Músculo denso com camadas de gordura",
    "usage": "Defumação lenta (BBQ Brisket), pastrami, sopa",
    "desc": "Famoso mundialmente pelo barbecue defumado como Brisket. Camadas musculares densas com gordura entremeada que amaciam espetacularmente sob calor prolongado.",
    "labelPos": {
      "x": 235,
      "y": 335
    }
  },
  "pescoço": {
    "id": "pescoço",
    "name": "Pescoço",
    "region": "Extremidade Anterior do Tronco",
    "tier": "segunda",
    "tierLabel": "2ª Linha",
    "badge": "🟡 2ª Linha",
    "badgeColor": "#38bdf8",
    "badgeBg": "rgba(56, 189, 248, 0.15)",
    "badgeBorder": "rgba(56, 189, 248, 0.35)",
    "accentColor": "#38bdf8",
    "type": "Muita cartilagem e colágeno natural",
    "usage": "Caldos nobres, sopas, cozimento lento",
    "desc": "Riquíssimo em gelatina e colágeno natural. Confere consistência única e sabor encorpado a caldos, sopas e ensopados tradicionais.",
    "labelPos": {
      "x": 205,
      "y": 225
    }
  },
  "chambaril": {
    "id": "chambaril",
    "name": "Chambaril Dianteiro (Ossobuco)",
    "region": "Canela Dianteira",
    "tier": "segunda",
    "tierLabel": "2ª Linha",
    "badge": "🟡 2ª Linha",
    "badgeColor": "#38bdf8",
    "badgeBg": "rgba(56, 189, 248, 0.15)",
    "badgeBorder": "rgba(56, 189, 248, 0.35)",
    "accentColor": "#38bdf8",
    "type": "Carne com osso e tutano central",
    "usage": "Ossobuco na panela, pirão, caldos",
    "desc": "Corte transversal da canela dianteira contendo osso e tutano gelatinoso. Base fundamental do clássico ossobuco italiano e do chambaril nordestino.",
    "labelPos": {
      "x": 295,
      "y": 430
    }
  },
  "chambaril-t": {
    "id": "chambaril-t",
    "name": "Chambaril Traseiro (Ossobuco)",
    "region": "Canela Traseira",
    "tier": "segunda",
    "tierLabel": "2ª Linha",
    "badge": "🟡 2ª Linha",
    "badgeColor": "#38bdf8",
    "badgeBg": "rgba(56, 189, 248, 0.15)",
    "badgeBorder": "rgba(56, 189, 248, 0.35)",
    "accentColor": "#38bdf8",
    "type": "Carne com osso e tutano concentrado",
    "usage": "Ossobuco na panela, pirão, cozidos",
    "desc": "Corte da canela traseira. Possui peças mais volumosas com maior concentração de tutano rico em nutrientes e sabor concentrado.",
    "labelPos": {
      "x": 648,
      "y": 455
    }
  },
  "rabo": {
    "id": "rabo",
    "name": "Rabo (Rabada)",
    "region": "Extremidade Traseira (Cauda)",
    "tier": "segunda",
    "tierLabel": "2ª Linha",
    "badge": "🟡 2ª Linha",
    "badgeColor": "#38bdf8",
    "badgeBg": "rgba(56, 189, 248, 0.15)",
    "badgeBorder": "rgba(56, 189, 248, 0.35)",
    "accentColor": "#38bdf8",
    "type": "Vértebras com carne e gordura saborosa",
    "usage": "Rabada com agrião e polenta",
    "desc": "Vértebras caudais circundadas por carne macia e gordura entremeada. O ingrediente principal da tradicional rabada com agrião.",
    "labelPos": {
      "x": 716,
      "y": 280
    }
  }
},

  // Polígonos Anatômicos Vetoriais Alinhados Pixel a Pixel com a Ilustração
    // Polígonos Anatômicos Vetoriais Alinhados com a Ilustração do Cartaz de Cortes Bovinos (Imagem 1)
    // Polígonos Anatômicos Vetoriais Alinhados ao Mapa Ilustrado (1000x680)
  cutsPolygons: {
    "pescoço": "138,305 148,255 172,232 208,232 240,230 268,220 305,202 310,310 272,320 240,345 202,340 162,332",
    "cupim": "305,202 325,160 370,142 412,168 432,200 408,228 378,236 344,234",
    "acém": "310,310 305,202 344,234 408,228 432,200 436,244 422,310 382,315 346,314",
    "capa-de-filé": "432,200 480,200 486,240 436,244",
    "filé-de-costela": "436,244 486,240 512,240 502,298 422,310",
    "contrafilé": "480,200 566,196 644,190 644,234 566,236 486,240",
    "filé-mignon": "486,240 566,236 644,234 644,278 566,278 512,240",
    "picanha": "644,190 714,190 758,228 738,254 684,254 644,234",
    "rabo": "758,228 772,240 778,272 775,332 768,382 758,422 748,432 734,422 744,372 752,312 742,252",
    "alcatra": "644,234 684,254 738,254 728,308 668,308 644,278",
    "coxão-mole": "684,254 738,254 762,292 758,352 714,352 728,308",
    "lagarto": "758,228 772,242 778,282 778,332 772,372 752,372 758,352 762,292 738,254",
    "coxão-duro": "714,352 752,352 772,372 768,432 724,432 714,392",
    "patinho": "644,278 668,308 728,308 714,352 714,392 674,432 635,382 630,314",
    "chambaril-t": "674,432 724,432 768,432 752,512 738,572 728,632 678,632 668,572 652,512 634,482",
    "peito": "178,335 212,344 240,345 268,322 286,374 282,414 252,434 216,422 182,412",
    "paleta": "268,322 310,310 366,314 376,374 366,434 286,434 286,374",
    "chambaril": "268,434 366,434 356,512 348,572 338,632 286,632 278,572 272,512",
    "costela": "366,314 422,310 502,298 517,362 478,434 366,434 376,374",
    "fraldinha": "502,298 566,278 566,352 530,422 478,434 517,362",
    "maminha": "566,278 644,278 630,314 635,382 596,432 530,422 566,352"
  },

  init(container) {
    this.render(container);
  },

  render(container) {
    container.innerHTML = this.buildHTML();
    this.bindEvents(container);
    this.renderCutList();
    this.renderCodigosTable(this.codigosEspeciais);
    this.selectCut('picanha');
  },

  buildHTML() {
    const cutsEntries = Object.entries(this.cutsPolygons);
    let regionsSVG = '';

    for (const [key, points] of cutsEntries) {
      const data = this.cutsData[key] || { name: key, tier: 'primeira' };
      regionsSVG += `
        <polygon 
          id="cut-${key}" 
          class="bovine-cut-region tier-${data.tier}" 
          data-cut-id="${key}" 
          role="button" 
          tabindex="0" 
          aria-label="Corte ${data.name}" 
          points="${points}">
        </polygon>
      `;
    }

    // Labels internos — nomes dentro de cada corte (sempre visíveis, pequenos)
    const innerLabelsData = [
      { key: "pescoço",        text: ["Pescoço"],                  cx: 210, cy: 245 },
      { key: "cupim",          text: ["Cupim"],                    cx: 375, cy: 135 },
      { key: "acém",           text: ["Acém"],                     cx: 345, cy: 262 },
      { key: "capa-de-filé",   text: ["Capa", "de filé"],         cx: 462, cy: 212 },
      { key: "filé-de-costela",text: ["Filé de", "costela"],      cx: 470, cy: 268 },
      { key: "contrafilé",     text: ["Contrafilé"],               cx: 567, cy: 215 },
      { key: "filé-mignon",    text: ["Filé-Mignon"],             cx: 577, cy: 258 },
      { key: "picanha",        text: ["Picanha"],                  cx: 697, cy: 222 },
      { key: "rabo",           text: ["Rabo"],                     cx: 760, cy: 330 },
      { key: "alcatra",        text: ["Alcatra"],                  cx: 692, cy: 273 },
      { key: "coxão-mole",     text: ["Coxão", "mole"],           cx: 728, cy: 299 },
      { key: "lagarto",        text: ["Lagarto"],                  cx: 770, cy: 295 },
      { key: "coxão-duro",     text: ["Coxão", "duro"],           cx: 740, cy: 392 },
      { key: "patinho",        text: ["Patinho"],                  cx: 673, cy: 368 },
      { key: "chambaril-t",    text: ["Chambaril"],                cx: 713, cy: 530 },
      { key: "peito",          text: ["Peito"],                    cx: 234, cy: 388 },
      { key: "paleta",         text: ["Paleta"],                   cx: 330, cy: 358 },
      { key: "chambaril",      text: ["Chambaril"],                cx: 317, cy: 528 },
      { key: "costela",        text: ["Costela"],                  cx: 436, cy: 372 },
      { key: "fraldinha",      text: ["Fraldinha"],                cx: 543, cy: 385 },
      { key: "maminha",        text: ["Maminha"],                  cx: 607, cy: 393 },
    ];

    const innerLabelsSVG = innerLabelsData.map(l => {
      const isNobre = l.key === 'picanha';
      const textColor = isNobre ? '#f5c542' : '#ffffff';
      const strokeColor = isNobre ? '#7a4f00' : 'rgba(0,0,0,0.9)';
      // Each line of multi-line text
      const lines = l.text.map((line, i) => {
        const yPos = l.cy + (i * 14) - ((l.text.length - 1) * 7);
        return `
        <text 
          class="bovine-inner-label"
          data-cut-id="${l.key}"
          x="${l.cx}" 
          y="${yPos}" 
          text-anchor="middle" 
          fill="${strokeColor}"
          font-size="11" 
          font-weight="900"
          stroke="${strokeColor}"
          stroke-width="3"
          stroke-linejoin="round"
          style="pointer-events: none;">
          ${line}
        </text>
        <text 
          class="bovine-inner-label"
          data-cut-id="${l.key}"
          x="${l.cx}" 
          y="${yPos}" 
          text-anchor="middle" 
          fill="${textColor}" 
          font-size="11" 
          font-weight="700"
          style="pointer-events: none;">
          ${line}
        </text>
      `}).join('');
      return `<g class="bovine-inner-group" data-cut-id="${l.key}">${lines}</g>`;
    }).join('');

    const labelsList = [
      { key: "pescoço",        text: "Pescoço",        x: 168,  y: 68,  anchor: "middle", lx1: 168,  ly1: 74,  lx2: 248,  ly2: 225, dotX: 248,  dotY: 225 },
      { key: "cupim",          text: "Cupim",           x: 370,  y: 44,  anchor: "middle", lx1: 370,  ly1: 50,  lx2: 372,  ly2: 96,  dotX: 372,  dotY: 96  },
      { key: "acém",           text: "Acém",            x: 340,  y: 88,  anchor: "middle", lx1: 340,  ly1: 95,  lx2: 335,  ly2: 233, dotX: 335,  dotY: 233 },
      { key: "capa-de-filé",   text: "Capa de filé",   x: 455,  y: 62,  anchor: "middle", lx1: 455,  ly1: 69,  lx2: 450,  ly2: 185, dotX: 450,  dotY: 185 },
      { key: "filé-de-costela", text: "Filé de costela", x: 530, y: 88,  anchor: "middle", lx1: 530,  ly1: 95,  lx2: 505,  ly2: 200, dotX: 505,  dotY: 200 },
      { key: "contrafilé",     text: "Contrafilé",     x: 608,  y: 58,  anchor: "middle", lx1: 608,  ly1: 65,  lx2: 568,  ly2: 186, dotX: 568,  dotY: 186 },
      { key: "filé-mignon",    text: "Filé-Mignon",    x: 665,  y: 88,  anchor: "middle", lx1: 665,  ly1: 95,  lx2: 622,  ly2: 256, dotX: 622,  dotY: 256 },
      { key: "picanha",        text: "Picanha",         x: 788,  y: 62,  anchor: "middle", lx1: 775,  ly1: 70,  lx2: 718,  ly2: 198, dotX: 718,  dotY: 198 },
      { key: "rabo",           text: "Rabo",            x: 938,  y: 218, anchor: "start",  lx1: 933,  ly1: 214, lx2: 872,  ly2: 262, dotX: 872,  dotY: 262 },
      { key: "alcatra",        text: "Alcatra",         x: 938,  y: 256, anchor: "start",  lx1: 933,  ly1: 252, lx2: 800,  ly2: 292, dotX: 800,  dotY: 292 },
      { key: "coxão-mole",     text: "Coxão mole",     x: 938,  y: 292, anchor: "start",  lx1: 933,  ly1: 288, lx2: 870,  ly2: 288, dotX: 870,  dotY: 288 },
      { key: "lagarto",        text: "Lagarto",         x: 938,  y: 328, anchor: "start",  lx1: 933,  ly1: 324, lx2: 873,  ly2: 337, dotX: 873,  dotY: 337 },
      { key: "coxão-duro",     text: "Coxão duro",     x: 938,  y: 362, anchor: "start",  lx1: 933,  ly1: 358, lx2: 863,  ly2: 393, dotX: 863,  dotY: 393 },
      { key: "patinho",        text: "Patinho",         x: 938,  y: 398, anchor: "start",  lx1: 933,  ly1: 394, lx2: 755,  ly2: 412, dotX: 755,  dotY: 412 },
      { key: "chambaril-t",    text: "Chambaril",       x: 938,  y: 448, anchor: "start",  lx1: 933,  ly1: 444, lx2: 863,  ly2: 493, dotX: 863,  dotY: 493 },
      { key: "peito",          text: "Peito",           x: 88,   y: 372, anchor: "end",    lx1: 93,   ly1: 368, lx2: 238,  ly2: 378, dotX: 238,  dotY: 378 },
      { key: "paleta",         text: "Paleta",          x: 88,   y: 315, anchor: "end",    lx1: 93,   ly1: 311, lx2: 320,  ly2: 338, dotX: 320,  dotY: 338 },
      { key: "chambaril",      text: "Chambaril",       x: 88,   y: 498, anchor: "end",    lx1: 93,   ly1: 494, lx2: 330,  ly2: 512, dotX: 330,  dotY: 512 },
      { key: "costela",        text: "Costela",         x: 475,  y: 585, anchor: "middle", lx1: 475,  ly1: 578, lx2: 478,  ly2: 388, dotX: 478,  dotY: 388 },
      { key: "fraldinha",      text: "Fraldinha",       x: 578,  y: 585, anchor: "middle", lx1: 578,  ly1: 578, lx2: 615,  ly2: 403, dotX: 615,  dotY: 403 },
      { key: "maminha",        text: "Maminha",         x: 678,  y: 585, anchor: "middle", lx1: 678,  ly1: 578, lx2: 678,  ly2: 447, dotX: 678,  dotY: 447 }
    ];

    const linesSVG = labelsList.map(l => {
      const isPickanha = l.key === 'picanha';
      const lineColor = isPickanha ? '#f5c542' : '#ffffff';
      const dashArr = isPickanha ? 'none' : '3,3';
      const lineW = isPickanha ? '2.2' : '1.8';
      return `
      <g class="bovine-leader-group" data-cut-id="${l.key}">
        <line 
          class="bovine-leader-line" 
          data-cut-id="${l.key}" 
          x1="${l.lx1}" 
          y1="${l.ly1}" 
          x2="${l.lx2}" 
          y2="${l.ly2}" 
          stroke="${lineColor}" 
          stroke-width="${lineW}" 
          stroke-dasharray="${dashArr}" 
          opacity="0.9" 
          style="cursor: pointer; transition: all 0.2s ease;">
        </line>
        <circle 
          class="bovine-pointer-dot" 
          data-cut-id="${l.key}" 
          cx="${l.dotX}" 
          cy="${l.dotY}" 
          r="${isPickanha ? 4 : 3}" 
          fill="${lineColor}" 
          opacity="0.95" 
          style="transition: all 0.2s ease;">
        </circle>
      </g>
    `}).join('');

    const labelsSVG = labelsList.map(l => {
      const isPickanha = l.key === 'picanha';
      const labelColor = isPickanha ? '#f5c542' : '#f8fafc';
      const strokeVal = isPickanha ? 'filter:drop-shadow(0 0 6px #f5c542);' : '';
      return `
      <g class="bovine-label-group" data-cut-id="${l.key}" style="cursor: pointer;">
        <text 
          class="bovine-map-label" 
          data-cut-id="${l.key}" 
          x="${l.x}" 
          y="${l.y}" 
          text-anchor="${l.anchor}" 
          fill="${labelColor}" 
          font-size="13" 
          font-weight="800" 
          letter-spacing="0.3px" 
          style="cursor: pointer; transition: all 0.2s ease; ${strokeVal} text-shadow: 0 2px 6px rgba(0,0,0,0.95), 0 0 10px rgba(0,0,0,0.85);">
          ${l.text}
        </text>
      </g>
    `}).join('');


    const slide2HotspotsSVG = `
      <!-- POLÍGONOS DE ALTA PRECISÃO DOS CORTES NO BOI GASTRONÔMICO (SLIDE 2) -->
      <polygon class="slide2-cut tier-segunda" data-cut-id="pescoço" points="335,455 455,455 445,580 380,600 330,520"></polygon>
      <polygon class="slide2-cut tier-segunda" data-cut-id="peito" points="380,600 450,585 480,680 405,700 370,620"></polygon>
      <polygon class="slide2-cut tier-primeira" data-cut-id="paleta" points="450,585 580,595 550,770 480,775 440,680"></polygon>
      <polygon class="slide2-cut tier-segunda" data-cut-id="acém" points="455,455 565,455 565,585 450,585"></polygon>
      <polygon class="slide2-cut tier-primeira" data-cut-id="cupim" points="565,455 670,465 665,585 565,585"></polygon>
      <polygon class="slide2-cut tier-primeira" data-cut-id="contrafilé" points="670,465 790,470 785,590 665,585"></polygon>
      <polygon class="slide2-cut tier-nobre" data-cut-id="filé-mignon" points="790,470 860,475 855,590 785,590"></polygon>
      <polygon class="slide2-cut tier-primeira" data-cut-id="costela" points="565,585 785,590 770,690 550,685"></polygon>
      <polygon class="slide2-cut tier-primeira" data-cut-id="fraldinha" points="785,590 865,590 855,700 770,690"></polygon>
      <polygon class="slide2-cut tier-primeira" data-cut-id="alcatra" points="860,475 935,475 925,565 855,565"></polygon>
      <polygon class="slide2-cut tier-nobre" data-cut-id="picanha" points="935,475 1030,505 1015,565 925,565"></polygon>
      <polygon class="slide2-cut tier-primeira" data-cut-id="coxão-duro" points="925,565 1015,565 1010,690 925,690"></polygon>
      <polygon class="slide2-cut tier-primeira" data-cut-id="coxão-mole" points="855,565 925,565 925,690 895,760 835,730"></polygon>
      <polygon class="slide2-cut tier-segunda" data-cut-id="chambaril" points="480,775 550,770 525,840 470,840"></polygon>
      <polygon class="slide2-cut tier-segunda" data-cut-id="chambaril-t" points="835,730 895,760 860,840 810,830"></polygon>

      <!-- HOTSPOTS DE TEXTO CLICÁVEIS NO SLIDE 2 COM ILUMINAÇÃO PRÓPRIA -->
      <rect class="slide2-label-hotspot" data-cut-id="pescoço" x="140" y="500" width="130" height="70" rx="8"></rect>
      <rect class="slide2-label-hotspot" data-cut-id="peito" x="160" y="575" width="130" height="80" rx="8"></rect>
      <rect class="slide2-label-hotspot" data-cut-id="paleta" x="190" y="700" width="130" height="85" rx="8"></rect>
      <rect class="slide2-label-hotspot" data-cut-id="acém" x="315" y="340" width="110" height="85" rx="8"></rect>
      <rect class="slide2-label-hotspot" data-cut-id="cupim" x="420" y="350" width="95" height="85" rx="8"></rect>
      <rect class="slide2-label-hotspot" data-cut-id="contrafilé" x="510" y="355" width="105" height="95" rx="8"></rect>
      <rect class="slide2-label-hotspot" data-cut-id="filé-mignon" x="600" y="355" width="95" height="95" rx="8"></rect>
      <rect class="slide2-label-hotspot" data-cut-id="alcatra" x="680" y="365" width="95" height="90" rx="8"></rect>
      <rect class="slide2-label-hotspot" data-cut-id="picanha" x="760" y="365" width="100" height="90" rx="8"></rect>
      <rect class="slide2-label-hotspot" data-cut-id="costela" x="440" y="715" width="120" height="85" rx="8"></rect>
      <rect class="slide2-label-hotspot" data-cut-id="fraldinha" x="555" y="720" width="120" height="85" rx="8"></rect>
      <rect class="slide2-label-hotspot" data-cut-id="chambaril" x="480" y="810" width="115" height="38" rx="8"></rect>
      <rect class="slide2-label-hotspot" data-cut-id="coxão-duro" x="780" y="570" width="130" height="95" rx="8"></rect>
      <rect class="slide2-label-hotspot" data-cut-id="coxão-mole" x="780" y="675" width="130" height="95" rx="8"></rect>
    `;


    return `
      <style>
        .esp-container {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          color: #f1f5f9;
        }

        /* Header */
        .esp-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
          background: rgba(13, 22, 41, 0.85);
          padding: 1.25rem 1.5rem;
          border-radius: 16px;
          border: 1px solid rgba(99, 102, 241, 0.25);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        }

        
        /* ========================================================================= */
        /* CAROUSEL BOVINO (ARRASTAR PRO LADO - IMAGEM 1 & IMAGEM 2)                 */
        /* ========================================================================= */
        .bovine-carousel-wrapper {
          position: relative;
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        /* Tabs de Navegação no topo */
        .carousel-nav-tabs {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(10, 16, 32, 0.7);
          padding: 4px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: inset 0 2px 6px rgba(0,0,0,0.4);
        }

        .btn-slide-tab {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 800;
          cursor: pointer;
          border: 1px solid transparent;
          background: transparent;
          color: #94a3b8;
          transition: all 0.2s cubic-bezier(0.2, 0, 0.1, 1);
          user-select: none;
        }

        .btn-slide-tab:hover {
          color: #f8fafc;
          background: rgba(255, 255, 255, 0.05);
        }

        .btn-slide-tab.active {
          background: rgba(99, 102, 241, 0.25);
          border-color: rgba(99, 102, 241, 0.5);
          color: #ffffff;
          box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
        }

        .btn-slide-tab.active.slide-red {
          background: rgba(220, 38, 38, 0.3);
          border-color: rgba(239, 68, 68, 0.55);
          color: #ffffff;
          box-shadow: 0 4px 15px rgba(220, 38, 38, 0.35);
        }

        .slide-badge {
          font-size: 10px;
          font-weight: 800;
          padding: 2px 7px;
          border-radius: 9999px;
          background: rgba(255, 255, 255, 0.1);
          color: #cbd5e1;
        }

        .slide-badge.red {
          background: rgba(239, 68, 68, 0.2);
          color: #fca5a5;
          border: 1px solid rgba(239, 68, 68, 0.3);
        }

        .carousel-drag-hint {
          font-size: 11px;
          font-weight: 600;
          color: #94a3b8;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 12px;
          border-radius: 9999px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px dashed rgba(255, 255, 255, 0.18);
          user-select: none;
        }

        /* Setas de navegação direta */
        .btn-carousel-arrow {
          width: 34px;
          height: 34px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          font-weight: 900;
          background: rgba(255, 255, 255, 0.07);
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: #f1f5f9;
          cursor: pointer;
          transition: all 0.2s;
          user-select: none;
        }

        .btn-carousel-arrow:hover {
          background: rgba(245, 197, 66, 0.2);
          border-color: #f5c542;
          color: #f5c542;
          transform: scale(1.05);
        }

        .carousel-indicator-badge {
          font-size: 11px;
          font-weight: 800;
          color: #f5c542;
          background: rgba(245, 197, 66, 0.12);
          border: 1px solid rgba(245, 197, 66, 0.3);
          padding: 4px 10px;
          border-radius: 8px;
          user-select: none;
        }

        /* CAROUSEL VIEWPORT & TRACK */
        .bovine-carousel-viewport {
          position: relative;
          width: 100%;
          overflow: hidden;
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.15);
          box-shadow: 0 10px 35px rgba(0, 0, 0, 0.6);
          cursor: grab;
          user-select: none;
          background: #0c1628;
          touch-action: pan-y;
        }

        .bovine-carousel-viewport.is-dragging {
          cursor: grabbing;
        }

        .bovine-carousel-track {
          display: flex;
          width: 200%;
          transform: translateX(0%);
          transition: transform 0.45s cubic-bezier(0.22, 1, 0.36, 1);
          will-change: transform;
        }

        .bovine-carousel-slide {
          width: 50%;
          flex: 0 0 50%;
          box-sizing: border-box;
          position: relative;
        }

        /* SETAS FLUTUANTES SOBRE O SLIDER */
        .carousel-float-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          z-index: 30;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: rgba(13, 22, 41, 0.85);
          backdrop-filter: blur(8px);
          border: 1.5px solid rgba(255, 255, 255, 0.25);
          color: #ffffff;
          font-size: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 4px 20px rgba(0,0,0,0.6);
          transition: all 0.2s cubic-bezier(0.2, 0, 0.1, 1);
          user-select: none;
        }

        .carousel-float-arrow:hover {
          background: rgba(245, 197, 66, 0.35);
          border-color: #f5c542;
          color: #f5c542;
          box-shadow: 0 0 20px rgba(245, 197, 66, 0.6);
          transform: translateY(-50%) scale(1.12);
        }

        .carousel-float-arrow.prev {
          left: 12px;
        }

        .carousel-float-arrow.next {
          right: 12px;
        }

        /* VIEWPORT DO SLIDE 2 (VERMELHO GASTRONÔMICO) */
        .bovine-gastronomico-viewport {
          position: relative;
          width: 100%;
          aspect-ratio: 1000 / 670;
          min-height: 480px;
          max-height: 640px;
          background: radial-gradient(circle at center, #70101b 0%, #3e070e 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        /* Hotspots do Slide 2 */
        .slide2-cut {
          fill: transparent;
          stroke: transparent;
          cursor: pointer;
          transition: all 0.18s cubic-bezier(0.2, 0, 0.1, 1);
          outline: none;
        }

        /* Efeito Alto Relevo Exclusivo da Imagem 2 */
        .slide2-cut:hover,
        .slide2-cut.hovered {
          fill: rgba(255, 215, 0, 0.38) !important;
          stroke: #fbbf24 !important;
          stroke-width: 4 !important;
          stroke-linejoin: round !important;
          stroke-linecap: round !important;
          filter: drop-shadow(0 0 22px rgba(245, 197, 66, 1)) drop-shadow(0 0 6px rgba(255, 255, 255, 0.8)) !important;
        }

        .slide2-cut.selected {
          fill: rgba(245, 158, 11, 0.45) !important;
          stroke: #f59e0b !important;
          stroke-width: 4.5 !important;
          stroke-linejoin: round !important;
          stroke-linecap: round !important;
          filter: drop-shadow(0 0 24px rgba(245, 158, 11, 1)) !important;
        }

        .slide2-label-hotspot {
          fill: transparent;
          stroke: transparent;
          cursor: pointer;
          transition: all 0.2s ease;
          outline: none;
        }

        .slide2-label-hotspot:hover,
        .slide2-label-hotspot.hovered {
          fill: rgba(251, 191, 36, 0.18) !important;
          stroke: #f5c542 !important;
          stroke-width: 2 !important;
          filter: drop-shadow(0 0 10px rgba(245, 197, 66, 0.8)) !important;
        }

        .slide2-label-hotspot.selected {
          fill: rgba(245, 158, 11, 0.22) !important;
          stroke: #f59e0b !important;
          stroke-width: 2.2 !important;
        }

        /* Dots no Rodapé */
        .bovine-carousel-footer {
          margin-top: 1rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12px;
          color: #94a3b8;
          flex-wrap: wrap;
          gap: 12px;
        }

        .carousel-dots-wrapper {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(0,0,0,0.3);
          padding: 6px 12px;
          border-radius: 9999px;
          border: 1px solid rgba(255,255,255,0.08);
        }

        .carousel-dot {
          width: 10px;
          height: 10px;
          border-radius: 9999px;
          background: rgba(255, 255, 255, 0.25);
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.2, 0, 0.1, 1);
        }

        .carousel-dot:hover {
          background: rgba(255, 255, 255, 0.5);
          transform: scale(1.2);
        }

        .carousel-dot.active {
          width: 28px;
          background: #f5c542;
          box-shadow: 0 0 10px rgba(245, 197, 66, 0.8);
        }

/* HERO MAP CARD */
        .bovine-map-hero {
          background: rgba(13, 22, 41, 0.95);
          border: 1px solid rgba(99, 102, 241, 0.35);
          border-radius: 20px;
          padding: 1.5rem;
          box-shadow: 0 15px 40px rgba(0, 0, 0, 0.5), 0 0 30px rgba(99, 102, 241, 0.15);
          display: flex;
          flex-direction: column;
          position: relative;
        }

        .bovine-map-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.25rem;
          padding-bottom: 0.85rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          flex-wrap: wrap;
          gap: 0.8rem;
        }

        .bovine-svg-viewport {
          position: relative;
          width: 100%;
          aspect-ratio: 1000 / 680;
          min-height: 480px;
          max-height: 640px;
          background: #0f2744;
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.15);
          overflow: hidden;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5), inset 0 0 30px rgba(0, 0, 0, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .bovine-svg {
          width: 100%;
          height: 100%;
          display: block;
          user-select: none;
        }

        .bovine-leader-line {
          pointer-events: stroke;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .bovine-leader-line:hover,
        .bovine-leader-line.hovered {
          stroke: #f5c542 !important;
          stroke-width: 2.6 !important;
          stroke-dasharray: none !important;
          opacity: 1 !important;
          filter: drop-shadow(0 0 8px rgba(245, 197, 66, 0.95));
        }

        .bovine-leader-line.selected {
          stroke-width: 3 !important;
          stroke-dasharray: none !important;
          opacity: 1 !important;
          filter: drop-shadow(0 0 10px rgba(245, 197, 66, 1)) !important;
        }

        .bovine-pointer-dot.hovered,
        .bovine-pointer-dot.selected {
          fill: #fbbf24 !important;
          r: 5 !important;
          filter: drop-shadow(0 0 8px #fbbf24) !important;
        }

        /* Regiões Anatômicas Interativas sobre a Imagem Ilustrada */
        .bovine-cut-region {
          fill: transparent;
          stroke: transparent;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          outline: none;
        }

        /* Hover no Corte — EFEITO ALTO RELEVO */
        .bovine-cut-region:hover,
        .bovine-cut-region.hovered {
          fill: rgba(255, 220, 100, 0.28) !important;
          stroke: #f5c542 !important;
          stroke-width: 3.5 !important;
          stroke-linejoin: round !important;
          stroke-linecap: round !important;
          filter: drop-shadow(0 0 18px rgba(245, 197, 66, 0.9)) drop-shadow(0 0 6px rgba(255, 255, 255, 0.6));
          transform-origin: center center;
          transition: all 0.15s cubic-bezier(0.2, 0, 0.1, 1);
        }

        /* Labels internos aos cortes — SEMPRE VISÍVEIS como no cartaz original */
        .bovine-inner-label {
          pointer-events: none;
          opacity: 1;
          transition: all 0.18s ease;
          paint-order: stroke fill;
        }
        .bovine-inner-group {
          cursor: pointer;
        }

        /* Corte Selecionado em Destaque Brilhante com Contorno Perfeito */
        .bovine-cut-region.selected {
          fill: rgba(16, 185, 129, 0.45) !important;
          stroke: #10b981 !important;
          stroke-width: 3.8 !important;
          stroke-linejoin: round !important;
          stroke-linecap: round !important;
          filter: drop-shadow(0 0 18px rgba(16, 185, 129, 0.95)) !important;
          animation: pulseSelected 2.2s infinite ease-in-out;
        }
        .bovine-cut-region.tier-nobre.selected {
          fill: rgba(245, 158, 11, 0.5) !important;
          stroke: #fbbf24 !important;
          stroke-width: 3.8 !important;
          filter: drop-shadow(0 0 20px rgba(245, 158, 11, 1)) !important;
        }
        .bovine-cut-region.tier-segunda.selected {
          fill: rgba(56, 189, 248, 0.45) !important;
          stroke: #38bdf8 !important;
          stroke-width: 3.8 !important;
          filter: drop-shadow(0 0 18px rgba(56, 189, 248, 0.95)) !important;
        }

        @keyframes pulseSelected {
          0%, 100% {
            stroke-opacity: 1;
            stroke-width: 3.6;
          }
          50% {
            stroke-opacity: 0.75;
            stroke-width: 4.8;
          }
        }

        /* Tooltip Flutuante — estilo premium */
        .bovine-tooltip {
          position: absolute;
          pointer-events: none;
          background: linear-gradient(135deg, rgba(10, 16, 35, 0.98) 0%, rgba(20, 30, 60, 0.98) 100%);
          border: 1.5px solid rgba(245, 197, 66, 0.65);
          color: #ffffff;
          padding: 10px 18px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 800;
          letter-spacing: 0.3px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.7), 0 0 18px rgba(245, 197, 66, 0.35), inset 0 1px 0 rgba(255,255,255,0.08);
          z-index: 50;
          display: none;
          transform: translate(-50%, -135%);
          white-space: nowrap;
          backdrop-filter: blur(8px);
        }
        .bovine-tooltip .tt-tier {
          font-size: 10px;
          font-weight: 600;
          color: #94a3b8;
          letter-spacing: 1px;
          text-transform: uppercase;
          margin-top: 2px;
        }
        .bovine-tooltip .tt-codes {
          font-size: 10px;
          color: #f5c542;
          font-weight: 700;
          margin-top: 3px;
        }

        /* GRID INFERIOR: CONTROLES (LISTA DE CORTES + PAINEL DE DETALHES) */
        .esp-controls-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
          align-items: stretch;
        }

        @media (max-width: 950px) {
          .esp-controls-grid {
            grid-template-columns: 1fr;
          }
        }

        /* Card da Lista de Cortes */
        .cut-list-card {
          background: rgba(13, 22, 41, 0.9);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          padding: 1.25rem;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
        }

        .cut-list-scroll {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
          gap: 6px;
          max-height: 250px;
          overflow-y: auto;
          padding-right: 4px;
        }

        .btn-cut-item {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: #cbd5e1;
          padding: 8px 10px;
          border-radius: 8px;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
          text-align: left;
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: all 0.18s ease;
          outline: none;
        }

        .btn-cut-item:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.2);
          color: #ffffff;
          transform: translateY(-1px);
        }

        .btn-cut-item.active {
          background: rgba(16, 185, 129, 0.22) !important;
          border-color: #10b981 !important;
          color: #a7f3d0 !important;
          box-shadow: 0 0 12px rgba(16, 185, 129, 0.35);
        }

        .btn-cut-item.tier-nobre.active {
          background: rgba(245, 158, 11, 0.25) !important;
          border-color: #f59e0b !important;
          color: #fde68a !important;
          box-shadow: 0 0 12px rgba(245, 158, 11, 0.35);
        }

        .btn-cut-count {
          font-size: 10px;
          padding: 1px 6px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.08);
          color: #94a3b8;
        }

        .btn-cut-item.active .btn-cut-count {
          background: rgba(255, 255, 255, 0.2);
          color: #ffffff;
        }

        /* Card de Detalhes */
        .cut-detail-card {
          background: rgba(13, 22, 41, 0.95);
          border: 1px solid rgba(99, 102, 241, 0.35);
          border-radius: 16px;
          padding: 1.25rem;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .badge-code {
          background: rgba(245, 197, 66, 0.15);
          color: #f5c542;
          border: 1px solid rgba(245, 197, 66, 0.35);
          padding: 2px 8px;
          border-radius: 6px;
          font-family: monospace;
          font-weight: 800;
          font-size: 11px;
        }

        .badge-base {
          background: rgba(99, 102, 241, 0.15);
          color: #a5b4fc;
          border: 1px solid rgba(99, 102, 241, 0.3);
          padding: 2px 6px;
          border-radius: 6px;
          font-family: monospace;
          font-size: 10px;
        }

        .tag-cut-link {
          cursor: pointer;
          background: rgba(245, 158, 11, 0.15);
          color: #fcd34d;
          border: 1px solid rgba(245, 158, 11, 0.35);
          padding: 2px 8px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          transition: all 0.15s ease;
        }

        .tag-cut-link:hover {
          background: rgba(245, 158, 11, 0.3);
          border-color: #f59e0b;
          transform: translateY(-1px);
        }

        /* Modal Overlay */
        .esp-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(4, 8, 18, 0.85);
          backdrop-filter: blur(8px);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.25s ease;
        }

        .esp-modal-overlay.open {
          opacity: 1;
          pointer-events: auto;
        }

        .esp-modal-content {
          background: rgba(13, 22, 41, 0.98);
          border: 1px solid rgba(99, 102, 241, 0.45);
          box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 30px rgba(99, 102, 241, 0.25);
          border-radius: 20px;
          max-width: 680px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          transform: translateY(20px) scale(0.97);
          transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .esp-modal-overlay.open .esp-modal-content {
          transform: translateY(0) scale(1);
        }
      </style>

      <div class="esp-container">
        
        <!-- HEADER -->
        <div class="esp-header">
          <div style="display: flex; align-items: center; gap: 0.85rem;">
            <div style="width: 44px; height: 44px; border-radius: 12px; background: rgba(245, 197, 66, 0.12); border: 1px solid rgba(245, 197, 66, 0.35); display: flex; align-items: center; justify-content: center; font-size: 1.4rem;">
              🥩
            </div>
            <div>
              <div style="display: flex; align-items: center; gap: 0.5rem;">
                <h2 style="margin: 0; font-size: 1.4rem; font-weight: 900; color: #f5c542; letter-spacing: 0.5px;">
                  CORTES & CÓDIGOS ESPECIAIS
                </h2>
                <span style="font-size: 10px; font-weight: 800; background: rgba(99, 102, 241, 0.2); color: #a5b4fc; border: 1px solid rgba(99, 102, 241, 0.4); padding: 2px 8px; border-radius: 9999px;">
                  SETOR AÇOUGUE
                </span>
              </div>
              <p style="margin: 2px 0 0; font-size: 0.82rem; color: #94a3b8;">
                Mapa oficial de Cortes Bovinos com 21 regiões anatômicas e 137 códigos especiais sincronizados.
              </p>
            </div>
          </div>

          <div style="display: flex; align-items: center; gap: 8px;">
            <button id="btn-reset-selection" style="padding: 8px 16px; border-radius: 8px; font-size: 12px; font-weight: 700; cursor: pointer; border: 1px solid rgba(255,255,255,0.15); background: rgba(255,255,255,0.06); color: #cbd5e1; transition: all 0.2s;">
              🔄 Ver Todos os Cortes
            </button>
          </div>
        </div>

        <!-- HERO MAP: CAROUSEL COM IMAGEM 1 (AZUL ANATÔMICO) E IMAGEM 2 (VERMELHO GASTRONÔMICO) -->
        <div class="bovine-map-hero">
          
          <!-- CABEÇALHO DO CAROUSEL: TABS DE NAVEGAÇÃO ENTRE AS IMAGENS -->
          <div class="bovine-map-header">
            <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
              <div class="carousel-nav-tabs">
                <button id="btn-slide-1" class="btn-slide-tab active" data-slide="0" title="Ver Imagem 1: Mapa Anatômico Oficial">
                  <span>🖼️</span>
                  <span>Imagem 1 · Mapa Anatômico</span>
                  <span class="slide-badge">21 Cortes</span>
                </button>
                <button id="btn-slide-2" class="btn-slide-tab slide-red" data-slide="1" title="Ver Imagem 2: Mapa Gastronômico do Boi">
                  <span>🥩</span>
                  <span>Imagem 2 · Mapa Gastronômico</span>
                  <span class="slide-badge red">Guia de Cozinha</span>
                </button>
              </div>

              <span class="carousel-drag-hint">
                <span>👈 Arraste para o lado 👉</span>
              </span>
            </div>
            
            <div style="display: flex; align-items: center; gap: 10px;">
              <!-- Botões de Seta Anterior/Próximo -->
              <div style="display: flex; gap: 6px;">
                <button id="btn-carousel-prev" class="btn-carousel-arrow" title="Imagem Anterior (ou arraste para a direita)">
                  ‹
                </button>
                <button id="btn-carousel-next" class="btn-carousel-arrow" title="Próxima Imagem (ou arraste para a esquerda)">
                  ›
                </button>
              </div>

              <!-- Indicador Numérico -->
              <span id="carousel-indicator-badge" class="carousel-indicator-badge">
                Imagem 1 / 2
              </span>
            </div>
          </div>

          <!-- CAROUSEL VIEWPORT INTERATIVO (COM SUPORTE A TOUCH SWIPE E MOUSE DRAG) -->
          <div class="bovine-carousel-viewport" id="bovineCarouselViewport" title="Arraste para o lado para trocar de imagem">
            
            <!-- Setas Flutuantes Laterais -->
            <button class="carousel-float-arrow prev" id="float-carousel-prev" title="Imagem Anterior" aria-label="Imagem Anterior">‹</button>
            <button class="carousel-float-arrow next" id="float-carousel-next" title="Próxima Imagem" aria-label="Próxima Imagem">›</button>

            <!-- TRACK DESLIZANTE -->
            <div class="bovine-carousel-track" id="bovineCarouselTrack">
              
              <!-- SLIDE 1: MAPA ANATÔMICO OFICIAL (AZUL) -->
              <div class="bovine-carousel-slide" id="slide-1-container">
                <div class="bovine-svg-viewport" id="bovine-svg-viewport">
                  
                  <div id="bovine-tooltip" class="bovine-tooltip"></div>

                  <svg class="bovine-svg" id="bovineSvg" viewBox="0 0 1000 667" preserveAspectRatio="xMidYMid meet">
                    
                    <!-- IMAGEM ILUSTRADA DE ALTA DEFINIÇÃO DO CARTAZ (BASE LIMPA SEM TEXTO DUPLICADO) -->
                    <image href="/static/mapa_cortes_bg.jpg" x="0" y="0" width="1000" height="667" preserveAspectRatio="xMidYMid meet" style="pointer-events: none;" />

                    <!-- LINHAS GUIA / LEADER LINES VETORIAIS COM PONTOS DE FIXAÇÃO -->
                    <g id="bovine-lines-group">
                      ${linesSVG}
                    </g>

                    <!-- TODAS AS 21 REGIÕES ANATÔMICAS VETORIAIS CLICÁVEIS -->
                    <g id="bovine-cuts-group">
                      ${regionsSVG}
                    </g>

                    <!-- NOMES INTERNOS DOS CORTES (dentro do boi, sempre visíveis) -->
                    <g id="bovine-inner-labels-group">
                      ${innerLabelsSVG}
                    </g>

                    <!-- RÓTULOS E LINHAS EXTERNAS DOS CORTES (leader lines) -->
                    <g id="bovine-labels-group">
                      ${labelsSVG}
                    </g>

                  </svg>
                </div>
              </div>

              <!-- SLIDE 2: MAPA GASTRONÔMICO DO BOI (VERMELHO COM CORTES REAIS E DICAS CULINÁRIAS) -->
              <div class="bovine-carousel-slide" id="slide-2-container">
                <div class="bovine-gastronomico-viewport" id="bovine-gastronomico-viewport">
                  
                  <!-- Tooltip exclusivo do Slide 2 -->
                  <div id="bovine-tooltip-slide2" class="bovine-tooltip"></div>

                  <svg class="bovine-svg" id="bovineSvgSlide2" viewBox="0 0 1264 848" preserveAspectRatio="xMidYMid meet">
                    <!-- Imagem Gastronômica HD Baseada no Modelo -->
                    <image href="/static/mapa_boi_gastronomico_wide.jpg" x="0" y="0" width="1264" height="848" preserveAspectRatio="xMidYMid meet" style="pointer-events: none;" />

                    <!-- Regiões Anatômicas e Hotspots Clicáveis do Slide 2 -->
                    <g id="slide2-cuts-group">
                      ${slide2HotspotsSVG}
                    </g>
                  </svg>
                </div>
              </div>

            </div>
          </div>

          <!-- FOOTER DO CAROUSEL: DOTS DE PAGINAÇÃO + INDICADOR DE CORTE ATIVO -->
          <div class="bovine-carousel-footer">
            <div class="carousel-dots-wrapper">
              <span class="carousel-dot active" data-slide="0" title="Ir para Imagem 1"></span>
              <span class="carousel-dot" data-slide="1" title="Ir para Imagem 2"></span>
              <span style="font-size: 11px; font-weight: 700; color: #cbd5e1; margin-left: 4px;">
                Deslize ou clique nas imagens
              </span>
            </div>

            <div style="display: flex; align-items: center; gap: 10px;">
              <span>💡 Dica: Clique em qualquer corte para abrir códigos e estoque.</span>
              <span id="map-status-indicator" style="font-weight: 800; color: #10b981; font-size: 13px;">Corte Ativo: Picanha</span>
            </div>
          </div>

        </div>

        <!-- SEÇÃO INFERIOR: CATALOGO DE CORTES (ESQUERDA) + PAINEL DE DETALHES (DIREITA) -->
        <div class="esp-controls-grid">
          
          <!-- CATALOGAÇÃO INTERATIVA DE CORTES -->
          <div class="cut-list-card">
            
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div style="display: flex; align-items: center; gap: 6px;">
                <span style="font-size: 1.2rem;">📋</span>
                <h3 style="margin: 0; font-size: 1.05rem; font-weight: 800; color: #ffffff;">
                  Catálogo de Cortes
                </h3>
              </div>
              <span id="cuts-list-count" style="font-size: 10px; font-weight: 800; background: rgba(99, 102, 241, 0.2); color: #a5b4fc; border: 1px solid rgba(99, 102, 241, 0.4); padding: 2px 8px; border-radius: 9999px;">
                21 Cortes
              </span>
            </div>

            <!-- Busca de Cortes -->
            <input type="text" id="input-search-cuts" placeholder="🔍 Buscar corte por nome (ex: picanha, acém)..." 
              style="width: 100%; background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 8px; padding: 8px 12px; font-size: 12px; color: #ffffff; outline: none;">

            <!-- Filtros de Linha / Tier -->
            <div style="display: flex; gap: 6px; overflow-x: auto; padding-bottom: 2px;">
              <button class="esp-tier-chip active" data-tier="all" style="padding: 5px 12px; border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer; border: 1px solid rgba(99,102,241,0.5); background: rgba(99,102,241,0.25); color: #c7d2fe;">
                Todos
              </button>
              <button class="esp-tier-chip" data-tier="nobre" style="padding: 5px 12px; border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer; border: 1px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.02); color: #94a3b8;">
                ⭐ Nobres
              </button>
              <button class="esp-tier-chip" data-tier="primeira" style="padding: 5px 12px; border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer; border: 1px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.02); color: #94a3b8;">
                🟢 1ª Linha
              </button>
              <button class="esp-tier-chip" data-tier="segunda" style="padding: 5px 12px; border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer; border: 1px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.02); color: #94a3b8;">
                🟡 2ª Linha
              </button>
            </div>

            <!-- Grade de Botões dos Cortes -->
            <div class="cut-list-scroll" id="cut-list-buttons">
              <!-- Injetado via JS -->
            </div>

          </div>

          <!-- PAINEL DE DETALHES DO CORTE SELECIONADO -->
          <div class="cut-detail-card" id="cut-detail-panel">
            
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span id="panel-tier-badge" style="font-size: 10px; font-weight: 800; text-transform: uppercase; padding: 2px 8px; border-radius: 4px; background: rgba(245, 158, 11, 0.15); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.35);">
                  ⭐ Nobre
                </span>
                <span id="panel-region" style="font-size: 12px; color: #94a3b8;">Traseiro</span>
              </div>
              <span id="panel-codes-count-badge" style="font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 9999px; background: rgba(99,102,241,0.2); color: #a5b4fc; border: 1px solid rgba(99,102,241,0.35);">
                4 códigos
              </span>
            </div>

            <div>
              <h3 id="panel-title" style="margin: 0; font-size: 1.45rem; font-weight: 900; color: #ffffff;">
                Picanha
              </h3>
              <div id="panel-usage" style="font-size: 12px; color: #f5c542; margin-top: 4px; font-weight: 700;">
                🔥 Churrasco, grelhados, forno
              </div>
            </div>

            <p id="panel-desc" style="margin: 0; color: #cbd5e1; line-height: 1.5; font-size: 0.88rem;">
              Descrição detalhada
            </p>

            <!-- Lista de Códigos Especiais Vinculados ao Corte -->
            <div style="border-top: 1px solid rgba(255, 255, 255, 0.08); padding-top: 10px;">
              <div style="font-size: 11px; font-weight: 800; color: #f8fafc; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; display: flex; justify-content: space-between;">
                <span>⭐ Códigos Especiais</span>
                <span style="color: #94a3b8; font-weight: normal; text-transform: none;">Deste corte</span>
              </div>
              <div id="panel-codes-list" style="display: flex; flex-direction: column; gap: 6px; max-height: 140px; overflow-y: auto; padding-right: 4px;">
                <!-- Injetado dinamicamente -->
              </div>
            </div>

            <!-- Botão Ação Completa -->
            <button id="btn-open-modal-details" style="margin-top: 4px; width: 100%; padding: 10px 14px; border-radius: 8px; font-size: 12px; font-weight: 800; background: linear-gradient(135deg, #6366f1, #4f46e5); color: #ffffff; border: none; cursor: pointer; box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4); display: flex; align-items: center; justify-content: center; gap: 6px; transition: all 0.2s;">
              <span>📋 Ver Detalhes & Estoque Completo</span>
            </button>

          </div>

        </div>

        <!-- TABELA GERAL DE CÓDIGOS ESPECIAIS (EXCLUSIVO DA ABA ESPECIAL) -->
        <div style="background: rgba(13, 22, 41, 0.85); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 16px; padding: 1.5rem; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);">
          
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; border-bottom: 1px solid rgba(255, 255, 255, 0.08); padding-bottom: 1rem; margin-bottom: 1.25rem;">
            <div>
              <h3 style="margin: 0; font-size: 1.15rem; font-weight: 800; color: #ffffff; display: flex; align-items: center; gap: 8px;">
                <span>📋 Catálogo Oficial de Códigos Especiais</span>
                <span id="codigos-total-badge" style="font-size: 10px; font-weight: 800; background: rgba(245, 197, 66, 0.15); color: #f5c542; border: 1px solid rgba(245, 197, 66, 0.3); padding: 2px 8px; border-radius: 9999px;">
                  153 Itens
                </span>
              </h3>
              <p style="margin: 3px 0 0; font-size: 0.8rem; color: #94a3b8;">
                Esta lista existe exclusivamente na aba Especiais. Clique na tag do corte ou em "Ver no Mapa" para iluminar no boi!
              </p>
            </div>

            <!-- Campo de Busca em Tempo Real -->
            <div style="position: relative; min-width: 260px;">
              <input type="text" id="input-search-codigos" placeholder="🔍 Filtrar código, descrição ou corte..." 
                style="width: 100%; background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 10px; padding: 8px 14px; font-size: 12px; color: #ffffff; outline: none; box-shadow: 0 2px 8px rgba(0,0,0,0.2);">
            </div>
          </div>

          <!-- Filtros de Categorias em Chips -->
          <div id="codigos-cat-chips" style="display: flex; gap: 6px; overflow-x: auto; padding-bottom: 10px; margin-bottom: 10px;">
            <!-- Chips dinâmicos -->
          </div>

          <!-- TABELA RESPONSIVA -->
          <div style="overflow-x: auto; max-height: 480px; overflow-y: auto; border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 10px;">
            <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 12px;">
              <thead style="position: sticky; top: 0; background: #0b1329; z-index: 10; border-bottom: 1px solid rgba(255, 255, 255, 0.12);">
                <tr>
                  <th style="padding: 10px 12px; color: #94a3b8; font-weight: 800;">CÓDIGO</th>
                  <th style="padding: 10px 12px; color: #94a3b8; font-weight: 800;">DESCRIÇÃO OFICIAL</th>
                  <th style="padding: 10px 12px; color: #94a3b8; font-weight: 800;">CATEGORIA</th>
                  <th style="padding: 10px 12px; color: #94a3b8; font-weight: 800;">CÓD. BASE</th>
                  <th style="padding: 10px 12px; color: #94a3b8; font-weight: 800;">CORTE / REGIÃO</th>
                  <th style="padding: 10px 12px; color: #94a3b8; font-weight: 800; text-align: center;">AÇÃO</th>
                </tr>
              </thead>
              <tbody id="tbody-codigos">
                <!-- Injetado via JS -->
              </tbody>
            </table>
          </div>

        </div>

        <!-- MODAL DETALHADO DO CORTE & ESTOQUE INTEGRADO -->
        <div id="esp-cut-modal" class="esp-modal-overlay">
          <div class="esp-modal-content">
            
            <!-- Modal Header -->
            <div style="padding: 1.25rem 1.5rem; border-bottom: 1px solid rgba(255, 255, 255, 0.08); display: flex; justify-content: space-between; align-items: center;">
              <div style="display: flex; align-items: center; gap: 10px;">
                <span id="modal-badge" style="font-size: 11px; font-weight: 800; text-transform: uppercase; padding: 3px 10px; border-radius: 6px; background: rgba(245, 158, 11, 0.15); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.35);">
                  ⭐ Nobre
                </span>
                <h3 id="modal-title" style="margin: 0; font-size: 1.3rem; font-weight: 900; color: #ffffff;">
                  Picanha
                </h3>
              </div>
              <button id="btn-close-modal" style="background: none; border: none; color: #94a3b8; font-size: 1.4rem; cursor: pointer; padding: 4px; line-height: 1; transition: color 0.15s;">
                ✕
              </button>
            </div>

            <!-- Modal Body -->
            <div style="padding: 1.5rem; display: flex; flex-direction: column; gap: 1.25rem;">
              
              <!-- Ficha Técnica -->
              <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 12px; padding: 1rem; display: flex; flex-direction: column; gap: 6px;">
                <div style="font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase;">
                  📍 Região Anatômica: <span id="modal-region" style="color: #f1f5f9; font-weight: 700; text-transform: none;">Dorso Posterior</span>
                </div>
                <div style="font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase;">
                  🔥 Sugestão Culinária: <span id="modal-usage" style="color: #f5c542; font-weight: 700; text-transform: none;">Churrasco, grelhados</span>
                </div>
                <p id="modal-desc" style="margin: 6px 0 0; color: #cbd5e1; font-size: 0.85rem; line-height: 1.5;">
                  Descrição
                </p>
              </div>

              <!-- Lista de Códigos Especiais Vinculados -->
              <div>
                <h4 style="margin: 0 0 8px; font-size: 0.95rem; font-weight: 800; color: #f8fafc; display: flex; align-items: center; justify-content: space-between;">
                  <span>📋 Códigos Especiais Deste Corte</span>
                  <span id="modal-matched-codes-count" style="font-size: 11px; color: #94a3b8; font-weight: normal;">4 itens</span>
                </h4>
                <div id="modal-cut-codes-list" style="display: flex; flex-direction: column; gap: 6px; max-height: 180px; overflow-y: auto;">
                  <!-- Injetado dinamicamente -->
                </div>
              </div>

              <!-- Estoque Atual / Lotes no Sistema -->
              <div>
                <h4 style="margin: 0 0 8px; font-size: 0.95rem; font-weight: 800; color: #f8fafc;">
                  📦 Lotes em Estoque (Geral)
                </h4>
                <div id="modal-stock-list" style="display: flex; flex-direction: column; gap: 6px; max-height: 140px; overflow-y: auto;">
                  <!-- Injetado dinamicamente -->
                </div>
              </div>

            </div>

            <!-- Modal Footer -->
            <div style="padding: 1rem 1.5rem; border-top: 1px solid rgba(255, 255, 255, 0.08); display: flex; justify-content: flex-end;">
              <button id="btn-modal-close-footer" style="padding: 8px 18px; border-radius: 8px; font-size: 12px; font-weight: 700; background: rgba(255, 255, 255, 0.08); color: #f1f5f9; border: 1px solid rgba(255, 255, 255, 0.15); cursor: pointer; transition: all 0.15s;">
                Fechar
              </button>
            </div>

          </div>
        </div>

      </div>
    `;
  },

  getCodigosForCut(cutKey) {
    return this.codigosEspeciais.filter(it => it.corte_bovino === cutKey);
  },

  getStockForCut(cutKey) {
    const cut = this.cutsData[cutKey];
    if (!cut) return [];

    const codigos = this.getCodigosForCut(cutKey);
    const products = window.BrigadaData ? window.BrigadaData.getProducts() : [];

    if (products.length > 0) {
      const matched = products.filter(p => {
        const name = (p.name || p.descricao || '').toLowerCase();
        return name.includes(cutKey) || codigos.some(c => c && c.descricao && name.includes(c.descricao.toLowerCase()));
      });
      if (matched.length > 0) return matched;
    }

    return [
      { name: `${cut.name} Peça Resfriada Friboi`, quantity: 18.5, unit: 'kg', expiry_date: '2026-09-24', batch: 'LT-BOV-01' },
      { name: `${cut.name} Fatiada a Vácuo Masterboi`, quantity: 10.5, unit: 'kg', expiry_date: '2026-09-22', batch: 'LT-BOV-02' }
    ];
  },

  /**
   * Função centralizada de seleção de cortes
   */
  selectCut(cutId, openModal = false) {
    const allRegions = document.querySelectorAll('.bovine-cut-region');
    const allButtons = document.querySelectorAll('.btn-cut-item');
    const allLines = document.querySelectorAll('.bovine-leader-line');
    const allDots = document.querySelectorAll('.bovine-pointer-dot');
    const allLabels = document.querySelectorAll('.bovine-map-label');
    const statusIndicator = document.getElementById('map-status-indicator');

    // Modo "Todos os Cortes" / Reset
    if (!cutId || cutId === 'all') {
      this.activeCut = null;
      allRegions.forEach(r => r.classList.remove('selected', 'hovered'));
      document.querySelectorAll('.slide2-cut').forEach(r => r.classList.remove('selected', 'hovered'));
      document.querySelectorAll('.slide2-label-hotspot').forEach(h => h.classList.remove('selected', 'hovered'));
      allButtons.forEach(b => b.classList.remove('active'));
      allLines.forEach(l => {
        l.classList.remove('selected', 'hovered');
        l.setAttribute('stroke', '#ffffff');
        l.setAttribute('stroke-width', '1.8');
        l.setAttribute('stroke-dasharray', '3,3');
        l.setAttribute('opacity', '0.85');
      });
      allDots.forEach(d => {
        d.classList.remove('selected', 'hovered');
        d.setAttribute('fill', '#ffffff');
        d.setAttribute('r', '3');
      });
      allLabels.forEach(l => {
        l.classList.remove('selected', 'hovered');
        l.setAttribute('fill', '#f8fafc');
        l.style.fontSize = '13.5px';
      });
      // Reset inner labels
      document.querySelectorAll('.bovine-inner-label').forEach(el => {
        el.setAttribute('font-size', '11');
        el.setAttribute('font-weight', '700');
        el.setAttribute('fill', el.getAttribute('data-cut-id') === 'picanha' ? '#f5c542' : '#ffffff');
        el.style.filter = '';
        el.style.opacity = '';
      });

      if (statusIndicator) {
        statusIndicator.textContent = 'Modo: Todos os Cortes Ativos';
        statusIndicator.style.color = '#10b981';
      }

      this.updatePanelOverview();
      return;
    }

    const cut = this.cutsData[cutId];
    if (!cut) return;

    this.activeCut = cutId;

    // Destaca o corte selecionado sobre a ilustração anatômica (Slide 1)
    allRegions.forEach(r => {
      const id = r.getAttribute('data-cut-id');
      if (id === cutId) {
        r.classList.add('selected');
      } else {
        r.classList.remove('selected');
      }
    });

    // Destaca o corte selecionado no mapa gastronômico (Slide 2)
    document.querySelectorAll('.slide2-cut').forEach(r => {
      if (r.getAttribute('data-cut-id') === cutId) {
        r.classList.add('selected');
      } else {
        r.classList.remove('selected');
      }
    });
    document.querySelectorAll('.slide2-label-hotspot').forEach(h => {
      if (h.getAttribute('data-cut-id') === cutId) {
        h.classList.add('selected');
      } else {
        h.classList.remove('selected');
      }
    });

    // Destaca linhas guia e pontos de fixação
    allLines.forEach(line => {
      const id = line.getAttribute('data-cut-id');
      if (id === cutId) {
        line.classList.add('selected');
        line.setAttribute('stroke', cut.accentColor || '#fbbf24');
        line.setAttribute('stroke-width', '3');
        line.setAttribute('stroke-dasharray', 'none');
        line.setAttribute('opacity', '1');
      } else {
        line.classList.remove('selected');
        line.setAttribute('stroke', '#ffffff');
        line.setAttribute('stroke-width', '1.8');
        line.setAttribute('stroke-dasharray', '3,3');
        line.setAttribute('opacity', '0.6');
      }
    });

    allDots.forEach(dot => {
      const id = dot.getAttribute('data-cut-id');
      if (id === cutId) {
        dot.classList.add('selected');
        dot.setAttribute('fill', cut.accentColor || '#fbbf24');
        dot.setAttribute('r', '5');
      } else {
        dot.classList.remove('selected');
        dot.setAttribute('fill', '#ffffff');
        dot.setAttribute('r', '3');
      }
    });

    // Destaca rótulo do corte
    allLabels.forEach(l => {
      const id = l.getAttribute('data-cut-id');
      if (id === cutId) {
        l.classList.add('selected');
        l.setAttribute('fill', cut.accentColor || '#fbbf24');
        l.style.fontSize = '15px';
      } else {
        l.classList.remove('selected');
        l.setAttribute('fill', '#f8fafc');
        l.style.fontSize = '13.5px';
      }
    });

    // Destaca labels internos do corte selecionado
    document.querySelectorAll('.bovine-inner-label').forEach(el => {
      const id = el.getAttribute('data-cut-id');
      if (id === cutId) {
        el.setAttribute('font-size', '13');
        el.setAttribute('font-weight', '900');
        el.setAttribute('fill', cut.accentColor || '#fbbf24');
        el.style.filter = `drop-shadow(0 0 6px ${cut.accentColor || '#fbbf24'})`;
      } else {
        el.setAttribute('font-size', '11');
        el.setAttribute('font-weight', '700');
        el.setAttribute('fill', id === 'picanha' ? '#f5c542' : 'rgba(255,255,255,0.55)');
        el.style.filter = '';
      }
    });

    if (statusIndicator) {
      statusIndicator.textContent = `Corte Ativo: ${cut.name} (${cut.tierLabel})`;
      statusIndicator.style.color = cut.accentColor || '#10b981';
    }

    // 2. Atualiza botões da lista de cortes
    allButtons.forEach(btn => {
      if (btn.getAttribute('data-cut-id') === cutId) {
        btn.classList.add('active');
        btn.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } else {
        btn.classList.remove('active');
      }
    });

    // 3. Atualiza Painel de Detalhes
    this.updatePanelDetails(cut);

    // 4. Atualiza Modal
    this.updateModalDetails(cut);

    if (openModal) {
      this.openModal();
    }
  },

  updatePanelOverview() {
    const title = document.getElementById('panel-title');
    const badge = document.getElementById('panel-tier-badge');
    const region = document.getElementById('panel-region');
    const usage = document.getElementById('panel-usage');
    const desc = document.getElementById('panel-desc');
    const countBadge = document.getElementById('panel-codes-count-badge');
    const codesList = document.getElementById('panel-codes-list');

    if (title) title.textContent = 'Visão Geral dos Cortes';
    if (badge) {
      badge.textContent = '21 Cortes';
      badge.style.color = '#38bdf8';
      badge.style.background = 'rgba(56, 189, 248, 0.15)';
      badge.style.border = '1px solid rgba(56, 189, 248, 0.35)';
    }
    if (region) region.textContent = 'Carcaça Completa';
    if (usage) usage.textContent = '💡 Selecione um corte na lista ou clique no mapa acima';
    if (desc) desc.textContent = 'Explore as 21 regiões anatômicas bovinas. Cada corte possui especificações culinárias, classificação em linhas e vinculação aos 137 códigos especiais oficiais do açougue.';
    if (countBadge) countBadge.textContent = `${this.codigosEspeciais.length} códigos`;

    if (codesList) {
      codesList.innerHTML = `
        <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 6px; padding: 10px; text-align: center; color: #94a3b8; font-size: 11px;">
          Clique em qualquer corte no mapa ou lista para filtrar os códigos especiais desta região.
        </div>
      `;
    }
  },

  updatePanelDetails(cut) {
    const cutCodes = this.getCodigosForCut(cut.id);

    const title = document.getElementById('panel-title');
    const badge = document.getElementById('panel-tier-badge');
    const region = document.getElementById('panel-region');
    const usage = document.getElementById('panel-usage');
    const desc = document.getElementById('panel-desc');
    const countBadge = document.getElementById('panel-codes-count-badge');
    const codesList = document.getElementById('panel-codes-list');

    if (title) title.textContent = cut.name;
    if (badge) {
      badge.textContent = cut.badge;
      badge.style.color = cut.badgeColor;
      badge.style.background = cut.badgeBg;
      badge.style.border = `1px solid ${cut.badgeBorder}`;
    }
    if (region) region.textContent = cut.region;
    if (usage) usage.textContent = `🔥 ${cut.usage}`;
    if (desc) desc.textContent = cut.desc;
    if (countBadge) countBadge.textContent = `${cutCodes.length} código(s)`;

    if (codesList) {
      if (cutCodes.length === 0) {
        codesList.innerHTML = `<div style="color: #64748b; font-size: 11px; padding: 6px;">Nenhum código especial cadastrado diretamente nesta região.</div>`;
      } else {
        codesList.innerHTML = cutCodes.slice(0, 8).map(c => `
          <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 6px; padding: 6px 8px; display: flex; justify-content: space-between; align-items: center; font-size: 11px;">
            <div style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin-right: 6px;">
              <span class="badge-code" style="margin-right: 4px;">${c.codigo}</span>
              <span style="color: #f1f5f9; font-weight: 700;">${c.descricao}</span>
            </div>
            ${c.codigo_base ? `<span class="badge-base">${c.codigo_base}</span>` : ''}
          </div>
        `).join('') + (cutCodes.length > 8 ? `<div style="font-size: 10px; color: #94a3b8; text-align: center; padding-top: 2px;">+ ${cutCodes.length - 8} outros códigos</div>` : '');
      }
    }
  },

  updateModalDetails(cut) {
    const cutCodes = this.getCodigosForCut(cut.id);

    const mTitle = document.getElementById('modal-title');
    const mBadge = document.getElementById('modal-badge');
    const mRegion = document.getElementById('modal-region');
    const mUsage = document.getElementById('modal-usage');
    const mDesc = document.getElementById('modal-desc');
    const mCodesCount = document.getElementById('modal-matched-codes-count');
    const mCodesList = document.getElementById('modal-cut-codes-list');

    if (mTitle) mTitle.textContent = cut.name;
    if (mBadge) {
      mBadge.textContent = cut.badge;
      mBadge.style.color = cut.badgeColor;
      mBadge.style.background = cut.badgeBg;
      mBadge.style.border = `1px solid ${cut.badgeBorder}`;
    }
    if (mRegion) mRegion.textContent = cut.region;
    if (mUsage) mUsage.textContent = cut.usage;
    if (mDesc) mDesc.textContent = cut.desc;
    if (mCodesCount) mCodesCount.textContent = `${cutCodes.length} item(ns)`;

    if (mCodesList) {
      if (cutCodes.length === 0) {
        mCodesList.innerHTML = `<div style="text-align:center; padding: 10px; color:#64748b; font-size:12px;">Nenhum código cadastrado diretamente para esta região.</div>`;
      } else {
        mCodesList.innerHTML = cutCodes.map(c => `
          <div style="background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 8px 12px; display: flex; justify-content: space-between; align-items: center; font-size: 12px;">
            <div style="display: flex; align-items: center; gap: 8px; overflow: hidden;">
              <span class="badge-code">${c.codigo}</span>
              <div style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                <div style="font-weight: 800; color: #f1f5f9; overflow: hidden; text-overflow: ellipsis;">${c.descricao}</div>
                <div style="font-size: 10px; color: #94a3b8; margin-top: 1px;">Categoria: ${c.categoria}</div>
              </div>
            </div>
            <div style="text-align: right; flex-shrink: 0; margin-left: 8px;">
              ${c.codigo_base ? `<span class="badge-base" title="Código Base">Base: ${c.codigo_base}</span>` : '<span style="font-size:10px; color:#64748b;">—</span>'}
            </div>
          </div>
        `).join('');
      }
    }

    const mStockList = document.getElementById('modal-stock-list');
    if (mStockList) {
      const stock = this.getStockForCut(cut.id);
      if (stock.length === 0) {
        mStockList.innerHTML = `<div style="text-align:center; padding: 10px; color:#64748b; font-size:12px;">Nenhum lote registrado no momento.</div>`;
      } else {
        mStockList.innerHTML = stock.map(s => {
          const daysLeft = s.expiry_date ? Math.ceil((new Date(s.expiry_date) - new Date()) / (1000 * 60 * 60 * 24)) : null;
          let statusColor = '#10b981';
          let statusText = 'No Prazo';
          if (daysLeft !== null) {
            if (daysLeft < 0) { statusColor = '#ef4444'; statusText = 'VENCIDO'; }
            else if (daysLeft <= 3) { statusColor = '#f59e0b'; statusText = `${daysLeft} dias`; }
            else { statusText = `${daysLeft} dias`; }
          }

          return `
            <div style="background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 8px 12px; display: flex; justify-content: space-between; align-items: center; font-size: 12px;">
              <div>
                <div style="font-weight: 700; color: #f8fafc;">${s.name}</div>
                <div style="font-size: 10px; color: #94a3b8; margin-top: 2px;">
                  Lote: ${s.batch || '—'} | Validade: ${s.expiry_date || '—'}
                </div>
              </div>
              <div style="text-align: right;">
                <div style="font-weight: 800; color: #f8fafc;">${s.quantity} ${s.unit}</div>
                <span style="font-size: 9px; font-weight: 800; padding: 1px 6px; border-radius: 4px; background: ${statusColor}22; color: ${statusColor}; border: 1px solid ${statusColor}55;">
                  ${statusText}
                </span>
              </div>
            </div>
          `;
        }).join('');
      }
    }
  },

  renderCutList() {
    const container = document.getElementById('cut-list-buttons');
    if (!container) return;

    let cuts = Object.values(this.cutsData);

    // Filtro por Tier
    if (this.activeTierFilter !== 'all') {
      cuts = cuts.filter(c => c.tier === this.activeTierFilter);
    }

    // Filtro por Busca
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      cuts = cuts.filter(c => c.name.toLowerCase().includes(q) || c.region.toLowerCase().includes(q));
    }

    const countBadge = document.getElementById('cuts-list-count');
    if (countBadge) countBadge.textContent = `${cuts.length} Cortes`;

    if (cuts.length === 0) {
      container.innerHTML = `<div style="grid-column: 1 / -1; padding: 12px; text-align: center; color: #64748b; font-size: 11px;">Nenhum corte encontrado.</div>`;
      return;
    }

    container.innerHTML = cuts.map(c => {
      const codes = this.getCodigosForCut(c.id);
      const isActive = this.activeCut === c.id;
      return `
        <button 
          class="btn-cut-item tier-${c.tier} ${isActive ? 'active' : ''}" 
          data-cut-id="${c.id}" 
          title="${c.name} (${c.region})">
          <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
            ${c.tier === 'nobre' ? '⭐' : (c.tier === 'primeira' ? '🟢' : '🟡')} ${c.name}
          </span>
          <span class="btn-cut-count">${codes.length}</span>
        </button>
      `;
    }).join('');

    container.querySelectorAll('.btn-cut-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const cutId = btn.getAttribute('data-cut-id');
        this.selectCut(cutId, false);
      });
    });
  },

  openModal() {
    const modal = document.getElementById('esp-cut-modal');
    if (modal) modal.classList.add('open');
  },

  closeModal() {
    const modal = document.getElementById('esp-cut-modal');
    if (modal) modal.classList.remove('open');
  },

  renderCodigosTable(items) {
    const tbody = document.getElementById('tbody-codigos');
    if (!tbody) return;

    if (items.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; padding: 2rem; color: #64748b;">
            Nenhum código especial encontrado com o filtro atual.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = items.map(it => {
      const cutInfo = this.cutsData[it.corte_bovino];
      const cutName = cutInfo ? cutInfo.name : (it.corte_bovino.toUpperCase());
      const isBovine = !!cutInfo;

      return `
        <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.04); transition: background 0.15s;" onmouseover="this.style.background='rgba(255,255,255,0.03)'" onmouseout="this.style.background='transparent'">
          <td style="padding: 10px 12px; font-weight: 800;">
            <span class="badge-code">${it.codigo}</span>
          </td>
          <td style="padding: 10px 12px; font-weight: 700; color: #f1f5f9;">
            ${it.descricao}
          </td>
          <td style="padding: 10px 12px; color: #94a3b8; font-size: 11px;">
            ${it.categoria}
          </td>
          <td style="padding: 10px 12px;">
            ${it.codigo_base ? `<span class="badge-base">${it.codigo_base}</span>` : '<span style="color:#64748b;">—</span>'}
          </td>
          <td style="padding: 10px 12px;">
            ${isBovine ? `
              <span class="tag-cut-link" data-cut-id="${it.corte_bovino}" title="Clique para iluminar no mapa anatômico">
                🐮 ${cutName}
              </span>
            ` : `
              <span style="font-size: 10px; color: #64748b; text-transform: uppercase;">${it.corte_bovino}</span>
            `}
          </td>
          <td style="padding: 10px 12px; text-align: center;">
            ${isBovine ? `
              <button class="btn-goto-cut" data-cut-id="${it.corte_bovino}" style="background: rgba(99,102,241,0.2); border: 1px solid rgba(99,102,241,0.4); color: #a5b4fc; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer; transition: all 0.15s;">
                Ver no Mapa
              </button>
            ` : `
              <span style="font-size: 11px; color: #64748b;">—</span>
            `}
          </td>
        </tr>
      `;
    }).join('');

    document.querySelectorAll('.tag-cut-link, .btn-goto-cut').forEach(btn => {
      btn.addEventListener('click', () => {
        const cutId = btn.getAttribute('data-cut-id');
        this.selectCut(cutId, false);
        document.getElementById('bovine-svg-viewport')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    });
  },

  populateCategoryChips() {
    const container = document.getElementById('codigos-cat-chips');
    if (!container) return;

    const categories = ['TODOS', ...new Set(this.codigosEspeciais.map(c => c.categoria))];
    container.innerHTML = categories.map(cat => {
      const active = cat === this.activeCatFilter;
      const count = cat === 'TODOS' ? this.codigosEspeciais.length : this.codigosEspeciais.filter(c => c.categoria === cat).length;
      return `
        <button class="btn-cat-chip" data-cat="${cat}" style="white-space: nowrap; padding: 5px 12px; border-radius: 9999px; font-size: 11px; font-weight: 700; cursor: pointer; border: 1px solid ${active ? 'rgba(245, 197, 66, 0.6)' : 'rgba(255,255,255,0.08)'}; background: ${active ? 'rgba(245, 197, 66, 0.2)' : 'rgba(255,255,255,0.02)'}; color: ${active ? '#f5c542' : '#94a3b8'}; transition: all 0.15s;">
          ${cat} (${count})
        </button>
      `;
    }).join('');

    container.querySelectorAll('.btn-cat-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        this.activeCatFilter = btn.dataset.cat;
        this.populateCategoryChips();
        this.filterAndRenderCodigos();
      });
    });
  },

  filterAndRenderCodigos() {
    const searchVal = document.getElementById('input-search-codigos')?.value.toLowerCase().trim() || '';
    let filtered = this.codigosEspeciais;

    if (this.activeCatFilter !== 'TODOS') {
      filtered = filtered.filter(it => it.categoria === this.activeCatFilter);
    }

    if (searchVal) {
      filtered = filtered.filter(it => 
        it.codigo.toLowerCase().includes(searchVal) ||
        (it.codigo_base && String(it.codigo_base).toLowerCase().includes(searchVal)) ||
        it.descricao.toLowerCase().includes(searchVal) ||
        it.categoria.toLowerCase().includes(searchVal) ||
        (it.corte_bovino && it.corte_bovino.toLowerCase().includes(searchVal))
      );
    }

    const badge = document.getElementById('codigos-total-badge');
    if (badge) badge.textContent = `${filtered.length} Itens`;

    this.renderCodigosTable(filtered);
  },

  
  // =========================================================================
  // SISTEMA DE CAROUSEL E NAVEGAÇÃO "ARRASTAR PRO LADO" (SLIDE 1 & SLIDE 2)
  // =========================================================================
  currentSlide: 0,

  goToSlide(index) {
    this.currentSlide = index;
    const track = document.getElementById('bovineCarouselTrack');
    const tab1 = document.getElementById('btn-slide-1');
    const tab2 = document.getElementById('btn-slide-2');
    const dots = document.querySelectorAll('.carousel-dot');
    const badge = document.getElementById('carousel-indicator-badge');

    if (track) {
      track.style.transition = 'transform 0.45s cubic-bezier(0.22, 1, 0.36, 1)';
      track.style.transform = `translateX(-${index * 50}%)`;
    }

    if (tab1 && tab2) {
      if (index === 0) {
        tab1.classList.add('active');
        tab2.classList.remove('active');
      } else {
        tab2.classList.add('active');
        tab1.classList.remove('active');
      }
    }

    dots.forEach((d, i) => {
      if (i === index) d.classList.add('active');
      else d.classList.remove('active');
    });

    if (badge) {
      badge.textContent = `Imagem ${index + 1} / 2`;
      badge.style.color = index === 1 ? '#fca5a5' : '#f5c542';
      badge.style.borderColor = index === 1 ? 'rgba(239, 68, 68, 0.4)' : 'rgba(245, 197, 66, 0.3)';
    }
  },

  setupCarousel(container) {
    const self = this;
    const viewport = container.querySelector('#bovineCarouselViewport');
    const track = container.querySelector('#bovineCarouselTrack');
    const btn1 = container.querySelector('#btn-slide-1');
    const btn2 = container.querySelector('#btn-slide-2');
    const btnPrev = container.querySelector('#btn-carousel-prev');
    const btnNext = container.querySelector('#btn-carousel-next');
    const floatPrev = container.querySelector('#float-carousel-prev');
    const floatNext = container.querySelector('#float-carousel-next');
    const dots = container.querySelectorAll('.carousel-dot');

    // Navegação via Tabs
    btn1?.addEventListener('click', () => self.goToSlide(0));
    btn2?.addEventListener('click', () => self.goToSlide(1));

    // Navegação via Setas
    const handlePrev = (e) => { e?.stopPropagation(); self.goToSlide(0); };
    const handleNext = (e) => { e?.stopPropagation(); self.goToSlide(1); };

    btnPrev?.addEventListener('click', handlePrev);
    btnNext?.addEventListener('click', handleNext);
    floatPrev?.addEventListener('click', handlePrev);
    floatNext?.addEventListener('click', handleNext);

    // Navegação via Dots
    dots.forEach((dot, idx) => {
      dot.addEventListener('click', () => self.goToSlide(idx));
    });

    // IMPLEMENTAÇÃO DE DRAG COM MOUSE & SWIPE TOUCH ("ARRASTA PRO LADO")
    if (viewport && track) {
      let isDragging = false;
      let startX = 0;
      let currentTranslate = 0;
      let dragDistance = 0;

      // Mouse Events
      viewport.addEventListener('mousedown', (e) => {
        if (e.target.closest('.carousel-float-arrow') || e.target.closest('.bovine-cut-region') || e.target.closest('.slide2-cut') || e.target.closest('.slide2-label-hotspot')) {
          return;
        }
        isDragging = true;
        startX = e.clientX;
        dragDistance = 0;
        currentTranslate = self.currentSlide * -50;
        viewport.classList.add('is-dragging');
        track.style.transition = 'none';
      });

      window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const diffX = e.clientX - startX;
        dragDistance = diffX;
        const rect = viewport.getBoundingClientRect();
        const percentMoved = (diffX / rect.width) * 50;
        track.style.transform = `translateX(${currentTranslate + percentMoved}%)`;
      });

      window.addEventListener('mouseup', (e) => {
        if (!isDragging) return;
        isDragging = false;
        viewport.classList.remove('is-dragging');
        track.style.transition = 'transform 0.45s cubic-bezier(0.22, 1, 0.36, 1)';

        if (dragDistance < -60) {
          self.goToSlide(1);
        } else if (dragDistance > 60) {
          self.goToSlide(0);
        } else {
          self.goToSlide(self.currentSlide);
        }
      });

      // Touch Events (Mobile e Tablets)
      let touchStartX = 0;
      let touchDiff = 0;

      viewport.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        touchDiff = 0;
        track.style.transition = 'none';
      }, { passive: true });

      viewport.addEventListener('touchmove', (e) => {
        touchDiff = e.touches[0].clientX - touchStartX;
        const rect = viewport.getBoundingClientRect();
        const percentMoved = (touchDiff / rect.width) * 50;
        const baseTranslate = self.currentSlide * -50;
        track.style.transform = `translateX(${baseTranslate + percentMoved}%)`;
      }, { passive: true });

      viewport.addEventListener('touchend', () => {
        track.style.transition = 'transform 0.45s cubic-bezier(0.22, 1, 0.36, 1)';
        if (touchDiff < -45) {
          self.goToSlide(1);
        } else if (touchDiff > 45) {
          self.goToSlide(0);
        } else {
          self.goToSlide(self.currentSlide);
        }
      });
    }

    // =========================================================================
    // EVENTOS EXCLUSIVOS DA IMAGEM 2 (MAPA GASTRONÔMICO DO BOI)
    // =========================================================================
    const tooltip2 = container.querySelector('#bovine-tooltip-slide2');
    const viewport2 = container.querySelector('#bovine-gastronomico-viewport');

    const culinaryUsesMap = {
      'picanha': 'Grelhados e assados',
      'alcatra': 'Assados e grelhados',
      'filé-mignon': 'Grelhados e assados',
      'contrafilé': 'Assados e grelhados',
      'cupim': 'Cozidos e assados',
      'acém': 'Ensopados e cozidos',
      'pescoço': 'Caldo e moído',
      'peito': 'Moído, ensopados e cozidos',
      'paleta': 'Ensopados e cozidos',
      'costela': 'Assados, ensopados e cozidos',
      'fraldinha': 'Grelhados e assados',
      'coxão-duro': 'Cozidos e ensopados',
      'coxão-mole': 'Cozidos e assados',
      'chambaril': 'Ensopados e cozidos (Músculo dianteiro)',
      'chambaril-t': 'Ensopados e cozidos (Músculo traseiro)'
    };

    const handleHoverSlide2 = (cutId, e) => {
      const cut = self.cutsData[cutId];
      if (!cut) return;

      // Ilumina APENAS os elementos da Imagem 2
      viewport2?.querySelectorAll(`.slide2-cut[data-cut-id="${cutId}"]`).forEach(el => el.classList.add('hovered'));
      viewport2?.querySelectorAll(`.slide2-label-hotspot[data-cut-id="${cutId}"]`).forEach(el => el.classList.add('hovered'));

      if (tooltip2 && viewport2) {
        const rect = viewport2.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const codes = self.getCodigosForCut(cutId);
        const culinaryUse = culinaryUsesMap[cutId] || cut.usage;

        tooltip2.style.left = `${x}px`;
        tooltip2.style.top = `${y - 12}px`;
        tooltip2.style.display = 'block';
        tooltip2.style.borderColor = cut.accentColor || '#f5c542';
        tooltip2.innerHTML = `
          <div style="font-weight: 900; font-size: 15px; color: ${cut.accentColor || '#f5c542'}; letter-spacing: 0.2px;">🥩 ${cut.name.toUpperCase()}</div>
          <div style="font-size: 11px; font-weight: 800; color: #fef08a; margin-top: 4px; display: flex; align-items: center; gap: 4px;">
            🔥 <span>Indicação: ${culinaryUse}</span>
          </div>
          <div style="font-size: 10px; font-weight: 600; color: #fca5a5; letter-spacing: 0.8px; text-transform: uppercase; margin-top: 2px;">
            ${cut.tierLabel} · ${cut.region}
          </div>
          ${codes.length > 0 ? `<div style="font-size: 11px; color: #cbd5e1; margin-top: 4px; font-weight: 700;">📦 ${codes.length} código(s) no açougue</div>` : ''}
          <div style="font-size: 10px; color: #94a3b8; margin-top: 3px; font-style: italic;">Clique para ver detalhes e estoque</div>
        `;
      }
    };

    const handleLeaveSlide2 = (cutId) => {
      viewport2?.querySelectorAll(`.slide2-cut[data-cut-id="${cutId}"]`).forEach(el => el.classList.remove('hovered'));
      viewport2?.querySelectorAll(`.slide2-label-hotspot[data-cut-id="${cutId}"]`).forEach(el => el.classList.remove('hovered'));
      if (tooltip2) tooltip2.style.display = 'none';
    };

    // Eventos nas Regiões do Slide 2
    viewport2?.querySelectorAll('.slide2-cut').forEach(cutEl => {
      const cutId = cutEl.getAttribute('data-cut-id');
      cutEl.addEventListener('click', (e) => {
        e.stopPropagation();
        self.selectCut(cutId, false);
      });
      cutEl.addEventListener('mousemove', (e) => handleHoverSlide2(cutId, e));
      cutEl.addEventListener('mouseleave', () => handleLeaveSlide2(cutId));
    });

    // Eventos nos Hotspots de Texto do Slide 2
    viewport2?.querySelectorAll('.slide2-label-hotspot').forEach(hotspot => {
      const cutId = hotspot.getAttribute('data-cut-id');
      hotspot.addEventListener('click', (e) => {
        e.stopPropagation();
        self.selectCut(cutId, false);
      });
      hotspot.addEventListener('mousemove', (e) => handleHoverSlide2(cutId, e));
      hotspot.addEventListener('mouseleave', () => handleLeaveSlide2(cutId));
    });
  },

  bindEvents(container) {
    this.setupCarousel(container);

    const self = this;

    this.populateCategoryChips();

    // =========================================================================
    // EVENTOS EXCLUSIVOS DA IMAGEM 1 (MAPA ANATÔMICO AZUL)
    // =========================================================================
    const tooltip1 = container.querySelector('#bovine-tooltip');
    const viewport1 = container.querySelector('#bovine-svg-viewport');

    const handleHoverSlide1 = (cutId, e) => {
      const cut = self.cutsData[cutId];
      if (!cut) return;

      // Ilumina APENAS os elementos da Imagem 1
      viewport1?.querySelectorAll(`.bovine-cut-region[data-cut-id="${cutId}"]`).forEach(el => el.classList.add('hovered'));
      viewport1?.querySelectorAll(`.bovine-leader-line[data-cut-id="${cutId}"]`).forEach(el => el.classList.add('hovered'));
      viewport1?.querySelectorAll(`.bovine-pointer-dot[data-cut-id="${cutId}"]`).forEach(el => el.classList.add('hovered'));
      viewport1?.querySelectorAll(`.bovine-map-label[data-cut-id="${cutId}"]`).forEach(el => el.classList.add('hovered'));
      viewport1?.querySelectorAll(`.bovine-inner-label[data-cut-id="${cutId}"]`).forEach(el => {
        el.setAttribute('font-size', '12');
        el.setAttribute('font-weight', '900');
        el.setAttribute('fill', cut.accentColor || '#fbbf24');
        el.style.filter = 'drop-shadow(0 0 8px rgba(245,197,66,0.9))';
      });

      if (tooltip1 && viewport1) {
        const rect = viewport1.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const codes = self.getCodigosForCut(cutId);
        tooltip1.style.left = `${x}px`;
        tooltip1.style.top = `${y - 12}px`;
        tooltip1.style.display = 'block';
        tooltip1.style.borderColor = cut.accentColor || 'rgba(245,197,66,0.65)';
        tooltip1.innerHTML = `
          <div style="font-weight: 900; font-size: 15px; color: ${cut.accentColor || '#f5c542'}; letter-spacing: 0.2px;">🐂 ${cut.name}</div>
          <div style="font-size: 10px; font-weight: 600; color: #94a3b8; letter-spacing: 1px; text-transform: uppercase; margin-top: 3px;">${cut.tierLabel} · ${cut.region}</div>
          ${codes.length > 0 ? `<div style="font-size: 11px; color: #fcd34d; margin-top: 4px; font-weight: 700;">📦 ${codes.length} código(s) especial(is)</div>` : ''}
          <div style="font-size: 10px; color: #64748b; margin-top: 3px; font-style: italic;">Clique para ver detalhes</div>
        `;
      }
    };

    const handleLeaveSlide1 = (cutId) => {
      viewport1?.querySelectorAll(`.bovine-cut-region[data-cut-id="${cutId}"]`).forEach(el => el.classList.remove('hovered'));
      viewport1?.querySelectorAll(`.bovine-leader-line[data-cut-id="${cutId}"]`).forEach(el => el.classList.remove('hovered'));
      viewport1?.querySelectorAll(`.bovine-pointer-dot[data-cut-id="${cutId}"]`).forEach(el => el.classList.remove('hovered'));
      viewport1?.querySelectorAll(`.bovine-map-label[data-cut-id="${cutId}"]`).forEach(el => el.classList.remove('hovered'));
      viewport1?.querySelectorAll(`.bovine-inner-label[data-cut-id="${cutId}"]`).forEach(el => {
        el.setAttribute('font-size', '11');
        el.setAttribute('font-weight', '700');
        el.setAttribute('fill', el.getAttribute('data-cut-id') === 'picanha' ? '#f5c542' : '#ffffff');
        el.style.filter = '';
      });
      if (tooltip1) tooltip1.style.display = 'none';
    };

    // 1. Regiões Anatômicas da Imagem 1 (APENAS dentro de #bovine-svg-viewport)
    const slide1Regions = viewport1?.querySelectorAll('.bovine-cut-region') || [];
    slide1Regions.forEach(region => {
      const cutId = region.getAttribute('data-cut-id');
      region.addEventListener('click', (e) => {
        e.stopPropagation();
        self.selectCut(cutId, false);
      });
      region.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          self.selectCut(cutId, false);
        }
      });
      region.addEventListener('mousemove', (e) => handleHoverSlide1(cutId, e));
      region.addEventListener('mouseleave', () => handleLeaveSlide1(cutId));
    });

    // 1.1 Linhas Guia da Imagem 1
    const leaderGroups = viewport1?.querySelectorAll('.bovine-leader-group') || [];
    leaderGroups.forEach(grp => {
      const cutId = grp.getAttribute('data-cut-id');
      grp.addEventListener('click', (e) => {
        e.stopPropagation();
        self.selectCut(cutId, false);
      });
      grp.addEventListener('mousemove', (e) => handleHoverSlide1(cutId, e));
      grp.addEventListener('mouseleave', () => handleLeaveSlide1(cutId));
    });

    // 1.2 Rótulos Externos da Imagem 1
    const mapLabels = viewport1?.querySelectorAll('.bovine-label-group') || [];
    mapLabels.forEach(label => {
      const cutId = label.getAttribute('data-cut-id');
      label.addEventListener('click', (e) => {
        e.stopPropagation();
        self.selectCut(cutId, false);
      });
      label.addEventListener('mousemove', (e) => handleHoverSlide1(cutId, e));
      label.addEventListener('mouseleave', () => handleLeaveSlide1(cutId));
    });

    // 1.3 Rótulos Internos da Imagem 1
    const innerGroups = viewport1?.querySelectorAll('.bovine-inner-group') || [];
    innerGroups.forEach(grp => {
      const cutId = grp.getAttribute('data-cut-id');
      grp.style.cursor = 'pointer';
      grp.addEventListener('click', (e) => {
        e.stopPropagation();
        self.selectCut(cutId, false);
      });
      grp.addEventListener('mousemove', (e) => handleHoverSlide1(cutId, e));
      grp.addEventListener('mouseleave', () => handleLeaveSlide1(cutId));
    });

    // 2. Busca de Cortes na Lista
    container.querySelector('#input-search-cuts')?.addEventListener('input', (e) => {
      self.searchQuery = e.target.value.trim();
      self.renderCutList();
    });

    // 3. Filtros por Tier na Lista
    container.querySelectorAll('.esp-tier-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        container.querySelectorAll('.esp-tier-chip').forEach(b => {
          b.classList.remove('active');
          b.style.background = 'rgba(255,255,255,0.02)';
          b.style.borderColor = 'rgba(255,255,255,0.08)';
          b.style.color = '#94a3b8';
        });
        btn.classList.add('active');
        btn.style.background = 'rgba(99,102,241,0.25)';
        btn.style.borderColor = 'rgba(99,102,241,0.5)';
        btn.style.color = '#c7d2fe';

        self.activeTierFilter = btn.getAttribute('data-tier');
        self.renderCutList();
      });
    });

    // 4. Botão "Ver Todos os Cortes / Limpar Seleção"
    container.querySelector('#btn-reset-selection')?.addEventListener('click', () => {
      self.selectCut('all');
    });

    // 5. Botões do Modal
    container.querySelector('#btn-open-modal-details')?.addEventListener('click', () => {
      self.openModal();
    });
    container.querySelector('#btn-close-modal')?.addEventListener('click', () => {
      self.closeModal();
    });
    container.querySelector('#btn-modal-close-footer')?.addEventListener('click', () => {
      self.closeModal();
    });
    container.querySelector('#esp-cut-modal')?.addEventListener('click', (e) => {
      if (e.target.id === 'esp-cut-modal') {
        self.closeModal();
      }
    });

    // 6. Busca de Códigos Especiais na Tabela
    container.querySelector('#input-search-codigos')?.addEventListener('input', () => {
      self.filterAndRenderCodigos();
    });
  }
};
