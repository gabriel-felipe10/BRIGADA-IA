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
      const [resProd, resUsers] = await Promise.all([
        fetch('/api/products').then(r => {
          if (!r.ok) throw new Error('Falha ao obter produtos');
          return r.json();
        }),
        fetch('/api/users').then(r => {
          if (!r.ok) throw new Error('Falha ao obter usuários');
          return r.json();
        })
      ]);
      
      this.products = resProd.map(p => this.parseProductCreator(p));
      this.users = resUsers;
      console.log('Dados carregados com sucesso do Supabase via API');
      return true;
    } catch (err) {
      console.warn("Erro ao carregar do Supabase (usando fallback local em memória):", err);
      // Se falhar (por exemplo, sem tabelas criadas no banco), usa os dados locais mockados
      this.products = PRODUCTS_DB.map(p => this.parseProductCreator(p));
      this.users = [...USERS_DB];
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
  async deleteProduct(id) {
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
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
  getProductStatus(product) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = new Date(product.endDate + 'T00:00:00');
    const diffDays = Math.ceil((end - today) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      if (product.expiredAction === 'quebra') return { label: 'Vencido (Quebra)', class: 'badge--expired', icon: '🗑️', days: diffDays };
      if (product.expiredAction === 'troca') return { label: 'Vencido (Troca)', class: 'badge--expired', icon: '🔄', days: diffDays };
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
  getStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let allowedProducts = this.products;
    if (window.BrigadaAuth && window.BrigadaAuth.currentUser) {
      const email = window.BrigadaAuth.currentUser.email.toLowerCase();
      const isRestricted = !(email === 'admin@brigada.com' || email === 'marcos@brigada.com' || window.BrigadaAuth.isSuperAdmin());
      if (isRestricted) {
        const sector = window.BrigadaAuth.currentUser.sector;
        if (sector === 'açougue') {
          allowedProducts = this.products.filter(p => ['aves', 'suino', 'bovino', 'pescado'].includes(p.category));
        } else if (sector === 'pereciveis') {
          allowedProducts = this.products.filter(p => ['laticinios', 'frios'].includes(p.category));
        } else if (sector === 'padaria') {
          allowedProducts = this.products.filter(p => ['padaria'].includes(p.category));
        } else if (sector === 'hortifruti') {
          allowedProducts = this.products.filter(p => ['hortifruti'].includes(p.category));
        } else if (sector === 'mercearia') {
          allowedProducts = this.products.filter(p => ['mercearia'].includes(p.category));
        }
      }
    }

    let expired = 0, expiresToday = 0, expiresSoon = 0, ok = 0, awaitingReduction = 0, quebra = 0, troca = 0;
    allowedProducts.forEach(p => {
      if (p.isAwaitingReduction) awaitingReduction++;
      if (p.expiredAction === 'quebra') quebra++;
      if (p.expiredAction === 'troca') troca++;
      const s = this.getProductStatus(p);
      if (s.days < 0) expired++;
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
        enabled: false,
        apiUrl: "https://api.whatsapp.com",
        instanceId: "instance-123",
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
  }
};
