/**
 * BRIGADA-IA — Mock Data
 * Produtos, usuários e estado do sistema
 */

// ── Usuários ──────────────────────────────────────────────────────────────────
const USERS_DB = [
  {
    id: 1,
    name: 'Administrador',
    email: 'admin@brigada.com',
    password: 'admin123',
    role: 'superadmin',
    avatar: 'AD',
    status: 'active',
    sector: 'todos',
    createdAt: '2026-06-24',
    lastLogin: new Date().toISOString(),
  },
  {
    id: 2,
    name: 'Marcos',
    email: 'marcos@brigada.com',
    password: '123456',
    role: 'gestao',
    avatar: 'MA',
    status: 'active',
    sector: 'todos',
    createdAt: '2026-06-24',
    lastLogin: null,
  },
  {
    id: 3,
    name: 'Jefferson',
    email: 'jefferson@brigada.com',
    password: '123456',
    role: 'gestao',
    avatar: 'JE',
    status: 'active',
    sector: 'pereciveis',
    createdAt: '2026-06-24',
    lastLogin: null,
  },
];

// ── Produtos ──────────────────────────────────────────────────────────────────
// Gera datas relativas ao dia atual para tornar o sistema dinâmico
function daysFromNow(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

function daysAgo(days) {
  return daysFromNow(-days);
}

const PRODUCTS_DB = [
  // ── AVES ──────────────────────────────────────────────────────────────────
  {
    id: 1,
    plu: '1001',
    name: 'Filé de Peito de Frango Resfriado Sadia Bandeja 1kg',
    category: 'aves',
    startDate: daysAgo(3),
    endDate: daysFromNow(1),
    unit: 'kg',
    supplier: 'BRF S.A. (Sadia)',
    location: 'Vitrine de Aves',
  },
  {
    id: 2,
    plu: '1002',
    name: 'Coxa e Sobrecoxa de Frango Congelada Seara Pacote 1kg',
    category: 'aves',
    startDate: daysAgo(10),
    endDate: daysFromNow(6),
    unit: 'kg',
    supplier: 'JBS S.A. (Seara)',
    location: 'Câmara de Congelados A',
  },
  {
    id: 3,
    plu: '1003',
    name: 'Asa de Frango Resfriada Aurora Bandeja 1kg',
    category: 'aves',
    startDate: daysAgo(2),
    endDate: daysFromNow(2),
    unit: 'kg',
    supplier: 'Cooperativa Central Aurora Alimentos',
    location: 'Vitrine de Aves',
  },
  {
    id: 4,
    plu: '1004',
    name: 'Filé de Sassami de Frango Congelado Copacol Pacote 1kg',
    category: 'aves',
    startDate: daysAgo(8),
    endDate: daysFromNow(8),
    unit: 'kg',
    supplier: 'Copacol Cooperativa Agroindustrial',
    location: 'Gôndola de Congelados 01',
  },
  {
    id: 5,
    plu: '1005',
    name: 'Coração de Frango Resfriado Sadia Bandeja 500g',
    category: 'aves',
    startDate: daysAgo(4),
    endDate: daysFromNow(0),
    unit: 'pct',
    supplier: 'BRF S.A. (Sadia)',
    location: 'Vitrine de Aves',
  },
  {
    id: 6,
    plu: '1006',
    name: 'Meio da Asa (Tulipa) de Frango Congelado Seara IQF Pacote 1kg',
    category: 'aves',
    startDate: daysAgo(12),
    endDate: daysFromNow(5),
    unit: 'kg',
    supplier: 'JBS S.A. (Seara)',
    location: 'Gôndola de Congelados 01',
  },
  {
    id: 7,
    plu: '1007',
    name: 'Moela de Frango Congelada Copacol Pacote 1kg',
    category: 'aves',
    startDate: daysAgo(5),
    endDate: daysFromNow(-1),
    unit: 'kg',
    supplier: 'Copacol Cooperativa Agroindustrial',
    location: 'Câmara de Congelados A',
  },
  {
    id: 8,
    plu: '1008',
    name: 'Frango Inteiro Resfriado Seara 2kg',
    category: 'aves',
    startDate: daysAgo(3),
    endDate: daysFromNow(4),
    unit: 'kg',
    supplier: 'JBS S.A. (Seara)',
    location: 'Câmara Fria de Resfriados A',
  },
  {
    id: 9,
    plu: '1009',
    name: 'Filezinho de Peito de Frango Orgânico Korin Bandeja 600g',
    category: 'aves',
    startDate: daysAgo(2),
    endDate: daysFromNow(3),
    unit: 'pct',
    supplier: 'Korin Agropecuária S.A.',
    location: 'Vitrine de Aves',
  },
  {
    id: 10,
    plu: '1010',
    name: 'Linguiça de Frango Fina Seara Pacote 700g',
    category: 'aves',
    startDate: daysAgo(15),
    endDate: daysFromNow(12),
    unit: 'pct',
    supplier: 'JBS S.A. (Seara)',
    location: 'Câmara Fria de Resfriados A',
  },
  {
    id: 11,
    plu: '1011',
    name: 'Coxinha da Asa de Frango Resfriada Aurora Bandeja 1kg',
    category: 'aves',
    startDate: daysAgo(3),
    endDate: daysFromNow(4),
    unit: 'kg',
    supplier: 'Cooperativa Central Aurora Alimentos',
    location: 'Vitrine de Aves',
  },
  {
    id: 12,
    plu: '1012',
    name: 'Peito de Frango com Osso Resfriado Sadia Bandeja 1kg',
    category: 'aves',
    startDate: daysAgo(1),
    endDate: daysFromNow(5),
    unit: 'kg',
    supplier: 'BRF S.A. (Sadia)',
    location: 'Vitrine de Aves',
  },
  {
    id: 13,
    plu: '1013',
    name: 'Fígado de Frango Congelado Copacol Pacote 1kg',
    category: 'aves',
    startDate: daysAgo(20),
    endDate: daysFromNow(30),
    unit: 'kg',
    supplier: 'Copacol Cooperativa Agroindustrial',
    location: 'Câmara de Congelados A',
  },
  {
    id: 14,
    plu: '1014',
    name: 'Sobrecoxa de Frango Resfriada Lar Pacote 1kg',
    category: 'aves',
    startDate: daysAgo(2),
    endDate: daysFromNow(6),
    unit: 'kg',
    supplier: 'Lar Cooperativa Agroindustrial',
    location: 'Câmara Fria de Resfriados A',
  },
  {
    id: 15,
    plu: '1015',
    name: 'Peito de Peru Defumado Fatiado Sadia 200g',
    category: 'aves',
    startDate: daysAgo(25),
    endDate: daysFromNow(20),
    unit: 'pct',
    supplier: 'BRF S.A. (Sadia)',
    location: 'Balcão de Fatiados',
  },

  // ── SUÍNO ─────────────────────────────────────────────────────────────────
  {
    id: 16,
    plu: '2001',
    name: 'Costela Suína Especial Resfriada Pamplona kg',
    category: 'suino',
    startDate: daysAgo(4),
    endDate: daysFromNow(2),
    unit: 'kg',
    supplier: 'Pamplona Alimentos S/A',
    location: 'Vitrine de Suínos',
  },
  {
    id: 17,
    plu: '2002',
    name: 'Lombo Suíno Resfriado Seara kg',
    category: 'suino',
    startDate: daysAgo(2),
    endDate: daysFromNow(4),
    unit: 'kg',
    supplier: 'JBS S.A. (Seara)',
    location: 'Vitrine de Suínos',
  },
  {
    id: 18,
    plu: '2003',
    name: 'Bisteca Suína Resfriada Pamplona Bandeja 1kg',
    category: 'suino',
    startDate: daysAgo(3),
    endDate: daysFromNow(1),
    unit: 'kg',
    supplier: 'Pamplona Alimentos S/A',
    location: 'Vitrine de Suínos',
  },
  {
    id: 19,
    plu: '2004',
    name: 'Pernil Suíno Traseiro com Osso Resfriado Perdigão kg',
    category: 'suino',
    startDate: daysAgo(6),
    endDate: daysFromNow(-2),
    unit: 'kg',
    supplier: 'BRF S.A. (Perdigão)',
    location: 'Câmara Fria de Resfriados B',
  },
  {
    id: 20,
    plu: '2005',
    name: 'Paleta Suína Resfriada sem Osso Aurora kg',
    category: 'suino',
    startDate: daysAgo(1),
    endDate: daysFromNow(4),
    unit: 'kg',
    supplier: 'Cooperativa Central Aurora Alimentos',
    location: 'Vitrine de Suínos',
  },
  {
    id: 21,
    plu: '2006',
    name: 'Linguiça Toscana Perdigão Na Brasa Pacote 500g',
    category: 'suino',
    startDate: daysAgo(10),
    endDate: daysFromNow(8),
    unit: 'pct',
    supplier: 'BRF S.A. (Perdigão)',
    location: 'Vitrine de Embutidos',
  },
  {
    id: 22,
    plu: '2007',
    name: 'Bacon Manta Defumado Seara kg',
    category: 'suino',
    startDate: daysAgo(30),
    endDate: daysFromNow(45),
    unit: 'kg',
    supplier: 'JBS S.A. (Seara)',
    location: 'Câmara de Embutidos',
  },
  {
    id: 23,
    plu: '2008',
    name: 'Copa Fatiada Sadia Especialidades Pacote 100g',
    category: 'suino',
    startDate: daysAgo(15),
    endDate: daysFromNow(15),
    unit: 'pct',
    supplier: 'BRF S.A. (Sadia)',
    location: 'Balcão de Fatiados',
  },
  {
    id: 24,
    plu: '2009',
    name: 'Presunto Cozido sem Capa de Gordura Seara Peça kg',
    category: 'suino',
    startDate: daysAgo(20),
    endDate: daysFromNow(25),
    unit: 'kg',
    supplier: 'JBS S.A. (Seara)',
    location: 'Câmara Fria de Resfriados B',
  },
  {
    id: 25,
    plu: '2010',
    name: 'Toucinho Suíno Resfriado Pamplona kg',
    category: 'suino',
    startDate: daysAgo(3),
    endDate: daysFromNow(0),
    unit: 'kg',
    supplier: 'Pamplona Alimentos S/A',
    location: 'Câmara Fria de Resfriados B',
  },
  {
    id: 26,
    plu: '2011',
    name: 'Joelho de Porco (Eisbein) Pamplona kg',
    category: 'suino',
    startDate: daysAgo(5),
    endDate: daysFromNow(3),
    unit: 'kg',
    supplier: 'Pamplona Alimentos S/A',
    location: 'Câmara Fria de Resfriados B',
  },
  {
    id: 27,
    plu: '2012',
    name: 'Orelha Suína Salgada Aurora Pacote 1kg',
    category: 'suino',
    startDate: daysAgo(30),
    endDate: daysFromNow(90),
    unit: 'pct',
    supplier: 'Cooperativa Central Aurora Alimentos',
    location: 'Gôndola de Salgados',
  },
  {
    id: 28,
    plu: '2013',
    name: 'Pé Suíno Salgado Aurora Pacote 1kg',
    category: 'suino',
    startDate: daysAgo(30),
    endDate: daysFromNow(90),
    unit: 'pct',
    supplier: 'Cooperativa Central Aurora Alimentos',
    location: 'Gôndola de Salgados',
  },
  {
    id: 29,
    plu: '2014',
    name: 'Rabo Suíno Salgado Pamplona Pacote 1kg',
    category: 'suino',
    startDate: daysAgo(25),
    endDate: daysFromNow(85),
    unit: 'pct',
    supplier: 'Pamplona Alimentos S/A',
    location: 'Gôndola de Salgados',
  },
  {
    id: 30,
    plu: '2015',
    name: 'Linguiça Calabresa Defumada Seara kg',
    category: 'suino',
    startDate: daysAgo(14),
    endDate: daysFromNow(16),
    unit: 'kg',
    supplier: 'JBS S.A. (Seara)',
    location: 'Vitrine de Embutidos',
  },

  // ── PESCADO ───────────────────────────────────────────────────────────────
  {
    id: 31,
    plu: '3001',
    name: 'Filé de Tilápia Congelado Copacol Pacote 400g',
    category: 'pescado',
    startDate: daysAgo(20),
    endDate: daysFromNow(120),
    unit: 'pct',
    supplier: 'Copacol Cooperativa Agroindustrial',
    location: 'Gôndola de Congelados 02',
  },
  {
    id: 32,
    plu: '3002',
    name: 'Filé de Tilápia Fresco Noronha Pescados kg',
    category: 'pescado',
    startDate: daysAgo(3),
    endDate: daysFromNow(2),
    unit: 'kg',
    supplier: 'Noronha Pescados S.A.',
    location: 'Vitrine de Peixaria',
  },
  {
    id: 33,
    plu: '3003',
    name: 'Posta de Cação Congelada Costa Sul Pacote 800g',
    category: 'pescado',
    startDate: daysAgo(40),
    endDate: daysFromNow(110),
    unit: 'pct',
    supplier: 'Costa Sul Pescados S/A',
    location: 'Câmara de Congelados B',
  },
  {
    id: 34,
    plu: '3004',
    name: 'Filé de Salmão Congelado Swift Pacote 500g',
    category: 'pescado',
    startDate: daysAgo(50),
    endDate: daysFromNow(130),
    unit: 'pct',
    supplier: 'JBS S.A. (Swift)',
    location: 'Câmara de Congelados B',
  },
  {
    id: 35,
    plu: '3005',
    name: 'Lombo de Salmão Fresco Frescatto kg',
    category: 'pescado',
    startDate: daysAgo(2),
    endDate: daysFromNow(1),
    unit: 'kg',
    supplier: 'Frescatto Company',
    location: 'Vitrine de Peixaria',
  },
  {
    id: 36,
    plu: '3006',
    name: 'Filé de Merluza Congelado Noronha Pacote 500g',
    category: 'pescado',
    startDate: daysAgo(30),
    endDate: daysFromNow(70),
    unit: 'pct',
    supplier: 'Noronha Pescados S.A.',
    location: 'Gôndola de Congelados 02',
  },
  {
    id: 37,
    plu: '3007',
    name: 'Sardinha Inteira Eviscerada Swift Pacote 1kg',
    category: 'pescado',
    startDate: daysAgo(15),
    endDate: daysFromNow(-1),
    unit: 'pct',
    supplier: 'JBS S.A. (Swift)',
    location: 'Câmara de Congelados B',
  },
  {
    id: 38,
    plu: '3008',
    name: 'Camarão Cinza Limpo Congelado DellMare Pacote 400g',
    category: 'pescado',
    startDate: daysAgo(25),
    endDate: daysFromNow(95),
    unit: 'pct',
    supplier: 'DellMare Alimentos',
    location: 'Gôndola de Congelados 02',
  },
  {
    id: 39,
    plu: '3009',
    name: 'Anéis de Lula Congelados Costa Sul Pacote 400g',
    category: 'pescado',
    startDate: daysAgo(45),
    endDate: daysFromNow(105),
    unit: 'pct',
    supplier: 'Costa Sul Pescados S/A',
    location: 'Câmara de Congelados B',
  },
  {
    id: 40,
    plu: '3010',
    name: 'Tentáculos de Polvo Congelados Frescatto Pacote 500g',
    category: 'pescado',
    startDate: daysAgo(10),
    endDate: daysFromNow(0),
    unit: 'pct',
    supplier: 'Frescatto Company',
    location: 'Câmara de Congelados B',
  },
  {
    id: 41,
    plu: '3011',
    name: 'Posta de Pintado Congelada Swift Pacote 1kg',
    category: 'pescado',
    startDate: daysAgo(12),
    endDate: daysFromNow(48),
    unit: 'pct',
    supplier: 'JBS S.A. (Swift)',
    location: 'Câmara de Congelados B',
  },
  {
    id: 42,
    plu: '3012',
    name: 'Bacalhau em Postas Dessalgado Cod Gadus Morhua Frescatto kg',
    category: 'pescado',
    startDate: daysAgo(15),
    endDate: daysFromNow(15),
    unit: 'kg',
    supplier: 'Frescatto Company',
    location: 'Câmara Fria de Pescados',
  },
  {
    id: 43,
    plu: '3013',
    name: 'Mexilhão Sem Casca Congelado DellMare Pacote 400g',
    category: 'pescado',
    startDate: daysAgo(60),
    endDate: daysFromNow(120),
    unit: 'pct',
    supplier: 'DellMare Alimentos',
    location: 'Gôndola de Congelados 02',
  },
  {
    id: 44,
    plu: '3014',
    name: 'Posta de Corvina Congelada Costa Sul Pacote 800g',
    category: 'pescado',
    startDate: daysAgo(15),
    endDate: daysFromNow(45),
    unit: 'pct',
    supplier: 'Costa Sul Pescados S/A',
    location: 'Câmara de Congelados B',
  },
  {
    id: 45,
    plu: '3015',
    name: 'Filé de Panga Congelado Noronha Pacote 800g',
    category: 'pescado',
    startDate: daysAgo(3),
    endDate: daysFromNow(3),
    unit: 'pct',
    supplier: 'Noronha Pescados S.A.',
    location: 'Gôndola de Congelados 02',
  },

  // ── BOVINO ─────────────────────────────────────────────────────────────────
  {
    id: 46,
    plu: '4001',
    name: 'Alcatra Bovina sem Osso Resfriada kg',
    category: 'bovino',
    startDate: daysAgo(2),
    endDate: daysFromNow(5),
    unit: 'kg',
    supplier: 'Friboi (JBS S.A.)',
    location: 'Vitrine de Bovinos',
  },
  {
    id: 47,
    plu: '4002',
    name: 'Contra Filé Bovino Grill Friboi kg',
    category: 'bovino',
    startDate: daysAgo(4),
    endDate: daysFromNow(1),
    unit: 'kg',
    supplier: 'Friboi (JBS S.A.)',
    location: 'Vitrine de Bovinos',
  },
  {
    id: 48,
    plu: '4003',
    name: 'Patinho Bovino Moído Resfriado Swift Bandeja 1kg',
    category: 'bovino',
    startDate: daysAgo(3),
    endDate: daysFromNow(2),
    unit: 'pct',
    supplier: 'Swift (JBS S.A.)',
    location: 'Balcão de Auto-serviço',
  },
  {
    id: 49,
    plu: '4004',
    name: 'Maminha Bovina Resfriada Estância 92 kg',
    category: 'bovino',
    startDate: daysAgo(5),
    endDate: daysFromNow(-2),
    unit: 'kg',
    supplier: 'Minerva Foods',
    location: 'Vitrine de Bovinos',
  },
  // ── PEREÇÍVEIS ────────────────────────────────────────────────────────────
  {
    id: 100,
    plu: '5001',
    name: 'Queijo Muçarela Fatiado Sadia 150g',
    category: 'laticinios',
    startDate: daysAgo(5),
    endDate: daysFromNow(4),
    unit: 'pct',
    supplier: 'BRF S.A. (Sadia)',
    location: 'Gôndola Fria 01',
    quantity: 15
  },
  {
    id: 101,
    plu: '5002',
    name: 'Iogurte Natural Integral Nestlé 170g',
    category: 'laticinios',
    startDate: daysAgo(10),
    endDate: daysFromNow(2),
    unit: 'un',
    supplier: 'Nestlé Brasil',
    location: 'Geladeira Laticínios',
    quantity: 24
  },
  {
    id: 102,
    plu: '6001',
    name: 'Margarina com Sal Qualy Pote 500g',
    category: 'frios',
    startDate: daysAgo(30),
    endDate: daysFromNow(12),
    unit: 'un',
    supplier: 'BRF S.A. (Qualy)',
    location: 'Gôndola Fria 02',
    quantity: 8
  },
  {
    id: 103,
    plu: '7001',
    name: 'Pão de Forma Tradicional Wickbold 500g',
    category: 'padaria',
    startDate: daysAgo(2),
    endDate: daysFromNow(1),
    unit: 'pct',
    supplier: 'Wickbold & Nosso Pão',
    location: 'Prateleira Padaria',
    quantity: 10
  },
  {
    id: 104,
    plu: '8001',
    name: 'Salada de Frutas Higienizada Pote 300g',
    category: 'hortifruti',
    startDate: daysAgo(1),
    endDate: daysFromNow(0),
    unit: 'pct',
    supplier: 'Hortifruti Distribuidora',
    location: 'Expositor Frio',
    quantity: 6
  }
];

// ── Helpers de Estado e Sincronização ─────────────────────────────────────────
window.BrigadaData = {
  users: [],
  products: [],
  catalog: [],
  produtosSemNota: [],

  parseProductCreator(p) {
    if (!p.supplier) {
      return { ...p, createdBy: null };
    }
    const match = p.supplier.match(/(.*?)\s*\[Criado por:\s*(.*?)\]\s*$/);
    if (match) {
      return {
        ...p,
        supplier: match[1].trim() || '',
        createdBy: match[2].trim()
      };
    }
    return { ...p, createdBy: null };
  },

  getUserNameByEmail(email) {
    if (!email) return '—';
    const user = this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    return user ? user.name : email.split('@')[0];
  },

  // Carrega todos os produtos e usuários do Supabase via backend Flask
  async load() {
    try {
      // Carrega produtos sem nota (que contém a base de iogurtes cadastrados)
      await this.loadProdutosSemNota().catch(err => console.warn("Aviso: Falha ao carregar produtos sem nota", err));

      const [resProd, resUsers, resCatalog] = await Promise.all([
        fetch('/api/products').then(r => {
          if (!r.ok) throw new Error('Falha ao obter produtos');
          return r.json();
        }),
        fetch('/api/users').then(r => {
          if (!r.ok) throw new Error('Falha ao obter usuários');
          return r.json();
        }),
        fetch('/api/products/catalog').then(r => {
          if (!r.ok) throw new Error('Falha ao obter catálogo');
          return r.json();
        }).catch(err => {
          console.warn("Aviso: Falha ao carregar catálogo", err);
          return [];
        })
      ]);
      
      this.products = resProd.map(p => this.parseProductCreator(p));
      this.users = resUsers;
      this.catalog = resCatalog;

      // Merge items from PRODUCTS_DB into products and catalog if missing
      const seenProdKeys = new Set(this.products.map(p => `${p.category}-${p.plu}`));
      PRODUCTS_DB.forEach(p => {
        const key = `${p.category}-${p.plu}`;
        if (!seenProdKeys.has(key)) {
          seenProdKeys.add(key);
          this.products.push(this.parseProductCreator(p));
        }
      });

      const seenCatKeys = new Set(this.catalog.map(c => `${c.category}-${c.plu}`));
      PRODUCTS_DB.forEach(p => {
        const key = `${p.category}-${p.plu}`;
        if (!seenCatKeys.has(key)) {
          seenCatKeys.add(key);
          this.catalog.push({
            plu: p.plu,
            name: p.name,
            category: p.category,
            barcode: p.barcode || ''
          });
        }
      });

      // Mescla produtos sem nota (base de iogurtes/laticínios) no catálogo base
      (this.produtosSemNota || []).forEach(p => {
        const key = `${p.category}-${p.plu}`;
        if (!seenCatKeys.has(key)) {
          seenCatKeys.add(key);
          this.catalog.push({
            plu: String(p.plu),
            name: p.name,
            category: p.category,
            barcode: p.barcode || ''
          });
        }
      });

      console.log('Dados carregados com sucesso do Supabase via API (mesclado com base local e sem nota)');
      return true;
    } catch (err) {
      console.warn("Erro ao carregar do Supabase (usando fallback local em memória):", err);
      // Se falhar (por exemplo, sem tabelas criadas no banco), usa os dados locais mockados
      this.products = PRODUCTS_DB.map(p => this.parseProductCreator(p));
      this.users = [...USERS_DB];
      
      // Cria catálogo de fallback a partir dos produtos mockados e produtos sem nota
      const seenPlus = new Set();
      this.catalog = [];
      this.products.forEach(p => {
        if (!seenPlus.has(p.plu)) {
          seenPlus.add(p.plu);
          this.catalog.push({
            plu: p.plu,
            name: p.name,
            category: p.category
          });
        }
      });

      (this.produtosSemNota || []).forEach(p => {
        if (!seenPlus.has(String(p.plu))) {
          seenPlus.add(String(p.plu));
          this.catalog.push({
            plu: String(p.plu),
            name: p.name,
            category: p.category,
            barcode: p.barcode || ''
          });
        }
      });

      return false;
    }
  },

  // Adiciona produto no backend
  async addProduct(p) {
    const creatorEmail = window.BrigadaAuth.currentUser?.email || 'sistema';
    const payload = {
      ...p,
      supplier: p.supplier ? `${p.supplier} [Criado por: ${creatorEmail}]` : `[Criado por: ${creatorEmail}]`
    };
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Erro ao salvar produto no servidor');
      }
      const created = await res.json();
      const parsed = this.parseProductCreator(created);
      this.products.push(parsed);
      return parsed;
    } catch (err) {
      // Se for um erro de validação do próprio backend, repassa para o front exibir
      if (err.message && !err.message.includes('Failed to fetch') && !err.message.includes('NetworkError')) {
        throw err;
      }
      console.error("Erro na API ao criar produto (usando fallback local):", err);
      const local = { id: this.nextProductId(), ...p, createdBy: creatorEmail };
      this.products.push(local);
      return local;
    }
  },

  // Atualiza produto no backend
  async updateProduct(id, p) {
    const original = this.products.find(x => x.id === id);
    const creatorEmail = original?.createdBy || window.BrigadaAuth.currentUser?.email || 'sistema';
    const payload = {
      ...p,
      supplier: p.supplier ? `${p.supplier} [Criado por: ${creatorEmail}]` : `[Criado por: ${creatorEmail}]`
    };
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Erro ao atualizar produto no servidor');
      }
      const updated = await res.json();
      const parsed = this.parseProductCreator(updated);
      const idx = this.products.findIndex(x => x.id === id);
      if (idx !== -1) this.products[idx] = parsed;
      return parsed;
    } catch (err) {
      if (err.message && !err.message.includes('Failed to fetch') && !err.message.includes('NetworkError')) {
        throw err;
      }
      console.error("Erro na API ao atualizar produto (usando fallback local):", err);
      const idx = this.products.findIndex(x => x.id === id);
      if (idx !== -1) {
        this.products[idx] = { ...this.products[idx], ...p, createdBy: creatorEmail };
        return this.products[idx];
      }
      return null;
    }
  },

  // Remove produto no backend
  async deleteProduct(id, payload = {}) {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error(await res.text());
      const idx = this.products.findIndex(x => x.id === id);
      if (idx !== -1) this.products.splice(idx, 1);
      return true;
    } catch (err) {
      console.error("Erro na API ao excluir produto (usando fallback local):", err);
      const idx = this.products.findIndex(x => x.id === id);
      if (idx !== -1) this.products.splice(idx, 1);
      return true;
    }
  },

  // Adiciona usuário no backend
  async addUser(u) {
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(u)
      });
      if (!res.ok) throw new Error(await res.text());
      const created = await res.json();
      this.users.push(created);
      return created;
    } catch (err) {
      console.error("Erro na API ao criar usuário (usando fallback local):", err);
      const local = { 
        id: this.nextUserId(), 
        ...u, 
        createdAt: new Date().toISOString().split('T')[0], 
        lastLogin: null 
      };
      this.users.push(local);
      return local;
    }
  },

  // Atualiza usuário no backend
  async updateUser(id, u) {
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(u)
      });
      if (!res.ok) throw new Error(await res.text());
      const updated = await res.json();
      const idx = this.users.findIndex(x => x.id === id);
      if (idx !== -1) this.users[idx] = updated;
      return updated;
    } catch (err) {
      console.error("Erro na API ao atualizar usuário (usando fallback local):", err);
      const idx = this.users.findIndex(x => x.id === id);
      if (idx !== -1) {
        this.users[idx] = { ...this.users[idx], ...u };
        return this.users[idx];
      }
      return null;
    }
  },

  // Remove usuário no backend
  async deleteUser(id) {
    try {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(await res.text());
      const idx = this.users.findIndex(x => x.id === id);
      if (idx !== -1) this.users.splice(idx, 1);
      return true;
    } catch (err) {
      console.error("Erro na API ao excluir usuário (usando fallback local):", err);
      const idx = this.users.findIndex(x => x.id === id);
      if (idx !== -1) this.users.splice(idx, 1);
      return true;
    }
  },

  // Calcula status de validade de um produto
  getProductStatus(product, ignoreAction = false) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = new Date(product.endDate + 'T00:00:00');
    const diffDays = Math.ceil((end - today) / (1000 * 60 * 60 * 24));

    if (!ignoreAction) {
      if (product.expiredAction === 'quebra') {
        return { label: diffDays < 0 ? 'Vencido (Quebra)' : 'Quebra', class: 'badge--expired', icon: '🗑️', days: diffDays };
      }
      if (product.expiredAction === 'troca') {
        return { label: diffDays < 0 ? 'Vencido (Troca)' : 'Troca', class: 'badge--expired', icon: '🔄', days: diffDays };
      }
      if (product.expiredAction === 'vendido') {
        return { label: 'Vendido', class: 'badge--ok', icon: '💰', days: diffDays };
      }
      if (product.expiredAction === 'tratado') {
        return { label: 'Tratado com Sucesso', class: 'badge--ok', icon: '✔️', days: diffDays };
      }
    }

    if (diffDays < 0) {
      return { label: 'Vencido', class: 'badge--expired', icon: '🔴', days: diffDays };
    }
    if (diffDays === 0) return { label: 'Vence Hoje', class: 'badge--today', icon: '🟠', days: 0 };
    if (diffDays <= 3) return { label: `${diffDays}d restantes`, class: 'badge--warning', icon: '🟡', days: diffDays };
    return { label: 'OK', class: 'badge--ok', icon: '🟢', days: diffDays };
  },

  // Define status de aguardando rebaixa (persiste no Supabase)
  async setAwaitingReduction(ids, status, rebaixaStatus = 'aguardando') {
    // Atualiza localmente primeiro para resposta imediata
    this.products.forEach(p => {
      if (ids.includes(p.id)) {
        p.isAwaitingReduction = status;
        p.rebaixaStatus = rebaixaStatus;
      }
    });

    // Persiste no backend
    try {
      const res = await fetch('/api/products/rebaixa', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids, status, rebaixaStatus })
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        console.error('Erro ao salvar rebaixa no servidor:', errData);
      }
    } catch (err) {
      console.error('Erro na API ao atualizar rebaixa (dados salvos localmente):', err);
    }
  },

  // Define status de ação para produtos vencidos (Quebra ou Troca)
  async setExpiredAction(id, action) {
    const product = this.products.find(p => p.id === id);
    if (!product) return;
    
    // Atualiza localmente
    product.expiredAction = action;
    
    // Persiste no backend via PATCH ou PUT
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expiredAction: action })
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        console.error('Erro ao salvar ação de vencido no servidor:', errData);
      }
    } catch (err) {
      console.error('Erro na API ao atualizar ação de vencido (dados salvos localmente):', err);
    }
  },

  // Estatísticas gerais
  getStats(productsList = null) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let allowedProducts = productsList;
    if (!allowedProducts) {
      allowedProducts = this.products;
      if (window.BrigadaAuth && window.BrigadaAuth.currentUser) {
        const email = window.BrigadaAuth.currentUser.email.toLowerCase();
        const isRestricted = !(email === 'admin@brigada.com' || email === 'marcos@brigada.com' || window.BrigadaAuth.isSuperAdmin());
        if (isRestricted) {
          const sector = window.BrigadaAuth.currentUser.sector;
          if (sector === 'açougue') {
            allowedProducts = this.products.filter(p => ['aves', 'suino', 'bovino', 'pescado'].includes(p.category));
          } else if (sector === 'padaria') {
            allowedProducts = this.products.filter(p => ['padaria'].includes(p.category));
          } else if (sector === 'hortifruti') {
            allowedProducts = this.products.filter(p => ['hortifruti'].includes(p.category));
          } else if (sector === 'mercearia') {
            allowedProducts = this.products.filter(p => ['mercearia'].includes(p.category));
          }
        }
      }
    }

    let expired = 0, expiresToday = 0, expiresSoon = 0, ok = 0, awaitingReduction = 0, quebra = 0, troca = 0, tratado = 0;
    allowedProducts.forEach(p => {
      if (p.isAwaitingReduction) awaitingReduction++;
      if (p.expiredAction === 'quebra') quebra++;
      if (p.expiredAction === 'troca') troca++;
      if (p.expiredAction === 'tratado') tratado++;
      const s = this.getProductStatus(p);
      if (s.days < 0) {
        if (!p.expiredAction) expired++;
      }
      else if (s.days === 0) expiresToday++;
      else if (s.days <= 3) expiresSoon++;
      else ok++;
    });

    return {
      total: allowedProducts.length,
      expired,
      expiresToday,
      expiresSoon,
      ok,
      awaitingReduction,
      quebra,
      troca,
      tratado,
      totalUsers: this.users.length,
      activeUsers: this.users.filter(u => u.status === 'active').length,
    };
  },

  // Próximo ID disponível (usado em fallback local)
  nextProductId() {
    return Math.max(...this.products.map(p => p.id), 0) + 1;
  },
  nextUserId() {
    return Math.max(...this.users.map(u => u.id), 0) + 1;
  },

  // Formata data para exibição
  formatDate(dateStr) {
    if (!dateStr) return '—';
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  },

  // Formata data e hora
  formatDateTime(isoStr) {
    if (!isoStr) return '—';
    const d = new Date(isoStr);
    return d.toLocaleString('pt-BR');
  },

  // Formata localização de produto de forma amigável
  formatLocationFriendly(p) {
    if (!p) return '—';
    const loc = p.location;
    if (!loc) return '—';
    if (loc === 'resfriado') return '❄️ Resfriado';
    if (loc === 'congelado') return '🥶 Congelado';
    if (loc === 'piso_loja') return '🏪 Piso de Loja';
    
    // Testa se é coordenada de câmara fria
    const match = loc.match(/^(resfriado|congelado):C(\d+)-N(\d+)-([ED])$/);
    if (match) {
      const chamber = match[1] === 'resfriado' ? '❄️ Resf' : '🥶 Cong';
      const pos = match[4] === 'E' ? 'E' : 'D';
      return `${chamber}: C${match[2]}-N${match[3]}-${pos}`;
    }
    
    // Fallback genérico
    const colInfo = p.column ? ` (Col. ${p.column}${p.columnNumber ? ` - Nº ${p.columnNumber}` : ''})` : '';
    return `${loc}${colInfo}`;
  },

  // ── Configurações ──────────────────────────────────────────────────────────
  async loadSettings(key) {
    try {
      const res = await fetch(`/api/settings/${key}`);
      if (!res.ok) throw new Error('Falha ao carregar configurações');
      return await res.json();
    } catch (err) {
      console.warn(`Erro ao carregar configurações de ${key} (usando fallback local):`, err);
      // Fallback para localStorage
      const cached = localStorage.getItem(`brigada_settings_${key}`);
      if (cached) {
        try { return JSON.parse(cached); } catch {}
      }
      // Defaults
      return {
        enabled: true,
        apiUrl: "https://papi.seu-servidor.com",
        instanceId: "papi",
        apiToken: "",
        alertDaysBefore: 3,
        alertTime: "08:00",
        alertPhone: "",
        reminderActive: false,
        reminderMsg: "Atenção equipe! Favor verificar as validades do setor de aves hoje.",
        reminderTime: "09:00"
      };
    }
  },

  async saveSettings(key, data) {
    try {
      const res = await fetch(`/api/settings/${key}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Falha ao salvar configurações no servidor');
      localStorage.setItem(`brigada_settings_${key}`, JSON.stringify(data));
      return await res.json();
    } catch (err) {
      console.error(`Erro ao salvar configurações de ${key} no servidor (salvando localmente):`, err);
      localStorage.setItem(`brigada_settings_${key}`, JSON.stringify(data));
      return { success: true, message: 'Salvo localmente (modo offline).' };
    }
  },

  async testWhatsApp(config) {
    try {
      const res = await fetch('/api/settings/whatsapp/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Erro ao enviar notificação de teste');
      }
      return await res.json();
    } catch (err) {
      console.error('Erro na API de teste do WhatsApp:', err);
      // Simulação em caso de offline total
      return {
        success: true,
        simulated: true,
        message: `Mensagem de teste simulada offline enviada com sucesso para ${config.alertPhone}!`
      };
    }
  },

  async broadcastWhatsApp(phones, message) {
    try {
      const res = await fetch('/api/settings/whatsapp/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phones, message })
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Erro ao enviar disparo em massa');
      }
      return await res.json();
    } catch (err) {
      console.error('Erro no broadcast WhatsApp:', err);
      return {
        success: true,
        simulated: true,
        sent: phones.length,
        failed: 0,
        message: `Disparo simulado offline: ${phones.length} mensagem(ns) processada(s).`
      };
    }
  },

  async loadProdutosSemNota() {
    try {
      const res = await fetch('/api/produtos-sem-nota');
      if (!res.ok) throw new Error('Falha ao buscar produtos sem nota');
      this.produtosSemNota = await res.json();
      return this.produtosSemNota;
    } catch (err) {
      console.error('Erro na API ao carregar produtos sem nota (usando fallback local):', err);
      const cached = localStorage.getItem('brigada_produtos_sem_nota');
      this.produtosSemNota = cached ? JSON.parse(cached) : [    // ── IOGURTES & BEBIDAS LÁCTEAS (CADASTRADOS VIA ANÁLISE DE ESTOQUE) ──
  {
    id: 5000,
    plu: '271',
    name: 'BEB LACT BAT GUT BETANIA SCH 900G AMEIXA',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Betânia',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7898403781014'
  },
  {
    id: 5001,
    plu: '46173',
    name: 'BEB LACT BAT GUT BETANIA SCH 900G GRAVIOLA',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Betânia',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7898403781021'
  },
  {
    id: 5002,
    plu: '49777',
    name: 'BEB LACT BAT GUT BETANIA SCH 900G MAC CEREJAS',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Betânia',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7898064011826'
  },
  {
    id: 5003,
    plu: '270',
    name: 'BEB LACT BAT GUT BETANIA SCH 900G MORANGO',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Betânia',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7898403780451'
  },
  {
    id: 5004,
    plu: '46180',
    name: 'BEB LACT BETANIA BD540G COCO',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Betânia',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7898403782196'
  },
  {
    id: 5005,
    plu: '269',
    name: 'BEB LACT BETANIA BD540G MOR AMEIXA',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Betânia',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7898403780970'
  },
  {
    id: 5006,
    plu: '268',
    name: 'BEB LACT BETANIA BD540G MOR',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Betânia',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7898403780574'
  },
  {
    id: 5007,
    plu: '5880',
    name: 'BEB LACT CHAMYTO 130G MOR CER CHOC',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Nestlé',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891000260166'
  },
  {
    id: 5008,
    plu: '5881',
    name: 'BEB LACT CHAMYTO 130G MOR CER COLOR',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Nestlé',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891000261460'
  },
  {
    id: 5009,
    plu: '25289',
    name: 'BEB LACT ELEGE BJ 510G MOR AMEIXA',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Elegê',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891097101748'
  },
  {
    id: 5010,
    plu: '46148',
    name: 'BEB LACT FERM BETANIA BD680G MOR',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Betânia',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7898950516084'
  },
  {
    id: 5011,
    plu: '33335',
    name: 'BEB LACT FERM DANONE BD 510G MORANGO',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Danone',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891025121626'
  },
  {
    id: 5012,
    plu: '33332',
    name: 'BEB LACT FERM DANONE KIDS BD 510G MORANGO',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Danone',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891025121640'
  },
  {
    id: 5013,
    plu: '25262',
    name: 'BEB LACT FERM ELEGE 1150G MOR',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Elegê',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891097103223'
  },
  {
    id: 5014,
    plu: '25264',
    name: 'BEB LACT FERM ELEGE 1150G SALADA FRUTAS',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Elegê',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891097103230'
  },
  {
    id: 5015,
    plu: '3237',
    name: 'BEB LACT FERM LETA 540G MORANGO',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Leta',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7898144260472'
  },
  {
    id: 5016,
    plu: '3238',
    name: 'BEB LACT FERM LETA BICAMADA 120G MORANGO',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Leta',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7898144260243'
  },
  {
    id: 5017,
    plu: '50827',
    name: 'BEB LACT FERM LETA GF 850G FRUTAS CEREAIS',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Leta',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7898144260199'
  },
  {
    id: 5018,
    plu: '50829',
    name: 'BEB LACT FERM LETA GF 850G LIGHT MORANGO',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Leta',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7898144260373'
  },
  {
    id: 5019,
    plu: '3200',
    name: 'BEB LACT FERM LETA SCH 150G MORANGO',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Leta',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7898144260342'
  },
  {
    id: 5020,
    plu: '50818',
    name: 'BEB LACT FERM LETA SCH 900G ACAI BANANA',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Leta',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7898144261233'
  },
  {
    id: 5021,
    plu: '3250',
    name: 'BEB LACT FERM LETA SCH 900G AMEIXA',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Leta',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7898144260441'
  },
  {
    id: 5022,
    plu: '3253',
    name: 'BEB LACT FERM LETA SCH 900G CAJA',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Leta',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7898144260724'
  },
  {
    id: 5023,
    plu: '3248',
    name: 'BEB LACT FERM LETA SCH 900G FR CER',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Leta',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7898144260496'
  },
  {
    id: 5024,
    plu: '3252',
    name: 'BEB LACT FERM LETA SCH 900G GRAV',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Leta',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7898144260229'
  },
  {
    id: 5025,
    plu: '3241',
    name: 'BEB LACT FERM LETA SCH 900G MORANGO',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Leta',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7898144260489'
  },
  {
    id: 5026,
    plu: '13774',
    name: 'BEB LACT FERM POLPA BATAVO 540G MOR COCO',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Batavo',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891097101854'
  },
  {
    id: 5027,
    plu: '22908',
    name: 'BEB LACT IPOJUCA GF 170G AMEIXA',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Ipojuca',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7898925984382'
  },
  {
    id: 5028,
    plu: '22907',
    name: 'BEB LACT IPOJUCA GF 170G SALADA FRUTAS',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Ipojuca',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7898925984375'
  },
  {
    id: 5029,
    plu: '22914',
    name: 'BEB LACT IPOJUCA GF 850G MOR',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Ipojuca',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7898925984443'
  },
  {
    id: 5030,
    plu: '22915',
    name: 'BEB LACT IPOJUCA GF 850G SALADA FRUTAS',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Ipojuca',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7898925984474'
  },
  {
    id: 5031,
    plu: '22904',
    name: 'BEB LACT IPOJUCA SCH 900G ACAI C BANANA',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Ipojuca',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7898925984528'
  },
  {
    id: 5032,
    plu: '22905',
    name: 'BEB LACT IPOJUCA SCH 900G AMEIXA',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Ipojuca',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7898925984283'
  },
  {
    id: 5033,
    plu: '22903',
    name: 'BEB LACT IPOJUCA SCH 900G SALADA FRUTAS',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Ipojuca',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7898925984276'
  },
  {
    id: 5034,
    plu: '46260',
    name: 'BEB LACT ISINHO SCH 70G MORANGO',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Isis',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7898034920899'
  },
  {
    id: 5035,
    plu: '46261',
    name: 'BEB LACT ISINHO SCH 70G TUTTI FRUT',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Isis',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7898034920264'
  },
  {
    id: 5036,
    plu: '472',
    name: 'BEB LACT ISIS 150G MOR',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Isis',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7898037640121'
  },
  {
    id: 5037,
    plu: '473',
    name: 'BEB LACT ISIS 150G SALADA FR',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Isis',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7898037640381'
  },
  {
    id: 5038,
    plu: '35061',
    name: 'BEB LACT ISIS BD 540G BANANA C MACA',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Isis',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7898037640978'
  },
  {
    id: 5039,
    plu: '489',
    name: 'BEB LACT ISIS BD 540G MOR',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Isis',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7898037640930'
  },
  {
    id: 5040,
    plu: '35060',
    name: 'BEB LACT ISIS BD 540G SALADA FRUTAS',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Isis',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7898037640947'
  },
  {
    id: 5041,
    plu: '474',
    name: 'BEB LACT ISIS SCH 900G AMEIXA',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Isis',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7898037640633'
  },
  {
    id: 5042,
    plu: '22972',
    name: 'BEB LACT ISIS SCH 900G BANANA MACA',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Isis',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7898037640411'
  },
  {
    id: 5043,
    plu: '475',
    name: 'BEB LACT ISIS SCH 900G GRAV',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Isis',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7898037640244'
  },
  {
    id: 5044,
    plu: '476',
    name: 'BEB LACT ISIS SCH 900G MOR',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Isis',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7898037640138'
  },
  {
    id: 5045,
    plu: '478',
    name: 'BEB LACT ISIS SCH 900G SALADA FR',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Isis',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7898037640404'
  },
  {
    id: 5046,
    plu: '20235',
    name: 'BEB LACT NESTLE NESTON GFA 850G MACA E BANANA',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Nestlé',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891000260623'
  },
  {
    id: 5047,
    plu: '13785',
    name: 'BEB LACT POLPA ELEGE BOB MOR BD510G',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Elegê',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891097101465'
  },
  {
    id: 5048,
    plu: '102910',
    name: 'BEB LACT POLPA VIGOR ZR MOR 480G',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Vigor',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7896625213436'
  },
  {
    id: 5049,
    plu: '287',
    name: 'COALHADA BETANIA 140G ADOC INT',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Betânia',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7898403780277'
  },
  {
    id: 5050,
    plu: '286',
    name: 'COALHADA BETANIA 140G LIGHT',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Betânia',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7898403780284'
  },
  {
    id: 5051,
    plu: '481',
    name: 'COALHADA ISIS COPO 150G DESN',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Isis',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7898037640176'
  },
  {
    id: 5052,
    plu: '482',
    name: 'COALHADA ISIS COPO 150G INT',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Isis',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7898037640183'
  },
  {
    id: 5053,
    plu: '50812',
    name: 'COALHADA LETA 140G AMEIXA',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Leta',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7898144260717'
  },
  {
    id: 5054,
    plu: '50813',
    name: 'COALHADA LETA 140G INTEGRAL',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Leta',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7898144260731'
  },
  {
    id: 5055,
    plu: '50811',
    name: 'COALHADA LETA 140G LIGHT DESN',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Leta',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7898144260748'
  },
  {
    id: 5056,
    plu: '50810',
    name: 'COALHADA LETA 140G MORANGO',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Leta',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7898144260700'
  },
  {
    id: 5057,
    plu: '25840',
    name: 'IOG ACTIVIA CAFE DA MANHA 170G AMARANTO MAMAO',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Danone',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891025117797'
  },
  {
    id: 5058,
    plu: '25841',
    name: 'IOG ACTIVIA CAFE DA MANHA 170G LINH MOR',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Danone',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891025117742'
  },
  {
    id: 5059,
    plu: '33340',
    name: 'IOG ACTIVIA POLPA BD680G MAMAO E CEREAIS',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Danone',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891025123248'
  },
  {
    id: 5060,
    plu: '33341',
    name: 'IOG ACTIVIA POLPA BD680G MOR',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Danone',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891025123231'
  },
  {
    id: 5061,
    plu: '13807',
    name: 'IOG BATAVO PENSE ZERO 100G PEDACOS MOR',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Batavo',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891097000775'
  },
  {
    id: 5062,
    plu: '13759',
    name: 'IOG BATAVO PENSE ZERO 170G MAMAO',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Batavo',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891097107825'
  },
  {
    id: 5063,
    plu: '26711',
    name: 'IOG BATAVO PENSE ZERO GF 1,150G MOR',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Batavo',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891097103643'
  },
  {
    id: 5064,
    plu: '13812',
    name: 'IOG BATAVO PENSE ZERO PED FR PT450G MOR',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Batavo',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891097001260'
  },
  {
    id: 5065,
    plu: '50059',
    name: 'IOG BATAVO PROBIO2 GF 1,150G AMEIXA',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Batavo',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891097106842'
  },
  {
    id: 5066,
    plu: '50060',
    name: 'IOG BATAVO PROBIO2 GF 1,150G MORANGO',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Batavo',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891097107016'
  },
  {
    id: 5067,
    plu: '277',
    name: 'IOG BETANIA BICAMADA 150G AMEIXA',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Betânia',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7898403782349'
  },
  {
    id: 5068,
    plu: '276',
    name: 'IOG BETANIA BICAMADA 150G MOR',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Betânia',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7898403781632'
  },
  {
    id: 5069,
    plu: '46144',
    name: 'IOG BETANIA ECON GF 1250G MOR',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Betânia',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7898403782943'
  },
  {
    id: 5070,
    plu: '278',
    name: 'IOG BETANIA GF 900G AMEIXA',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Betânia',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7898403780635'
  },
  {
    id: 5071,
    plu: '279',
    name: 'IOG BETANIA GF 900G FR VM',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Betânia',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7898403780932'
  },
  {
    id: 5072,
    plu: '281',
    name: 'IOG BETANIA GF 900G MOR',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Betânia',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7898403780659'
  },
  {
    id: 5073,
    plu: '46104',
    name: 'IOG BETANIA INT GREGO BD 540G',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Betânia',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7898403782448'
  },
  {
    id: 5074,
    plu: '46168',
    name: 'IOG BETANIA KIDS FR 100G BANANA E MACA',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Betânia',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7898403782783'
  },
  {
    id: 5075,
    plu: '46158',
    name: 'IOG BETANIA KIDS FR 100G MOR',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Betânia',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7898403782769'
  },
  {
    id: 5076,
    plu: '46153',
    name: 'IOG BETANIA KIDS MERENDINHA 100G GOIABA',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Betânia',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7898064011772'
  },
  {
    id: 5077,
    plu: '46154',
    name: 'IOG BETANIA KIDS MERENDINHA 100G UVA',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Betânia',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7898064011789'
  },
  {
    id: 5078,
    plu: '46149',
    name: 'IOG BETANIA KIDS MERENDINHA MOR100G',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Betânia',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7898403782936'
  },
  {
    id: 5079,
    plu: '50074',
    name: 'IOG C CONFEITO BOB ESPON ELEGE 125G TRADICIONAL',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Elegê',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891097104541'
  },
  {
    id: 5080,
    plu: '38949',
    name: 'IOG CHAMBINHO POLPA BDJ 510G MOR',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Nestlé',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891000394632'
  },
  {
    id: 5081,
    plu: '25837',
    name: 'IOG CORPUS 800G MORANGO',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Danone',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891025124177'
  },
  {
    id: 5082,
    plu: '47522',
    name: 'IOG DANONE MAIS PROTEINA COPO 160G BAUNILHA',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Danone',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891025124597'
  },
  {
    id: 5083,
    plu: '47523',
    name: 'IOG DANONE MAIS PROTEINA COPO 160G MORANGO',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Danone',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891025124573'
  },
  {
    id: 5084,
    plu: '47524',
    name: 'IOG DANONE MAIS PROTEINA COPO 160G ORIGINAL',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Danone',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891025124603'
  },
  {
    id: 5085,
    plu: '56293',
    name: 'IOG DANONE NATURAL160G LAR CEN MEL',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Danone',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891025121251'
  },
  {
    id: 5086,
    plu: '65992',
    name: 'IOG DANONE YOPRO MORANGO 160G',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Danone',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891025115311'
  },
  {
    id: 5087,
    plu: '47531',
    name: 'IOG DANONINHO BOM DIA SQZ 70G BANANA C AVEIA',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Danone',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891025124535'
  },
  {
    id: 5088,
    plu: '63799',
    name: 'IOG DES BATAVO PENSE ZERO 100G COCO',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Batavo',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891097107023'
  },
  {
    id: 5089,
    plu: '63792',
    name: 'IOG DES GREGO BATAVO ZERO BD 510G MOR MAR TRAD',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Batavo',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891097106248'
  },
  {
    id: 5090,
    plu: '100385',
    name: 'IOG DESN BATAVO PROBIO2 GF 170G AMEIXA',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Batavo',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891097104886'
  },
  {
    id: 5091,
    plu: '100386',
    name: 'IOG DESN BATAVO PROBIO2 GF 170G MORANGO',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Batavo',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891097104879'
  },
  {
    id: 5092,
    plu: '283',
    name: 'IOG DESN BETANIA GF 170G MOR',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Betânia',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7898403780666'
  },
  {
    id: 5093,
    plu: '50070',
    name: 'IOG DESN ELEGE BOB ESPONJA SQZ 100G MORANGO',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Elegê',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891097106750'
  },
  {
    id: 5094,
    plu: '50071',
    name: 'IOG DESN ELEGE BOB ESPONJA SQZ 100G VITAMINA FT',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Elegê',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891097106767'
  },
  {
    id: 5095,
    plu: '5915',
    name: 'IOG DESN NAT NESTLE COPO 160G',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Nestlé',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891000073018'
  },
  {
    id: 5096,
    plu: '101851',
    name: 'IOG DESN NESTLE Z LACT GF 1,15KG AMEIXA',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Nestlé',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7898755200485'
  },
  {
    id: 5097,
    plu: '100377',
    name: 'IOG DESN PARMALAT FIT ZERO BDJ 400G COCO',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Parmalat',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891097107344'
  },
  {
    id: 5098,
    plu: '100378',
    name: 'IOG DESN PARMALAT FIT ZERO BDJ 400G MORANGO',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Parmalat',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891097107351'
  },
  {
    id: 5099,
    plu: '100381',
    name: 'IOG DESN PARMALAT FIT ZERO GF 100G COCO',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Parmalat',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891097107443'
  },
  {
    id: 5100,
    plu: '101663',
    name: 'IOG DESN PARMALAT FIT ZERO GF 850G COCO',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Parmalat',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891097107948'
  },
  {
    id: 5101,
    plu: '63706',
    name: 'IOG DESNATADO ZERO LACTOSE 1,15KG BATIDO',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Outros Laticínios',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7898755200362'
  },
  {
    id: 5102,
    plu: '63704',
    name: 'IOG DESNATADO ZERO LACTOSE 1,15KG MORANGO',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Outros Laticínios',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7898755200331'
  },
  {
    id: 5103,
    plu: '13705',
    name: 'IOG GREGO BATAVO 100G MOR',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Batavo',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891097000256'
  },
  {
    id: 5104,
    plu: '13704',
    name: 'IOG GREGO BATAVO 100G TRAD',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Batavo',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891097000270'
  },
  {
    id: 5105,
    plu: '50075',
    name: 'IOG GREGO BATAVO PENSE ZERO 100G MARACUJA',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Batavo',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891097106101'
  },
  {
    id: 5106,
    plu: '13809',
    name: 'IOG GREGO BATAVO PENSE ZERO 100G MOR',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Batavo',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891097000713'
  },
  {
    id: 5107,
    plu: '13810',
    name: 'IOG GREGO BATAVO PENSE ZERO 100G TRAD',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Batavo',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891097000720'
  },
  {
    id: 5108,
    plu: '13709',
    name: 'IOG GREGO BATAVO POTE 450G PENSE ZERO MOR',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Batavo',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891097001253'
  },
  {
    id: 5109,
    plu: '33344',
    name: 'IOG GREGO DANONE BD 510G ORIG FR VM',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Danone',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891025123378'
  },
  {
    id: 5110,
    plu: '33351',
    name: 'IOG GREGO DANONE LIGHT BD 510G ORIG E MORANGO',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Danone',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891025123392'
  },
  {
    id: 5111,
    plu: '33339',
    name: 'IOG GREGO DANONE POTE 90G FR VM',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Danone',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891025123057'
  },
  {
    id: 5112,
    plu: '33338',
    name: 'IOG GREGO DANONE POTE 90G TRAD',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Danone',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891025123064'
  },
  {
    id: 5113,
    plu: '24580',
    name: 'IOG GREGO ITAMBE POTE 450G MOR',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Itambé',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7896051165637'
  },
  {
    id: 5114,
    plu: '50816',
    name: 'IOG GREGO LETA 100G BANANA',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Leta',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7898144261035'
  },
  {
    id: 5115,
    plu: '50817',
    name: 'IOG GREGO LETA 100G GOIABA',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Leta',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7898144261028'
  },
  {
    id: 5116,
    plu: '50814',
    name: 'IOG GREGO LETA 100G MORANGO',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Leta',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7898144261011'
  },
  {
    id: 5117,
    plu: '50815',
    name: 'IOG GREGO LETA 100G TRADICIONAL',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Leta',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7898144261042'
  },
  {
    id: 5118,
    plu: '50176',
    name: 'IOG GREGO NESTLE 90G CALDA FRUT VM',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Nestlé',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891000409282'
  },
  {
    id: 5119,
    plu: '50175',
    name: 'IOG GREGO NESTLE 90G LIMAO CALDA',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Nestlé',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891000409305'
  },
  {
    id: 5120,
    plu: '36830',
    name: 'IOG GREGO NESTLE 90G TRAD CALDA MOR',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Nestlé',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891000382349'
  },
  {
    id: 5121,
    plu: '5892',
    name: 'IOG GREGO NESTLE 90G TRAD',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Nestlé',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '78936171'
  },
  {
    id: 5122,
    plu: '32749',
    name: 'IOG GREGO NESTLE BDJ 360G FRUTAS VM',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Nestlé',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891000360620'
  },
  {
    id: 5123,
    plu: '5883',
    name: 'IOG GREGO NESTLE LIGHT 540G 3 SABORES',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Nestlé',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891000096864'
  },
  {
    id: 5124,
    plu: '32750',
    name: 'IOG GREGO NESTLE TRAD MOR BDJ 540G',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Nestlé',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891000360361'
  },
  {
    id: 5125,
    plu: '50662',
    name: 'IOG GREGO VIGOR 90G FLOCOS CHOC',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Vigor',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7896625211081'
  },
  {
    id: 5126,
    plu: '50667',
    name: 'IOG GREGO VIGOR 90G FRUT VERM',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Vigor',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7896625211111'
  },
  {
    id: 5127,
    plu: '50668',
    name: 'IOG GREGO VIGOR 90G MOR BAUNILHA',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Vigor',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7896625211098'
  },
  {
    id: 5128,
    plu: '53284',
    name: 'IOG GREGO VIGOR 90G PISTACHE',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Vigor',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7896625212644'
  },
  {
    id: 5129,
    plu: '50705',
    name: 'IOG GREGO VIGOR 90G TRADICIONAL',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Vigor',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7896625211142'
  },
  {
    id: 5130,
    plu: '50706',
    name: 'IOG GREGO VIGOR 90G ZERO GOR FLOCOS',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Vigor',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7896625211968'
  },
  {
    id: 5131,
    plu: '50670',
    name: 'IOG GREGO VIGOR 90G ZERO GORDURA',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Vigor',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7896625211159'
  },
  {
    id: 5132,
    plu: '101667',
    name: 'IOG INT BATAVO COPO 160G ORIG',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Batavo',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891097107856'
  },
  {
    id: 5133,
    plu: '101658',
    name: 'IOG INT CR BATAVO BDJ 510G NATURAL',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Batavo',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891097108105'
  },
  {
    id: 5134,
    plu: '47348',
    name: 'IOG INT GREGO BATAVO BD 510G MORANGO',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Batavo',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891097105678'
  },
  {
    id: 5135,
    plu: '455',
    name: 'IOG ISIS FRASCO 170G AMEIXA',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Isis',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7898037640039'
  },
  {
    id: 5136,
    plu: '22970',
    name: 'IOG ISIS FRASCO 170G BANANA MACA',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Isis',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7898037640053'
  },
  {
    id: 5137,
    plu: '456',
    name: 'IOG ISIS FRASCO 170G FR VM',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Isis',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7898037640367'
  },
  {
    id: 5138,
    plu: '458',
    name: 'IOG ISIS FRASCO 170G MOR',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Isis',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7898037640015'
  },
  {
    id: 5139,
    plu: '459',
    name: 'IOG ISIS FRASCO 170G SALADA FR',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Isis',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7898037640077'
  },
  {
    id: 5140,
    plu: '460',
    name: 'IOG ISIS GF 480G AMEIXA',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Isis',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7898037640046'
  },
  {
    id: 5141,
    plu: '26385',
    name: 'IOG ISIS GF 480G BANANA C MACA',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Isis',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7898037640060'
  },
  {
    id: 5142,
    plu: '462',
    name: 'IOG ISIS GF 480G MOR',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Isis',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7898037640022'
  },
  {
    id: 5143,
    plu: '463',
    name: 'IOG ISIS GF 900G AMEIXA',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Isis',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7898037640664'
  },
  {
    id: 5144,
    plu: '27823',
    name: 'IOG ISIS GF 900G BAN MACA',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Isis',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7898037640091'
  },
  {
    id: 5145,
    plu: '464',
    name: 'IOG ISIS GF 900G FR VM',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Isis',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7898037640343'
  },
  {
    id: 5146,
    plu: '466',
    name: 'IOG ISIS GF 900G MOR',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Isis',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7898037640350'
  },
  {
    id: 5147,
    plu: '468',
    name: 'IOG ISIS VIVA LEVE FRASCO 170G MOR',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Isis',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7898037640114'
  },
  {
    id: 5148,
    plu: '25838',
    name: 'IOG LIQ ACTIVIA ZERO 1000G AMEIXA',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Danone',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891025116608'
  },
  {
    id: 5149,
    plu: '25839',
    name: 'IOG LIQ ACTIVIA ZERO 1000G MOR',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Danone',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891025116592'
  },
  {
    id: 5150,
    plu: '25253',
    name: 'IOG LIQ BATAVO 170G MOR',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Batavo',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891097102851'
  },
  {
    id: 5151,
    plu: '25267',
    name: 'IOG LIQ BATAVO GF 1150G CEREAL',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Batavo',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891097103391'
  },
  {
    id: 5152,
    plu: '50069',
    name: 'IOG LIQ BATAVO GF 1150G GRAVIOLA',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Batavo',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891097104374'
  },
  {
    id: 5153,
    plu: '25266',
    name: 'IOG LIQ BATAVO GF 1150G MOR',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Batavo',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891097103384'
  },
  {
    id: 5154,
    plu: '45495',
    name: 'IOG LIQ CHAMBINHO GF 165G MOR',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Nestlé',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7898755200041'
  },
  {
    id: 5155,
    plu: '34134',
    name: 'IOG LIQ CHAMBINHO POUCH 100G',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Nestlé',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891000360668'
  },
  {
    id: 5156,
    plu: '5863',
    name: 'IOG LIQ CHAMYTO GO 100G MOR',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Nestlé',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891000252819'
  },
  {
    id: 5157,
    plu: '5864',
    name: 'IOG LIQ CHAMYTO GO 100G VIT FRUTAS',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Nestlé',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891000252833'
  },
  {
    id: 5158,
    plu: '25836',
    name: 'IOG LIQ CORPUS Z LACT 170G',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Danone',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891025114406'
  },
  {
    id: 5159,
    plu: '15965',
    name: 'IOG LIQ DANONE 170G MOR',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Danone',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891025101376'
  },
  {
    id: 5160,
    plu: '46079',
    name: 'IOG LIQ DANONE GF 1,25L COCO',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Danone',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891025121909'
  },
  {
    id: 5161,
    plu: '46081',
    name: 'IOG LIQ DANONE GF 1,25L MORANGO',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Danone',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891025121923'
  },
  {
    id: 5162,
    plu: '46080',
    name: 'IOG LIQ DANONE GF 1,25L VITAMINA FRUTAS',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Danone',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891025121916'
  },
  {
    id: 5163,
    plu: '47528',
    name: 'IOG LIQ DANONE MAIS PROT GF 220G COCO',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Danone',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891025124559'
  },
  {
    id: 5164,
    plu: '47529',
    name: 'IOG LIQ DANONE MAIS PROT GF 220G MORANGO',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Danone',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891025124566'
  },
  {
    id: 5165,
    plu: '69653',
    name: 'IOG LIQ DANONE ZERO 1200G BATIDO',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Danone',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891025125365'
  },
  {
    id: 5166,
    plu: '69651',
    name: 'IOG LIQ DANONE ZERO 1200G MORANGO',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Danone',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891025125372'
  },
  {
    id: 5167,
    plu: '49775',
    name: 'IOG LIQ DESN BETANIA GF 900G TRAD',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Betânia',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7898064011857'
  },
  {
    id: 5168,
    plu: '33534',
    name: 'IOG LIQ ITAMBE FIT GF 1,15L MAMAO',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Itambé',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7896051166559'
  },
  {
    id: 5169,
    plu: '34632',
    name: 'IOG LIQ ITAMBE GF 1150G FRUTAS VM',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Itambé',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7896051166269'
  },
  {
    id: 5170,
    plu: '21465',
    name: 'IOG LIQ MOLICO 170G MOR',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Nestlé',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891000305812'
  },
  {
    id: 5171,
    plu: '21467',
    name: 'IOG LIQ MOLICO GF 850ML MOR',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Nestlé',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891000305775'
  },
  {
    id: 5172,
    plu: '30324',
    name: 'IOG LIQ MOLICO TRIP BAUNILHA 170G',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Nestlé',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891000332269'
  },
  {
    id: 5173,
    plu: '30323',
    name: 'IOG LIQ MOLICO TRIP ZERO BAUN 850G',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Nestlé',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891000332221'
  },
  {
    id: 5174,
    plu: '5876',
    name: 'IOG LIQ NESTLE GFA900G MOR',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Nestlé',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891000244425'
  },
  {
    id: 5175,
    plu: '5875',
    name: 'IOG LIQ NESTLE GFA900G VIT FRUTAS',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Nestlé',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891000241417'
  },
  {
    id: 5176,
    plu: '5872',
    name: 'IOG LIQ NESTON 170G MC BAN',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Nestlé',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891000260609'
  },
  {
    id: 5177,
    plu: '5870',
    name: 'IOG LIQ NINHO 170G MC BAN',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Nestlé',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891000103852'
  },
  {
    id: 5178,
    plu: '5871',
    name: 'IOG LIQ NINHO 170G MOR',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Nestlé',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891000103876'
  },
  {
    id: 5179,
    plu: '5877',
    name: 'IOG LIQ NINHO GF 850G MACA E BANANA',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Nestlé',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891000261002'
  },
  {
    id: 5180,
    plu: '5862',
    name: 'IOG LIQ NINHO POUCH 100G MACA E BANANA',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Nestlé',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891000261484'
  },
  {
    id: 5181,
    plu: '53277',
    name: 'IOG LIQ VIGOR 1150G MORANGO',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Vigor',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7896625212460'
  },
  {
    id: 5182,
    plu: '53279',
    name: 'IOG LIQ VIGOR 1150G VITAMINA',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Vigor',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7896625212477'
  },
  {
    id: 5183,
    plu: '50653',
    name: 'IOG LIQ VIGOR 170G BATIDO',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Vigor',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7896625210442'
  },
  {
    id: 5184,
    plu: '50655',
    name: 'IOG LIQ VIGOR 170G MORANGO',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Vigor',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7896625210466'
  },
  {
    id: 5185,
    plu: '53282',
    name: 'IOG LIQ VIGOR 170G PISTACHE',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Vigor',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7896625212514'
  },
  {
    id: 5186,
    plu: '53283',
    name: 'IOG LIQ VIGOR 170G TANGERINA',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Vigor',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7896625212507'
  },
  {
    id: 5187,
    plu: '50657',
    name: 'IOG LIQ VIGOR 170G VITAMINA',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Vigor',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7896625210473'
  },
  {
    id: 5188,
    plu: '102912',
    name: 'IOG LIQ VIGOR ZERO 170G JABUTICABA',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Vigor',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7896625214136'
  },
  {
    id: 5189,
    plu: '69661',
    name: 'IOG LIQ YOPRO 23G PROT MORANGO 250G',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Danone',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891025125181'
  },
  {
    id: 5190,
    plu: '25824',
    name: 'IOG LIQ YOPRO 250G MORANGO',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Danone',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891025115595'
  },
  {
    id: 5191,
    plu: '50700',
    name: 'IOG MIX VIGOR 140G MOG CEREAIS',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Vigor',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7896625210886'
  },
  {
    id: 5192,
    plu: '50697',
    name: 'IOG MIX VIGOR 140G MOR CEREAIS CHO',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Vigor',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7896625210855'
  },
  {
    id: 5193,
    plu: '50699',
    name: 'IOG MIX VIGOR 140G MOR CONF COLOR',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Vigor',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7896625210862'
  },
  {
    id: 5194,
    plu: '63669',
    name: 'IOG MOLICO DESN ZERO LACTOSE 170G AMEIXA',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Nestlé',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7898755200218'
  },
  {
    id: 5195,
    plu: '30320',
    name: 'IOG MOLICO POLPA 360G MOR',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Nestlé',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891000334188'
  },
  {
    id: 5196,
    plu: '272',
    name: 'IOG NAT BETANIA 170G INT',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Betânia',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7898403780680'
  },
  {
    id: 5197,
    plu: '274',
    name: 'IOG NAT BETANIA 170G LAR CEN MEL',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Betânia',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7898403780727'
  },
  {
    id: 5198,
    plu: '454',
    name: 'IOG NAT BETANIA Z LACT COPO 170G DESN',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Betânia',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7898403782059'
  },
  {
    id: 5199,
    plu: '25844',
    name: 'IOG NAT DANONE 160G DESN',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Danone',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891025120223'
  },
  {
    id: 5200,
    plu: '25842',
    name: 'IOG NAT DANONE 160G INTEGRAL',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Danone',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891025120230'
  },
  {
    id: 5201,
    plu: '46178',
    name: 'IOG NAT DESN BETANIA MOR 170G',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Betânia',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7898950516053'
  },
  {
    id: 5202,
    plu: '35433',
    name: 'IOG NAT NESTLE BDJ 340G INTEGRAL',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Nestlé',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891000378175'
  },
  {
    id: 5203,
    plu: '35432',
    name: 'IOG NAT NESTLE BDJ 340G MEL',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Nestlé',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891000378212'
  },
  {
    id: 5204,
    plu: '5917',
    name: 'IOG NAT NESTLE COPO 170G CEN LAR',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Nestlé',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891000072998'
  },
  {
    id: 5205,
    plu: '5916',
    name: 'IOG NAT NESTLE COPO 170G INT',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Nestlé',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891000072950'
  },
  {
    id: 5206,
    plu: '5914',
    name: 'IOG NAT NESTLE COPO 170G MEL',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Nestlé',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891000072974'
  },
  {
    id: 5207,
    plu: '50681',
    name: 'IOG NAT VIGOR VIV 150G DESNATADO',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Vigor',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7896625210749'
  },
  {
    id: 5208,
    plu: '50690',
    name: 'IOG NAT VIGOR VIV 150G INT AMEIXA',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Vigor',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7896625210756'
  },
  {
    id: 5209,
    plu: '50687',
    name: 'IOG NAT VIGOR VIV 150G INT COM MEL',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Vigor',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7896625210732'
  },
  {
    id: 5210,
    plu: '50683',
    name: 'IOG NAT VIGOR VIV 150G LAR CEN MEL',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Vigor',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7896625210725'
  },
  {
    id: 5211,
    plu: '5874',
    name: 'IOG NESTLE 170G MOR',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Nestlé',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891000244265'
  },
  {
    id: 5212,
    plu: '5873',
    name: 'IOG NESTLE 170G VIT FR',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Nestlé',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891000241448'
  },
  {
    id: 5213,
    plu: '38978',
    name: 'IOG NESTLE BICAMADA 150G FRUT VERMELHAS',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Nestlé',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891000390078'
  },
  {
    id: 5214,
    plu: '5913',
    name: 'IOG NESTLE BICAMADA 150G MOR',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Nestlé',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891000340004'
  },
  {
    id: 5215,
    plu: '43152',
    name: 'IOG NESTLE Z LACT NAT BDJ 320G',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Nestlé',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891000393536'
  },
  {
    id: 5216,
    plu: '5939',
    name: 'IOG NINHO FRUTI 250G MOR',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Nestlé',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891000094396'
  },
  {
    id: 5217,
    plu: '101854',
    name: 'IOG PARC DESN NESTLE GF 1,15KG COCO',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Nestlé',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7898755200324'
  },
  {
    id: 5218,
    plu: '101852',
    name: 'IOG PARC DESN NESTLE GF 1,15KG MORANGO',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Nestlé',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7898755200461'
  },
  {
    id: 5219,
    plu: '101853',
    name: 'IOG PARC DESN NESTLE GF 1,15KG VITAMINA FRUTAS',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Nestlé',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7898755200430'
  },
  {
    id: 5220,
    plu: '50086',
    name: 'IOG POLPA BATAVO PENSE ZERO 510G MORANGO',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Batavo',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891097107153'
  },
  {
    id: 5221,
    plu: '7896',
    name: 'IOG POLPA ITAMBE CEREAIS BD 510G',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Itambé',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7896051164135'
  },
  {
    id: 5222,
    plu: '34630',
    name: 'IOG POLPA ITAMBE FIT BD 510G MOR MACA AME',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Itambé',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7896051164142'
  },
  {
    id: 5223,
    plu: '7891',
    name: 'IOG POLPA ITAMBE KIDS BD 510G',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Itambé',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7896051164159'
  },
  {
    id: 5224,
    plu: '102909',
    name: 'IOG POLPA MORANGO VIGOR 480G',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Vigor',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7896625213047'
  },
  {
    id: 5225,
    plu: '32752',
    name: 'IOG POLPA NESTLE TRAD BDJ 510G MORANGO',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Nestlé',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891000362037'
  },
  {
    id: 5226,
    plu: '32753',
    name: 'IOG POLPA NESTON 2 SABORES BDJ510G',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Nestlé',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891000360323'
  },
  {
    id: 5227,
    plu: '5869',
    name: 'IOG POLPA NINHO 540G',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Nestlé',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891000261026'
  },
  {
    id: 5228,
    plu: '102908',
    name: 'IOG POLPA VIGOR MOR VITAMINA 480G',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Vigor',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7896625213030'
  },
  {
    id: 5229,
    plu: '46096',
    name: 'IOG PROT YOBEM GARRAFA 250ML',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Outros Laticínios',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7898064011796'
  },
  {
    id: 5230,
    plu: '46101',
    name: 'IOG PROT YOBEM POUCH 160G',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Outros Laticínios',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7898064011802'
  },
  {
    id: 5231,
    plu: '49780',
    name: 'IOG PROT YOBEM PT 170G COCO BAUN',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Outros Laticínios',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7898064011918'
  },
  {
    id: 5232,
    plu: '49779',
    name: 'IOG PROT YOBEM PT 170G MOR BAN',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Outros Laticínios',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7898064011895'
  },
  {
    id: 5233,
    plu: '49781',
    name: 'IOG PROT YOBEM PT 170G NATURAL',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Outros Laticínios',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7898064011901'
  },
  {
    id: 5234,
    plu: '63487',
    name: 'IOG SEM PARMALAT FIT ZERO COPO 120G COCO',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Parmalat',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891097107221'
  },
  {
    id: 5235,
    plu: '63795',
    name: 'IOG SEM PARMALAT FIT ZERO COPO 120G MORANGO',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Parmalat',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891097107214'
  },
  {
    id: 5236,
    plu: '63796',
    name: 'IOG SEM PARMALAT FIT ZERO COPO 120G TRADICIONAL',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Parmalat',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891097107191'
  },
  {
    id: 5237,
    plu: '25784',
    name: 'IOG VERDE CAMPO LACFREE FRASCO 170G MOR',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Verde Campo',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7898205924480'
  },
  {
    id: 5238,
    plu: '25786',
    name: 'IOG VERDE CAMPO LACFREE GARRAFA 500G BAN MAC MAMAO C',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Verde Campo',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7898205923940'
  },
  {
    id: 5239,
    plu: '25788',
    name: 'IOG VERDE CAMPO LACFREE GARRAFA 500G MOR',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Verde Campo',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7898205923650'
  },
  {
    id: 5240,
    plu: '36362',
    name: 'IOG VERDE CAMPO WHEY 10 FRASCO 170G PESSEGO',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Verde Campo',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7898205925470'
  },
  {
    id: 5241,
    plu: '25778',
    name: 'IOG VERDE CAMPO WHEY 30 GF 500G MOR',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Verde Campo',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7898205924725'
  },
  {
    id: 5242,
    plu: '32098',
    name: 'IOG YOBEM TRIPLO ZERO 170G AMEIXA',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Outros Laticínios',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7898403781489'
  },
  {
    id: 5243,
    plu: '32097',
    name: 'IOG YOBEM TRIPLO ZERO 170G MORANGO',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Outros Laticínios',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7898403781458'
  },
  {
    id: 5244,
    plu: '36348',
    name: 'IOG YOBEM TRIPLO ZERO 170G PAPAIA LINHACA',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Outros Laticínios',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7898403782073'
  },
  {
    id: 5245,
    plu: '32094',
    name: 'IOG YOBEM TRIPLO ZERO 800G AMEIXA',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Outros Laticínios',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7898403781496'
  },
  {
    id: 5246,
    plu: '32095',
    name: 'IOG YOBEM TRIPLO ZERO 800G MORANGO',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Outros Laticínios',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7898403781465'
  },
  {
    id: 5247,
    plu: '63712',
    name: 'IOGURTE DESNAT ZERO LACTOSE 170G BATIDO',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Outros Laticínios',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7898755200379'
  },
  {
    id: 5248,
    plu: '63709',
    name: 'IOGURTE DESNAT ZERO LACTOSE 170G MORANGO',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Outros Laticínios',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7898755200348'
  },
  {
    id: 5249,
    plu: '47327',
    name: 'LEITE FER DES ELEGE TM FA GAR 1150G',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Elegê',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891097106156'
  },
  {
    id: 5250,
    plu: '13787',
    name: 'LEITE FERM BATAVO BOB 3X160G MOR',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Batavo',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891097101588'
  },
  {
    id: 5251,
    plu: '13786',
    name: 'LEITE FERM BATAVO BOB 3X160G TRAD',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Batavo',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891097101540'
  },
  {
    id: 5252,
    plu: '13789',
    name: 'LEITE FERM BATAVO BOB 80G MOR',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Batavo',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891097087431'
  },
  {
    id: 5253,
    plu: '13821',
    name: 'LEITE FERM BATAVO BOB 80G TRAD',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Batavo',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891097087448'
  },
  {
    id: 5254,
    plu: '13790',
    name: 'LEITE FERM BATAVO BOB 80G UVA',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Batavo',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891097087455'
  },
  {
    id: 5255,
    plu: '288',
    name: 'LEITE FERM BETANIA 170G ADOC',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Betânia',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7898403782691'
  },
  {
    id: 5256,
    plu: '289',
    name: 'LEITE FERM BETANIA 850G ADOC',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Betânia',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7898403782707'
  },
  {
    id: 5257,
    plu: '53278',
    name: 'LEITE FERM BETANIA KIDS 80G MORANGO',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Betânia',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7898064011970'
  },
  {
    id: 5258,
    plu: '290',
    name: 'LEITE FERM BETANIA KIDS 80G TRAD',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Betânia',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7898403782714'
  },
  {
    id: 5259,
    plu: '5941',
    name: 'LEITE FERM CHAMYTO 6X 120G',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Nestlé',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891000027974'
  },
  {
    id: 5260,
    plu: '5945',
    name: 'LEITE FERM CHAMYTO 80G MOR',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Nestlé',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891000276303'
  },
  {
    id: 5261,
    plu: '37691',
    name: 'LEITE FERM CHAMYTO 80G TRAD',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Nestlé',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891000379547'
  },
  {
    id: 5262,
    plu: '5946',
    name: 'LEITE FERM CHAMYTO 80G UVA',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Nestlé',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891000276280'
  },
  {
    id: 5263,
    plu: '5942',
    name: 'LEITE FERM CHAMYTO CJ 450G',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Nestlé',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891000070444'
  },
  {
    id: 5264,
    plu: '30596',
    name: 'LEITE FERM ITAMBE KIDS TP 480G MOR',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Itambé',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7896051165972'
  },
  {
    id: 5265,
    plu: '7902',
    name: 'LEITE FERM ITAMBE KIDS TP 480G TRAD',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Itambé',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7896051126089'
  },
  {
    id: 5266,
    plu: '50824',
    name: 'LEITE FERM LETA GF 850G',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Leta',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7898144260991'
  },
  {
    id: 5267,
    plu: '36315',
    name: 'LEITE FERM LIQ ACTIVIA GF 1000G MORANGO',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Danone',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891025112914'
  },
  {
    id: 5268,
    plu: '9081',
    name: 'LEITE FERM VIGOR 6X75G TRAD',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Vigor',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891999904805'
  },
  {
    id: 5269,
    plu: '39390',
    name: 'LEITE FERM YAKULT 40 80G',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Yakult',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '78914285'
  },
  {
    id: 5270,
    plu: '35443',
    name: 'LEITE FERM YAKULT 40 LIGHT 80G',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Yakult',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '78936676'
  },
  {
    id: 5271,
    plu: '15769',
    name: 'LEITE FERM YAKULT 80G',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Yakult',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '78911000'
  },
  {
    id: 5272,
    plu: '63665',
    name: 'PETIT CHAMBINHO BANANA MACA 320G',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Nestlé',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7898755200232'
  },
  {
    id: 5273,
    plu: '5935',
    name: 'PETIT CHAMBINHO CHOCOLATE BDJ 320G',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Nestlé',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891000110430'
  },
  {
    id: 5274,
    plu: '5938',
    name: 'PETIT CHAMBINHO MAXI BDJ 480G MOR',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Nestlé',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891000103913'
  },
  {
    id: 5275,
    plu: '5936',
    name: 'PETIT CHAMBINHO MORANGO BDJ 320G',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Nestlé',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891000103937'
  },
  {
    id: 5276,
    plu: '13791',
    name: 'PETIT SUISSE BATAVO BOB 320G MOR',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Batavo',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891097089527'
  },
  {
    id: 5277,
    plu: '28029',
    name: 'PETIT SUISSE BETANIA KIDS MOR 320G',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Betânia',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7898403781052'
  },
  {
    id: 5278,
    plu: '16125',
    name: 'PETIT SUISSE DANONINHO 480G MOR BAN',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Danone',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891025109938'
  },
  {
    id: 5279,
    plu: '16123',
    name: 'PETIT SUISSE DANONINHO 480G MOR',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Danone',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891025109907'
  },
  {
    id: 5280,
    plu: '33252',
    name: 'PETIT SUISSE DANONINHO MOR 320G',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Danone',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891025109891'
  },
  {
    id: 5281,
    plu: '36310',
    name: 'PETIT SUISSE Z LACT ISINHO MOR 320G',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Isis',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7898034922947'
  },
  {
    id: 5282,
    plu: '50804',
    name: 'QJO PETIT SUISSE LETA MORANGO 240G',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Leta',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7898144260922'
  },
  {
    id: 5283,
    plu: '5923',
    name: 'SOBREM LACT CHANDELLE 180G CHOCO',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Nestlé',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '78936195'
  },
  {
    id: 5284,
    plu: '5925',
    name: 'SOBREM LACT CHANDELLE 360G CHOCO BR',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Nestlé',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891000110096'
  },
  {
    id: 5285,
    plu: '5924',
    name: 'SOBREM LACT CHANDELLE 360G CHOCO',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Nestlé',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891000096468'
  },
  {
    id: 5286,
    plu: '43071',
    name: 'SOBREM LACT CHANDELLE 540G CHOCO',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Nestlé',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891000370933'
  },
  {
    id: 5287,
    plu: '5926',
    name: 'SOBREM LACT CHANDELLE 720G GTS 90G CHOCO',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Nestlé',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891000120750'
  },
  {
    id: 5288,
    plu: '50192',
    name: 'SOBREM LACT CHANDELLE CHANTILLY 90G CHOC',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Nestlé',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7898755200065'
  },
  {
    id: 5289,
    plu: '43076',
    name: 'SOBREM LACT CHANDELLE DARK BR 180G',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Nestlé',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891000396452'
  },
  {
    id: 5290,
    plu: '50190',
    name: 'SOBREM LACT CHANDELLE PT 100G PUDIM LEIT COND',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Nestlé',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7898755200027'
  },
  {
    id: 5291,
    plu: '9116',
    name: 'SOBREMESA CR VIGOR 180G CHOC',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Vigor',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891999014153'
  },
  {
    id: 5292,
    plu: '16092',
    name: 'SOBREMESA DANETTE 720G CHOCO',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Nestlé',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891025105244'
  },
  {
    id: 5293,
    plu: '33259',
    name: 'SOBREMESA DANETTE BD 540G CHOC AO LEITE',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Nestlé',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891025121619'
  },
  {
    id: 5294,
    plu: '33258',
    name: 'SOBREMESA DANETTE BD 540G CHOC BR',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Nestlé',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891025121602'
  },
  {
    id: 5295,
    plu: '33246',
    name: 'SOBREMESA DANETTE CHOC 1PACK 180G',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Nestlé',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891025110897'
  },
  {
    id: 5296,
    plu: '47539',
    name: 'SOBREMESA DANETTE CHOC BR 1PACK180G',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Nestlé',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891025124870'
  },
  {
    id: 5297,
    plu: '47541',
    name: 'SOBREMESA DANETTE CREMOSAO POTE 90G CHOC C AVELA',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Nestlé',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891025124924'
  },
  {
    id: 5298,
    plu: '47540',
    name: 'SOBREMESA DANETTE CREMOSAO POTE 90G DOCE DE LEITE C',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Nestlé',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891025124917'
  },
  {
    id: 5299,
    plu: '50079',
    name: 'SOBREMESA LACT BATAVO CHANT 90G CHOC',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Batavo',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891097106347'
  },
  {
    id: 5300,
    plu: '50642',
    name: 'SOBREMESA LACT VIGOR INF 320G CHOC',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Vigor',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7896625211050'
  },
  {
    id: 5301,
    plu: '63662',
    name: 'SOBREMESA LACTEA CHANDELLE 90G BRIGADEIRAO',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Nestlé',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7898755200188'
  },
  {
    id: 5302,
    plu: '15774',
    name: 'SUPLEM ALIM HILINE F YAKULT 100ML',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Yakult',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891156076208'
  },
  {
    id: 5303,
    plu: '15772',
    name: 'SUPLEM ALIM LIQ TAFFMAN YAKULT110ML',
    category: 'iogurtes',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: 'Yakult',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '7891156076178'
  },
];
      return this.produtosSemNota;
    }
  },

  async addProdutoSemNota(plu, quantity, arrivalDate, signature = null, responsibleName = null) {
    const creatorEmail = window.BrigadaAuth.currentUser?.email || 'sistema';
    // Tenta encontrar o nome do produto no catálogo local
    const catItem = this.catalog.find(c => c.plu === plu);
    const name = catItem ? catItem.name : `PRODUTO PLU ${plu}`;

    const payload = {
      plu,
      name,
      quantity: parseFloat(quantity),
      arrivalDate,
      createdBy: creatorEmail,
      signature,
      responsibleName
    };

    try {
      const res = await fetch('/api/produtos-sem-nota', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Erro ao salvar produto sem nota no servidor');
      }
      const created = await res.json();
      this.produtosSemNota.unshift(created);
      localStorage.setItem('brigada_produtos_sem_nota', JSON.stringify(this.produtosSemNota));
      return created;
    } catch (err) {
      console.error('Erro na API ao registrar produto sem nota (usando fallback local):', err);
      const local = {
        id: Date.now(),
        ...payload,
        createdAt: new Date().toISOString()
      };
      this.produtosSemNota.unshift(local);
      localStorage.setItem('brigada_produtos_sem_nota', JSON.stringify(this.produtosSemNota));
      return local;
    }
  },

  async deleteProdutoSemNota(id) {
    try {
      // Se for id gerado localmente pelo fallback (timestamp grande), remove direto do local
      if (id > 1000000000000) {
        this.produtosSemNota = this.produtosSemNota.filter(p => p.id !== id);
        localStorage.setItem('brigada_produtos_sem_nota', JSON.stringify(this.produtosSemNota));
        return { success: true };
      }

      const res = await fetch(`/api/produtos-sem-nota/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Erro ao excluir produto sem nota do servidor');
      }
      this.produtosSemNota = this.produtosSemNota.filter(p => p.id !== id);
      localStorage.setItem('brigada_produtos_sem_nota', JSON.stringify(this.produtosSemNota));
      return { success: true };
    } catch (err) {
      console.error('Erro na API ao excluir produto sem nota (usando fallback local):', err);
      this.produtosSemNota = this.produtosSemNota.filter(p => p.id !== id);
      localStorage.setItem('brigada_produtos_sem_nota', JSON.stringify(this.produtosSemNota));
      return { success: true };
    }
  }
};
