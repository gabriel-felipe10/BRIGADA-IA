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
    createdAt: '2026-06-24',
    lastLogin: new Date().toISOString(),
  },
  {
    id: 2,
    name: 'Marcos',
    email: 'marcos@brigada.com',
    password: '123456',
    role: 'user',
    avatar: 'MA',
    status: 'active',
    createdAt: '2026-06-24',
    lastLogin: null,
  },
  {
    id: 3,
    name: 'Jefferson',
    email: 'jefferson@brigada.com',
    password: '123456',
    role: 'user',
    avatar: 'JE',
    status: 'active',
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
    plu: 'AV001',
    name: 'Frango Inteiro Resfriado',
    category: 'aves',
    startDate: daysAgo(3),
    endDate: daysFromNow(1),
    unit: 'kg',
    supplier: 'Sadia / BRF',
    location: 'Câmara Fria A1',
  },
  {
    id: 2,
    plu: 'AV002',
    name: 'Coxa e Sobrecoxa de Frango',
    category: 'aves',
    startDate: daysAgo(2),
    endDate: daysFromNow(4),
    unit: 'kg',
    supplier: 'Perdigão',
    location: 'Câmara Fria A1',
  },
  {
    id: 3,
    plu: 'AV003',
    name: 'Peito de Frango sem Osso',
    category: 'aves',
    startDate: daysAgo(1),
    endDate: daysFromNow(2),
    unit: 'kg',
    supplier: 'Aurora',
    location: 'Vitrine Açougue',
  },
  {
    id: 4,
    plu: 'AV004',
    name: 'Filé de Peito de Frango',
    category: 'aves',
    startDate: daysAgo(1),
    endDate: daysFromNow(3),
    unit: 'kg',
    supplier: 'Sadia / BRF',
    location: 'Vitrine Açougue',
  },
  {
    id: 5,
    plu: 'AV005',
    name: 'Asa de Frango',
    category: 'aves',
    startDate: daysAgo(4),
    endDate: daysFromNow(0),
    unit: 'kg',
    supplier: 'Perdigão',
    location: 'Câmara Fria A2',
  },
  {
    id: 6,
    plu: 'AV006',
    name: 'Coxinha da Asa (Frango)',
    category: 'aves',
    startDate: daysAgo(2),
    endDate: daysFromNow(5),
    unit: 'kg',
    supplier: 'Aurora',
    location: 'Câmara Fria A2',
  },
  {
    id: 7,
    plu: 'AV007',
    name: 'Moela de Frango',
    category: 'aves',
    startDate: daysAgo(5),
    endDate: daysFromNow(-1),
    unit: 'kg',
    supplier: 'Sadia / BRF',
    location: 'Câmara Fria A1',
  },
  {
    id: 8,
    plu: 'AV008',
    name: 'Coração de Frango',
    category: 'aves',
    startDate: daysAgo(3),
    endDate: daysFromNow(6),
    unit: 'kg',
    supplier: 'Perdigão',
    location: 'Câmara Fria A2',
  },
  {
    id: 9,
    plu: 'AV009',
    name: 'Frango à Passarinho',
    category: 'aves',
    startDate: daysAgo(1),
    endDate: daysFromNow(2),
    unit: 'kg',
    supplier: 'Seara',
    location: 'Vitrine Açougue',
  },
  {
    id: 10,
    plu: 'AV010',
    name: 'Linguiça de Frango Toscana',
    category: 'aves',
    startDate: daysAgo(6),
    endDate: daysFromNow(8),
    unit: 'kg',
    supplier: 'Seara',
    location: 'Câmara Fria A3',
  },
  {
    id: 11,
    plu: 'AV011',
    name: 'Nuggets de Frango',
    category: 'aves',
    startDate: daysAgo(10),
    endDate: daysFromNow(20),
    unit: 'kg',
    supplier: 'Sadia / BRF',
    location: 'Freezer B1',
  },
  {
    id: 12,
    plu: 'AV012',
    name: 'Almôndega de Frango',
    category: 'aves',
    startDate: daysAgo(8),
    endDate: daysFromNow(15),
    unit: 'kg',
    supplier: 'Aurora',
    location: 'Freezer B1',
  },
  {
    id: 13,
    plu: 'AV013',
    name: 'Peru Inteiro Resfriado',
    category: 'aves',
    startDate: daysAgo(2),
    endDate: daysFromNow(5),
    unit: 'kg',
    supplier: 'Perdigão',
    location: 'Câmara Fria A1',
  },
  {
    id: 14,
    plu: 'AV014',
    name: 'Peito de Peru Defumado',
    category: 'aves',
    startDate: daysAgo(15),
    endDate: daysFromNow(45),
    unit: 'kg',
    supplier: 'Sadia / BRF',
    location: 'Balcão Fatiados',
  },
  {
    id: 15,
    plu: 'AV015',
    name: 'Salsicha de Frango',
    category: 'aves',
    startDate: daysAgo(5),
    endDate: daysFromNow(25),
    unit: 'pct',
    supplier: 'Seara',
    location: 'Câmara Fria A3',
  },

  // ── SUÍNO ─────────────────────────────────────────────────────────────────
  {
    id: 16,
    plu: 'SU001',
    name: 'Costela Suína',
    category: 'suino',
    startDate: daysAgo(3),
    endDate: daysFromNow(2),
    unit: 'kg',
    supplier: 'Aurora',
    location: 'Vitrine Açougue',
  },
  {
    id: 17,
    plu: 'SU002',
    name: 'Lombo Suíno',
    category: 'suino',
    startDate: daysAgo(2),
    endDate: daysFromNow(3),
    unit: 'kg',
    supplier: 'Seara',
    location: 'Vitrine Açougue',
  },
  {
    id: 18,
    plu: 'SU003',
    name: 'Bisteca Suína',
    category: 'suino',
    startDate: daysAgo(4),
    endDate: daysFromNow(1),
    unit: 'kg',
    supplier: 'Aurora',
    location: 'Vitrine Açougue',
  },
  {
    id: 19,
    plu: 'SU004',
    name: 'Pernil Suíno',
    category: 'suino',
    startDate: daysAgo(5),
    endDate: daysFromNow(-2),
    unit: 'kg',
    supplier: 'Sadia / BRF',
    location: 'Câmara Fria B1',
  },
  {
    id: 20,
    plu: 'SU005',
    name: 'Paleta Suína',
    category: 'suino',
    startDate: daysAgo(1),
    endDate: daysFromNow(4),
    unit: 'kg',
    supplier: 'Perdigão',
    location: 'Vitrine Açougue',
  },
  {
    id: 21,
    plu: 'SU006',
    name: 'Linguiça Calabresa',
    category: 'suino',
    startDate: daysAgo(7),
    endDate: daysFromNow(23),
    unit: 'kg',
    supplier: 'Seara',
    location: 'Câmara Fria B2',
  },
  {
    id: 22,
    plu: 'SU007',
    name: 'Linguiça Toscana Suína',
    category: 'suino',
    startDate: daysAgo(6),
    endDate: daysFromNow(14),
    unit: 'kg',
    supplier: 'Aurora',
    location: 'Câmara Fria B2',
  },
  {
    id: 23,
    plu: 'SU008',
    name: 'Bacon em Fatias',
    category: 'suino',
    startDate: daysAgo(20),
    endDate: daysFromNow(40),
    unit: 'pct',
    supplier: 'Sadia / BRF',
    location: 'Balcão Fatiados',
  },
  {
    id: 24,
    plu: 'SU009',
    name: 'Toucinho Defumado',
    category: 'suino',
    startDate: daysAgo(10),
    endDate: daysFromNow(30),
    unit: 'kg',
    supplier: 'Aurora',
    location: 'Câmara Fria B2',
  },
  {
    id: 25,
    plu: 'SU010',
    name: 'Joelho Suíno',
    category: 'suino',
    startDate: daysAgo(3),
    endDate: daysFromNow(0),
    unit: 'kg',
    supplier: 'Perdigão',
    location: 'Câmara Fria B1',
  },
  {
    id: 26,
    plu: 'SU011',
    name: 'Rabo Suíno',
    category: 'suino',
    startDate: daysAgo(2),
    endDate: daysFromNow(5),
    unit: 'kg',
    supplier: 'Aurora',
    location: 'Câmara Fria B1',
  },
  {
    id: 27,
    plu: 'SU012',
    name: 'Orelha Suína',
    category: 'suino',
    startDate: daysAgo(4),
    endDate: daysFromNow(3),
    unit: 'kg',
    supplier: 'Seara',
    location: 'Câmara Fria B1',
  },
  {
    id: 28,
    plu: 'SU013',
    name: 'Pé Suíno',
    category: 'suino',
    startDate: daysAgo(1),
    endDate: daysFromNow(6),
    unit: 'kg',
    supplier: 'Perdigão',
    location: 'Câmara Fria B1',
  },
  {
    id: 29,
    plu: 'SU014',
    name: 'Presunto Cozido Fatiado',
    category: 'suino',
    startDate: daysAgo(12),
    endDate: daysFromNow(18),
    unit: 'kg',
    supplier: 'Sadia / BRF',
    location: 'Balcão Fatiados',
  },
  {
    id: 30,
    plu: 'SU015',
    name: 'Copa Fatiada',
    category: 'suino',
    startDate: daysAgo(8),
    endDate: daysFromNow(22),
    unit: 'kg',
    supplier: 'Seara',
    location: 'Balcão Fatiados',
  },

  // ── PESCADO ───────────────────────────────────────────────────────────────
  {
    id: 31,
    plu: 'PE001',
    name: 'Tilápia Inteira Congelada',
    category: 'pescado',
    startDate: daysAgo(15),
    endDate: daysFromNow(75),
    unit: 'kg',
    supplier: 'Santa Mônica',
    location: 'Freezer C1',
  },
  {
    id: 32,
    plu: 'PE002',
    name: 'Filé de Tilápia',
    category: 'pescado',
    startDate: daysAgo(3),
    endDate: daysFromNow(2),
    unit: 'kg',
    supplier: 'Santa Mônica',
    location: 'Vitrine Pescado',
  },
  {
    id: 33,
    plu: 'PE003',
    name: 'Salmão em Postas',
    category: 'pescado',
    startDate: daysAgo(1),
    endDate: daysFromNow(1),
    unit: 'kg',
    supplier: 'Mar Aberto',
    location: 'Vitrine Pescado',
  },
  {
    id: 34,
    plu: 'PE004',
    name: 'Atum em Posta',
    category: 'pescado',
    startDate: daysAgo(2),
    endDate: daysFromNow(1),
    unit: 'kg',
    supplier: 'Mar Aberto',
    location: 'Vitrine Pescado',
  },
  {
    id: 35,
    plu: 'PE005',
    name: 'Sardinha Inteira Congelada',
    category: 'pescado',
    startDate: daysAgo(20),
    endDate: daysFromNow(100),
    unit: 'kg',
    supplier: 'Pescados Sul',
    location: 'Freezer C2',
  },
  {
    id: 36,
    plu: 'PE006',
    name: 'Filé de Merluza',
    category: 'pescado',
    startDate: daysAgo(10),
    endDate: daysFromNow(50),
    unit: 'kg',
    supplier: 'Pescados Sul',
    location: 'Freezer C1',
  },
  {
    id: 37,
    plu: 'PE007',
    name: 'Cação em Posta',
    category: 'pescado',
    startDate: daysAgo(4),
    endDate: daysFromNow(0),
    unit: 'kg',
    supplier: 'Mar Aberto',
    location: 'Vitrine Pescado',
  },
  {
    id: 38,
    plu: 'PE008',
    name: 'Bacalhau Dessalgado',
    category: 'pescado',
    startDate: daysAgo(5),
    endDate: daysFromNow(10),
    unit: 'kg',
    supplier: 'Importados Premium',
    location: 'Câmara Fria C1',
  },
  {
    id: 39,
    plu: 'PE009',
    name: 'Camarão Rosa Congelado',
    category: 'pescado',
    startDate: daysAgo(30),
    endDate: daysFromNow(90),
    unit: 'kg',
    supplier: 'Frutos do Mar',
    location: 'Freezer C2',
  },
  {
    id: 40,
    plu: 'PE010',
    name: 'Lula em Anéis',
    category: 'pescado',
    startDate: daysAgo(25),
    endDate: daysFromNow(65),
    unit: 'kg',
    supplier: 'Frutos do Mar',
    location: 'Freezer C2',
  },
  {
    id: 41,
    plu: 'PE011',
    name: 'Polvo Inteiro Congelado',
    category: 'pescado',
    startDate: daysAgo(45),
    endDate: daysFromNow(135),
    unit: 'kg',
    supplier: 'Importados Premium',
    location: 'Freezer C1',
  },
  {
    id: 42,
    plu: 'PE012',
    name: 'Corvina Inteira',
    category: 'pescado',
    startDate: daysAgo(2),
    endDate: daysFromNow(-1),
    unit: 'kg',
    supplier: 'Santa Mônica',
    location: 'Vitrine Pescado',
  },
  {
    id: 43,
    plu: 'PE013',
    name: 'Pintado em Posta',
    category: 'pescado',
    startDate: daysAgo(3),
    endDate: daysFromNow(7),
    unit: 'kg',
    supplier: 'Pescados Sul',
    location: 'Câmara Fria C1',
  },
  {
    id: 44,
    plu: 'PE014',
    name: 'Tambaqui em Posta',
    category: 'pescado',
    startDate: daysAgo(2),
    endDate: daysFromNow(5),
    unit: 'kg',
    supplier: 'Pescados Sul',
    location: 'Câmara Fria C1',
  },
  {
    id: 45,
    plu: 'PE015',
    name: 'Camarão Sete Barbas',
    category: 'pescado',
    startDate: daysAgo(7),
    endDate: daysFromNow(3),
    unit: 'kg',
    supplier: 'Frutos do Mar',
    location: 'Freezer C2',
  },
];

// ── Helpers de Estado ─────────────────────────────────────────────────────────
window.BrigadaData = {
  users: [...USERS_DB],
  products: [...PRODUCTS_DB],

  // Calcula status de validade de um produto
  getProductStatus(product) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = new Date(product.endDate + 'T00:00:00');
    const diffDays = Math.ceil((end - today) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { label: 'Vencido', class: 'badge--expired', icon: '🔴', days: diffDays };
    if (diffDays === 0) return { label: 'Vence Hoje', class: 'badge--today', icon: '🟠', days: 0 };
    if (diffDays <= 3) return { label: `${diffDays}d restantes`, class: 'badge--warning', icon: '🟡', days: diffDays };
    return { label: 'OK', class: 'badge--ok', icon: '🟢', days: diffDays };
  },

  // Estatísticas gerais
  getStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let expired = 0, expiresToday = 0, expiresSoon = 0, ok = 0;
    this.products.forEach(p => {
      const s = this.getProductStatus(p);
      if (s.days < 0) expired++;
      else if (s.days === 0) expiresToday++;
      else if (s.days <= 3) expiresSoon++;
      else ok++;
    });

    return {
      total: this.products.length,
      expired,
      expiresToday,
      expiresSoon,
      ok,
      totalUsers: this.users.length,
      activeUsers: this.users.filter(u => u.status === 'active').length,
    };
  },

  // Próximo ID disponível
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

  // Formata data de hora
  formatDateTime(isoStr) {
    if (!isoStr) return '—';
    const d = new Date(isoStr);
    return d.toLocaleString('pt-BR');
  },
};
