/**
 * BRIGADA-IA — Gêmeo Digital 3D
 *
 * Visualização espacial interativa (Piso de Loja + Câmaras Frias) com:
 *  - cores semafóricas de validade por freezer / palete,
 *  - trilho de alertas com "Ir para o problema" (câmera voa até o objeto),
 *  - drill-down contextual (painel lateral) e ações com um clique,
 *  - camadas: Validade · Verificar hoje · Rebaixa · Categoria.
 *
 * Os dados vêm de window.BrigadaData.products e as localizações reaproveitam
 * os formatos já usados pelos módulos existentes:
 *   Piso de Loja ........ piso_loja:FZ{n}
 *   Câmaras Frias ....... {resfriado|congelado}:C{col}-N{nivel}-{E|D}[:full|misto]
 *
 * O modelo de dados (buildModel) não depende do Three.js, que só é baixado
 * quando a página é aberta.
 */
(function () {
  'use strict';

  // ── Constantes ────────────────────────────────────────────────────────────
  const SEV = { EMPTY: -1, OK: 0, LONG: 1, WARN: 2, TODAY: 3, EXPIRED: 4 };

  const SEV_META = {
    [SEV.EMPTY]:   { color: '#475569', label: 'Vazio',             icon: '⚪' },
    [SEV.OK]:      { color: '#10b981', label: 'OK',                icon: '🟢' },
    [SEV.LONG]:    { color: '#38bdf8', label: 'Alerta 15d/30d',    icon: '❄️' },
    [SEV.WARN]:    { color: '#f59e0b', label: 'Vence em até 3 dias', icon: '🟡' },
    [SEV.TODAY]:   { color: '#f97316', label: 'Vence hoje',        icon: '🟠' },
    [SEV.EXPIRED]: { color: '#ef4444', label: 'Vencido',           icon: '🔴' },
  };

  const CATEGORY_COLORS = {
    aves: '#facc15', bovino: '#dc2626', suino: '#f472b6', misto: '#fb923c',
    pescado: '#38bdf8', resfriados: '#22d3ee', queijos_especiais: '#fde68a',
    frios: '#f87171', laticinios: '#e0f2fe', iogurtes: '#c4b5fd', pereciveis: '#86efac',
  };

  const CHAMBER_NAMES = { congelado: 'Câmara Congelada', resfriado: 'Câmara Resfriada' };

  /**
   * Layout físico — ajuste aqui para espelhar a planta real da loja.
   * Unidades em metros. Cada câmara lista as fileiras de colunas (rack).
   */
  const LAYOUT = {
    freezer: { w: 2.0, h: 0.9, d: 1.1, gapX: 0.35, rowGap: 2.6 },
    store: {
      acougue:    { origin: { x: -21, z: 0 }, perRow: 8, label: '🥩 AÇOUGUE' },
      pereciveis: { origin: { x: 3,   z: 0 }, perRow: 9, label: '🥗 PERECÍVEIS' },
    },
    chambersInStore: {
      congelado: { x: -12, z: -10, w: 18, d: 7, h: 4.2 },
      resfriado: { x: 10,  z: -10, w: 9,  d: 7, h: 4.2 },
    },
    chamberInterior: {
      // Fileiras de colunas; a 1ª fileira fica de frente para a 2ª (corredor no meio)
      congelado: { offset: { x: 400, z: 0 }, rows: [[1, 2, 3, 4, 5, 6, 7, 8], [9, 10, 11, 12, 13, 14, 15, 16]], levels: 4 },
      resfriado: { offset: { x: 600, z: 0 }, rows: [[1, 2, 3, 4]], levels: 4 },
    },
    rack: { colW: 2.7, levelH: 1.35, palletW: 1.15, palletH: 1.0, palletD: 1.1, aisle: 4.5 },
  };

  const THREE_URL = 'three';
  const ORBIT_URL = 'three/addons/controls/OrbitControls.js';
  const REFRESH_MS = 60000;

  // ── Utilitários ───────────────────────────────────────────────────────────
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const pad2 = (n) => String(n).padStart(2, '0');
  const norm = (s) => (s || '').toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
  const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

    // ── Configuração dos Agentes Operacionais da Brigada IA (Funções Reais) ────
  const AGENTS_CONFIG = {
    FELIPE: {
      name: 'FELIPE',
      role: 'Auditor Geral & Central de Validades',
      icon: '⭐',
      badge: 'Coordenação Geral',
      sector: 'global',
      sectorLabel: 'Visão Consolidada da Loja e Câmaras',
      themeColor: '#f97316',
      description: 'Audita todas as validades da loja, consolida produtos vencidos e dispara o Relatório Geral no WhatsApp.',
      speech: (sum) => sum.expired > 0
        ? `Detectei ${sum.expired} lote(s) VENCIDO(S) no sistema! Clique no botão verde abaixo para disparar o relatório completo no WhatsApp da gerência e equipe agora.`
        : (sum.today > 0 ? `Atenção: ${sum.today} lote(s) vencem HOJE! Dispare o relatório no WhatsApp para que a equipe aplique rebaixa imediata.` : `Auditoria global concluída: zero produtos vencidos no momento. Sistema 100% em conformidade.`)
    },
    LIU: {
      name: 'LIU',
      role: 'Auditor de Freezers de Carnes (Açougue)',
      icon: '🥩',
      badge: 'Açougue',
      sector: 'acougue',
      sectorLabel: 'Freezers de Carnes e Aves (FZ17 ao FZ41)',
      freezers: [17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 34, 35, 36, 37, 38, 39, 40, 41],
      categories: ['bovino', 'suino', 'aves', 'pescado', 'misto'],
      themeColor: '#ef4444',
      description: 'Varre os freezers FZ17 ao FZ41, identifica carnes vencidas e notifica a equipe do Açougue no WhatsApp.',
      speech: (sum) => sum.expired > 0
        ? `Atenção Açougue: identifiquei ${sum.expired} carne(s) VENCIDA(S) nos freezers! Envie o relatório pelo WhatsApp para recolher e lançar quebra já.`
        : (sum.today > 0 ? `Temos ${sum.today} corte(s) vencendo hoje nos freezers de carnes. Dispare o aviso no WhatsApp para rebaixa ou produção.` : `Freezers do Açougue (FZ17 ao FZ41) conferidos: todas as carnes com validade em dia.`)
    },
    ROSE: {
      name: 'ROSE',
      role: 'Auditora de Cortes Especiais & Embalagens a Vácuo',
      icon: '🔍',
      badge: 'Cortes Especiais',
      sector: 'acougue_cortes',
      sectorLabel: 'Cortes Nobres e Peças a Vácuo (FZ17 ao FZ41)',
      freezers: [17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 34, 35, 36, 37, 38, 39, 40, 41],
      categories: ['bovino', 'suino', 'aves'],
      themeColor: '#f97316',
      description: 'Audita cortes nobres e embalagens a vácuo, notifica produtos vencidos e dispara lista de descarte no WhatsApp.',
      speech: (sum) => sum.expired > 0
        ? `Corte especial com data de validade vencida detectado! Dispare a notificação no WhatsApp para remoção imediata da área de vendas.`
        : (sum.warn > 0 ? `Alerta preventivo: ${sum.warn} corte(s) nobres vencendo nos próximos 3 dias. Monitorando giro.` : `Cortes nobres e carnes a vácuo auditados com 100% de conformidade.`)
    },
    ISABEL: {
      name: 'ISABEL',
      role: 'Auditora de Perecíveis & Laticínios',
      icon: '🥗',
      badge: 'Perecíveis',
      sector: 'pereciveis',
      sectorLabel: 'Gôndolas de Perecíveis e Freezers FZ42 ao FZ48',
      freezers: [42, 43, 44, 45, 46, 47, 48],
      categories: ['pereciveis', 'iogurtes', 'laticinios', 'frios', 'queijos_especiais'],
      themeColor: '#06b6d4',
      description: 'Audita gôndolas e freezers de perecíveis, notifica lotes vencidos e envia relação para rebaixa no WhatsApp.',
      speech: (sum) => sum.expired > 0
        ? `Identifiquei ${sum.expired} produto(s) de perecíveis VENCIDO(S)! Clique abaixo para enviar o relatório no WhatsApp do setor.`
        : (sum.today > 0 ? `Temos ${sum.today} produto(s) de laticínios/frios vencendo hoje! Mande a lista no WhatsApp para aplicação da etiqueta de rebaixa.` : `Setor de Perecíveis e Laticínios conferido sem vencimentos.`)
    },
    IMPERADOR: {
      name: 'IMPERADOR',
      role: 'Auditor de Gôndolas & Frios',
      icon: '📦',
      badge: 'Gôndolas / Frios',
      sector: 'pereciveis',
      sectorLabel: 'Gôndolas de Auto-Serviço e Embutidos',
      freezers: [42, 43, 44, 45, 46, 47, 48],
      categories: ['pereciveis', 'iogurtes', 'laticinios', 'frios'],
      themeColor: '#eab308',
      description: 'Audita as gôndolas de embutidos e frios, localiza itens vencidos e gera relatório de quebra no WhatsApp.',
      speech: (sum) => sum.expired > 0
        ? `Detectei produto vencido na gôndola de frios! Envie o alerta no WhatsApp para retirar e registrar a quebra.`
        : `Gôndolas de frios e perecíveis auditadas e com giro regular.`
    },
    HUGO: {
      name: 'HUGO',
      role: 'Auditor da Câmara Congelada (-18.5 °C)',
      icon: '❄️',
      badge: 'Câmara Congelada',
      sector: 'congelado',
      sectorLabel: 'Câmara Congelada -18.5 °C (Colunas 01 a 16)',
      chamberKey: 'congelado',
      themeColor: '#0284c7',
      description: 'Rastreia paletes da câmara congelada, notifica caixas vencidas no estoque fechado e manda relatório no WhatsApp.',
      speech: (sum) => sum.expired > 0
        ? `Atenção estoque: ${sum.expired} lote(s) VENCIDO(S) dentro da Câmara Congelada! Dispare a notificação no WhatsApp da logística.`
        : (sum.long > 0 ? `Alerta de 30 dias na câmara congelada: ${sum.long} lote(s) precisam descer para o piso de loja.` : `Câmara Congelada (-18.5°C) 100% conferida. Nenhum lote vencido.`)
    },
    JUARES: {
      name: 'JUARES',
      role: 'Auditor da Câmara Resfriada (2.5 °C) & Recebimento',
      icon: '🧊',
      badge: 'Câmara Resfriada',
      sector: 'resfriado',
      sectorLabel: 'Câmara Resfriada 2.5 °C (Colunas 01 a 04) & Recebimento',
      chamberKey: 'resfriado',
      themeColor: '#10b981',
      description: 'Audita cargas recebidas e câmara resfriada, detecta produtos vencidos e avisa os fiscais no WhatsApp.',
      speech: (sum) => sum.expired > 0
        ? `Detectei ${sum.expired} lote(s) VENCIDO(S) na Câmara Resfriada! Envie o relatório pelo WhatsApp para que a equipe providencie o descarte.`
        : (sum.long > 0 ? `Alerta de 15 dias: ${sum.long} lote(s) na câmara resfriada prontos para abastecer a loja.` : `Recebimento e Câmara Resfriada (2.5°C) auditados sem pendências.`)
    },
    RAFAEL: {
      name: 'RAFAEL',
      role: 'Auditor de Paletes Aéreos (Câmara Congelada)',
      icon: '🚜',
      badge: 'Paletes Aéreos',
      sector: 'congelado',
      sectorLabel: 'Níveis Superiores da Câmara Congelada (N2, N3, N4)',
      chamberKey: 'congelado',
      themeColor: '#f59e0b',
      description: 'Localiza paletes aéreos com lotes vencidos e manda a relação com número da coluna e nível no WhatsApp.',
      speech: (sum) => (sum.expired > 0 || sum.today > 0)
        ? `Palete nos níveis aéreos com produto crítico/vencido localizado! Mande a ordem no WhatsApp com a coluna e nível exatos.`
        : `Níveis aéreos da câmara congelada auditados e com prazos regulares.`
    },
    GILMAR: {
      name: 'GILMAR',
      role: 'Auditor de Carga Pesada & Escoamento Resfriado',
      icon: '🚜',
      badge: 'Cargas Resfriadas',
      sector: 'resfriado',
      sectorLabel: 'Paletes Pesados da Câmara Resfriada',
      chamberKey: 'resfriado',
      themeColor: '#0284c7',
      description: 'Identifica lotes pesados perto da validade e dispara lista para reposição urgente no WhatsApp.',
      speech: (sum) => sum.long > 0
        ? `Lotes de carga pesada na câmara resfriada precisam de giro. Envie o alerta pelo WhatsApp para reposição.`
        : `Paletes da câmara resfriada organizados e dentro do prazo.`
    },
    JEFFERSON: {
      name: 'JEFFERSON',
      role: 'Auditor de Quebras & Baixas Operacionais',
      icon: '🛒',
      badge: 'Quebras & Baixas',
      sector: 'transporte',
      sectorLabel: 'Controle de Quebra e Descarte de Vencidos',
      themeColor: '#84cc16',
      description: 'Consolida itens vencidos para lançamento de quebra no sistema e envia comprovante de recolhimento no WhatsApp.',
      speech: (sum) => sum.expired > 0
        ? `Temos ${sum.expired} item(ns) vencido(s) aguardando baixa. Clique abaixo para enviar o resumo de quebra no WhatsApp da equipe.`
        : `Nenhum produto vencido pendente de recolhimento no momento.`
    }
  };

  window.BrigadaTwin = {
    AGENTS_CONFIG,
    // ════════════════════════════════════════════════════════════════════════
    // 1.1 SISTEMA DE AGENTES OPERACIONAIS (AUDITORIA E NOTIFICAÇÃO REAL)
    // ════════════════════════════════════════════════════════════════════════

    
    generateWhatsAppReport(agentName) {
      const agent = this.getAgentData(agentName);
      const sum = agent.summary;
      const now = new Date();
      const dataHora = now.toLocaleDateString('pt-BR') + ' às ' + now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

      let msg = `🚨 *RELATÓRIO DE AUDITORIA DE VALIDADES — BRIGADA IA* 🚨\n\n`;
      msg += `👤 *Agente Auditor:* ${agent.name} (${agent.role})\n`;
      msg += `📍 *Setor:* ${agent.sectorLabel}\n`;
      msg += `⏰ *Data da Auditoria:* ${dataHora}\n`;
      msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;

      if (sum.expired > 0) {
        msg += `🔴 *PRODUTOS VENCIDOS:* ${sum.expired} lote(s) detectado(s)!\n`;
      }
      if (sum.today > 0) {
        msg += `🟠 *VENCEM HOJE:* ${sum.today} lote(s)\n`;
      }
      if (sum.warn > 0) {
        msg += `🟡 *VENCEM EM ATÉ 3 DIAS:* ${sum.warn} lote(s)\n`;
      }
      if (sum.expired === 0 && sum.today === 0 && sum.warn === 0) {
        msg += `✅ *Nenhum produto vencido. Setor 100% regular.*\n`;
      }

      msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
      msg += `📋 *RELAÇÃO DETALHADA DOS PRODUTOS:*\n\n`;

      const criticals = agent.products.filter(({ sev }) => sev === SEV.EXPIRED || sev === SEV.TODAY || sev === SEV.WARN);
      const listToReport = criticals.length ? criticals : agent.products.slice(0, 10);

      listToReport.forEach(({ p, sev }, idx) => {
        let statusBadge = '🟢 [REGULAR]';
        if (sev === SEV.EXPIRED) statusBadge = '🔴 *[VENCIDO]*';
        else if (sev === SEV.TODAY) statusBadge = '🟠 *[VENCE HOJE]*';
        else if (sev === SEV.WARN) statusBadge = '🟡 *[ATÉ 3 DIAS]*';

        let locFriendly = p.location || 'Local não informado';
        if (window.BrigadaData?.formatLocationFriendly) {
          try { locFriendly = window.BrigadaData.formatLocationFriendly(p); } catch (e) {}
        }
        const valDate = window.BrigadaData?.formatDate ? window.BrigadaData.formatDate(p.endDate) : p.endDate;

        msg += `${idx + 1}. ${statusBadge} *${p.name || 'Sem nome'}*\n`;
        msg += `   📍 *Local:* ${locFriendly}\n`;
        msg += `   📅 *Validade:* ${valDate}\n`;
        msg += `   📦 *Qtd:* ${p.quantity ?? 0} ${p.unit || ''} (PLU: ${p.plu || '—'})\n\n`;
      });

      msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
      if (sum.expired > 0) {
        msg += `⚠️ *AÇÃO REQUERIDA:* Retirar imediatamente os produtos vencidos da área de vendas e lançar no módulo de quebras.\n`;
      } else if (sum.today > 0) {
        msg += `🏷️ *AÇÃO REQUERIDA:* Aplicar etiqueta amarela de rebaixa nos produtos que vencem hoje.\n`;
      }
      msg += `_Relatório gerado e auditado automaticamente pela Brigada IA._`;

      return msg;
    },

    async sendAgentWhatsApp(agentName) {
      const agent = this.getAgentData(agentName);
      const text = this.generateWhatsAppReport(agentName);
      this.playNotificationSound('audit');

      // Tenta broadcast via Pastorini API se configurado
      if (window.BrigadaData?.broadcastWhatsApp) {
        try {
          const allUsers = window.BrigadaData?.users || [];
          const targetSector = (agent.config.sector || '').toLowerCase();
          const phones = allUsers
            .filter(u => u.whatsapp && (targetSector === 'global' || !u.sector || u.sector.toLowerCase().includes(targetSector) || u.sector === 'todos'))
            .map(u => u.whatsapp);
          if (phones.length) {
            window.BrigadaData.broadcastWhatsApp(phones, text);
          }
        } catch (e) {
          console.warn('Pastorini broadcast error:', e);
        }
      }

      // Abre o WhatsApp Web / Mobile para envio direto em Grupos ou Contatos
      const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
      window.open(waUrl, '_blank');
      window.BrigadaUI?.showToast?.(`📲 Relatório de validades do Agente ${agent.name} aberto no WhatsApp!`, 'success');
    },

    sendProductWhatsApp(productId, agentName) {
      const D = window.BrigadaData;
      const allProducts = D?.products || [];
      const p = allProducts.find(x => String(x.id) === String(productId));
      if (!p) {
        window.BrigadaUI?.showToast?.('Produto não encontrado.', 'error');
        return;
      }

      const st = D?.getProductStatus ? D.getProductStatus(p) : { label: 'Aviso', icon: '🚨' };
      let locFriendly = p.location || 'Local não informado';
      if (D?.formatLocationFriendly) {
        try { locFriendly = D.formatLocationFriendly(p); } catch (e) {}
      }
      const valDate = D?.formatDate ? D.formatDate(p.endDate) : p.endDate;

      let msg = `🚨 *ALERTA DE PRODUTO VENCIDO — BRIGADA IA* 🚨\n\n`;
      msg += `🤖 *Agente Notificador:* ${agentName || 'Auditor de Validade'}\n`;
      msg += `❌ *Produto:* *${p.name || 'Sem nome'}*\n`;
      msg += `📍 *Local Exato:* ${locFriendly}\n`;
      msg += `📅 *Data de Validade:* ${valDate} (${st.label})\n`;
      msg += `📦 *Estoque:* ${p.quantity ?? 0} ${p.unit || ''} (PLU: ${p.plu || '—'})\n\n`;
      msg += `⚠️ *Ação:* Recolher imediatamente este lote para descarte/quebra e evitar irregularidades!\n`;
      msg += `_Disparado via Gêmeo Digital BRIGADA-IA._`;

      const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
      window.open(waUrl, '_blank');
      window.BrigadaUI?.showToast?.(`📲 Alerta do produto ${p.name} aberto no WhatsApp!`, 'info');
    },

    getAgentData(agentName) {
      const rawName = (agentName || '').toUpperCase();
      const cfg = AGENTS_CONFIG[rawName] || {
        name: agentName,
        role: 'Agente Operacional',
        icon: '👤',
        badge: 'Operação',
        sector: 'geral',
        sectorLabel: 'Piso de Loja',
        themeColor: '#38bdf8',
        description: 'Supervisão de conformidade no salão de vendas.',
        speech: () => 'Ronda em andamento no salão de vendas.'
      };

      const allProducts = window.BrigadaData?.products || [];
      const audited = allProducts.filter(p => {
        if (!p) return false;
        if (cfg.sector === 'global' || cfg.name === 'FELIPE' || cfg.name === 'JEFFERSON') return true;
        if (cfg.chamberKey) {
          return (p.location || '').toLowerCase().startsWith(cfg.chamberKey.toLowerCase());
        }
        const loc = (p.location || '').toUpperCase();
        const fzMatch = /^PISO_LOJA:FZ(\d+)$/i.exec(loc);
        if (fzMatch && cfg.freezers) {
          const fzNum = parseInt(fzMatch[1], 10);
          if (cfg.freezers.includes(fzNum)) return true;
        }
        const cat = (p.category || '').toLowerCase();
        if (cfg.categories && cfg.categories.includes(cat)) return true;
        return false;
      });

      const counts = {
        [SEV.EXPIRED]: 0,
        [SEV.TODAY]: 0,
        [SEV.WARN]: 0,
        [SEV.LONG]: 0,
        [SEV.OK]: 0,
        rebaixa: 0
      };

      const classified = audited.map(p => {
        const sev = this.classify(p);
        if (sev !== null && counts[sev] !== undefined) counts[sev]++;
        if (p.isAwaitingReduction) counts.rebaixa++;
        return { p, sev };
      });

      classified.sort((a, b) => (b.sev ?? -2) - (a.sev ?? -2) || String(a.p.endDate).localeCompare(String(b.p.endDate)));

      const expired = counts[SEV.EXPIRED];
      const today = counts[SEV.TODAY];
      const warn = counts[SEV.WARN];
      const long = counts[SEV.LONG];
      const ok = counts[SEV.OK];
      const total = audited.length;

      let worst = SEV.OK;
      let statusText = 'Operação Conforme';
      let statusColor = '#10b981';
      let statusIcon = '🟢';

      if (expired > 0) {
        worst = SEV.EXPIRED;
        statusText = `${expired} Vencido${expired > 1 ? 's' : ''}!`;
        statusColor = '#ef4444';
        statusIcon = '🚨';
      } else if (today > 0) {
        worst = SEV.TODAY;
        statusText = `${today} Vence Hoje!`;
        statusColor = '#f97316';
        statusIcon = '🟠';
      } else if (warn > 0) {
        worst = SEV.WARN;
        statusText = `${warn} em até 3 dias`;
        statusColor = '#f59e0b';
        statusIcon = '🟡';
      } else if (long > 0) {
        worst = SEV.LONG;
        statusText = `${long} Alerta de Câmara`;
        statusColor = '#38bdf8';
        statusIcon = '❄️';
      }

      const summary = { total, expired, today, warn, long, ok, rebaixa: counts.rebaixa, worst, statusText, statusColor, statusIcon };
      const speechText = cfg.speech ? cfg.speech(summary) : 'Ronda operacional em andamento.';

      return {
        config: cfg,
        name: cfg.name,
        role: cfg.role,
        icon: cfg.icon,
        badge: cfg.badge,
        sectorLabel: cfg.sectorLabel,
        themeColor: cfg.themeColor,
        description: cfg.description,
        summary,
        speechText,
        products: classified
      };
    },

    focusAgent(agentName) {
      if (this.view !== 'store') {
        this.setView('store', true);
      }
      const key = 'agent:' + agentName;
      this.select(key, true);
    },

    notifyAgentAlert(agentName) {
      const agent = this.getAgentData(agentName);
      const sum = agent.summary;
      this.playNotificationSound(sum.expired > 0 ? 'critical' : 'alert');

      let msg = '';
      if (sum.expired > 0) {
        msg = `🚨 [AGENTE ${agent.name}] Detectados ${sum.expired} lote(s) VENCIDO(S) em ${agent.sectorLabel}! Ação urgente necessária.`;
      } else if (sum.today > 0) {
        msg = `🟠 [AGENTE ${agent.name}] Atenção: ${sum.today} lote(s) vencem HOJE em ${agent.sectorLabel}.`;
      } else if (sum.warn > 0) {
        msg = `🟡 [AGENTE ${agent.name}] Alerta preventivo: ${sum.warn} lote(s) vencendo em até 3 dias em ${agent.sectorLabel}.`;
      } else {
        msg = `✅ [AGENTE ${agent.name}] Ronda de conformidade concluída em ${agent.sectorLabel}. Zero irregularidades!`;
      }

      window.BrigadaUI?.showToast?.(msg, sum.expired > 0 ? 'error' : (sum.today > 0 ? 'warning' : 'success'));

      if (window.BrigadaNotifications?.addSystemBanner) {
        try {
          window.BrigadaNotifications.addSystemBanner({
            title: `Alerta do Agente ${agent.name} (${agent.role})`,
            message: msg,
            type: sum.expired > 0 ? 'danger' : 'warning',
            sector: agent.config.sector
          });
        } catch (e) {}
      }

      if ('Notification' in window && Notification.permission === 'granted') {
        try {
          new Notification(`Brigada IA - Agente ${agent.name}`, {
            body: msg,
            icon: '/static/icons/icon-192x192.png'
          });
        } catch (e) {}
      }
    },

    async reauditAgent(agentName) {
      window.BrigadaUI?.showToast?.(`🔄 Agente ${agentName} realizando nova varredura minuciosa...`, 'info');
      this.playNotificationSound('audit');
      try {
        if (window.BrigadaData?.load) {
          await window.BrigadaData.load();
        }
      } catch (e) {
        console.warn('Erro ao atualizar dados:', e);
      }
      this._rebuild();
      if (this.selectedKey === 'agent:' + agentName) {
        this.renderDrawer();
      }
      const agent = this.getAgentData(agentName);
      window.BrigadaUI?.showToast?.(`✅ Varredura concluída por ${agent.name}: ${agent.summary.statusText}`, agent.summary.expired > 0 ? 'error' : 'success');
    },

    flyToLocation(loc) {
      if (!loc) return;
      const fz = /^piso_loja:FZ(\d+)$/i.exec(loc.trim());
      if (fz) {
        const fzKey = `fz:${fz[1]}`;
        if (this.view !== 'store') this.setView('store', true);
        this.select(fzKey, true);
        return;
      }
      const ch = this.parseChamberLocation(loc);
      if (ch) {
        const slotKey = `slot:${ch.chamberKey}:${ch.column}:${ch.level}:${ch.pos}`;
        if (this.view !== ch.chamberKey) this.setView(ch.chamberKey, true);
        this.select(slotKey, true);
        return;
      }
      window.BrigadaUI?.showToast?.(`Localização: ${loc}`, 'info');
    },

    playNotificationSound(type = 'alert') {
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        const now = ctx.currentTime;

        if (type === 'critical') {
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(520, now);
          osc.frequency.setValueAtTime(780, now + 0.1);
          osc.frequency.setValueAtTime(1040, now + 0.2);
          gain.gain.setValueAtTime(0.12, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
          osc.start(now);
          osc.stop(now + 0.46);
        } else if (type === 'audit') {
          osc.type = 'sine';
          osc.frequency.setValueAtTime(440, now);
          osc.frequency.exponentialRampToValueAtTime(880, now + 0.2);
          gain.gain.setValueAtTime(0.08, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
          osc.start(now);
          osc.stop(now + 0.26);
        } else {
          osc.type = 'sine';
          osc.frequency.setValueAtTime(659.25, now);
          osc.frequency.setValueAtTime(880, now + 0.12);
          gain.gain.setValueAtTime(0.08, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
          osc.start(now);
          osc.stop(now + 0.36);
        }
      } catch (err) {}
    },

    renderAgentsDock() {
      const dock = this.container?.querySelector('#twin-agents-dock');
      if (!dock) return;
      const agentsList = ['FELIPE', 'LIU', 'HUGO', 'ISABEL', 'ROSE', 'IMPERADOR', 'JEFFERSON', 'RAFAEL', 'GILMAR', 'JUARES'];
      const html = agentsList.map(name => {
        const data = this.getAgentData(name);
        const hasExpired = data.summary.expired > 0;
        const hasToday = data.summary.today > 0;
        const isSelected = this.selectedKey === 'agent:' + name;
        let badgeClass = 'agent-pill--ok';
        let badgeLabel = '✓';
        if (hasExpired) {
          badgeClass = 'agent-pill--danger';
          badgeLabel = `🚨 ${data.summary.expired}`;
        } else if (hasToday) {
          badgeClass = 'agent-pill--warn';
          badgeLabel = `🟠 ${data.summary.today}`;
        }
        return `
          <button type="button" class="twin-agent-pill ${badgeClass} ${isSelected ? 'twin-agent-pill--active' : ''}" data-focus-agent="${name}" title="${esc(data.name)} · ${esc(data.role)} (${esc(data.summary.statusText)})">
            <span class="twin-agent-pill__icon">${data.icon}</span>
            <span class="twin-agent-pill__name">${data.name}</span>
            <span class="twin-agent-pill__badge">${badgeLabel}</span>
          </button>
        `;
      }).join('');
      dock.innerHTML = `
        <div class="twin-agents-dock__inner">
          <span class="twin-agents-dock__label">🤖 AGENTES DA BRIGADA:</span>
          ${html}
        </div>
      `;
    },

    _renderAgentDrawer(drawer, agentName) {
      const agent = this.getAgentData(agentName);
      const D = window.BrigadaData;
      const sum = agent.summary;
      const activeFilter = this.agentProductFilter || null;

      let displayProducts = agent.products;
      if (activeFilter === 'expired') {
        displayProducts = agent.products.filter(({ sev }) => sev === SEV.EXPIRED);
      } else if (activeFilter === 'today') {
        displayProducts = agent.products.filter(({ sev }) => sev === SEV.TODAY);
      } else if (activeFilter === 'warn') {
        displayProducts = agent.products.filter(({ sev }) => sev === SEV.WARN);
      } else if (activeFilter === 'ok') {
        displayProducts = agent.products.filter(({ sev }) => sev === SEV.OK || sev === SEV.LONG);
      }

      const rows = displayProducts.length ? displayProducts.map(({ p, sev }) => {
        const st = D.getProductStatus ? D.getProductStatus(p) : { label: 'Conforme', icon: '🟢' };
        const color = sev === null ? '#64748b' : SEV_META[sev]?.color || '#10b981';
        let friendlyLoc = p.location || 'Local não informado';
        if (D.formatLocationFriendly) {
          try { friendlyLoc = D.formatLocationFriendly(p); } catch (e) {}
        }
        
        const isExp = sev === SEV.EXPIRED;
        const isTod = sev === SEV.TODAY;
        const statusBadge = isExp
          ? `<span style="background: rgba(239, 68, 68, 0.2); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.4); padding: 2px 7px; border-radius: 4px; font-weight: 700; font-size: 0.72rem;">🔴 VENCIDO</span>`
          : (isTod
            ? `<span style="background: rgba(249, 115, 22, 0.2); color: #fb923c; border: 1px solid rgba(249, 115, 22, 0.4); padding: 2px 7px; border-radius: 4px; font-weight: 700; font-size: 0.72rem;">🟠 VENCE HOJE</span>`
            : `<span style="color: ${color}; font-size: 0.75rem; font-weight: 600;">${st.icon} ${esc(st.label)}</span>`);

        return `
          <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255,255,255,0.08); border-left: 4px solid ${color}; border-radius: 8px; padding: 10px; margin-bottom: 8px; transition: all 0.2s ease;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; margin-bottom: 6px;">
              <div>
                <strong style="color: var(--text-primary); font-size: 0.88rem; display: block;">${esc(p.name || 'Sem nome')}</strong>
                <span style="font-size: 0.75rem; color: var(--text-secondary);">PLU: ${esc(p.plu || '—')} · Qtd: <b>${esc(p.quantity ?? 0)} ${esc(p.unit || '')}</b></span>
              </div>
              <div>${statusBadge}</div>
            </div>
            
            <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.74rem; color: var(--text-secondary); margin-bottom: 8px; padding: 4px 6px; background: rgba(0,0,0,0.25); border-radius: 4px;">
              <span>📍 <b>${esc(friendlyLoc)}</b></span>
              <span>📅 Val: <b>${esc(D.formatDate ? D.formatDate(p.endDate) : p.endDate)}</b></span>
            </div>

            <div style="display: flex; gap: 6px; flex-wrap: wrap;">
              <button type="button" class="btn btn--sm" data-fly-to="${esc(p.location || '')}" style="background: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.4); color: #7dd3fc; font-size: 0.72rem; padding: 4px 8px; border-radius: 6px;" title="Ver localização no 3D">
                🎯 Ver no 3D
              </button>
              <button type="button" class="btn btn--sm" data-twin-cracha="${esc(p.id)}" style="background: rgba(99, 102, 241, 0.15); border: 1px solid rgba(99, 102, 241, 0.4); color: #a5b4fc; font-size: 0.72rem; padding: 4px 8px; border-radius: 6px;" title="Gerar Crachá">
                🏷️ Crachá
              </button>
              <button type="button" class="btn btn--sm" data-agent-wa-item="${esc(p.id)}" data-agent="${esc(agent.name)}" style="background: rgba(37, 211, 102, 0.2); border: 1px solid rgba(37, 211, 102, 0.5); color: #4ade80; font-size: 0.72rem; padding: 4px 8px; border-radius: 6px; font-weight: 700; display: inline-flex; align-items: center; gap: 3px;" title="Avisar este produto no WhatsApp">
                📲 WhatsApp
              </button>
              ${isExp ? `
                <button type="button" class="btn btn--sm" data-agent-quebra="${esc(p.id)}" style="background: rgba(239, 68, 68, 0.2); border: 1px solid rgba(239, 68, 68, 0.5); color: #fca5a5; font-size: 0.72rem; padding: 4px 8px; border-radius: 6px; font-weight: 700;" title="Lançar Quebra">
                  🗑️ Quebra
                </button>
              ` : ''}
              ${(sev === SEV.WARN || isTod) && !p.isAwaitingReduction ? `
                <button type="button" class="btn btn--sm" data-agent-rebaixa="${esc(p.id)}" style="background: rgba(168, 85, 247, 0.15); border: 1px solid rgba(168, 85, 247, 0.4); color: #d8b4fe; font-size: 0.72rem; padding: 4px 8px; border-radius: 6px;" title="Marcar Rebaixa">
                  🏷️ Rebaixa
                </button>
              ` : ''}
            </div>
          </div>
        `;
      }).join('') : `<div class="twin-rail__empty" style="text-align: center; padding: 2rem 1rem;">✅ Nenhum produto sob supervisão deste agente requer atenção no momento.</div>`;

      drawer.innerHTML = `
        <div class="twin-drawer__head" style="--sev:${sum.statusColor}; background: linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.95)); border-bottom: 2px solid ${sum.statusColor};">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="font-size: 2.2rem; background: rgba(255,255,255,0.06); padding: 8px 12px; border-radius: 12px; border: 1px solid var(--glass-border); display: flex; align-items: center; justify-content: center;">
              ${agent.icon}
            </div>
            <div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <h2 style="margin: 0; font-size: 1.15rem; color: #fff; font-weight: 800;">${esc(agent.name)}</h2>
                <span class="twin-badge" style="background: ${agent.themeColor}; color: #fff; font-size: 0.72rem; padding: 2px 8px; border-radius: 6px; font-weight: 700;">${esc(agent.badge)}</span>
              </div>
              <p style="margin: 3px 0 0; font-size: 0.8rem; color: var(--text-secondary); font-weight: 500;">${esc(agent.role)}</p>
              <div style="color: #94a3b8; font-size: 0.74rem; margin-top: 2px;">📍 ${esc(agent.sectorLabel)}</div>
            </div>
          </div>
          <button class="modal-close" data-action="close" title="Fechar">✕</button>
        </div>

        <!-- Diálogo / Insight do Agente -->
        <div style="margin: 12px 14px; padding: 12px 14px; background: rgba(99, 102, 241, 0.08); border-left: 4px solid ${sum.statusColor}; border-radius: 8px;">
          <div style="font-size: 0.72rem; text-transform: uppercase; font-weight: 700; color: ${agent.themeColor}; margin-bottom: 4px; display: flex; align-items: center; gap: 6px;">
            <span>💬</span> RELATÓRIO DO AGENTE EM TEMPO REAL:
          </div>
          <div style="font-size: 0.86rem; color: var(--text-primary); line-height: 1.45; font-weight: 500;">
            "${esc(agent.speechText)}"
          </div>
        </div>

        <!-- KPIs Resumo Clicáveis (Filtro Interativo de Produtos) -->
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin: 0 14px 12px;">
          <button type="button" class="btn-agent-kpi ${activeFilter === 'expired' ? 'btn-agent-kpi--active' : ''}" data-agent-filter="expired" data-agent="${esc(agent.name)}" title="Filtrar produtos vencidos" style="background: ${activeFilter === 'expired' ? 'rgba(239, 68, 68, 0.32)' : 'rgba(239, 68, 68, 0.12)'}; border: 1.5px solid ${activeFilter === 'expired' ? '#ef4444' : 'rgba(239, 68, 68, 0.25)'}; border-radius: 8px; padding: 8px 4px; text-align: center; cursor: pointer; transition: all 0.2s ease; outline: none; box-shadow: ${activeFilter === 'expired' ? '0 0 12px rgba(239, 68, 68, 0.45)' : 'none'};">
            <div style="font-size: 1.25rem; font-weight: 800; color: #ef4444; line-height: 1;">${sum.expired}</div>
            <div style="font-size: 0.65rem; color: var(--text-secondary); text-transform: uppercase; font-weight: 700; margin-top: 4px;">Vencidos</div>
          </button>
          <button type="button" class="btn-agent-kpi ${activeFilter === 'today' ? 'btn-agent-kpi--active' : ''}" data-agent-filter="today" data-agent="${esc(agent.name)}" title="Filtrar produtos que vencem hoje" style="background: ${activeFilter === 'today' ? 'rgba(249, 115, 22, 0.32)' : 'rgba(249, 115, 22, 0.12)'}; border: 1.5px solid ${activeFilter === 'today' ? '#f97316' : 'rgba(249, 115, 22, 0.25)'}; border-radius: 8px; padding: 8px 4px; text-align: center; cursor: pointer; transition: all 0.2s ease; outline: none; box-shadow: ${activeFilter === 'today' ? '0 0 12px rgba(249, 115, 22, 0.45)' : 'none'};">
            <div style="font-size: 1.25rem; font-weight: 800; color: #f97316; line-height: 1;">${sum.today}</div>
            <div style="font-size: 0.65rem; color: var(--text-secondary); text-transform: uppercase; font-weight: 700; margin-top: 4px;">Hoje</div>
          </button>
          <button type="button" class="btn-agent-kpi ${activeFilter === 'warn' ? 'btn-agent-kpi--active' : ''}" data-agent-filter="warn" data-agent="${esc(agent.name)}" title="Filtrar produtos que vencem em até 3 dias" style="background: ${activeFilter === 'warn' ? 'rgba(245, 158, 11, 0.32)' : 'rgba(245, 158, 11, 0.12)'}; border: 1.5px solid ${activeFilter === 'warn' ? '#f59e0b' : 'rgba(245, 158, 11, 0.25)'}; border-radius: 8px; padding: 8px 4px; text-align: center; cursor: pointer; transition: all 0.2s ease; outline: none; box-shadow: ${activeFilter === 'warn' ? '0 0 12px rgba(245, 158, 11, 0.45)' : 'none'};">
            <div style="font-size: 1.25rem; font-weight: 800; color: #f59e0b; line-height: 1;">${sum.warn}</div>
            <div style="font-size: 0.65rem; color: var(--text-secondary); text-transform: uppercase; font-weight: 700; margin-top: 4px;">Até 3d</div>
          </button>
          <button type="button" class="btn-agent-kpi ${activeFilter === 'ok' ? 'btn-agent-kpi--active' : ''}" data-agent-filter="ok" data-agent="${esc(agent.name)}" title="Filtrar produtos conformes / regulares" style="background: ${activeFilter === 'ok' ? 'rgba(16, 185, 129, 0.32)' : 'rgba(16, 185, 129, 0.12)'}; border: 1.5px solid ${activeFilter === 'ok' ? '#10b981' : 'rgba(16, 185, 129, 0.25)'}; border-radius: 8px; padding: 8px 4px; text-align: center; cursor: pointer; transition: all 0.2s ease; outline: none; box-shadow: ${activeFilter === 'ok' ? '0 0 12px rgba(16, 185, 129, 0.45)' : 'none'};">
            <div style="font-size: 1.25rem; font-weight: 800; color: #10b981; line-height: 1;">${sum.ok}</div>
            <div style="font-size: 0.65rem; color: var(--text-secondary); text-transform: uppercase; font-weight: 700; margin-top: 4px;">OK</div>
          </button>
        </div>

        <!-- AÇÕES REAIS: DISPARO DE RELATÓRIO VIA WHATSAPP E ALERTAS -->
        <div style="display: flex; flex-direction: column; gap: 8px; padding: 0 14px 12px;">
          <button type="button" class="btn" data-agent-action="send-whatsapp" data-agent="${esc(agent.name)}" style="background: #25D366; color: #ffffff; border: none; font-weight: 800; font-size: 0.86rem; padding: 10px 14px; border-radius: 8px; display: flex; align-items: center; justify-content: center; gap: 8px; cursor: pointer; box-shadow: 0 3px 12px rgba(37, 211, 102, 0.4); transition: all 0.2s ease;">
            <span style="font-size: 1.2rem;">📲</span> Enviar Relatório de Validades no WhatsApp
          </button>
          <div style="display: flex; gap: 8px;">
            <button type="button" class="btn btn--primary btn--sm" data-agent-action="notify" data-agent="${esc(agent.name)}" style="background: var(--accent-gradient); border: none; font-weight: 700; flex: 1; padding: 7px 10px; font-size: 0.78rem;">
              🚨 Alarme no Sistema
            </button>
            <button type="button" class="btn btn--outline btn--sm" data-agent-action="reaudit" data-agent="${esc(agent.name)}" style="border-color: rgba(255,255,255,0.2); font-weight: 600; padding: 7px 10px; font-size: 0.78rem;">
              🔄 Reauditar Setor
            </button>
          </div>
        </div>

        <!-- Lista de Produtos Auditados -->
        <div class="twin-drawer__list" style="padding: 0 14px 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; flex-wrap: wrap; gap: 4px;">
            <span style="font-size: 0.78rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px;">
              📦 ${activeFilter ? `Filtrando: ${activeFilter === 'expired' ? 'Vencidos' : (activeFilter === 'today' ? 'Vencem Hoje' : (activeFilter === 'warn' ? 'Até 3 dias' : 'Regulares (OK)'))} (${displayProducts.length})` : `Todos os Produtos (${agent.products.length})`}
            </span>
            ${activeFilter ? `
              <button type="button" class="btn btn--sm" data-agent-filter="clear" data-agent="${esc(agent.name)}" style="background: rgba(255,255,255,0.08); border: 1px solid var(--glass-border); color: #cbd5e1; font-size: 0.70rem; padding: 2px 8px; border-radius: 6px; cursor: pointer; display: inline-flex; align-items: center; gap: 3px;" title="Limpar filtro e ver todos os produtos">
                ✕ Ver Todos (${agent.products.length})
              </button>
            ` : `<span style="font-size: 0.70rem; color: #94a3b8;">Clique nos cartões acima para filtrar</span>`}
          </div>
          ${rows}
        </div>
      `;
    },

    _createAgentBubbleSprite(name) {
      if (!this._ctx) return null;
      const { THREE } = this._ctx;
      const canvas = document.createElement('canvas');
      canvas.width = 340;
      canvas.height = 76;
      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false });
      const sprite = new THREE.Sprite(mat);
      sprite.scale.set(1.5, 0.335, 1);
      sprite.userData = { canvas, tex, agentName: name };
      this._renderBubbleCanvas(sprite, name);
      return sprite;
    },

    _renderBubbleCanvas(sprite, name) {
      if (!sprite?.userData?.canvas) return;
      const data = this.getAgentData(name);
      const canvas = sprite.userData.canvas;
      const ctx = canvas.getContext('2d');
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      let bg = 'rgba(16, 185, 129, 0.92)';
      let border = '#34d399';
      let text = '✓ 0 Vencidos';

      if (data.summary.expired > 0) {
        bg = 'rgba(239, 68, 68, 0.96)';
        border = '#fca5a5';
        text = `🚨 ${data.summary.expired} VENCIDO${data.summary.expired > 1 ? 'S' : ''}!`;
      } else if (data.summary.today > 0) {
        bg = 'rgba(249, 115, 22, 0.96)';
        border = '#fdba74';
        text = `🟠 ${data.summary.today} VENCE HOJE`;
      } else if (data.summary.warn > 0) {
        bg = 'rgba(245, 158, 11, 0.95)';
        border = '#fde047';
        text = `⚠️ ${data.summary.warn} EM RISCO`;
      } else if (data.summary.long > 0) {
        bg = 'rgba(2, 132, 199, 0.95)';
        border = '#7dd3fc';
        text = `❄️ ${data.summary.long} CÂMARA ALERTA`;
      }

      ctx.fillStyle = bg;
      ctx.strokeStyle = border;
      ctx.lineWidth = 3;
      if (ctx.roundRect) {
        ctx.beginPath();
        ctx.roundRect(4, 4, w - 8, h - 8, 16);
        ctx.fill();
        ctx.stroke();
      } else {
        ctx.fillRect(4, 4, w - 8, h - 8);
      }

      ctx.font = 'bold 30px Outfit, system-ui, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 4;
      ctx.fillText(text, w / 2, h / 2);
      ctx.shadowBlur = 0;

      sprite.userData.tex.needsUpdate = true;
    },

    _updateAllAgentBubbles() {
      if (!this._ctx?.agentBubbles) return;
      this._ctx.agentBubbles.forEach((sprite, name) => {
        this._renderBubbleCanvas(sprite, name);
      });
    },

    SEV, SEV_META, LAYOUT,

    // estado de UI
    view: 'store',            // 'store' | 'congelado' | 'resfriado'
    layer: 'validade',        // 'validade' | 'agenda' | 'rebaixa' | 'categoria'
    search: '',
    selectedKey: null,
    railOpen: true,
    model: null,

    // estado 3D
    _three: null,
    _ctx: null,

    // ════════════════════════════════════════════════════════════════════════
    // 1. MODELO DE DADOS (sem dependência de Three.js)
    // ════════════════════════════════════════════════════════════════════════

    isMaster(user) {
      const u = user || window.BrigadaAuth?.currentUser;
      if (!u) return false;
      const email = (u.email || '').toLowerCase();
      return u.role === 'superadmin' || u.role === 'gestao' || norm(u.sector) === 'todos' ||
        email === 'admin@brigada.com' || email === 'marcos@brigada.com';
    },

    visibleSectors(user) {
      const u = user || window.BrigadaAuth?.currentUser;
      if (this.isMaster(u)) return ['acougue', 'pereciveis'];
      const sec = norm(u?.sector);
      if (sec.includes('pereciv')) return ['pereciveis'];
      return ['acougue'];
    },

    /** Classifica um produto na escala de severidade (null = já tratado/resolvido). */
    classify(p) {
      if (!p || p.expiredAction) return null;
      const s = window.BrigadaData.getProductStatus(p, true);
      if (s.days < 0) return SEV.EXPIRED;
      if (s.days === 0) return SEV.TODAY;
      if (s.days >= 1 && s.days <= 3) return SEV.WARN;
      if (s.isResfriadoAlert || s.isCongeladoAlert) return SEV.LONG;
      return SEV.OK;
    },

    parseFreezerLocation(loc) {
      const m = /^piso_loja:FZ(\d+)$/i.exec(loc || '');
      return m ? parseInt(m[1], 10) : null;
    },

    parseChamberLocation(loc) {
      const m = /^(resfriado|congelado|laticinios|pereciveis):C(\d+)-N(\d+)-([ED])(?::(full|misto))?$/i.exec(loc || '');
      if (!m) return null;
      return {
        chamberKey: m[1].toLowerCase(),
        column: parseInt(m[2], 10),
        level: parseInt(m[3], 10),
        pos: m[4].toUpperCase(),
        palletType: (m[5] || 'full').toLowerCase(),
      };
    },

    _newEntity(props) {
      return {
        products: [], counts: { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 }, active: 0,
        worst: SEV.EMPTY, rebaixa: 0, scheduled: false, ...props,
      };
    },

    _addToEntity(e, p, sev) {
      e.products.push({ p, sev });
      if (p.isAwaitingReduction) e.rebaixa++;
      if (sev === null) {
        if (e.worst === SEV.EMPTY) e.worst = SEV.OK;
        return;
      }
      e.counts[sev]++;
      e.active++;
      if (sev > e.worst) e.worst = sev;
    },

    /**
     * Constrói o modelo espacial completo a partir dos produtos carregados.
     * @returns {{entities: Map, alerts: Array, kpis: Object, today: Object}}
     */
    buildModel(opts = {}) {
      const D = window.BrigadaData;
      const P = window.BrigadaPisoLoja;
      const C = window.BrigadaChambers;
      const user = opts.user || window.BrigadaAuth?.currentUser;
      const master = this.isMaster(user);
      const sectors = this.visibleSectors(user);
      const todayIdx = opts.todayIndex ?? new Date().getDay();
      const entities = new Map();

      // ── Freezers do piso ──
      const freezerDefs = {
        acougue: P?.FREEZERS_AÇOUGUE || [],
        pereciveis: P?.FREEZERS_PERECIVEIS || [],
      };
      const schedules = {
        acougue: (P?.SCHEDULE_AÇOUGUE || []).find(s => s.dayIndex === todayIdx),
        pereciveis: (P?.SCHEDULE_PERECIVEIS || []).find(s => s.dayIndex === todayIdx),
      };
      sectors.forEach(sector => {
        freezerDefs[sector].forEach(f => {
          entities.set(`fz:${sector}:${f.num}`, this._newEntity({
            key: `fz:${sector}:${f.num}`, type: 'freezer', sector, num: f.num, category: f.category,
            label: `Freezer ${pad2(f.num)}`,
            scheduled: !!schedules[sector]?.freezers?.includes(f.num),
          }));
        });
      });

      // ── Câmaras, colunas e posições de palete ──
      const congSchedule = (C?.SCHEDULE_CONGELADA || []).find(s => s.dayIndex === todayIdx);
      const configs = C?.CHAMBER_CONFIGS || {};
      Object.keys(CHAMBER_NAMES).forEach(chKey => {
        const name = CHAMBER_NAMES[chKey];
        const cols = configs[name]?.columnsCount || (chKey === 'congelado' ? 16 : 4);
        const levels = LAYOUT.chamberInterior[chKey].levels;
        entities.set(`ch:${chKey}`, this._newEntity({
          key: `ch:${chKey}`, type: 'chamber', chamberKey: chKey, label: name,
          temp: configs[name]?.temp || '', capacity: cols * levels * 2, occupied: 0,
        }));
        for (let col = 1; col <= cols; col++) {
          const scheduled = chKey === 'congelado' && !!congSchedule?.columns?.includes(col);
          entities.set(`col:${chKey}:${col}`, this._newEntity({
            key: `col:${chKey}:${col}`, type: 'column', chamberKey: chKey, column: col,
            label: `${name} · Coluna ${pad2(col)}`, scheduled,
          }));
          for (let lvl = 1; lvl <= levels; lvl++) {
            ['E', 'D'].forEach(pos => {
              const key = `slot:${chKey}:${col}:${lvl}:${pos}`;
              entities.set(key, this._newEntity({
                key, type: 'slot', chamberKey: chKey, column: col, level: lvl, pos,
                label: `${name} · C${pad2(col)} · Nível ${lvl} · ${pos === 'E' ? 'Esquerda' : 'Direita'}`,
                scheduled,
              }));
            });
          }
        }
      });

      // ── Distribui os produtos ──
      const kpis = { total: 0, active: 0, expired: 0, today: 0, warn: 0, long: 0, ok: 0, rebaixa: 0, unplaced: 0, conformidade: 100 };
      const products = (D?.products || []).filter(p => master || D.isProductAllowedForUser(p, user));

      products.forEach(p => {
        const sev = this.classify(p);
        kpis.total++;
        if (sev !== null) {
          kpis.active++;
          if (sev === SEV.EXPIRED) kpis.expired++;
          else if (sev === SEV.TODAY) kpis.today++;
          else if (sev === SEV.WARN) kpis.warn++;
          else if (sev === SEV.LONG) kpis.long++;
          else kpis.ok++;
        }
        if (p.isAwaitingReduction) kpis.rebaixa++;

        const fz = this.parseFreezerLocation(p.location);
        if (fz !== null) {
          const candidates = sectors.filter(s => entities.has(`fz:${s}:${fz}`));
          let sector = candidates[0];
          if (candidates.length > 1) {
            // FZ17–FZ35 existem nos dois setores: decide pela natureza do produto
            sector = (D.isPereciveisProduct(p) && !D.isAçougueProduct(p)) ? 'pereciveis' : 'acougue';
          }
          if (sector) { this._addToEntity(entities.get(`fz:${sector}:${fz}`), p, sev); return; }
          kpis.unplaced++; return;
        }

        const ch = this.parseChamberLocation(p.location);
        if (ch) {
          const slot = entities.get(`slot:${ch.chamberKey}:${ch.column}:${ch.level}:${ch.pos}`);
          if (slot) {
            slot.palletType = ch.palletType;
            this._addToEntity(slot, p, sev);
            this._addToEntity(entities.get(`col:${ch.chamberKey}:${ch.column}`), p, sev);
            this._addToEntity(entities.get(`ch:${ch.chamberKey}`), p, sev);
            return;
          }
        }
        kpis.unplaced++;
      });

      // ocupação das câmaras
      entities.forEach(e => {
        if (e.type === 'slot' && e.products.length) entities.get(`ch:${e.chamberKey}`).occupied++;
      });

      kpis.conformidade = kpis.active ? Math.round(((kpis.ok + kpis.long) / kpis.active) * 1000) / 10 : 100;

      // ── Alertas (nível de causa raiz: freezer ou posição de palete) ──
      const alerts = [];
      entities.forEach(e => {
        if ((e.type === 'freezer' || e.type === 'slot') && e.worst >= SEV.WARN) {
          const parts = [];
          if (e.counts[SEV.EXPIRED]) parts.push(`${e.counts[SEV.EXPIRED]} vencido${e.counts[SEV.EXPIRED] > 1 ? 's' : ''}`);
          if (e.counts[SEV.TODAY]) parts.push(`${e.counts[SEV.TODAY]} vence${e.counts[SEV.TODAY] > 1 ? 'm' : ''} hoje`);
          if (e.counts[SEV.WARN]) parts.push(`${e.counts[SEV.WARN]} em até 3 dias`);
          alerts.push({ key: e.key, severity: e.worst, title: parts.join(' · '), entity: e, weight: e.counts[e.worst] });
        }
      });
      alerts.sort((a, b) => b.severity - a.severity || b.weight - a.weight || a.key.localeCompare(b.key));

      const scheduledToday = [...entities.values()].filter(e => e.scheduled && (e.type === 'freezer' || e.type === 'column'));

      return { entities, alerts, kpis, sectors, master, scheduledToday, generatedAt: new Date() };
    },

    // ════════════════════════════════════════════════════════════════════════
    // 2. PÁGINA (HUD 2D)
    // ════════════════════════════════════════════════════════════════════════

    render(container) {
      this.destroy();
      this.container = container;
      this.selectedKey = null;
      this.view = 'store';
      this.model = this.buildModel();
      this.railOpen = window.innerWidth > 900;

      container.innerHTML = `
        <div class="twin" id="twin-root">
          <div class="twin__topbar">
            <div class="twin__title">
              <h1>🧊 Gêmeo Digital</h1>
              <nav class="twin__crumbs" id="twin-crumbs"></nav>
            </div>
            <div class="twin__kpis" id="twin-kpis"></div>
          </div>
          <div class="twin__toolbar">
            <div class="twin__layers" id="twin-layers">
              <button data-layer="validade" class="twin-chip">🚦 Validade</button>
              <button data-layer="agenda" class="twin-chip">📅 Verificar hoje</button>
              <button data-layer="rebaixa" class="twin-chip">🏷️ Rebaixa</button>
              <button data-layer="categoria" class="twin-chip">🥩 Categoria</button>
            </div>
            <div class="twin__search">
              <input type="search" id="twin-search" class="form-input" placeholder="Localizar produto ou PLU no mapa…" autocomplete="off">
            </div>
            <button class="twin-chip" id="twin-toggle-rail" title="Mostrar/ocultar alertas">🚨 Alertas</button>
          </div>
          <div class="twin__agents-dock" id="twin-agents-dock"></div>
          <div class="twin__body">
            <aside class="twin__rail ${this.railOpen ? '' : 'twin__rail--closed'}" id="twin-rail"></aside>
            <div class="twin__stage" id="twin-stage">
              <button type="button" class="btn btn--sm" id="twin-rail-pull-tab" style="display: ${this.railOpen ? 'none' : 'inline-flex'};" title="Puxar / Abrir Painel de Alertas">
                🚨 Alertas ▶
              </button>
              <div class="twin__loading" id="twin-loading"><div class="spinner"></div><span>Carregando ambiente 3D…</span></div>
              <div class="twin__tooltip" id="twin-tooltip"></div>
              <div class="twin__legend" id="twin-legend"></div>
              <div class="twin__stage-actions">
                <button class="twin-chip" id="twin-back" style="display:none;">⬅ Voltar para a loja</button>
                <button class="twin-chip" id="twin-reset" title="Recentralizar câmera">🎯 Centralizar</button>
              </div>
            </div>
            <aside class="twin__drawer" id="twin-drawer"></aside>
          </div>
        </div>`;

      this._bindHud();
      this.renderHud();
      this._initThree().catch(err => {
        console.error('[Gêmeo Digital] Falha ao iniciar 3D:', err);
        this._showFallback(err);
      });

      this._refreshTimer = setInterval(() => this.refresh(), REFRESH_MS);
    },

    _bindHud() {
      const root = this.container;
      root.querySelectorAll('[data-layer]').forEach(btn => btn.addEventListener('click', () => {
        this.layer = btn.dataset.layer;
        this.renderHud();
        this._applyColors();
      }));
      let t;
      root.querySelector('#twin-search').addEventListener('input', (e) => {
        clearTimeout(t);
        t = setTimeout(() => { this.search = e.target.value.trim(); this._applyColors(); this.renderRail(); }, 200);
      });
      root.querySelector('#twin-toggle-rail').addEventListener('click', () => {
        this.toggleRail();
      });
      root.querySelector('#twin-back').addEventListener('click', () => this.setView('store'));
      root.querySelector('#twin-reset').addEventListener('click', () => this._flyToView(this.view));

      // Delegação de eventos (rail + drawer + agentes)
      root.addEventListener('click', (e) => {
        const agentBtn = e.target.closest('[data-focus-agent]');
        if (agentBtn) {
          e.preventDefault();
          this.focusAgent(agentBtn.dataset.focusAgent);
          return;
        }
        const filterBtn = e.target.closest('[data-agent-filter]');
        if (filterBtn) {
          e.preventDefault();
          const targetFilter = filterBtn.dataset.agentFilter;
          const agentName = filterBtn.dataset.agent;
          if (targetFilter === 'clear' || this.agentProductFilter === targetFilter) {
            this.agentProductFilter = null;
          } else {
            this.agentProductFilter = targetFilter;
          }
          const drawer = this.container?.querySelector('#twin-drawer');
          if (drawer) this._renderAgentDrawer(drawer, agentName);
          return;
        }

        const agentAct = e.target.closest('[data-agent-action]');
        if (agentAct) {
          e.preventDefault();
          const action = agentAct.dataset.agentAction;
          const agentName = agentAct.dataset.agent;
          if (action === 'send-whatsapp') this.sendAgentWhatsApp(agentName);
          if (action === 'notify') this.notifyAgentAlert(agentName);
          if (action === 'reaudit') this.reauditAgent(agentName);
          return;
        }
        const waItemBtn = e.target.closest('[data-agent-wa-item]');
        if (waItemBtn) {
          e.preventDefault();
          const prodId = waItemBtn.dataset.agentWaItem;
          const agentName = waItemBtn.dataset.agent;
          this.sendProductWhatsApp(prodId, agentName);
          return;
        }
        const flyToBtn = e.target.closest('[data-fly-to]');
        if (flyToBtn) {
          e.preventDefault();
          this.flyToLocation(flyToBtn.dataset.flyTo);
          return;
        }
        const quebraBtn = e.target.closest('[data-agent-quebra]');
        if (quebraBtn) {
          e.preventDefault();
          window.BrigadaUI?.showQuebraModal?.(quebraBtn.dataset.agentQuebra);
          return;
        }
        const rebaixaBtn = e.target.closest('[data-agent-rebaixa]');
        if (rebaixaBtn) {
          e.preventDefault();
          const prodId = rebaixaBtn.dataset.agentRebaixa;
          window.BrigadaData?.setAwaitingReduction?.([prodId], true, 'aguardando').then(() => {
            window.BrigadaUI?.showToast?.('Produto enviado para rebaixa!', 'success');
            this.refresh();
          });
          return;
        }
        if (e.target.closest('#btn-guardar-rail')) {
          e.preventDefault();
          this.toggleRail(false);
          return;
        }
        if (e.target.closest('#twin-rail-pull-tab')) {
          e.preventDefault();
          this.toggleRail(true);
          return;
        }
        const crachaBtn = e.target.closest('[data-twin-cracha]');
        if (crachaBtn) {
          e.preventDefault();
          e.stopPropagation();
          const pId = crachaBtn.dataset.twinCracha;
          const prod = window.BrigadaData.products.find(x => String(x.id) === String(pId));
          if (prod) {
            const ent = this.selectedKey && this.model.entities.get(this.selectedKey);
            window.BrigadaUI?.showEditableCrachaModal?.(prod, ent);
          }
          return;
        }
        const go = e.target.closest('[data-go]');
        if (go) { e.preventDefault(); this.focusEntity(go.dataset.go); return; }
        const pv = e.target.closest('[data-product]');
        if (pv) { e.preventDefault(); window.BrigadaUI?.showProductView?.(pv.dataset.product); return; }
        const act = e.target.closest('[data-action]');
        if (act) { e.preventDefault(); this._handleAction(act.dataset.action, act.dataset); }
      });
    },

    toggleRail(open) {
      if (typeof open === 'boolean') {
        this.railOpen = open;
      } else {
        this.railOpen = !this.railOpen;
      }
      const rail = this.container?.querySelector('#twin-rail');
      if (rail) {
        rail.classList.toggle('twin__rail--closed', !this.railOpen);
      }
      this._updateRailControls();
      setTimeout(() => this._resize(), 260);
    },

    _updateRailControls() {
      const alertCount = this.model?.alerts?.length || 0;
      const toggleBtn = this.container?.querySelector('#twin-toggle-rail');
      if (toggleBtn) {
        toggleBtn.innerHTML = this.railOpen ? '◀ Guardar Painel' : `🚨 Alertas (${alertCount})`;
        toggleBtn.classList.toggle('twin-chip--active', this.railOpen);
      }
      const pullTab = this.container?.querySelector('#twin-rail-pull-tab');
      if (pullTab) {
        pullTab.style.display = this.railOpen ? 'none' : 'inline-flex';
        pullTab.innerHTML = `🚨 Alertas (${alertCount}) ▶`;
      }
    },

    renderHud() {
      if (!this.container?.isConnected) return;
      const m = this.model;
      const k = m.kpis;
      const kpi = (label, value, cls = '', go = '') => `
        <div class="twin-kpi ${cls}" ${go ? `data-go="${go}" role="button" tabindex="0"` : ''}>
          <span class="twin-kpi__value">${value}</span><span class="twin-kpi__label">${label}</span>
        </div>`;
      const firstOf = (sev) => m.alerts.find(a => a.severity === sev)?.key || '';
      this.container.querySelector('#twin-kpis').innerHTML = [
        kpi('Conformidade', `${k.conformidade}%`, k.conformidade >= 95 ? 'twin-kpi--ok' : k.conformidade >= 85 ? 'twin-kpi--warn' : 'twin-kpi--bad'),
        kpi('Vencidos', k.expired, k.expired ? 'twin-kpi--bad' : '', firstOf(SEV.EXPIRED)),
        kpi('Vencem hoje', k.today, k.today ? 'twin-kpi--today' : '', firstOf(SEV.TODAY)),
        kpi('Até 3 dias', k.warn, k.warn ? 'twin-kpi--warn' : '', firstOf(SEV.WARN)),
        kpi('Em rebaixa', k.rebaixa),
        kpi('Verificar hoje', m.scheduledToday.length),
      ].join('');

      this.container.querySelectorAll('[data-layer]').forEach(b => b.classList.toggle('twin-chip--active', b.dataset.layer === this.layer));

      const crumbs = [`<a href="#" data-crumb="store">🏪 Loja</a>`];
      if (this.view !== 'store') crumbs.push(`<span>›</span><strong>${esc(CHAMBER_NAMES[this.view])}</strong>`);
      const crumbEl = this.container.querySelector('#twin-crumbs');
      crumbEl.innerHTML = crumbs.join(' ');
      crumbEl.querySelector('[data-crumb]')?.addEventListener('click', (e) => { e.preventDefault(); this.setView('store'); });
      this.container.querySelector('#twin-back').style.display = this.view === 'store' ? 'none' : '';

      this.renderRail();
      this.renderLegend();
      this.renderDrawer();
      this.renderAgentsDock();

      this._updateRailControls();
    },

    renderRail() {
      const rail = this.container?.querySelector('#twin-rail');
      if (!rail) return;
      const m = this.model;
      const matches = this.search ? this._searchMatches() : null;

      let html = `
        <div class="twin-rail__header" style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 0.65rem; margin-bottom: 0.75rem; border-bottom: 1px solid var(--glass-border);">
          <div style="display: flex; align-items: center; gap: 7px;">
            <span style="font-size: 1.15rem;">🚨</span>
            <strong style="font-size: 0.95rem; color: var(--text-primary);">Painel de Alertas</strong>
          </div>
          <button type="button" class="btn btn--sm" id="btn-guardar-rail" style="background: rgba(255,255,255,0.08); border: 1px solid var(--glass-border); color: var(--text-primary); font-weight: 700; font-size: 0.78rem; padding: 4px 10px; border-radius: 6px; cursor: pointer; display: inline-flex; align-items: center; gap: 4px;" title="Guardar / Ocultar este painel">
            ◀ Guardar
          </button>
        </div>
      `;
      if (matches) {
        html += `<div class="twin-rail__section">🔎 Resultado da busca <span class="twin-badge">${matches.size}</span></div>`;
        if (!matches.size) html += `<div class="twin-rail__empty">Nenhum local contém "${esc(this.search)}".</div>`;
        [...matches].slice(0, 40).forEach(key => {
          const e = m.entities.get(key);
          html += this._railItem(e, `${e.products.length} item(ns) aqui`);
        });
      }

      html += `<div class="twin-rail__section">🚨 Alertas <span class="twin-badge">${m.alerts.length}</span></div>`;
      if (!m.alerts.length) {
        html += `<div class="twin-rail__empty">✅ Nenhum item vencido ou próximo do vencimento.</div>`;
      } else {
        m.alerts.slice(0, 60).forEach(a => { html += this._railItem(a.entity, a.title); });
        if (m.alerts.length > 60) html += `<div class="twin-rail__empty">+ ${m.alerts.length - 60} alertas…</div>`;
      }

      html += `<div class="twin-rail__section" style="color: #10b981; font-weight: 700;">📅 Verificação de hoje <span class="twin-badge twin-badge--verificar">${m.scheduledToday.length}</span></div>`;
      if (!m.scheduledToday.length) html += `<div class="twin-rail__empty">Sem locais agendados para hoje.</div>`;
      m.scheduledToday.forEach(e => { html += this._railItem(e, `${e.products.length} item(ns) · verificar hoje`, true); });

      if (m.kpis.unplaced) {
        html += `<div class="twin-rail__note">ℹ️ ${m.kpis.unplaced} produto(s) sem posição no mapa (sem freezer ou palete definido).</div>`;
      }
      rail.innerHTML = html;
    },

    _railItem(e, subtitle, isScheduled = false) {
      const isVerificar = isScheduled || (this.layer === 'agenda' && e.scheduled);
      const meta = isVerificar ? { color: '#10b981', label: 'Verificar Hoje' } : SEV_META[e.worst];
      const where = e.type === 'freezer'
        ? (e.sector === 'acougue' ? 'Açougue' : 'Perecíveis')
        : CHAMBER_NAMES[e.chamberKey];
      const label = e.type === 'slot' ? `C${pad2(e.column)} · N${e.level} · ${e.pos}` : e.type === 'column' ? `Coluna ${pad2(e.column)}` : e.label;
      return `
        <button class="twin-alert ${isVerificar ? 'twin-alert--verificar' : ''} ${this.selectedKey === e.key ? 'twin-alert--active' : ''}" data-go="${e.key}" style="--sev:${meta.color}">
          <span class="twin-alert__dot"></span>
          <span class="twin-alert__body">
            <span style="display:flex; align-items:center; justify-content:space-between; width:100%; gap: 6px;">
              <strong>${esc(label)}</strong>
              ${isVerificar ? `<span class="twin-badge--verificar">🟢 VERIFICAR</span>` : ''}
            </span>
            <small>${esc(where)} — ${isVerificar ? `<strong style="color:#10b981; font-weight:700;">${esc(subtitle)}</strong>` : esc(subtitle)}</small>
          </span>
          <span class="twin-alert__go">➜</span>
        </button>`;
    },

    renderLegend() {
      const el = this.container?.querySelector('#twin-legend');
      if (!el) return;
      let items = [];
      if (this.layer === 'agenda') {
        items = [
          ['#10b981', '🟢 Verificar hoje (Piscando)'],
          ['#1e293b', 'Fora da agenda de hoje']
        ];
      } else if (this.layer === 'validade') {
        items = [SEV.EXPIRED, SEV.TODAY, SEV.WARN, SEV.LONG, SEV.OK, SEV.EMPTY].map(s => [SEV_META[s].color, SEV_META[s].label]);
      } else if (this.layer === 'rebaixa') {
        items = [['#a855f7', 'Com itens em rebaixa'], ['#334155', 'Sem rebaixa']];
      } else {
        const labels = window.BrigadaPisoLoja?.FREEZER_CATEGORY_LABELS || {};
        items = Object.entries(CATEGORY_COLORS).slice(0, 7).map(([k, c]) => [c, labels[k] || k]);
      }
      el.innerHTML = items.map(([c, l]) => `<span><i style="background:${c}"></i>${esc(l)}</span>`).join('');
    },

    renderDrawer() {
      const drawer = this.container?.querySelector('#twin-drawer');
      if (!drawer) return;

      if (this.selectedKey && this.selectedKey.startsWith('agent:')) {
        const agentName = this.selectedKey.replace('agent:', '');
        this._renderAgentDrawer(drawer, agentName);
        drawer.classList.add('twin__drawer--open');
        return;
      }

      const e = this.selectedKey && this.model.entities.get(this.selectedKey);
      drawer.classList.toggle('twin__drawer--open', !!e);
      if (!e) { drawer.innerHTML = ''; return; }

      const D = window.BrigadaData;
      const meta = SEV_META[e.worst];
      const chips = [SEV.EXPIRED, SEV.TODAY, SEV.WARN, SEV.LONG, SEV.OK]
        .filter(s => e.counts[s])
        .map(s => `<span class="twin-pill" style="--sev:${SEV_META[s].color}">${SEV_META[s].icon} ${e.counts[s]} ${esc(SEV_META[s].label)}</span>`)
        .join('');

      const subtitle = e.type === 'freezer'
        ? `${e.sector === 'acougue' ? '🥩 Açougue' : '🥗 Perecíveis'} · ${esc(window.BrigadaPisoLoja?.FREEZER_CATEGORY_LABELS?.[e.category] || e.category || '')}`
        : e.type === 'chamber' ? `🌡️ ${esc(e.temp)} · Ocupação ${e.occupied}/${e.capacity} posições (${Math.round((e.occupied / e.capacity) * 100)}%)`
        : e.type === 'slot' ? (e.products.length ? (e.products.length > 1 ? `Palete misto (${e.products.length} lotes / crachás)` : `Palete cheio (1 lote / crachá)`) : 'Posição livre')
        : `${e.products.length} item(ns) na coluna`;

      const sorted = [...e.products].sort((a, b) => (b.sev ?? -2) - (a.sev ?? -2) || String(a.p.endDate).localeCompare(String(b.p.endDate)));
      const rows = sorted.slice(0, 80).map(({ p, sev }) => {
        const st = D.getProductStatus(p);
        const color = sev === null ? '#64748b' : SEV_META[sev].color;
        const where = e.type === 'column' || e.type === 'chamber' ? (() => {
          const c = this.parseChamberLocation(p.location);
          return c ? `<span class="twin-row__where">C${pad2(c.column)}·N${c.level}·${c.pos}</span>` : '';
        })() : '';
        return `
          <div style="display:flex; align-items:center; gap:6px; margin-bottom:4px;">
            <button class="twin-row" data-product="${esc(p.id)}" style="--sev:${color}; flex:1;">
              <span class="twin-row__bar"></span>
              <span class="twin-row__main">
                <strong>${esc(p.name || 'Sem nome')}</strong>
                <small>PLU ${esc(p.plu || '—')} · ${esc(p.quantity ?? 0)} ${esc(p.unit || '')} · Val. ${esc(D.formatDate ? D.formatDate(p.endDate) : p.endDate)} ${where}</small>
              </span>
              <span class="twin-row__status">${st.icon} ${esc(st.label)}${p.isAwaitingReduction ? '<em>🏷️ Rebaixa</em>' : ''}</span>
            </button>
            <button type="button" class="btn btn--sm btn--outline" data-twin-cracha="${esc(p.id)}" style="padding: 7px 10px; font-weight: 700; font-size: 0.72rem; border-color: rgba(99,102,241,0.5); color: #a5b4fc; border-radius: 8px; display: inline-flex; align-items: center; gap: 4px; flex-shrink: 0;" title="Gerar e Imprimir Crachá Deste Produto">
              🏷️ Crachá
            </button>
          </div>`;
      }).join('');

      const reducible = e.products.filter(({ p, sev }) => (sev === SEV.WARN || sev === SEV.TODAY) && !p.isAwaitingReduction);
      const actions = [];
      if (e.products && e.products.length) actions.push(`<button class="btn btn--primary btn--sm" data-action="print-cracha" style="background:#6366f1; border:none; font-weight:700;">🏷️ Gerar Crachá${e.products.length > 1 ? "s (" + e.products.length + " lotes)" : ""}</button>`);
      if (e.type === 'chamber') actions.push(`<button class="btn btn--primary btn--sm" data-action="enter" data-chamber="${e.chamberKey}">🚪 Entrar na câmara</button>`);
      if (reducible.length) actions.push(`<button class="btn btn--outline btn--sm" data-action="rebaixa">🏷️ Marcar rebaixa (${reducible.length})</button>`);
      actions.push(`<button class="btn btn--ghost btn--sm" data-action="open-module">↗ Abrir no módulo</button>`);

      drawer.innerHTML = `
        <div class="twin-drawer__head" style="--sev:${meta.color}">
          <div>
            <span class="twin-drawer__status">${meta.icon} ${esc(meta.label)}</span>
            <h2>${esc(e.label)}</h2>
            <p>${subtitle}</p>
          </div>
          <button class="modal-close" data-action="close" title="Fechar">✕</button>
        </div>
        ${e.scheduled ? `<div class="twin-drawer__notice" style="background: rgba(16,185,129,0.15); border-left: 4px solid #10b981; color: #10b981; font-weight:600; display:flex; align-items:center; justify-content:space-between; padding: 8px 12px; border-radius: 6px; margin-bottom: 10px;"><span>🗓️ Este local está na <strong>agenda de verificação de hoje</strong></span><span class="twin-badge--verificar">🟢 VERIFICAR</span></div>` : ''}
        <div class="twin-drawer__pills">${chips || '<span class="twin-pill">Sem itens ativos</span>'}${e.rebaixa ? `<span class="twin-pill" style="--sev:#a855f7">🏷️ ${e.rebaixa} em rebaixa</span>` : ''}</div>
        ${e.type === 'slot' && e.products.length > 1 ? `<div style="background: rgba(99, 102, 241, 0.1); border: 1px solid rgba(99, 102, 241, 0.3); border-radius: 8px; padding: 6px 10px; font-size: 0.74rem; color: var(--text-secondary); margin-bottom: 8px;">📦 <b>Palete com múltiplos lotes:</b> Este palete possui ${e.products.length} lotes alocados. Cada lote possui seu próprio crachá de identificação.</div>` : ''}
        <div class="twin-drawer__actions">${actions.join('')}</div>
        <div class="twin-drawer__list">
          ${rows || `<div class="twin-rail__empty">Nenhum produto alocado neste local.</div>`}
          ${sorted.length > 80 ? `<div class="twin-rail__empty">+ ${sorted.length - 80} itens…</div>` : ''}
        </div>`;
    },

    async _handleAction(action, data) {
      const e = this.selectedKey && this.model.entities.get(this.selectedKey);
      if (action === 'close') { this.select(null); return; }
      if (action === 'enter') { this.setView(data.chamber); return; }
      if (action === 'print-cracha') {
        const first = e.products[0]?.p;
        if (first) {
          window.BrigadaUI?.showEditableCrachaModal?.(first, e);
        }
        return;
      }
      if (!e) return;

      if (action === 'rebaixa') {
        const ids = e.products.filter(({ p, sev }) => (sev === SEV.WARN || sev === SEV.TODAY) && !p.isAwaitingReduction).map(({ p }) => p.id);
        if (!ids.length) return;
        if (!window.confirm(`Marcar ${ids.length} produto(s) de "${e.label}" como aguardando rebaixa?`)) return;
        await window.BrigadaData.setAwaitingReduction(ids, true, 'aguardando');
        window.BrigadaUI?.showToast?.(`${ids.length} produto(s) enviados para rebaixa.`, 'success');
        this._rebuild();
        return;
      }

      if (action === 'open-module') {
        const R = window.BrigadaRouter;
        if (e.type === 'freezer' && window.BrigadaPisoLoja) {
          window.BrigadaPisoLoja.selectedSector = e.sector === 'acougue' ? 'açougue' : 'pereciveis';
          window.BrigadaPisoLoja.selectedFreezer = e.num;
          R.navigate('piso-loja');
        } else if (window.BrigadaChambers) {
          window.BrigadaChambers.selectedChamber = CHAMBER_NAMES[e.chamberKey];
          window.BrigadaChambers.selectedColumn = e.column || null;
          R.navigate('chambers');
        }
      }
    },

    _searchMatches() {
      const q = norm(this.search);
      const out = new Set();
      if (!q) return out;
      this.model.entities.forEach(e => {
        if (e.type !== 'freezer' && e.type !== 'slot') return;
        if (e.products.some(({ p }) => norm(p.name).includes(q) || String(p.plu || '').includes(q) || String(p.barcode || '').includes(q))) out.add(e.key);
      });
      return out;
    },

    // ── Refresh ────────────────────────────────────────────────────────────
    async refresh() {
      if (!this.container?.isConnected) { this.destroy(); return; }
      if (document.hidden) return;
      try { await window.BrigadaData.load(); } catch (err) { console.warn('[Gêmeo Digital] refresh falhou', err); return; }
      this._rebuild();
    },

    _rebuild() {
      this.model = this.buildModel();
      if (this.selectedKey && !this.selectedKey.startsWith('agent:') && !this.model.entities.has(this.selectedKey)) this.selectedKey = null;
      this.renderHud();
      this._applyColors();
      this._updateAllAgentBubbles();
    },

    // ════════════════════════════════════════════════════════════════════════
    // 3. CENA 3D
    // ════════════════════════════════════════════════════════════════════════

    async _initThree() {
      const stage = this.container.querySelector('#twin-stage');
      if (!this._hasWebGL()) throw new Error('WebGL indisponível neste dispositivo');

      const [THREE, { OrbitControls }] = await Promise.all([import(THREE_URL), import(ORBIT_URL)]);
      if (!stage.isConnected) return; // usuário saiu da página durante o download
      this._three = THREE;

      const lowPower = (navigator.hardwareConcurrency || 8) <= 4 || window.innerWidth < 768;
      const renderer = new THREE.WebGLRenderer({ antialias: !lowPower, alpha: false, powerPreference: 'high-performance' });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, lowPower ? 1 : 2));
      renderer.shadowMap.enabled = !lowPower;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.domElement.className = 'twin__canvas';
      stage.prepend(renderer.domElement);

      const scene = new THREE.Scene();
      const bg = getComputedStyle(document.documentElement).getPropertyValue('--bg-primary').trim() || '#0d071a';
      const isLight = document.documentElement.classList.contains('light-theme');
      scene.background = new THREE.Color(bg);
      scene.fog = new THREE.Fog(scene.background, 70, 160);

      const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.08;
      controls.maxPolarAngle = Math.PI * 0.47;
      controls.minDistance = 4;
      controls.maxDistance = 85;
      controls.zoomSpeed = 0.65;

      scene.add(new THREE.HemisphereLight(isLight ? 0xffffff : 0xbfd4ff, isLight ? 0x888888 : 0x1a1030, isLight ? 1.1 : 0.9));
      const sun = new THREE.DirectionalLight(0xffffff, 1.2);
      sun.position.set(30, 50, 25);
      sun.castShadow = !lowPower;
      sun.shadow.mapSize.set(2048, 2048);
      Object.assign(sun.shadow.camera, { left: -60, right: 60, top: 60, bottom: -60, near: 1, far: 150 });
      scene.add(sun);

      this._ctx = {
        THREE, renderer, scene, camera, controls, stage, isLight,
        meshes: new Map(),      // key -> mesh principal (raycast + cor)
        pickables: [],
        groups: {},
        materials: new Map(),
        pulse: new Set(),
        tween: null,
        hoverKey: null,
        raycaster: new THREE.Raycaster(),
        pointer: new THREE.Vector2(),
        clock: new THREE.Clock(),
      };

      this._buildStore();
      this._buildChamberInterior('congelado');
      this._buildChamberInterior('resfriado');
      this._buildSelectionMarker();

      this._applyColors();
      this._bindStage();
      this._resize();
      this._resizeObs = new ResizeObserver(() => this._resize());
      this._resizeObs.observe(stage);

      this.setView('store', true);
      this.container.querySelector('#twin-loading')?.remove();
      this._loop();
    },

    _hasWebGL() {
      try {
        const c = document.createElement('canvas');
        return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
      } catch { return false; }
    },

    _showFallback(err) {
      const loading = this.container?.querySelector('#twin-loading');
      if (!loading) return;
      loading.innerHTML = `
        <div style="font-size:2.2rem">🧊</div>
        <strong>Não foi possível abrir o ambiente 3D</strong>
        <span>${esc(err?.message || err)}</span>
        <span style="opacity:.75">Os alertas ao lado continuam funcionando: use <em>↗ Abrir no módulo</em> para ir ao Piso de Loja ou às Câmaras.</span>`;
      loading.classList.add('twin__loading--error');
    },

    _mat(color, opts = {}) {
      const { THREE, materials } = this._ctx;
      const key = `${color}|${opts.opacity ?? 1}|${opts.emissive ?? 0.12}`;
      if (!materials.has(key)) {
        const m = new THREE.MeshStandardMaterial({
          color, roughness: 0.55, metalness: 0.1,
          emissive: new THREE.Color(color), emissiveIntensity: opts.emissive ?? 0.12,
          transparent: (opts.opacity ?? 1) < 1, opacity: opts.opacity ?? 1,
        });
        m.userData.baseEmissive = opts.emissive ?? 0.12;
        materials.set(key, m);
      }
      return materials.get(key);
    },

    _label(text, { size = 0.9, color = '#ffffff', bg = 'rgba(15,23,42,0.85)', flat = false } = {}) {
      const { THREE } = this._ctx;
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const font = 'bold 56px Outfit, system-ui, sans-serif';
      ctx.font = font;
      const w = Math.ceil(ctx.measureText(text).width) + 48;
      canvas.width = w; canvas.height = 88;
      ctx.font = font;
      if (bg) {
        ctx.fillStyle = bg;
        if (ctx.roundRect) { ctx.beginPath(); ctx.roundRect(0, 0, w, 88, 20); ctx.fill(); }
        else ctx.fillRect(0, 0, w, 88);
      }
      ctx.fillStyle = color; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(text, w / 2, 46);
      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = 4;
      const aspect = w / 88;
      if (flat) {
        const mesh = new THREE.Mesh(new THREE.PlaneGeometry(size * aspect, size), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }));
        mesh.rotation.x = -Math.PI / 2;
        return mesh;
      }
      const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false }));
      sprite.scale.set(size * aspect, size, 1);
      return sprite;
    },

    _register(key, mesh) {
      mesh.userData.key = key;
      this._ctx.meshes.set(key, mesh);
      this._ctx.pickables.push(mesh);
    },

    _buildStore() {
      const { THREE, scene, isLight } = this._ctx;
      const g = new THREE.Group();
      g.name = 'store';
      this._ctx.groups.store = g;
      scene.add(g);

      // piso
      const floor = new THREE.Mesh(new THREE.PlaneGeometry(70, 46), new THREE.MeshStandardMaterial({ color: isLight ? 0xe2e8f0 : 0x161029, roughness: 0.95 }));
      floor.rotation.x = -Math.PI / 2;
      floor.position.set(0, 0, 0);
      floor.receiveShadow = true;
      g.add(floor);
      const grid = new THREE.GridHelper(70, 35, isLight ? 0x94a3b8 : 0x3b2f63, isLight ? 0xcbd5e1 : 0x241a42);
      grid.position.y = 0.01;
      g.add(grid);

      const F = LAYOUT.freezer;
      const bodyGeo = new THREE.BoxGeometry(F.w, F.h, F.d);
      const glassGeo = new THREE.BoxGeometry(F.w * 0.92, 0.06, F.d * 0.85);
      const glassMat = new THREE.MeshStandardMaterial({ color: 0xbae6fd, transparent: true, opacity: 0.35, roughness: 0.1, metalness: 0.3 });      // Materiais compartilhados para as Geladeiras Verticais / Expositores em "L"
      const darkFrameMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.6, metalness: 0.4 });
      const canopyMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.3, metalness: 0.5 });
      const interiorShelfMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.2, metalness: 0.7 });
      const geladeiraGlassMat = new THREE.MeshStandardMaterial({ color: 0xdbeafe, transparent: true, opacity: 0.22, roughness: 0.1, metalness: 0.3 });
      const ledMat = new THREE.MeshBasicMaterial({ color: 0x67e8f9 });

      // Paleta vibrante para os produtos internos nas prateleiras dos módulos
      const prodColors = [0xef4444, 0x3b82f6, 0x10b981, 0xf59e0b, 0x8b5cf6, 0xec4899, 0x14b8a6, 0xf97316, 0xffffff];
      const prodMats = prodColors.map(c => new THREE.MeshStandardMaterial({ color: c, roughness: 0.6 }));

      // Dimensões dos módulos colados (formando uma linha contínua perfeita em "L")
      const GW = 1.02; // largura de cada módulo (1.02m)
      const GD = 0.85; // profundidade
      const G_baseH = 0.16;
      const G_canopyH = 0.22;
      const G_bodyH = 1.84;
      const G_totalH = G_baseH + G_bodyH + G_canopyH; // 2.22m

      const gBodyGeo = new THREE.BoxGeometry(GW * 0.99, G_bodyH, GD * 0.98);
      const gDoorGeo = new THREE.BoxGeometry(GW * 0.96, G_bodyH * 0.88, 0.03);
      const gCanopyGeo = new THREE.BoxGeometry(GW, G_canopyH, GD);
      const gBaseGeo = new THREE.BoxGeometry(GW, G_baseH, GD);
      const gShelfGeo = new THREE.BoxGeometry(GW * 0.92, 0.025, GD * 0.72);

      // Função construtora de cada módulo colado (com produtos visíveis e zero Z-fighting)
      const buildGeladeira = (e, slot) => {
        const group = new THREE.Group();
        group.position.set(slot.x, 0, slot.z);
        group.rotation.y = slot.rotY;

        // 1. Rodapé (base de aço escuro: y de 0 a 0.16)
        const base = new THREE.Mesh(gBaseGeo, darkFrameMat);
        base.position.set(0, G_baseH / 2, 0);
        base.receiveShadow = true;
        group.add(base);

        // 2. Gabinete principal com a cor semafórica de validade (y de 0.16 a 2.00)
        const body = new THREE.Mesh(gBodyGeo, this._mat(SEV_META[SEV.EMPTY].color));
        body.position.set(0, G_baseH + G_bodyH / 2, 0);
        body.castShadow = true;
        body.receiveShadow = true;
        group.add(body);
        this._register(e.key, body);

        // 3. Testeira superior chanfrada estritamente no topo (y de 2.00 a 2.22 - ZERO sobreposição!)
        const canopy = new THREE.Mesh(gCanopyGeo, canopyMat);
        canopy.position.set(0, G_baseH + G_bodyH + G_canopyH / 2, 0);
        group.add(canopy);

        // Faixa de LED superior
        const ledStrip = new THREE.Mesh(new THREE.BoxGeometry(GW * 0.92, 0.04, 0.03), ledMat);
        ledStrip.position.set(0, G_baseH + G_bodyH + G_canopyH / 2, GD / 2 + 0.015);
        group.add(ledStrip);

        // Prateleiras internas com produtos empilhados visíveis (estilo gôndola/geladeira expositora)
        [0.42, 0.86, 1.30].forEach((sy, lvlIdx) => {
          const shelf = new THREE.Mesh(gShelfGeo, interiorShelfMat);
          shelf.position.set(0, G_baseH + sy, 0);
          shelf.receiveShadow = true;
          group.add(shelf);

          // Testeira frontal colorida da prateleira (porta-preço)
          const trim = new THREE.Mesh(new THREE.BoxGeometry(GW * 0.92, 0.03, 0.015), this._mat(SEV_META[SEV.EMPTY].color));
          trim.position.set(0, G_baseH + sy - 0.01, GD * 0.72 / 2);
          group.add(trim);

          // Caixinhas e pacotes de produtos coloridos
          [-0.28, 0, 0.28].forEach((px, pIdx) => {
            const pMat = prodMats[(e.num + lvlIdx * 2 + pIdx) % prodMats.length];
            const pHeight = 0.22 + (pIdx % 2) * 0.05;
            const prodBox = new THREE.Mesh(new THREE.BoxGeometry(0.24, pHeight, GD * 0.52), pMat);
            prodBox.position.set(px, G_baseH + sy + pHeight / 2 + 0.012, 0);
            prodBox.castShadow = true;
            group.add(prodBox);

            // Etiqueta frontal branca no produto
            const tagMesh = new THREE.Mesh(new THREE.BoxGeometry(0.16, pHeight * 0.45, 0.01), new THREE.MeshBasicMaterial({ color: 0xffffff }));
            tagMesh.position.set(px, G_baseH + sy + pHeight / 2 + 0.012, GD * 0.52 / 2 + 0.006);
            group.add(tagMesh);
          });
        });

        // Porta de vidro frontal translúcida cristalina
        const glassDoor = new THREE.Mesh(gDoorGeo, geladeiraGlassMat);
        glassDoor.position.set(0, G_baseH + G_bodyH * 0.52, GD / 2 + 0.015);
        group.add(glassDoor);

        // Puxador vertical metálico na porta
        const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.42, 8), darkFrameMat);
        handle.position.set(0.18, G_baseH + G_bodyH * 0.5, GD / 2 + 0.035);
        group.add(handle);

        // Etiqueta com o número do freezer no topo (01 a 35)
        const label = this._label(pad2(e.num), { size: 0.55 });
        label.position.set(0, G_totalH + 0.38, 0);
        group.add(label);

        g.add(group);
      };

      this.model.sectors.forEach(sector => {
        const conf = LAYOUT.store[sector];
        const list = [...this.model.entities.values()].filter(e => e.type === 'freezer' && e.sector === sector).sort((a, b) => a.num - b.num);

        if (sector === 'acougue') {
          // ── AÇOUGUE: ILHAS DE FREEZERS HORIZONTAIS TRADICIONAIS (NÃO CONVERTIDAS EM GELADEIRAS) ──
          list.forEach((e, i) => {
            const row = Math.floor(i / conf.perRow);
            const col = i % conf.perRow;
            const x = conf.origin.x + col * (F.w + F.gapX) + F.w / 2;
            const z = conf.origin.z + row * (F.d + F.rowGap) + F.d / 2;

            const body = new THREE.Mesh(bodyGeo, this._mat(SEV_META[SEV.EMPTY].color));
            body.position.set(x, F.h / 2, z);
            body.castShadow = true; body.receiveShadow = true;
            g.add(body);
            this._register(e.key, body);

            const glass = new THREE.Mesh(glassGeo, glassMat);
            glass.position.set(x, F.h + 0.03, z);
            g.add(glass);

            const label = this._label(pad2(e.num), { size: 0.55 });
            label.position.set(x, F.h + 0.6, z);
            g.add(label);
          });

          const rows = Math.ceil(list.length / conf.perRow);
          const title = this._label(conf.label, { size: 1.3, flat: true, bg: null, color: isLight ? '#991b1b' : '#f87171' });
          title.position.set(conf.origin.x + (conf.perRow * (F.w + F.gapX)) / 2, 0.03, conf.origin.z + rows * (F.d + F.rowGap) + 0.6);
          g.add(title);

        } else if (sector === 'pereciveis') {
          // ── PERECÍVEIS: MÓDULOS COLADOS AO REDOR FORMANDO UM "L" CONTÍNUO (35 UNIDADES) ──
          // Braço Norte (fundo): 21 módulos colados lado a lado (x de 4.31 a 24.71, z = 0.8, virados para o Sul)
          // Braço Leste (lateral direita): 14 módulos colados lado a lado (x = 24.8, z de 1.74 a 15.00, virados para o Oeste)
          // As unidades se encontram perfeitamente no canto formando um "L" contínuo sem vãos!
          const lPerimeterSlots = [];

          // Braço Norte do L: 21 módulos (índices 0 a 20 -> unidades 01 a 21)
          for (let k = 0; k < 21; k++) {
            lPerimeterSlots.push({
              x: 4.31 + k * GW,
              z: 0.8,
              rotY: 0
            });
          }

          // Braço Leste do L: 14 módulos (índices 21 a 34 -> unidades 22 a 35)
          for (let k = 0; k < 14; k++) {
            lPerimeterSlots.push({
              x: 24.8,
              z: 1.74 + k * GW,
              rotY: -Math.PI / 2
            });
          }

          list.forEach((e, i) => {
            const slot = lPerimeterSlots[i] || { x: 4.31 + (i % 10) * 1.5, z: 2.0 + Math.floor(i / 10) * 2.0, rotY: 0 };
            buildGeladeira(e, slot);
          });

          // ── GÔNDOLAS CENTRAIS DE PERECÍVEIS (NO CENTRO, DENTRO DO "L") ──
          // Gôndola 01 (Norte): Mercearia / Laticínios Secos / Queijos
          const gondola1 = this._createGondola({
            x: 13.5,
            z: 5.4,
            length: 13.0,
            depth: 1.35,
            height: 1.68,
            label: '🥗 GÔNDOLA 01 · LATICÍNIOS & QUEIJOS',
            isLight
          });
          g.add(gondola1);

          // Gôndola 02 (Sul): Mercearia de Perecíveis / Frios Secos / Matinais
          const gondola2 = this._createGondola({
            x: 13.5,
            z: 10.4,
            length: 13.0,
            depth: 1.35,
            height: 1.68,
            label: '🥗 GÔNDOLA 02 · MERCEARIA & MATINAIS',
            isLight
          });
          g.add(gondola2);

          // Corredor central com letreiro oficial no piso entre as gôndolas
          const title = this._label('🥗 PERECÍVEIS', { size: 1.4, flat: true, bg: null, color: isLight ? '#065f46' : '#6ee7b7' });
          title.position.set(13.5, 0.03, 7.9);
          g.add(title);
        }
      });

      // câmaras (blocos clicáveis no fundo da loja)
      Object.entries(LAYOUT.chambersInStore).forEach(([chKey, c]) => {
        const e = this.model.entities.get(`ch:${chKey}`);
        const box = new THREE.Mesh(new THREE.BoxGeometry(c.w, c.h, c.d), this._mat(SEV_META[SEV.EMPTY].color, { opacity: 0.55 }));
        box.position.set(c.x, c.h / 2, c.z);
        box.castShadow = true;
        g.add(box);
        this._register(e.key, box);

        const edges = new THREE.LineSegments(new THREE.EdgesGeometry(box.geometry), new THREE.LineBasicMaterial({ color: 0xe0f2fe, transparent: true, opacity: 0.6 }));
        edges.position.copy(box.position);
        g.add(edges);

        const label = this._label(`❄️ ${e.label} · ${e.temp}`, { size: 0.9 });
        label.position.set(c.x, c.h + 0.9, c.z);
        g.add(label);
      });

      // Equipe operacional e empilhadeiras em atividade na loja
      this._buildStoreActivity(g);
    },

    _chamberRackPositions(chKey) {
      const conf = LAYOUT.chamberInterior[chKey];
      const R = LAYOUT.rack;
      const out = new Map(); // column -> {x, z, facing}
      conf.rows.forEach((cols, rowIdx) => {
        const width = cols.length * R.colW;
        const z = conf.rows.length === 1 ? 0 : (rowIdx === 0 ? -R.aisle / 2 - R.palletD / 2 : R.aisle / 2 + R.palletD / 2);
        const facing = rowIdx === 0 ? 1 : -1; // +z ou -z (corredor)
        cols.forEach((col, i) => {
          // fileira de trás (facing -1) é espelhada para manter E/D coerente para quem está no corredor
          const idx = facing === 1 ? i : cols.length - 1 - i;
          out.set(col, { x: conf.offset.x - width / 2 + idx * R.colW + R.colW / 2, z: conf.offset.z + z, facing });
        });
      });
      return out;
    },

    _buildChamberInterior(chKey) {
      const { THREE, scene, isLight } = this._ctx;
      const conf = LAYOUT.chamberInterior[chKey];
      const R = LAYOUT.rack;
      const g = new THREE.Group();
      g.name = chKey;
      g.visible = false;
      this._ctx.groups[chKey] = g;
      scene.add(g);

      const positions = this._chamberRackPositions(chKey);
      const maxCols = Math.max(...conf.rows.map(r => r.length));
      const floorW = maxCols * R.colW + 6;
      const floorD = conf.rows.length * (R.palletD + 1) + R.aisle + 6;

      const floor = new THREE.Mesh(new THREE.PlaneGeometry(floorW, floorD), new THREE.MeshStandardMaterial({ color: isLight ? 0xdbeafe : (chKey === 'congelado' ? 0x1e1b4b : 0x0c2340), roughness: 0.4, metalness: 0.2 }));
      floor.rotation.x = -Math.PI / 2;
      floor.position.set(conf.offset.x, 0, conf.offset.z);
      floor.receiveShadow = true;
      g.add(floor);

      const frameMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.7, roughness: 0.35 });
      const beamMat = new THREE.MeshStandardMaterial({ color: 0xf97316, metalness: 0.4, roughness: 0.5 });
      const woodMat = new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.9 });
      const postGeo = new THREE.BoxGeometry(0.08, conf.levels * R.levelH + 0.2, 0.08);
      const beamGeo = new THREE.BoxGeometry(R.colW, 0.08, 0.08);
      const palletGeo = new THREE.BoxGeometry(R.palletW, R.palletH, R.palletD);
      const baseGeo = new THREE.BoxGeometry(R.palletW, 0.12, R.palletD);
      const emptyGeo = new THREE.BoxGeometry(R.palletW, R.palletH * 0.92, R.palletD);

      positions.forEach((p, col) => {
        const colEntity = this.model.entities.get(`col:${chKey}:${col}`);
        if (!colEntity) return;
        // montantes
        [-1, 1].forEach(sx => [-1, 1].forEach(sz => {
          const post = new THREE.Mesh(postGeo, frameMat);
          post.position.set(p.x + sx * (R.colW / 2 - 0.04), postGeo.parameters.height / 2, p.z + sz * (R.palletD / 2));
          g.add(post);
        }));
        for (let lvl = 1; lvl <= conf.levels; lvl++) {
          const y = (lvl - 1) * R.levelH;
          [-1, 1].forEach(sz => {
            const beam = new THREE.Mesh(beamGeo, beamMat);
            beam.position.set(p.x, y + 0.06, p.z + sz * (R.palletD / 2));
            g.add(beam);
          });
          ['E', 'D'].forEach(pos => {
            const key = `slot:${chKey}:${col}:${lvl}:${pos}`;
            const e = this.model.entities.get(key);
            // Esquerda/Direita do ponto de vista de quem está no corredor olhando para o rack
            const side = (pos === 'E' ? -1 : 1) * p.facing;
            const x = p.x + side * (R.colW / 4);
            const base = new THREE.Mesh(baseGeo, woodMat);
            base.position.set(x, y + 0.16, p.z);
            g.add(base);
            const mesh = new THREE.Mesh(e.products.length ? palletGeo : emptyGeo, this._mat(SEV_META[SEV.EMPTY].color, { opacity: 0.18 }));
            mesh.position.set(x, y + 0.22 + R.palletH / 2, p.z);
            mesh.castShadow = true;
            g.add(mesh);
            this._register(key, mesh);
          });
        }
        // número da coluna
        const label = this._label(`C${pad2(col)}`, { size: 0.7, bg: colEntity.scheduled ? 'rgba(16,185,129,0.9)' : 'rgba(15,23,42,0.85)' });
        label.position.set(p.x, conf.levels * R.levelH + 0.7, p.z);
        g.add(label);
        // marcador invisível da coluna (para foco da câmera)
        const anchor = new THREE.Object3D();
        anchor.position.set(p.x, (conf.levels * R.levelH) / 2, p.z);
        anchor.userData.key = colEntity.key;
        g.add(anchor);
        this._ctx.meshes.set(colEntity.key, anchor);
      });

      const title = this._label(`❄️ ${CHAMBER_NAMES[chKey]}`, { size: 1.4, flat: true, bg: null, color: isLight ? '#1e3a8a' : '#c7d2fe' });
      title.position.set(conf.offset.x, 0.03, conf.offset.z + floorD / 2 - 1.5);
      g.add(title);

      // Operador trabalhando dentro do corredor da câmara (ex: ORLANDO O MELHOR na Câmara Congelada)
      const chamberWorker = this._createWorker({
        name: chKey === 'congelado' ? 'ORLANDO O MELHOR' : 'CONFERENTE RESFRIADOS',
        x: conf.offset.x - 1.2,
        z: conf.offset.z,
        rotY: chKey === 'congelado' ? 0.3 : Math.PI * 0.5,
        role: chKey === 'congelado' ? 'thermal' : 'clipboard',
        vestColor: chKey === 'congelado' ? 0x0284c7 : 0x84cc16,
        helmetColor: 0xffffff,
        waypoints: [
          { x: conf.offset.x - 1.2, z: conf.offset.z, facingY: 0.3 },
          { x: conf.offset.x + 5.0, z: conf.offset.z, facingY: -Math.PI * 0.4 },
          { x: conf.offset.x - 5.5, z: conf.offset.z, facingY: Math.PI * 0.5 }
        ],
        speed: 0.95
      });
      g.add(chamberWorker);
    },

    // ════════════════════════════════════════════════════════════════════════
    // 4. ELEMENTOS OPERACIONAIS (BONECOS E EMPILHADEIRAS 3D)
    // ════════════════════════════════════════════════════════════════════════

    _buildStoreActivity(g) {
      if (!this._ctx) return;
      this._ctx.animatedActors = this._ctx.animatedActors || [];

      // ── 1. DUAS EMPILHADEIRAS INDUSTRIAIS COM MANOBRA PERIÓDICA ──
      // RAFAEL: Manobra entre o corredor central e a entrada da Câmara Congelada
      const fork1 = this._createForklift({
        x: -3.2, z: -4.5, rotY: -0.35,
        color: 0xf59e0b, counterColor: 0x1e293b,
        hasPallet: true, forkHeight: 0.35,
        driverName: 'RAFAEL', driverHelmet: 0xffffff,
        waypoints: [
          { x: -3.2, z: -4.5, facingY: -0.35 },
          { x: -8.0, z: -4.5, facingY: -Math.PI * 0.5 },
          { x: -5.5, z: -2.8, facingY: 0.2 }
        ],
        speed: 1.3
      });
      g.add(fork1);

      // GILMAR: Manobra entre o corredor lateral e a Câmara Resfriada
      const fork2 = this._createForklift({
        x: 18.0, z: -4.0, rotY: 1.15,
        color: 0x0284c7, counterColor: 0x0f172a,
        hasPallet: false, forkHeight: 0.65,
        driverName: 'GILMAR', driverHelmet: 0xeab308,
        waypoints: [
          { x: 18.0, z: -4.0, facingY: 1.15 },
          { x: 18.0, z: 0.5,  facingY: Math.PI * 0.5 },
          { x: 14.5, z: -2.5, facingY: -0.4 }
        ],
        speed: 1.4
      });
      g.add(fork2);

      // ── 2. EQUIPE OPERACIONAL COM ROTAS DE RONDA E INSPEÇÃO PERIÓDICA ──
      // FELIPE: Coordenador andando pelo corredor central fiscalizando ambos os lados
      const felipe = this._createWorker({
        name: 'FELIPE',
        x: 0.5, z: 2.2, rotY: -0.5,
        role: 'leader',
        vestColor: 0xf97316, helmetColor: 0xffffff,
        waypoints: [
          { x: 0.5, z: 2.2,  facingY: -Math.PI * 0.4 },
          { x: 0.5, z: 6.5,  facingY: Math.PI * 0.4 },
          { x: 0.5, z: -1.2, facingY: -Math.PI * 0.9 }
        ],
        speed: 0.95
      });
      g.add(felipe);

      // JEFFERSON: Puxando transpaleteira manual ao longo do corredor cruzado
      const jefferson = this._createWorker({
        name: 'JEFFERSON',
        x: 4.8, z: -3.8, rotY: Math.PI * 0.5,
        role: 'pallet_jack',
        vestColor: 0x84cc16, helmetColor: 0xeab308,
        waypoints: [
          { x: 4.8, z: -3.8, facingY: Math.PI * 0.5 },
          { x: 9.5, z: -3.8, facingY: Math.PI * 0.5 },
          { x: 2.5, z: -3.8, facingY: -Math.PI * 0.5 }
        ],
        speed: 0.85
      });
      g.add(jefferson);

      // HUGO: Conferente andando e checando os acessos da Câmara Congelada
      const hugo = this._createWorker({
        name: 'HUGO',
        x: -11.5, z: -5.8, rotY: Math.PI * 0.95,
        role: 'thermal',
        vestColor: 0x0284c7, helmetColor: 0xffffff,
        waypoints: [
          { x: -11.5, z: -5.8, facingY: Math.PI * 0.95 },
          { x: -16.0, z: -5.8, facingY: Math.PI },
          { x: -7.5,  z: -5.8, facingY: Math.PI * 0.8 }
        ],
        speed: 0.9
      });
      g.add(hugo);

      // JUARES: Conferente inspecionando o recebimento em frente à Câmara Resfriada
      const juares = this._createWorker({
        name: 'JUARES',
        x: 11.2, z: -5.8, rotY: Math.PI * 0.9,
        role: 'clipboard',
        vestColor: 0x84cc16, helmetColor: 0xffffff,
        waypoints: [
          { x: 11.2, z: -5.8, facingY: Math.PI * 0.9 },
          { x: 7.0,  z: -5.8, facingY: Math.PI * 0.75 },
          { x: 13.5, z: -5.8, facingY: Math.PI }
        ],
        speed: 0.9
      });
      g.add(juares);

      // IMPERADOR: Abastecedor caminhando com caixa entre as gôndolas de Perecíveis
      const imperador = this._createWorker({
        name: 'IMPERADOR',
        x: 10.0, z: 2.4, rotY: 0.3,
        role: 'box',
        vestColor: 0xf97316, helmetColor: 0xeab308,
        waypoints: [
          { x: 10.0, z: 2.4, facingY: 0.3 },
          { x: 15.5, z: 2.4, facingY: Math.PI * 0.4 },
          { x: 5.5,  z: 2.4, facingY: -Math.PI * 0.3 }
        ],
        speed: 0.9
      });
      g.add(imperador);

      // LIU: Conferente auditando validades ao longo do corredor do Açougue
      const liu = this._createWorker({
        name: 'LIU',
        x: -10.0, z: 2.4, rotY: -Math.PI * 0.4,
        role: 'clipboard',
        vestColor: 0x84cc16, helmetColor: 0xeab308,
        waypoints: [
          { x: -10.0, z: 2.4, facingY: -Math.PI * 0.4 },
          { x: -15.5, z: 2.4, facingY: -Math.PI * 0.6 },
          { x: -5.5,  z: 2.4, facingY: -Math.PI * 0.3 }
        ],
        speed: 0.9
      });
      g.add(liu);

      // ISABEL: Repositora circulando na fileira intermediária de Perecíveis
      const isabel = this._createWorker({
        name: 'ISABEL',
        x: 14.5, z: 6.1, rotY: -Math.PI * 0.35,
        role: 'box',
        vestColor: 0x84cc16, helmetColor: 0xffffff,
        waypoints: [
          { x: 14.5, z: 6.1, facingY: -Math.PI * 0.35 },
          { x: 9.0,  z: 6.1, facingY: -Math.PI * 0.5 },
          { x: 19.5, z: 6.1, facingY: Math.PI * 0.5 }
        ],
        speed: 0.92
      });
      g.add(isabel);

      // ROSE: Auditora de carnes conferindo gôndolas na fileira do Açougue
      const rose = this._createWorker({
        name: 'ROSE',
        x: -7.5, z: 6.1, rotY: Math.PI * 0.3,
        role: 'clipboard',
        vestColor: 0xf97316, helmetColor: 0xffffff,
        waypoints: [
          { x: -7.5,  z: 6.1, facingY: Math.PI * 0.3 },
          { x: -13.5, z: 6.1, facingY: -Math.PI * 0.3 },
          { x: -4.0,  z: 6.1, facingY: Math.PI * 0.5 }
        ],
        speed: 0.92
      });
      g.add(rose);
    },


    // ════════════════════════════════════════════════════════════════════════
    // 3.1 GÔNDOLAS DE SUPERMERCADO (PERECÍVEIS / MERCEARIA)
    // ════════════════════════════════════════════════════════════════════════

    _createGondola({ x = 0, z = 0, length = 13.5, depth = 1.35, height = 1.68, label = '', isLight = false } = {}) {
      const { THREE } = this._ctx;
      const group = new THREE.Group();
      group.position.set(x, 0, z);

      // Materiais da estrutura da gôndola de aço
      const rackSteelMat = new THREE.MeshStandardMaterial({
        color: isLight ? 0x64748b : 0x1e293b,
        metalness: 0.7,
        roughness: 0.35
      });
      const shelfSteelMat = new THREE.MeshStandardMaterial({
        color: isLight ? 0xe2e8f0 : 0x334155,
        metalness: 0.6,
        roughness: 0.4
      });
      const trimRedMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.4 });
      const trimYellowMat = new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.4 });
      const trimGreenMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.4 });
      const trimBlueMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.4 });

      // Base contínua de aço (rodapé inferior)
      const baseMesh = new THREE.Mesh(new THREE.BoxGeometry(length, 0.16, depth), rackSteelMat);
      baseMesh.position.set(0, 0.08, 0);
      baseMesh.castShadow = true;
      baseMesh.receiveShadow = true;
      group.add(baseMesh);

      // Painel central / divisória da gôndola (spine)
      const spineMesh = new THREE.Mesh(new THREE.BoxGeometry(length, height, 0.08), rackSteelMat);
      spineMesh.position.set(0, height / 2, 0);
      spineMesh.castShadow = true;
      group.add(spineMesh);

      // Colunas verticais cremalheiras ao longo do comprimento
      const numCols = Math.max(3, Math.floor(length / 2.2));
      const colStep = (length - 0.3) / (numCols - 1);
      for (let c = 0; c < numCols; c++) {
        const colX = -length / 2 + 0.15 + c * colStep;
        const colPost = new THREE.Mesh(new THREE.BoxGeometry(0.06, height + 0.04, depth * 0.95), rackSteelMat);
        colPost.position.set(colX, height / 2, 0);
        group.add(colPost);
      }

      // Níveis de prateleiras suspensas em ambos os lados (face frontal e posterior)
      const shelfLevels = [
        { y: 0.20, shelfDepth: 0.54, trimMat: trimRedMat },
        { y: 0.62, shelfDepth: 0.48, trimMat: trimYellowMat },
        { y: 1.04, shelfDepth: 0.44, trimMat: trimGreenMat },
        { y: 1.44, shelfDepth: 0.40, trimMat: trimBlueMat }
      ];

      // Paleta vibrante para os produtos nas prateleiras
      const prodColors = [
        0xef4444, 0x3b82f6, 0x10b981, 0xf59e0b, 0x8b5cf6,
        0xec4899, 0x14b8a6, 0xf97316, 0xffffff, 0xd97706
      ];
      const prodMaterials = prodColors.map(c => new THREE.MeshStandardMaterial({ color: c, roughness: 0.6 }));

      shelfLevels.forEach((lvl, lvlIdx) => {
        [-1, 1].forEach(side => {
          const sideZ = side * (lvl.shelfDepth / 2 + 0.04);

          // Bandeja / Prateleira de aço
          const shelf = new THREE.Mesh(new THREE.BoxGeometry(length - 0.05, 0.025, lvl.shelfDepth), shelfSteelMat);
          shelf.position.set(0, lvl.y, sideZ);
          shelf.castShadow = true;
          shelf.receiveShadow = true;
          group.add(shelf);

          // Testeira frontal colorida (porta-preço de acrílico)
          const trim = new THREE.Mesh(new THREE.BoxGeometry(length - 0.05, 0.035, 0.015), lvl.trimMat);
          trim.position.set(0, lvl.y - 0.01, sideZ + side * (lvl.shelfDepth / 2 + 0.008));
          group.add(trim);

          // Fileiras de produtos organizados nesta prateleira
          const prodCount = Math.floor((length - 0.6) / 0.45);
          for (let p = 0; p < prodCount; p++) {
            const px = -length / 2 + 0.35 + p * 0.44;
            const pMat = prodMaterials[(p + lvlIdx * 3 + (side > 0 ? 5 : 0)) % prodMaterials.length];
            const pHeight = 0.22 + (p % 3) * 0.05;
            const pWidth = 0.36;
            const pDepth = lvl.shelfDepth * 0.75;

            // Caixa ou pacote de produto
            const prodBox = new THREE.Mesh(new THREE.BoxGeometry(pWidth, pHeight, pDepth), pMat);
            prodBox.position.set(px, lvl.y + pHeight / 2 + 0.015, sideZ);
            prodBox.castShadow = true;
            group.add(prodBox);

            // Etiqueta frontal branca na caixinha
            const tagMesh = new THREE.Mesh(
              new THREE.BoxGeometry(pWidth * 0.65, pHeight * 0.4, 0.01),
              new THREE.MeshBasicMaterial({ color: 0xffffff })
            );
            tagMesh.position.set(px, lvl.y + pHeight / 2 + 0.015, sideZ + side * (pDepth / 2 + 0.006));
            group.add(tagMesh);
          }
        });
      });

      // Pontas de Gôndola (Endcaps) nas duas extremidades
      [-1, 1].forEach(endSide => {
        const endX = endSide * (length / 2 + 0.32);
        const endcapDepth = depth * 0.95;
        const endcapWidth = 0.60;

        // Base da ponta
        const endBase = new THREE.Mesh(new THREE.BoxGeometry(endcapWidth, 0.16, endcapDepth), rackSteelMat);
        endBase.position.set(endX, 0.08, 0);
        group.add(endBase);

        // Painel de fundo da ponta
        const endBack = new THREE.Mesh(new THREE.BoxGeometry(0.06, height, endcapDepth), rackSteelMat);
        endBack.position.set(endX - endSide * (endcapWidth / 2 - 0.03), height / 2, 0);
        group.add(endBack);

        // Prateleiras da ponta de gôndola
        shelfLevels.forEach((lvl, idx) => {
          const eShelf = new THREE.Mesh(new THREE.BoxGeometry(endcapWidth * 0.92, 0.025, endcapDepth * 0.9), shelfSteelMat);
          eShelf.position.set(endX, lvl.y, 0);
          group.add(eShelf);

          // Produtos em destaque na ponta de gôndola
          [-0.32, 0, 0.32].forEach((pz, pIdx) => {
            const featMat = prodMaterials[(pIdx * 2 + idx + (endSide > 0 ? 4 : 1)) % prodMaterials.length];
            const featBox = new THREE.Mesh(new THREE.BoxGeometry(endcapWidth * 0.75, 0.26, 0.26), featMat);
            featBox.position.set(endX, lvl.y + 0.14, pz);
            featBox.castShadow = true;
            group.add(featBox);
          });
        });

        // Plaquinha testeira promocional no topo da ponta de gôndola
        const promoTag = this._label(endSide < 0 ? '✨ OFERTAS' : '🥗 DESTAQUE', {
          size: 0.42,
          color: '#fef08a',
          bg: 'rgba(180, 83, 9, 0.92)'
        });
        promoTag.position.set(endX, height + 0.35, 0);
        group.add(promoTag);
      });

      // Placa identificadora no topo da gôndola (se houver rótulo)
      if (label) {
        const sign = this._label(label, {
          size: 0.48,
          color: '#ffffff',
          bg: isLight ? 'rgba(30, 41, 59, 0.95)' : 'rgba(15, 23, 42, 0.92)'
        });
        sign.position.set(0, height + 0.42, 0);
        group.add(sign);
      }

      return group;
    },

    _createForklift({ x = 0, z = 0, rotY = 0, color = 0xf59e0b, counterColor = 0x1e293b, hasPallet = false, forkHeight = 0.35, driverName = '', driverHelmet = 0xffffff, waypoints = null, speed = 1.3 } = {}) {
      const { THREE } = this._ctx;
      const group = new THREE.Group();
      group.position.set(x, 0, z);
      group.rotation.y = rotY;

      const bodyMat = new THREE.MeshStandardMaterial({ color, metalness: 0.3, roughness: 0.4 });
      const counterMat = new THREE.MeshStandardMaterial({ color: counterColor, metalness: 0.5, roughness: 0.5 });
      const blackSteelMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.7, roughness: 0.3 });
      const rubberMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.9 });
      const steelMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.8, roughness: 0.25 });
      const lightMat = new THREE.MeshStandardMaterial({ color: 0xffedd5, emissive: 0xfbbf24, emissiveIntensity: 0.7 });
      const beaconMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xf59e0b, emissiveIntensity: 1.0, transparent: true, opacity: 0.85 });

      // 1. Chassi principal
      const chassis = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.65, 1.8), bodyMat);
      chassis.position.set(0, 0.52, -0.1);
      chassis.castShadow = true; chassis.receiveShadow = true;
      group.add(chassis);

      // Contrapeso traseiro arredondado
      const counterWeight = new THREE.Mesh(new THREE.BoxGeometry(1.22, 0.68, 0.6), counterMat);
      counterWeight.position.set(0, 0.54, -1.05);
      counterWeight.castShadow = true;
      group.add(counterWeight);

      // 2. Rodas industriais (4 rodas)
      const wheelGeo = new THREE.CylinderGeometry(0.26, 0.26, 0.22, 16);
      const hubGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.23, 12);
      const wheelMeshes = [];
      const wheelPos = [
        [-0.58, 0.26, 0.55],  // dianteira esquerda
        [0.58, 0.26, 0.55],   // dianteira direita
        [-0.54, 0.26, -0.95], // traseira esquerda
        [0.54, 0.26, -0.95],  // traseira direita
      ];
      wheelPos.forEach(([wx, wy, wz]) => {
        const wheel = new THREE.Mesh(wheelGeo, rubberMat);
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(wx, wy, wz);
        wheel.castShadow = true;
        group.add(wheel);
        wheelMeshes.push(wheel);

        const hub = new THREE.Mesh(hubGeo, blackSteelMat);
        hub.rotation.z = Math.PI / 2;
        hub.position.set(wx, wy, wz);
        group.add(hub);
      });

      // 3. Cabine / Gaiola de Proteção (ROPS)
      const postGeo = new THREE.BoxGeometry(0.06, 1.35, 0.06);
      const cagePosts = [
        [-0.52, 1.48, 0.45],
        [0.52, 1.48, 0.45],
        [-0.52, 1.48, -0.75],
        [0.52, 1.48, -0.75]
      ];
      cagePosts.forEach(([px, py, pz]) => {
        const p = new THREE.Mesh(postGeo, blackSteelMat);
        p.position.set(px, py, pz);
        p.castShadow = true;
        group.add(p);
      });

      // Teto da gaiola com grade
      const roof = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.06, 1.3), blackSteelMat);
      roof.position.set(0, 2.15, -0.15);
      roof.castShadow = true;
      group.add(roof);

      // Giroflex / Warning Beacon no teto
      const beacon = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.14, 12), beaconMat);
      beacon.position.set(0, 2.25, -0.15);
      group.add(beacon);
      if (this._ctx.animatedActors) {
        this._ctx.animatedActors.push({ type: 'beacon', mesh: beacon, phase: Math.random() * Math.PI * 2 });
      }

      // Crachá flutuante com o nome do operador da empilhadeira
      if (driverName) {
        const forkTag = this._label(`🚜 ${driverName}`, { size: 0.46, color: '#fef08a', bg: 'rgba(15, 23, 42, 0.92)' });
        forkTag.position.set(0, 2.65, -0.15);
        group.add(forkTag);

        const bubbleSprite = this._createAgentBubbleSprite(driverName);
        if (bubbleSprite) {
          bubbleSprite.position.set(0, 3.15, -0.15);
          group.add(bubbleSprite);
          this._ctx.agentBubbles = this._ctx.agentBubbles || new Map();
          this._ctx.agentBubbles.set(driverName, bubbleSprite);
        }

        const hitMat = new THREE.MeshBasicMaterial({ visible: false });
        const hitMesh = new THREE.Mesh(new THREE.BoxGeometry(2.0, 2.6, 2.8), hitMat);
        hitMesh.position.set(0, 1.3, 0.3);
        hitMesh.userData = { key: 'agent:' + driverName };
        group.add(hitMesh);
        if (this._ctx) {
          this._ctx.pickables.push(hitMesh);
          this._ctx.meshes.set('agent:' + driverName, group);
        }
      }

      // Faróis dianteiros
      [-0.42, 0.42].forEach(fx => {
        const headLight = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.1, 0.08), lightMat);
        headLight.position.set(fx, 1.7, 0.48);
        group.add(headLight);
      });

      // Banco do operador
      const seat = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.45, 0.45), blackSteelMat);
      seat.position.set(0, 0.98, -0.35);
      group.add(seat);

      // Volante e coluna de direção
      const colDirection = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.5, 8), blackSteelMat);
      colDirection.position.set(0, 1.1, 0.15);
      colDirection.rotation.x = -Math.PI * 0.18;
      group.add(colDirection);

      const steerWheel = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.025, 8, 16), blackSteelMat);
      steerWheel.position.set(0, 1.28, 0.08);
      steerWheel.rotation.x = Math.PI * 0.32;
      group.add(steerWheel);

      // Operador sentado na empilhadeira
      const driverGroup = new THREE.Group();
      driverGroup.position.set(0, 1.05, -0.28);
      // Tronco do motorista
      const dTorso = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.42, 0.22), new THREE.MeshStandardMaterial({ color: 0x3b82f6 }));
      dTorso.position.y = 0.22;
      driverGroup.add(dTorso);
      // Colete refletivo
      const dVest = new THREE.Mesh(new THREE.BoxGeometry(0.40, 0.38, 0.24), new THREE.MeshStandardMaterial({ color: 0x84cc16 }));
      dVest.position.y = 0.22;
      driverGroup.add(dVest);
      // Cabeça e capacete
      const dHead = new THREE.Mesh(new THREE.SphereGeometry(0.10, 12, 12), new THREE.MeshStandardMaterial({ color: 0xfcd34d }));
      dHead.position.y = 0.52;
      driverGroup.add(dHead);
      const dHelmet = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.55), new THREE.MeshStandardMaterial({ color: driverHelmet }));
      dHelmet.position.y = 0.55;
      driverGroup.add(dHelmet);
      // Braços estendidos até o volante
      [-0.16, 0.16].forEach(ax => {
        const dArm = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.28, 0.08), new THREE.MeshStandardMaterial({ color: 0x3b82f6 }));
        dArm.position.set(ax, 0.25, 0.16);
        dArm.rotation.x = Math.PI * 0.35;
        driverGroup.add(dArm);
      });
      group.add(driverGroup);

      // 4. Torre de Elevação (Mast) e Garfos dianteiros
      const mastH = 2.2;
      const mastRailGeo = new THREE.BoxGeometry(0.08, mastH, 0.1);
      [-0.38, 0.38].forEach(mx => {
        const rail = new THREE.Mesh(mastRailGeo, steelMat);
        rail.position.set(mx, mastH / 2 + 0.1, 0.88);
        rail.castShadow = true;
        group.add(rail);
      });
      // Travessas da torre
      [0.6, 1.2, 1.8, 2.2].forEach(ty => {
        const cross = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.06, 0.06), steelMat);
        cross.position.set(0, ty, 0.88);
        group.add(cross);
      });

      // Carro porta-garfos (móvel conforme forkHeight)
      const carriage = new THREE.Group();
      carriage.position.set(0, forkHeight, 0.94);

      const carriagePlate = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.45, 0.06), blackSteelMat);
      carriagePlate.position.set(0, 0.22, 0);
      carriage.add(carriagePlate);

      // 2 Garfos de aço
      const forkGeo = new THREE.BoxGeometry(0.09, 0.04, 1.15);
      [-0.26, 0.26].forEach(fx => {
        const forkV = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.46, 0.05), steelMat);
        forkV.position.set(fx, 0.23, 0.04);
        carriage.add(forkV);
        const forkH = new THREE.Mesh(forkGeo, steelMat);
        forkH.position.set(fx, 0.02, 0.6);
        forkH.castShadow = true;
        carriage.add(forkH);
      });

      // Se tiver carga de palete e caixas na empilhadeira
      if (hasPallet) {
        const woodMat = new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.9 });
        const boxMat1 = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.85 });
        const boxMat2 = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.85 });

        // Palete de madeira
        const pallet = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.12, 1.05), woodMat);
        pallet.position.set(0, 0.1, 0.62);
        pallet.castShadow = true;
        carriage.add(pallet);

        // Caixas empilhadas no palete
        const boxes = [
          { x: -0.24, y: 0.32, z: 0.40, w: 0.45, h: 0.32, d: 0.42, mat: boxMat1 },
          { x: 0.24,  y: 0.32, z: 0.40, w: 0.45, h: 0.32, d: 0.42, mat: boxMat2 },
          { x: -0.24, y: 0.32, z: 0.82, w: 0.45, h: 0.32, d: 0.42, mat: boxMat2 },
          { x: 0.24,  y: 0.32, z: 0.82, w: 0.45, h: 0.32, d: 0.42, mat: boxMat1 },
          { x: -0.15, y: 0.62, z: 0.55, w: 0.55, h: 0.30, d: 0.55, mat: boxMat1 },
          { x: 0.18,  y: 0.62, z: 0.68, w: 0.48, h: 0.30, d: 0.48, mat: boxMat2 }
        ];
        boxes.forEach(b => {
          const m = new THREE.Mesh(new THREE.BoxGeometry(b.w, b.h, b.d), b.mat);
          m.position.set(b.x, b.y, b.z);
          m.castShadow = true;
          carriage.add(m);
        });
      }

      group.add(carriage);

      if (this._ctx.animatedActors) {
        const wpList = Array.isArray(waypoints) && waypoints.length >= 2 ? waypoints : [
          { x, z, facingY: rotY },
          { x: x + 4, z: z, facingY: rotY }
        ];
        this._ctx.animatedActors.push({
          type: 'forklift',
          driverName,
          group,
          baseY: group.position.y,
          wheels: wheelMeshes,
          waypoints: wpList,
          currentWp: 0,
          targetWp: 1,
          state: 'moving',
          stateTimer: 0.5,
          speed: Math.max(speed, 1.8),
          phase: Math.random() * Math.PI * 2
        });
      }

      return group;
    },

    _createWorker({ name = '', x = 0, z = 0, rotY = 0, role = 'clipboard', vestColor = 0x84cc16, helmetColor = 0xffffff, waypoints = null, speed = 0.92 } = {}) {
      const { THREE } = this._ctx;
      const group = new THREE.Group();
      group.position.set(x, 0, z);
      group.rotation.y = rotY;

      // Materiais do operador
      const skinMat = new THREE.MeshStandardMaterial({ color: 0xfcd34d, roughness: 0.6 });
      const pantsMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.7 });
      const bootsMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8 });
      const vestMat = new THREE.MeshStandardMaterial({ color: vestColor, roughness: 0.4 });
      const stripeMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.2, emissive: 0xffffff, emissiveIntensity: 0.2 });
      const helmetMat = new THREE.MeshStandardMaterial({ color: helmetColor, roughness: 0.3 });
      const shirtMat = new THREE.MeshStandardMaterial({ color: role === 'thermal' ? 0x0284c7 : 0x334155, roughness: 0.6 });

      // Pernas com articulação no quadril para animação de caminhada
      const legGeo = new THREE.BoxGeometry(0.13, 0.58, 0.14);
      const bootGeo = new THREE.BoxGeometry(0.14, 0.12, 0.20);
      
      const legLGroup = new THREE.Group();
      legLGroup.position.set(-0.10, 0.68, 0); // pivô no quadril
      const legL = new THREE.Mesh(legGeo, pantsMat);
      legL.position.set(0, -0.26, 0);
      legL.castShadow = true;
      legLGroup.add(legL);
      const bootL = new THREE.Mesh(bootGeo, bootsMat);
      bootL.position.set(0, -0.58, 0.03);
      bootL.castShadow = true;
      legLGroup.add(bootL);
      group.add(legLGroup);

      const legRGroup = new THREE.Group();
      legRGroup.position.set(0.10, 0.68, 0); // pivô no quadril
      const legR = new THREE.Mesh(legGeo, pantsMat);
      legR.position.set(0, -0.26, 0);
      legR.castShadow = true;
      legRGroup.add(legR);
      const bootR = new THREE.Mesh(bootGeo, bootsMat);
      bootR.position.set(0, -0.58, 0.03);
      bootR.castShadow = true;
      legRGroup.add(bootR);
      group.add(legRGroup);

      // Tronco e Camisa
      const torso = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.48, 0.22), shirtMat);
      torso.position.set(0, 0.98, 0);
      torso.castShadow = true;
      group.add(torso);

      // Colete refletivo (EPI)
      if (role !== 'thermal') {
        const vest = new THREE.Mesh(new THREE.BoxGeometry(0.40, 0.42, 0.24), vestMat);
        vest.position.set(0, 0.98, 0);
        vest.castShadow = true;
        group.add(vest);

        // Faixa refletiva prateada no colete
        const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.41, 0.06, 0.25), stripeMat);
        stripe.position.set(0, 0.96, 0);
        group.add(stripe);
      } else {
        // Jaqueta térmica acolchoada para câmara fria
        const coat = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.54, 0.26), shirtMat);
        coat.position.set(0, 0.98, 0);
        coat.castShadow = true;
        group.add(coat);
      }

      // Cabeça
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.10, 12, 12), skinMat);
      head.position.set(0, 1.34, 0);
      group.add(head);

      // Capacete de Segurança com aba
      const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.55), helmetMat);
      helmet.position.set(0, 1.38, 0);
      group.add(helmet);
      const brim = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.02, 0.22), helmetMat);
      brim.position.set(0, 1.37, 0.05);
      group.add(brim);

      // Braços e Ações conforme o papel (role)
      let rightArmGroup = null;

      if (role === 'clipboard' || role === 'thermal') {
        // Braço esquerdo segurando a prancheta à frente
        const armL = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.32, 0.09), shirtMat);
        armL.position.set(-0.21, 1.05, 0.12);
        armL.rotation.x = Math.PI * 0.35;
        group.add(armL);

        // Prancheta com folha branca
        const boardMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.4 });
        const paperMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9 });
        const board = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.32, 0.015), boardMat);
        board.position.set(-0.08, 1.10, 0.26);
        board.rotation.x = -Math.PI * 0.25;
        board.rotation.y = Math.PI * 0.1;
        group.add(board);
        const paper = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.26, 0.018), paperMat);
        paper.position.copy(board.position);
        paper.rotation.copy(board.rotation);
        group.add(paper);

        // Braço direito com caneta apontando
        const armR = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.32, 0.09), shirtMat);
        armR.position.set(0.21, 1.05, 0.10);
        armR.rotation.x = Math.PI * 0.28;
        armR.rotation.z = -Math.PI * 0.15;
        group.add(armR);
        rightArmGroup = armR;

      } else if (role === 'box') {
        // Carregando caixa à frente com ambas as mãos
        [-0.22, 0.22].forEach(bx => {
          const arm = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.32, 0.09), shirtMat);
          arm.position.set(bx, 1.02, 0.14);
          arm.rotation.x = Math.PI * 0.45;
          group.add(arm);
        });

        // Caixa de papelão
        const boxMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.8 });
        const box = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.32, 0.38), boxMat);
        box.position.set(0, 1.02, 0.32);
        box.castShadow = true;
        group.add(box);

        // Etiqueta branca na caixa
        const label = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.10, 0.39), new THREE.MeshStandardMaterial({ color: 0xffffff }));
        label.position.set(0, 1.02, 0.32);
        group.add(label);

      } else if (role === 'pallet_jack') {
        // Operador com as duas mãos puxando o timão da paleteira manual
        [-0.18, 0.18].forEach(ax => {
          const arm = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.34, 0.09), shirtMat);
          arm.position.set(ax, 1.02, 0.12);
          arm.rotation.x = Math.PI * 0.38;
          group.add(arm);
        });

        // ── Paleteira Manual (Transpaleteira Hidráulica) ──
        const jackGroup = new THREE.Group();
        jackGroup.position.set(0, 0, 0.25);

        const orangeJackMat = new THREE.MeshStandardMaterial({ color: 0xea580c, metalness: 0.4, roughness: 0.4 });
        const steelJackMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8, roughness: 0.3 });

        // Timão / Alavanca de puxar com empunhadura
        const tiller = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.85, 8), steelJackMat);
        tiller.position.set(0, 0.65, 0.08);
        tiller.rotation.x = -Math.PI * 0.25;
        jackGroup.add(tiller);

        const handle = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.04, 0.08), orangeJackMat);
        handle.position.set(0, 0.98, -0.06);
        jackGroup.add(handle);

        // Corpo da bomba hidráulica e rodas frontais
        const pump = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.42, 12), orangeJackMat);
        pump.position.set(0, 0.28, 0.32);
        jackGroup.add(pump);

        // Garfos da paleteira
        [-0.20, 0.20].forEach(gx => {
          const fork = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.07, 1.15), orangeJackMat);
          fork.position.set(gx, 0.12, 0.95);
          fork.castShadow = true;
          jackGroup.add(fork);
        });

        // Palete de madeira sobre a paleteira
        const woodMat = new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.9 });
        const pallet = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.12, 1.05), woodMat);
        pallet.position.set(0, 0.22, 0.95);
        pallet.castShadow = true;
        jackGroup.add(pallet);

        // Caixas empilhadas no palete da paleteira
        const cMat1 = new THREE.MeshStandardMaterial({ color: 0xd97706 });
        const cMat2 = new THREE.MeshStandardMaterial({ color: 0xb45309 });
        [
          { x: -0.22, y: 0.42, z: 0.75, mat: cMat1 },
          { x: 0.22,  y: 0.42, z: 0.75, mat: cMat2 },
          { x: -0.22, y: 0.42, z: 1.15, mat: cMat2 },
          { x: 0.22,  y: 0.42, z: 1.15, mat: cMat1 }
        ].forEach(bx => {
          const cBox = new THREE.Mesh(new THREE.BoxGeometry(0.40, 0.30, 0.38), bx.mat);
          cBox.position.set(bx.x, bx.y, bx.z);
          cBox.castShadow = true;
          jackGroup.add(cBox);
        });

        group.add(jackGroup);

      } else {
        // Líder gesticulando / apontando com prancheta/rádio
        const armL = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.34, 0.09), shirtMat);
        armL.position.set(-0.21, 1.02, 0.08);
        armL.rotation.x = Math.PI * 0.25;
        group.add(armL);

        // Braço direito apontando para a câmara/gôndola
        const armR = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.36, 0.09), shirtMat);
        armR.position.set(0.24, 1.18, 0.20);
        armR.rotation.x = Math.PI * 0.48;
        armR.rotation.z = -Math.PI * 0.15;
        group.add(armR);
        rightArmGroup = armR;
      }

      // Crachá flutuante sobre a cabeça com o nome do colaborador
      if (name) {
        const isOrlando = name.includes('ORLANDO');
        const isLeader = role === 'leader' || name === 'FELIPE';
        const icon = isOrlando ? '⭐ ' : (isLeader ? '⭐ ' : '👤 ');
        const tag = this._label(`${icon}${name}`, {
          size: isOrlando ? 0.46 : 0.40,
          color: isOrlando ? '#fef08a' : (isLeader ? '#38bdf8' : '#ffffff'),
          bg: isOrlando ? 'rgba(120, 53, 15, 0.95)' : (isLeader ? 'rgba(30, 58, 138, 0.92)' : 'rgba(15, 23, 42, 0.88)')
        });
        tag.position.set(0, 1.76, 0);
        group.add(tag);

        const bubbleSprite = this._createAgentBubbleSprite(name);
        if (bubbleSprite) {
          bubbleSprite.position.set(0, 2.18, 0);
          group.add(bubbleSprite);
          this._ctx.agentBubbles = this._ctx.agentBubbles || new Map();
          this._ctx.agentBubbles.set(name, bubbleSprite);
        }

        const hitMat = new THREE.MeshBasicMaterial({ visible: false });
        const hitMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 2.1, 8), hitMat);
        hitMesh.position.set(0, 1.05, 0);
        hitMesh.userData = { key: 'agent:' + name };
        group.add(hitMesh);
        if (this._ctx) {
          this._ctx.pickables.push(hitMesh);
          this._ctx.meshes.set('agent:' + name, group);
        }
      }

      if (this._ctx.animatedActors) {
        const wpList = Array.isArray(waypoints) && waypoints.length >= 2 ? waypoints : [
          { x, z, facingY: rotY },
          { x: x + (Math.random() > 0.5 ? 2.5 : -2.5), z, facingY: rotY }
        ];
        this._ctx.animatedActors.push({
          type: 'worker',
          name,
          group,
          baseY: group.position.y,
          legL: legLGroup,
          legR: legRGroup,
          arm: rightArmGroup,
          baseArmRotX: rightArmGroup ? rightArmGroup.rotation.x : 0,
          waypoints: wpList,
          currentWp: 0,
          targetWp: 1,
          state: Math.random() > 0.4 ? 'moving' : 'idle',
          stateTimer: 0.3 + Math.random() * 1.2, // inicia quase imediatamente
          walkCycle: Math.random() * Math.PI * 2,
          speed: Math.max(speed, 1.4),
          phase: Math.random() * Math.PI * 2
        });
      }

      return group;
    },

    _buildSelectionMarker() {
      const { THREE, scene } = this._ctx;
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(1, 0.06, 12, 48),
        new THREE.MeshBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.95 })
      );
      ring.rotation.x = -Math.PI / 2;
      ring.visible = false;
      const box = new THREE.LineSegments(
        new THREE.EdgesGeometry(new THREE.BoxGeometry(1, 1, 1)),
        new THREE.LineBasicMaterial({ color: 0x22d3ee })
      );
      box.visible = false;
      scene.add(ring, box);
      this._ctx.selRing = ring;
      this._ctx.selBox = box;
    },

    /** Cor de cada objeto conforme a camada ativa + busca. */
    _applyColors() {
      if (!this._ctx) return;
      const ctx = this._ctx;
      const matches = this.search ? this._searchMatches() : null;
      ctx.pulse.forEach(m => { m.emissiveIntensity = m.userData.baseEmissive ?? 0.12; });
      ctx.pulse.clear();

      ctx.meshes.forEach((mesh, key) => {
        if (!mesh.isMesh) return;
        const e = this.model.entities.get(key);
        if (!e) return;
        const isChamberBox = e.type === 'chamber';
        const empty = !e.products.length;
        let color = SEV_META[e.worst].color;
        let opacity = isChamberBox ? 0.55 : (e.type === 'slot' && empty ? 0.18 : 1);
        let emissive = 0.12;

        if (this.layer === 'agenda') {
          const sched = e.scheduled || (isChamberBox && [...this.model.entities.values()].some(x => x.type === 'column' && x.chamberKey === e.chamberKey && x.scheduled));
          if (!sched) {
            color = '#1e293b';
            emissive = 0.02;
            if (e.type === 'slot') opacity = empty ? 0.08 : 0.35;
          } else {
            color = '#10b981'; // VERDE VIBRANTE DE VERIFICAÇÃO!
            emissive = 0.85;
            opacity = 1.0;
          }
        } else if (this.layer === 'rebaixa') {
          color = e.rebaixa ? '#a855f7' : '#334155';
          emissive = e.rebaixa ? 0.4 : 0.05;
        } else if (this.layer === 'categoria') {
          const cat = e.type === 'freezer' ? e.category : norm(e.products[0]?.p?.category);
          color = CATEGORY_COLORS[cat] || '#475569';
          if (e.type === 'slot' && empty) color = '#475569';
        }

        if (matches) {
          if (matches.has(key)) { color = '#fde047'; emissive = 0.7; opacity = 1; }
          else if (e.type !== 'chamber') { emissive = 0.02; opacity = Math.min(opacity, e.type === 'slot' ? 0.12 : 0.35); }
        }

        const mat = this._mat(color, { opacity, emissive });
        mesh.material = mat;
        const pulsing = !matches && (
          (this.layer === 'validade' && (e.worst === SEV.EXPIRED || e.worst === SEV.TODAY)) ||
          (this.layer === 'agenda' && (e.scheduled || (isChamberBox && [...this.model.entities.values()].some(x => x.type === 'column' && x.chamberKey === e.chamberKey && x.scheduled))))
        );
        if (pulsing) ctx.pulse.add(mat);
      });
    },

    _bindStage() {
      const { renderer } = this._ctx;
      const el = renderer.domElement;
      let downAt = null;

      el.addEventListener('pointermove', (ev) => this._onHover(ev));
      el.addEventListener('pointerleave', () => this._setHover(null));
      el.addEventListener('wheel', () => {
        if (this._ctx?.tween) this._ctx.tween = null;
      }, { passive: true });
      el.addEventListener('pointerdown', (ev) => {
        if (this._ctx?.tween) this._ctx.tween = null;
        downAt = { x: ev.clientX, y: ev.clientY };
      });
      el.addEventListener('pointerup', (ev) => {
        if (!downAt) return;
        const moved = Math.hypot(ev.clientX - downAt.x, ev.clientY - downAt.y);
        downAt = null;
        if (moved > 6) return; // foi arraste (órbita), não clique
        const key = this._pick(ev);
        if (!key) { this.select(null); return; }
        const e = this.model.entities.get(key);
        if (e?.type === 'chamber') { this.setView(e.chamberKey); return; }
        this.select(key, true);
      });
      el.addEventListener('dblclick', (ev) => {
        const key = this._pick(ev);
        const e = key && this.model.entities.get(key);
        if (e?.type === 'chamber') this.setView(e.chamberKey);
      });

      this._onVisibility = () => { if (!document.hidden) this._ctx?.clock.getDelta(); };
      document.addEventListener('visibilitychange', this._onVisibility);
    },

    _pick(ev) {
      const { renderer, camera, raycaster, pointer, pickables } = this._ctx;
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const visible = pickables.filter(m => m.parent?.visible);
      const hit = raycaster.intersectObjects(visible, false)[0];
      return hit?.object?.userData?.key || null;
    },

    _onHover(ev) {
      if (ev.pointerType === 'touch') return;
      const key = this._pick(ev);
      this._setHover(key, ev);
    },

    _setHover(key, ev) {
      const ctx = this._ctx;
      const tip = this.container?.querySelector('#twin-tooltip');
      if (!tip || !ctx) return;
      ctx.renderer.domElement.style.cursor = key ? 'pointer' : 'grab';
      if (!key) { tip.style.opacity = 0; ctx.hoverKey = null; return; }

      if (key.startsWith('agent:')) {
        const agentName = key.replace('agent:', '');
        const agent = this.getAgentData(agentName);
        if (ctx.hoverKey !== key) {
          tip.innerHTML = `
            <div style="display:flex; align-items:center; gap:6px; margin-bottom:4px;">
              <span style="font-size:1.25rem;">${agent.icon}</span>
              <strong>${esc(agent.name)} · ${esc(agent.role)}</strong>
            </div>
            <span style="color:${agent.summary.statusColor}; font-weight:700;">${agent.summary.statusIcon} ${esc(agent.summary.statusText)}</span>
            <span>📍 ${esc(agent.sectorLabel)}</span>
            <span style="color:var(--text-secondary);">${agent.summary.total} produto(s) sob supervisão</span>
            <em style="color:#38bdf8; margin-top:4px;">👉 Clique para abrir a Central do Agente</em>
          `;
          ctx.hoverKey = key;
        }
        const rect = ctx.stage.getBoundingClientRect();
        tip.style.left = `${Math.min(ev.clientX - rect.left + 16, rect.width - 260)}px`;
        tip.style.top = `${Math.max(ev.clientY - rect.top - 10, 8)}px`;
        tip.style.opacity = 1;
        return;
      }

      const e = this.model.entities.get(key);
      if (!e) return;
      if (ctx.hoverKey !== key) {
        const meta = SEV_META[e.worst];
        const top = [...e.products].filter(x => x.sev !== null).sort((a, b) => b.sev - a.sev)[0];
        tip.innerHTML = `
          <strong>${esc(e.type === 'slot' ? `C${pad2(e.column)} · N${e.level} · ${e.pos}` : e.label)}</strong>
          <span style="color:${meta.color}">${meta.icon} ${esc(meta.label)}</span>
          <span>${e.products.length} item(ns)${e.rebaixa ? ` · 🏷️ ${e.rebaixa} rebaixa` : ''}${e.type === 'chamber' ? ` · ${e.occupied}/${e.capacity} posições` : ''}</span>
          ${top ? `<span class="twin__tooltip-top">${esc(top.p.name)}</span>` : ''}
          ${e.scheduled ? '<span>📅 Verificar hoje</span>' : ''}
          <em>${e.type === 'chamber' ? 'Clique para entrar' : 'Clique para detalhes e Crachá 🏷️'}</em>`;
        ctx.hoverKey = key;
      }
      const rect = ctx.stage.getBoundingClientRect();
      tip.style.left = `${Math.min(ev.clientX - rect.left + 16, rect.width - 240)}px`;
      tip.style.top = `${Math.max(ev.clientY - rect.top - 10, 8)}px`;
      tip.style.opacity = 1;
    },

    // ── Navegação / câmera ────────────────────────────────────────────────
    _viewOf(key) {
      if (key.startsWith('fz:') || key.startsWith('ch:')) return 'store';
      const parts = key.split(':');
      return parts[1]; // slot:congelado:..., col:resfriado:...
    },

    setView(view, instant = false) {
      this.view = view;
      if (this._ctx) {
        Object.entries(this._ctx.groups).forEach(([k, g]) => { g.visible = k === view; });
        if (this.selectedKey && this._viewOf(this.selectedKey) !== view) this.selectedKey = null;
        this._updateSelectionMarker();
        this._flyToView(view, instant);
      }
      this.renderHud();
    },

    _flyToView(view, instant = false) {
      if (!this._ctx) return;
      const { THREE } = this._ctx;
      if (view === 'store') {
        const xs = this.model.sectors.map(s => LAYOUT.store[s].origin.x);
        const cx = this.model.sectors.length === 2 ? 0 : xs[0] + 10;
        this._tweenCamera(new THREE.Vector3(cx, 30, 30), new THREE.Vector3(cx, 0, -2), instant);
      } else {
        const o = LAYOUT.chamberInterior[view].offset;
        const wide = LAYOUT.chamberInterior[view].rows[0].length > 4;
        this._tweenCamera(new THREE.Vector3(o.x, wide ? 14 : 9, o.z + (wide ? 20 : 13)), new THREE.Vector3(o.x, 2, o.z), instant);
      }
    },

    _tweenCamera(toPos, toTarget, instant = false, ms = 900) {
      const { camera, controls } = this._ctx;
      if (instant) {
        camera.position.copy(toPos); controls.target.copy(toTarget); controls.update();
        this._ctx.tween = null; return;
      }
      this._ctx.tween = {
        fromPos: camera.position.clone(), fromTarget: controls.target.clone(),
        toPos, toTarget, start: performance.now(), ms,
      };
    },

    /** Vai até uma entidade (troca de cena se necessário), foca e abre o painel. */
    focusEntity(key) {
      if (!this.model.entities.has(key)) return;
      const view = this._viewOf(key);
      if (view !== this.view) {
        this.view = view;
        if (this._ctx) Object.entries(this._ctx.groups).forEach(([k, g]) => { g.visible = k === view; });
      }
      this.select(key, true);
      if (window.innerWidth <= 900 && this.railOpen) {
        this.toggleRail(false);
      }
    },

    select(key, fly = false) {
      if (this.selectedKey !== key) {
        this.agentProductFilter = null;
      }
      this.selectedKey = key;
      this.renderHud();
      if (!this._ctx) return;
      this._updateSelectionMarker();
      if (key && fly) {
        if (key.startsWith('agent:')) {
          const obj = this._ctx.meshes.get(key);
          if (obj) {
            const { THREE, camera, controls } = this._ctx;
            const target = new THREE.Vector3();
            obj.getWorldPosition(target);
            target.y += 0.9;
            const dir = camera.position.clone().sub(controls.target).normalize();
            if (dir.y < 0.35) { dir.y = 0.35; dir.normalize(); }
            const camPos = target.clone().add(dir.multiplyScalar(4.5));
            camPos.y = Math.max(camPos.y, 2.0);
            this._tweenCamera(camPos, target, false, 800);
          }
          return;
        }
        const obj = this._ctx.meshes.get(key);
        if (!obj) return;
        const { THREE, camera, controls } = this._ctx;
        const target = new THREE.Vector3();
        obj.getWorldPosition(target);
        const e = this.model.entities.get(key);
        const dist = e.type === 'column' ? 9 : e.type === 'slot' ? 6 : 7.5;
        const dir = camera.position.clone().sub(controls.target).normalize();
        if (dir.y < 0.45) { dir.y = 0.45; dir.normalize(); }
        // na câmara, olhar sempre a partir do corredor
        if (e.type === 'slot' || e.type === 'column') {
          const p = this._chamberRackPositions(e.chamberKey).get(e.column);
          if (p) dir.set(0, 0.55, p.facing).normalize();
        }
        this._tweenCamera(target.clone().add(dir.multiplyScalar(dist)), target);
      }
    },

    _updateSelectionMarker() {
      const { selRing, selBox, meshes, THREE } = this._ctx;
      selRing.visible = selBox.visible = false;
      if (!this.selectedKey) return;
      const obj = meshes.get(this.selectedKey);
      if (!obj || !obj.parent?.visible) return;
      const pos = new THREE.Vector3();
      obj.getWorldPosition(pos);
      if (obj.isMesh) {
        const size = new THREE.Box3().setFromObject(obj).getSize(new THREE.Vector3());
        selBox.scale.set(size.x + 0.15, size.y + 0.15, size.z + 0.15);
        selBox.position.copy(pos);
        selBox.visible = true;
        selRing.scale.setScalar(Math.max(size.x, size.z) * 0.85);
      } else {
        selRing.scale.setScalar(1.8);
      }
      selRing.position.set(pos.x, 0.05, pos.z);
      selRing.visible = true;
    },

    _resize() {
      if (!this._ctx) return;
      const { renderer, camera, stage } = this._ctx;
      const w = stage.clientWidth, h = stage.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    },

    _loop() {
      const ctx = this._ctx;
      if (!ctx) return;
      if (!ctx.renderer.domElement.isConnected) { this.destroy(); return; }
      this._raf = requestAnimationFrame(() => this._loop());
      if (document.hidden) return;

      const t = ctx.clock.getElapsedTime();
      if (ctx.tween) {
        const k = Math.min(1, (performance.now() - ctx.tween.start) / ctx.tween.ms);
        const e = easeInOut(k);
        ctx.camera.position.lerpVectors(ctx.tween.fromPos, ctx.tween.toPos, e);
        ctx.controls.target.lerpVectors(ctx.tween.fromTarget, ctx.tween.toTarget, e);
        if (k >= 1) ctx.tween = null;
      }
      const pulse = 0.20 + (Math.sin(t * 6.5) + 1) * 0.60;
      ctx.pulse.forEach(m => { m.emissiveIntensity = pulse; });

      if (this.selectedKey && this.selectedKey.startsWith('agent:') && ctx.meshes) {
        const aObj = ctx.meshes.get(this.selectedKey);
        if (aObj && ctx.selRing && ctx.selRing.visible) {
          const aPos = new this._three.Vector3();
          aObj.getWorldPosition(aPos);
          ctx.selRing.position.set(aPos.x, 0.05, aPos.z);
        }
      }

      // Delta de tempo preciso via performance.now() para locomoção suave
      const now = performance.now();
      const delta = ctx.lastAnimTime ? Math.min((now - ctx.lastAnimTime) / 1000, 0.1) : 0.016;
      ctx.lastAnimTime = now;

      // Animação e movimentação periódica dos operadores e empilhadeiras
      if (ctx.animatedActors && ctx.animatedActors.length) {
        for (let i = 0; i < ctx.animatedActors.length; i++) {
          const act = ctx.animatedActors[i];

          if (act.type === 'beacon' && act.mesh?.material) {
            act.mesh.material.emissiveIntensity = 0.4 + Math.abs(Math.sin(t * 9 + act.phase)) * 0.9;

          } else if (act.type === 'worker' && act.group) {
            act.stateTimer -= delta;

            if (act.state === 'idle') {
              // Em pausa: trabalhando, auditando com prancheta ou respirando
              act.group.position.y = act.baseY + Math.sin(t * 2.2 + act.phase) * 0.012;
              if (act.arm) {
                act.arm.rotation.x = act.baseArmRotX + Math.sin(t * 1.6 + act.phase) * 0.04;
              }
              // Pernas retornam à posição neutra
              if (act.legL) act.legL.rotation.x *= 0.85;
              if (act.legR) act.legR.rotation.x *= 0.85;

              // Transição: anda para o próximo ponto de conferência!
              if (act.stateTimer <= 0 && act.waypoints && act.waypoints.length) {
                act.state = 'moving';
              }

            } else if (act.state === 'moving' && act.waypoints && act.waypoints.length) {
              const target = act.waypoints[act.targetWp];
              const dx = target.x - act.group.position.x;
              const dz = target.z - act.group.position.z;
              const dist = Math.hypot(dx, dz);

              if (dist > 0.18) {
                const dirX = dx / dist;
                const dirZ = dz / dist;
                act.group.position.x += dirX * act.speed * delta;
                act.group.position.z += dirZ * act.speed * delta;

                // Rotação rápida e suave do corpo para a direção da caminhada
                const targetRotY = Math.atan2(dirX, dirZ);
                let diff = targetRotY - act.group.rotation.y;
                while (diff < -Math.PI) diff += Math.PI * 2;
                while (diff > Math.PI) diff -= Math.PI * 2;
                act.group.rotation.y += diff * Math.min(1, delta * 6);

                // Passadas bem visíveis e balanço do corpo ao caminhar
                act.walkCycle += delta * 8.5;
                if (act.legL) act.legL.rotation.x = Math.sin(act.walkCycle) * 0.55;
                if (act.legR) act.legR.rotation.x = -Math.sin(act.walkCycle) * 0.55;
                act.group.position.y = act.baseY + Math.abs(Math.sin(act.walkCycle)) * 0.045;

                if (act.arm) {
                  act.arm.rotation.x = act.baseArmRotX + Math.sin(act.walkCycle) * 0.25;
                }

              } else {
                // Chegou ao ponto de destino!
                act.group.position.x = target.x;
                act.group.position.z = target.z;
                if (target.facingY !== undefined) act.group.rotation.y = target.facingY;
                if (act.legL) act.legL.rotation.x = 0;
                if (act.legR) act.legR.rotation.x = 0;

                act.currentWp = act.targetWp;
                act.targetWp = (act.targetWp + 1) % act.waypoints.length;
                act.state = 'idle';
                // Pausa dinâmica e ágil: apenas 2 a 3.5 segundos antes de circular novamente!
                act.stateTimer = 2.0 + Math.random() * 1.5;
              }
            }

          } else if (act.type === 'forklift' && act.group) {
            act.stateTimer -= delta;

            if (act.state === 'idle') {
              if (act.stateTimer <= 0 && act.waypoints && act.waypoints.length) {
                act.state = 'moving';
              }
            } else if (act.state === 'moving' && act.waypoints && act.waypoints.length) {
              const target = act.waypoints[act.targetWp];
              const dx = target.x - act.group.position.x;
              const dz = target.z - act.group.position.z;
              const dist = Math.hypot(dx, dz);

              if (dist > 0.2) {
                const dirX = dx / dist;
                const dirZ = dz / dist;
                act.group.position.x += dirX * act.speed * delta;
                act.group.position.z += dirZ * act.speed * delta;

                // Giro suave da empilhadeira
                const targetRotY = Math.atan2(dirX, dirZ);
                let diff = targetRotY - act.group.rotation.y;
                while (diff < -Math.PI) diff += Math.PI * 2;
                while (diff > Math.PI) diff -= Math.PI * 2;
                act.group.rotation.y += diff * Math.min(1, delta * 3.5);

                // Rotação das rodas ao rodar
                if (act.wheels) {
                  for (let w = 0; w < act.wheels.length; w++) {
                    act.wheels[w].rotation.x += delta * 7;
                  }
                }
              } else {
                act.group.position.x = target.x;
                act.group.position.z = target.z;
                if (target.facingY !== undefined) act.group.rotation.y = target.facingY;

                act.currentWp = act.targetWp;
                act.targetWp = (act.targetWp + 1) % act.waypoints.length;
                act.state = 'idle';
                // Empilhadeira para para carga/descarga por apenas 2.5 a 4 segundos
                act.stateTimer = 2.5 + Math.random() * 1.5;
              }
            }
          }
        }
      }
      if (ctx.selRing.visible) {
        ctx.selRing.material.opacity = 0.55 + Math.sin(t * 5) * 0.4;
        ctx.selRing.rotation.z = t * 0.8;
      }
      ctx.controls.update();
      ctx.renderer.render(ctx.scene, ctx.camera);
    },

    destroy() {
      clearInterval(this._refreshTimer);
      this._refreshTimer = null;
      cancelAnimationFrame(this._raf);
      this._resizeObs?.disconnect();
      this._resizeObs = null;
      if (this._onVisibility) document.removeEventListener('visibilitychange', this._onVisibility);
      const ctx = this._ctx;
      if (ctx) {
        ctx.scene.traverse(o => {
          o.geometry?.dispose?.();
          const mats = Array.isArray(o.material) ? o.material : o.material ? [o.material] : [];
          mats.forEach(m => { m.map?.dispose?.(); m.dispose?.(); });
        });
        ctx.controls.dispose();
        ctx.renderer.dispose();
        ctx.renderer.forceContextLoss?.();
      }
      this._ctx = null;
    },
  };

  // Exposição global dos agentes da Brigada IA
  window.BrigadaAgents = {
    CONFIG: AGENTS_CONFIG,
    get: (name) => window.BrigadaTwin.getAgentData(name),
    getAll: () => Object.keys(AGENTS_CONFIG).map(name => window.BrigadaTwin.getAgentData(name)),
    focus: (name) => window.BrigadaTwin.focusAgent(name),
    notify: (name) => window.BrigadaTwin.notifyAgentAlert(name),
    reaudit: (name) => window.BrigadaTwin.reauditAgent(name)
  };
})();
