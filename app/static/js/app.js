/**
 * BRIGADA-IA — Main App Router & UI System
 * Painel Super Admin · Gestão de Usuários · Brigada de Validade
 */

// ── UI Helpers ────────────────────────────────────────────────────────────────
window.BrigadaUI = {
  setupPluAutocomplete(container, inputSelector, suggestionsContainerSelector, fieldsMapping, allowedCategories = null, mainField = 'plu') {
    const input = container.querySelector(inputSelector);
    const suggContainer = container.querySelector(suggestionsContainerSelector);
    if (!input || !suggContainer) return;

    input.setAttribute('autocomplete', 'off');

    const handleInput = () => {
      const query = input.value.trim().toLowerCase();
      if (!query) {
        suggContainer.style.display = 'none';
        return;
      }

      // Search central catalog
      const catalog = window.BrigadaData.catalog || [];
      let matches = catalog;
      if (allowedCategories && allowedCategories.length > 0) {
        matches = matches.filter(item => allowedCategories.includes(window.BrigadaCatalog.normalizeCat(item.category)));
      }
      matches = matches.filter(item => 
        (item.plu && item.plu.toLowerCase().includes(query)) ||
        (item.barcode && item.barcode.toLowerCase().includes(query)) ||
        (item.name && item.name.toLowerCase().includes(query))
      ).slice(0, 5); // limit to 5 suggestions

      if (matches.length === 0) {
        suggContainer.style.display = 'none';
        return;
      }

      suggContainer.innerHTML = matches.map(item => `
        <div class="autocomplete-suggestion-item" data-plu="${item.plu}">
          <span class="suggestion-plu" style="color: var(--accent); font-weight: bold; font-family: monospace;">${item.plu}</span>
          <span class="suggestion-name" style="text-align: left; margin-left: 10px; flex-grow: 1;">${item.name}</span>
        </div>
      `).join('');
      suggContainer.style.display = 'block';

      // Bind selection clicks
      suggContainer.querySelectorAll('.autocomplete-suggestion-item').forEach(el => {
        el.addEventListener('click', () => {
          const plu = el.dataset.plu;
          const selected = catalog.find(item => item.plu === plu);
          if (selected) {
            input.value = mainField === 'name' ? (selected.name || '') : (selected.plu || '');
            
            // Pre-fill mapped fields
            if (fieldsMapping.plu) {
              const pluEl = container.querySelector(fieldsMapping.plu);
              if (pluEl) pluEl.value = selected.plu || '';
            }
            if (fieldsMapping.name) {
              const nameEl = container.querySelector(fieldsMapping.name);
              if (nameEl) nameEl.value = selected.name || '';
            }
            if (fieldsMapping.category) {
              const catEl = container.querySelector(fieldsMapping.category);
              if (catEl) {
                const norm = window.BrigadaCatalog.normalizeCat(selected.category);
                catEl.value = norm || selected.category || '';
              }
            }
            if (fieldsMapping.barcode) {
              const barEl = container.querySelector(fieldsMapping.barcode);
              if (barEl) barEl.value = selected.barcode || '';
            }
            if (fieldsMapping.unit && selected.unit) {
              const unitEl = container.querySelector(fieldsMapping.unit);
              if (unitEl) unitEl.value = selected.unit || '';
            }
          }
          suggContainer.style.display = 'none';
        });
      });
    };

    input.addEventListener('input', handleInput);
    input.addEventListener('focus', handleInput);

    // Close suggestion list when clicking outside
    const handleOutsideClick = (e) => {
      if (e.target !== input && e.target !== suggContainer && !suggContainer.contains(e.target)) {
        suggContainer.style.display = 'none';
      }
    };
    document.addEventListener('click', handleOutsideClick);
  },

  showToast(message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.innerHTML = `
      <span class="toast__icon">${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
      <span class="toast__message">${message}</span>
    `;
    container.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('toast--visible'));
    setTimeout(() => {
      toast.classList.remove('toast--visible');
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  },

  printContent(html) {
    let printArea = document.getElementById('print-area');
    if (!printArea) {
      printArea = document.createElement('div');
      printArea.id = 'print-area';
      document.body.appendChild(printArea);
    }
    printArea.innerHTML = html;

    // Espera as imagens (como as assinaturas em base64) carregarem antes de imprimir
    const images = printArea.querySelectorAll('img');
    if (images.length > 0) {
      let loadedCount = 0;
      const onImageLoad = () => {
        loadedCount++;
        if (loadedCount === images.length) {
          setTimeout(() => {
            window.print();
          }, 150);
        }
      };
      images.forEach(img => {
        if (img.complete) {
          onImageLoad();
        } else {
          img.addEventListener('load', onImageLoad);
          img.addEventListener('error', onImageLoad);
        }
      });
    } else {
      setTimeout(() => {
        window.print();
      }, 100);
    }
  },

  async shareDocPDF(doc, fileName = 'relatorio.pdf', title = 'Documento BRIGADA-IA') {
    this.showToast('📄 Preparando envio do PDF...', 'info');
    try {
      const pdfBlob = doc.output('blob');
      const pdfFile = new File([pdfBlob], fileName, { type: 'application/pdf' });

      if (navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
        await navigator.share({
          title: title,
          text: title,
          files: [pdfFile]
        });
        this.showToast('PDF compartilhado com sucesso!', 'success');
        return;
      }

      // Download automático
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      this.showToast('PDF baixado! Pronto para enviar.', 'success');
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Erro ao compartilhar PDF:', err);
        doc.save(fileName);
      }
    }
  },

  async generateCrachaFromProduct(productOrId) {
    const product = (typeof productOrId === 'object' && productOrId !== null)
      ? productOrId
      : window.BrigadaData.products.find(p => String(p.id) === String(productOrId));

    if (!product) {
      this.showToast('Produto não encontrado.', 'error');
      return;
    }

    const parts = (product.endDate || '').split('-');
    let formattedDate = product.endDate || '';
    if (parts.length === 3) {
      formattedDate = `${parts[2]}/${parts[1]}/${parts[0].slice(-2)}`;
    }

    let friendlyLoc = '—';
    if (product.location) {
      if (window.BrigadaData && window.BrigadaData.formatLocationFriendly) {
        friendlyLoc = window.BrigadaData.formatLocationFriendly(product);
      } else {
        friendlyLoc = product.location;
      }
    }

    const user = window.BrigadaAuth.currentUser || {};
    const crachaData = {
      productName: (product.name || 'PRODUTO').toUpperCase(),
      consincoCode: product.plu || '',
      quantity: product.quantity !== undefined ? product.quantity : 0,
      expiryDate: formattedDate,
      notes: friendlyLoc !== '—' ? friendlyLoc : (product.notes || '—'),
      createdBy: user.name || user.username || 'Felipe'
    };

    try {
      if (window.BrigadaData && window.BrigadaData.createCracha) {
        await window.BrigadaData.createCracha(crachaData);
      }
    } catch(err) {
      console.warn('Crachá gerado localmente:', err);
    }

    if (window.BrigadaCracha && window.BrigadaCracha.shareCracha) {
      window.BrigadaCracha.shareCracha(crachaData);
    } else {
      this.showToast('Crachá gerado com sucesso!', 'success');
    }
  },

  // ── Modal de Seleção de Quantidade de Quebra / Avaria ─────────────────────
  showQuebraModal(productOrId, onComplete) {
    const product = (typeof productOrId === 'object' && productOrId !== null)
      ? productOrId 
      : window.BrigadaData.products.find(p => p.id === parseInt(productOrId, 10));

    if (!product) {
      this.showToast('Produto não encontrado para registro de quebra.', 'error');
      return;
    }

    const currentQty = parseFloat(product.quantity) || 0;
    const unit = (product.unit || 'un').toLowerCase();
    const isWeight = unit === 'kg' || unit === 'g' || unit === 'l';
    const step = isWeight ? '0.001' : '1';
    const minVal = isWeight ? 0.001 : 1;

    let overlay = document.getElementById('global-quebra-modal-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'global-quebra-modal-overlay';
      overlay.className = 'modal-overlay';
      overlay.style.zIndex = '3000';
      document.body.appendChild(overlay);
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const user = window.BrigadaAuth?.currentUser || {};
    const defaultRespName = user.name || 'Felipe Santos';

    overlay.innerHTML = `
      <div class="modal" style="max-width: 520px; width: 95%; max-height: 92vh; overflow-y: auto;">
        <div class="modal-header" style="border-bottom: 1px solid var(--border-color); padding-bottom: 1rem; position: sticky; top: 0; background: var(--bg-card); z-index: 10;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="font-size: 1.5rem; background: rgba(239, 68, 68, 0.15); border-radius: 8px; width: 42px; height: 42px; display: flex; align-items: center; justify-content: center; border: 1px solid rgba(239,68,68,0.3);">
              🗑️
            </div>
            <div>
              <h3 class="modal-title" style="margin: 0; font-size: 1.15rem; color: #fff;">Registrar Quebra / Avaria</h3>
              <p style="margin: 0; font-size: 0.78rem; color: var(--text-secondary);">Defina a quantidade a baixar do estoque</p>
            </div>
          </div>
          <button class="modal-close" id="g-quebra-modal-close" style="cursor: pointer;">✕</button>
        </div>

        <div class="modal-body" style="padding: 1.25rem 0; display: flex; flex-direction: column; gap: 1rem;">
          <!-- Card Resumo do Produto -->
          <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border-color); border-radius: 12px; padding: 12px 16px;">
            <div style="font-size: 0.72rem; color: var(--accent); font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">
              ${product.category ? product.category.toUpperCase() : 'PRODUTO'} • PLU: ${product.plu || 'S/N'}
            </div>
            <div style="font-size: 1.05rem; font-weight: 700; color: var(--text-primary); margin-bottom: 8px;">
              ${product.name}
            </div>
            <div style="display: flex; flex-wrap: wrap; gap: 12px; font-size: 0.82rem; color: var(--text-secondary);">
              <div>📦 Estoque Atual: <strong style="color: #38bdf8; font-size: 0.95rem;">${currentQty} ${unit}</strong></div>
              <div>📅 Validade: <strong>${window.BrigadaData.formatDate(product.endDate)}</strong></div>
              ${product.location ? `<div>📍 Local: <strong>${window.BrigadaData.formatLocationFriendly(product)}</strong></div>` : ''}
            </div>
          </div>

          <!-- Seleção de Quantidade -->
          <div style="background: rgba(239, 68, 68, 0.06); border: 1px solid rgba(239, 68, 68, 0.25); border-radius: 12px; padding: 14px 16px;">
            <label style="display: block; font-size: 0.88rem; font-weight: 700; color: #fca5a5; margin-bottom: 4px;">
              Quanto deste lote quebrou / avariou?
            </label>
            <p style="font-size: 0.78rem; color: var(--text-secondary); margin: 0 0 10px 0;">
              Total disponível: <strong style="color: #38bdf8;">${currentQty} ${unit}</strong>
            </p>

            <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 10px;">
              <button type="button" id="g-quebra-step-minus" class="btn btn--outline" style="width: 44px; height: 44px; padding: 0; font-size: 1.3rem; font-weight: bold; border-radius: 8px; flex-shrink: 0;">-</button>
              
              <div style="position: relative; flex: 1;">
                <input 
                  type="number" 
                  id="g-quebra-input-qty" 
                  value="${currentQty}" 
                  min="${minVal}" 
                  max="${currentQty}" 
                  step="${step}"
                  style="width: 100%; height: 44px; font-size: 1.25rem; font-weight: bold; text-align: center; background: rgba(0,0,0,0.3); border: 1px solid rgba(239, 68, 68, 0.4); border-radius: 8px; color: #fff; padding-right: 48px;"
                />
                <span style="position: absolute; right: 14px; top: 50%; transform: translateY(-50%); font-size: 0.85rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; pointer-events: none;">
                  ${unit}
                </span>
              </div>

              <button type="button" id="g-quebra-step-plus" class="btn btn--outline" style="width: 44px; height: 44px; padding: 0; font-size: 1.3rem; font-weight: bold; border-radius: 8px; flex-shrink: 0;">+</button>
            </div>

            <!-- Botões de Atalho Rápido -->
            <div style="display: flex; gap: 6px; flex-wrap: wrap;">
              <button type="button" class="g-quebra-quick-btn" data-ratio="1" style="flex: 1; min-width: 85px; padding: 6px 8px; font-size: 0.75rem; font-weight: 600; border-radius: 6px; background: rgba(239,68,68,0.2); border: 1px solid rgba(239,68,68,0.4); color: #fca5a5; cursor: pointer;">
                Tudo (${currentQty})
              </button>
              ${currentQty > 1 ? `
                <button type="button" class="g-quebra-quick-btn" data-ratio="0.5" style="flex: 1; min-width: 85px; padding: 6px 8px; font-size: 0.75rem; font-weight: 600; border-radius: 6px; background: rgba(255,255,255,0.06); border: 1px solid var(--border-color); color: var(--text-secondary); cursor: pointer;">
                  Metade (${isWeight ? (currentQty / 2).toFixed(3) : Math.floor(currentQty / 2)})
                </button>
              ` : ''}
              ${currentQty > 3 ? `
                <button type="button" class="g-quebra-quick-btn" data-ratio="0.25" style="flex: 1; min-width: 85px; padding: 6px 8px; font-size: 0.75rem; font-weight: 600; border-radius: 6px; background: rgba(255,255,255,0.06); border: 1px solid var(--border-color); color: var(--text-secondary); cursor: pointer;">
                  25% (${isWeight ? (currentQty * 0.25).toFixed(3) : Math.floor(currentQty * 0.25)})
                </button>
              ` : ''}
              <button type="button" class="g-quebra-quick-btn" data-val="1" style="flex: 1; min-width: 65px; padding: 6px 8px; font-size: 0.75rem; font-weight: 600; border-radius: 6px; background: rgba(255,255,255,0.06); border: 1px solid var(--border-color); color: var(--text-secondary); cursor: pointer;">
                1 ${unit}
              </button>
            </div>

            <!-- Pré-visualização do Impacto no Estoque -->
            <div style="margin-top: 12px; padding-top: 10px; border-top: 1px dashed rgba(239,68,68,0.25); display: flex; justify-content: space-between; font-size: 0.84rem;">
              <span>Quebra: <strong id="g-quebra-calc-break" style="color: #ef4444;">${currentQty} ${unit}</strong></span>
              <span>Restará em estoque: <strong id="g-quebra-calc-remain" style="color: #10b981;">0 ${unit}</strong></span>
            </div>
          </div>

          <!-- Informações de Registro de Quebra (Ocorrência / Motivo) -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <div>
              <label style="font-size: 0.78rem; font-weight: 600; color: var(--text-secondary); display: block; margin-bottom: 4px;">Ocorrência</label>
              <select id="g-quebra-field-occurrence" class="form-control" style="width: 100%; height: 38px; font-size: 0.82rem; background: var(--bg-card); border: 1px solid var(--border-color); color: #fff; border-radius: 8px; padding: 0 8px;">
                <option value="VENCIMENTO" selected>VENCIMENTO</option>
                <option value="DETERIORAÇÃO NATURAL">DETERIORAÇÃO NATURAL</option>
                <option value="AVARIA">AVARIA / QUEBRADO</option>
                <option value="VIOLADO">EMBALAGEM VIOLADA</option>
                <option value="DESCONGELADO">DESCONGELADO</option>
                <option value="SEM VÁCUO/GÁS">SEM VÁCUO/GÁS</option>
                <option value="DEGUSTAÇÃO">DEGUSTAÇÃO</option>
                <option value="OUTROS">OUTROS</option>
              </select>
            </div>
            <div>
              <label style="font-size: 0.78rem; font-weight: 600; color: var(--text-secondary); display: block; margin-bottom: 4px;">Origem</label>
              <select id="g-quebra-field-origin" class="form-control" style="width: 100%; height: 38px; font-size: 0.82rem; background: var(--bg-card); border: 1px solid var(--border-color); color: #fff; border-radius: 8px; padding: 0 8px;">
                <option value="SALÃO DE VENDAS" selected>SALÃO DE VENDAS</option>
                <option value="DEPÓSITO">DEPÓSITO</option>
                <option value="CÂMARA FRIA">CÂMARA FRIA</option>
                <option value="FRENTE DE CAIXA">FRENTE DE CAIXA</option>
              </select>
            </div>
          </div>

          <div>
            <label style="font-size: 0.78rem; font-weight: 600; color: var(--text-secondary); display: block; margin-bottom: 4px;">Motivo / Causa</label>
            <select id="g-quebra-field-reason" class="form-control" style="width: 100%; height: 38px; font-size: 0.82rem; background: var(--bg-card); border: 1px solid var(--border-color); color: #fff; border-radius: 8px; padding: 0 8px;">
              <option value="DE OLHO NA VALIDADE" selected>DE OLHO NA VALIDADE</option>
              <option value="PVPS LOJA">PVPS LOJA</option>
              <option value="QUALIDADE DO PRODUTO">QUALIDADE DO PRODUTO</option>
              <option value="FALHA NA EXPOSIÇÃO">FALHA NA EXPOSIÇÃO</option>
              <option value="ARMAZENAGEM INADEQUADA">ARMAZENAGEM INADEQUADA</option>
              <option value="ACIDENTE POR CLIENTE">ACIDENTE POR CLIENTE</option>
              <option value="ACIDENTE POR FUNCIONÁRIO">ACIDENTE POR FUNCIONÁRIO</option>
              <option value="REBAIXA NÃO REALIZADA">REBAIXA NÃO REALIZADA</option>
            </select>
          </div>

          <div>
            <label style="font-size: 0.78rem; font-weight: 600; color: var(--text-secondary); display: block; margin-bottom: 4px;">Observações (Opcional)</label>
            <input type="text" id="g-quebra-field-notes" placeholder="Ex: Baixa por validade ou avaria no manuseio" style="width: 100%; height: 38px; font-size: 0.82rem; background: var(--bg-card); border: 1px solid var(--border-color); color: #fff; border-radius: 8px; padding: 0 10px;" />
          </div>
        </div>

        <div class="modal-footer" style="border-top: 1px solid var(--border-color); padding-top: 1rem; display: flex; justify-content: flex-end; gap: 10px; position: sticky; bottom: 0; background: var(--bg-card); z-index: 10;">
          <button type="button" class="btn btn--outline" id="g-quebra-btn-cancel" style="padding: 8px 16px;">
            Cancelar
          </button>
          <button type="button" class="btn btn--danger" id="g-quebra-btn-confirm" style="padding: 8px 20px; display: inline-flex; align-items: center; gap: 6px; background: #ef4444; border-color: #dc2626;">
            <span>🗑️ Confirmar Quebra</span>
          </button>
        </div>
      </div>
    `;

    const inputQty = overlay.querySelector('#g-quebra-input-qty');
    const calcBreak = overlay.querySelector('#g-quebra-calc-break');
    const calcRemain = overlay.querySelector('#g-quebra-calc-remain');
    const btnMinus = overlay.querySelector('#g-quebra-step-minus');
    const btnPlus = overlay.querySelector('#g-quebra-step-plus');
    const btnClose = overlay.querySelector('#g-quebra-modal-close');
    const btnCancel = overlay.querySelector('#g-quebra-btn-cancel');
    const btnConfirm = overlay.querySelector('#g-quebra-btn-confirm');

    const updateCalc = () => {
      let val = parseFloat(inputQty.value) || 0;
      if (val > currentQty) {
        val = currentQty;
        inputQty.value = val;
      }
      if (val < minVal && currentQty >= minVal) {
        val = minVal;
      }
      const remain = Math.max(0, currentQty - val);
      calcBreak.textContent = `${isWeight ? val.toFixed(3) : val} ${unit}`;
      calcRemain.textContent = `${isWeight ? remain.toFixed(3) : remain} ${unit}`;
    };

    inputQty.addEventListener('input', updateCalc);

    btnMinus.addEventListener('click', () => {
      let val = parseFloat(inputQty.value) || 0;
      val = Math.max(minVal, isWeight ? val - 1 : val - 1);
      inputQty.value = isWeight ? parseFloat(val.toFixed(3)) : val;
      updateCalc();
    });

    btnPlus.addEventListener('click', () => {
      let val = parseFloat(inputQty.value) || 0;
      val = Math.min(currentQty, isWeight ? val + 1 : val + 1);
      inputQty.value = isWeight ? parseFloat(val.toFixed(3)) : val;
      updateCalc();
    });

    overlay.querySelectorAll('.g-quebra-quick-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.dataset.ratio) {
          const ratio = parseFloat(btn.dataset.ratio);
          let val = currentQty * ratio;
          if (!isWeight) val = Math.max(1, Math.round(val));
          inputQty.value = isWeight ? parseFloat(val.toFixed(3)) : val;
        } else if (btn.dataset.val) {
          let val = Math.min(currentQty, parseFloat(btn.dataset.val));
          inputQty.value = val;
        }
        updateCalc();
      });
    });

    const closeModal = () => {
      overlay.classList.remove('modal-overlay--visible');
      setTimeout(() => { overlay.style.display = 'none'; }, 250);
    };

    btnClose.addEventListener('click', closeModal);
    btnCancel.addEventListener('click', closeModal);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal();
    });

    btnConfirm.addEventListener('click', async () => {
      let val = parseFloat(inputQty.value) || 0;
      if (val <= 0) {
        window.BrigadaUI.showToast('Informe uma quantidade válida para quebra.', 'error');
        return;
      }
      if (val > currentQty) {
        val = currentQty;
      }

      const occurrence = overlay.querySelector('#g-quebra-field-occurrence').value;
      const origin = overlay.querySelector('#g-quebra-field-origin').value;
      const reason = overlay.querySelector('#g-quebra-field-reason').value;
      const notes = overlay.querySelector('#g-quebra-field-notes').value.trim();

      btnConfirm.disabled = true;
      btnConfirm.innerHTML = '<span>Gravando...</span>';

      try {
        // Cria o registro na tabela de quebras/avarias
        const quebraPayload = {
          plu: product.plu || '',
          productName: product.name,
          quantity: val,
          unit: unit,
          supplier: product.supplier || '',
          origin: origin,
          occurrence: occurrence,
          reason: reason,
          sector: product.category || 'Geral',
          occurrenceDate: todayStr,
          responsibleName: defaultRespName,
          createdBy: user.email || 'sistema',
          notes: notes
        };

        if (window.BrigadaData.createQuebra) {
          await window.BrigadaData.createQuebra(quebraPayload);
        }

        const remain = Math.max(0, currentQty - val);

        if (val >= currentQty) {
          // Quebra total do lote
          await window.BrigadaData.setExpiredAction(product.id, 'quebra');
          window.BrigadaUI.showToast(`Quebra total de ${val} ${unit} registrada com sucesso!`, 'success');
        } else {
          // Quebra parcial: reduz a quantidade do produto em estoque
          await window.BrigadaData.updateProduct(product.id, { quantity: remain });
          window.BrigadaUI.showToast(`Quebra de ${val} ${unit} registrada! Restam ${remain} ${unit} em estoque.`, 'success');
        }

        closeModal();
        if (typeof onComplete === 'function') {
          onComplete();
        }
      } catch (err) {
        console.error('Erro ao processar quebra:', err);
        window.BrigadaUI.showToast('Erro ao salvar quebra: ' + (err.message || 'Falha na requisição'), 'error');
        btnConfirm.disabled = false;
        btnConfirm.innerHTML = '<span>🗑️ Confirmar Quebra</span>';
      }
    });

    overlay.style.display = 'flex';
    requestAnimationFrame(() => overlay.classList.add('modal-overlay--visible'));
    updateCalc();
  },
  
  // ── Scanner ─────────────────────────────────────────────────────────────
  scannerInstance: null,
  onScanCallback: null,

  openScanner(callback) {
    this.onScanCallback = callback;
    const modal = document.getElementById('scanner-modal-overlay');
    if (!modal) return;
    
    modal.style.display = 'block';
    requestAnimationFrame(() => modal.classList.add('modal-overlay--visible'));

    if (!this.scannerInstance) {
      this.scannerInstance = new Html5Qrcode("scanner-reader");
    }

    const config = { fps: 10, qrbox: { width: 250, height: 150 }, aspectRatio: 1.0 };
    
    // Bind close button
    const closeBtn = document.getElementById('close-scanner-btn');
    if (closeBtn) closeBtn.onclick = () => this.closeScanner();

    this.scannerInstance.start(
      { facingMode: "environment" },
      config,
      (decodedText, decodedResult) => {
        // Success
        this.closeScanner();
        this.playBeep();
        
        let isScaleCode = false;
        let plu = null;
        let barcode = decodedText;

        // Lógica de Código de Balança (Brasil: começa com 2, 13 dígitos)
        // Exemplo: 2 CCCC PPPPPPP D (onde CCCC é o PLU)
        if (decodedText.startsWith('2') && decodedText.length === 13) {
           isScaleCode = true;
           // O PLU costuma estar entre a posição 1 e 5 (4 dígitos) ou 1 e 6 (5 dígitos)
           // Ex: 20123... (PLU 123) ou 21234... (PLU 1234). Assumindo 4 dígitos por padrão 
           // para a maioria das balanças (pos 1 a 5) ou adaptativo. 
           // Geralmente os zeros à esquerda são ignorados.
           plu = parseInt(decodedText.substring(1, 5), 10).toString();
        }

        if (this.onScanCallback) {
           this.onScanCallback({ barcode, isScaleCode, plu, raw: decodedText });
        }
      },
      (errorMessage) => {
        // Ignorar erros de scan contínuo
      }
    ).catch(err => {
      console.error("Erro ao iniciar câmera", err);
      this.showToast("Erro ao abrir a câmera. Verifique as permissões.", "error");
    });
  },

  closeScanner() {
    const modal = document.getElementById('scanner-modal-overlay');
    if (modal) {
      modal.classList.remove('modal-overlay--visible');
      setTimeout(() => { modal.style.display = 'none'; }, 300);
    }
    if (this.scannerInstance) {
      this.scannerInstance.stop().then(() => {
        this.scannerInstance.clear();
      }).catch(err => console.error("Erro ao parar o scanner", err));
    }
  },

  playBeep() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.value = 800;
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(1, ctx.currentTime + 0.05);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.15);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.2);
    } catch(e) {}
  },

  // ── Product View Modal ───────────────────────────────────────────────────
  showProductView(productId) {
    const product = window.BrigadaData.products.find(p => String(p.id) === String(productId));
    if (!product) return;

    const modal = document.getElementById('product-view-modal-overlay');
    const content = document.getElementById('product-view-content');
    if (!modal || !content) return;

    const catMap = {
      aves: '🐔 Aves', suino: '🐷 Suíno', bovino: '🐮 Bovino', pescado: '🐟 Pescado'
    };
    const status = window.BrigadaData.getProductStatus(product);

    const isConciliacao = product.category === 'conciliacao';

    content.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 0.5rem;">
        <strong style="color: var(--text-secondary); font-size: 0.85rem;">PRODUTO</strong>
        <div style="font-size: 1.25rem; font-weight: bold; color: var(--text-primary);">${product.name}</div>
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
        <div>
          <strong style="color: var(--text-secondary); font-size: 0.85rem;">PLU</strong>
          <div style="color: var(--text-primary);">${product.plu}</div>
        </div>
        <div>
          <strong style="color: var(--text-secondary); font-size: 0.85rem;">CÓD. BARRAS</strong>
          <div style="color: var(--text-primary);">${product.barcode || '—'}</div>
        </div>
        <div>
          <strong style="color: var(--text-secondary); font-size: 0.85rem;">CATEGORIA</strong>
          <div style="color: var(--text-primary);">${catMap[product.category] || product.category}</div>
        </div>
        <div>
          <strong style="color: var(--text-secondary); font-size: 0.85rem;">QUANTIDADE</strong>
          <div style="color: var(--text-primary);">${product.quantity !== undefined ? product.quantity : 0} ${product.unit || 'kg'}</div>
        </div>
        <div>
          <strong style="color: var(--text-secondary); font-size: 0.85rem;">${isConciliacao ? 'DATA DA CONTAGEM' : 'DATA DE CADASTRO'}</strong>
          <div style="color: var(--text-primary);">${window.BrigadaData.formatCreatedDateAndHour(product)}</div>
        </div>
        <div>
          <strong style="color: var(--text-secondary); font-size: 0.85rem;">${isConciliacao ? 'DATA DE VALIDADE' : 'VALIDADE'}</strong>
          <div style="color: var(--text-primary); font-weight: 600;">${window.BrigadaData.formatDate(product.endDate)}</div>
        </div>
        ${!isConciliacao ? `
        <div style="grid-column: span 2; background: rgba(255,255,255,0.03); padding: 0.75rem 1rem; border-radius: 8px; border: 1px solid var(--glass-border);">
          <strong style="color: var(--text-secondary); font-size: 0.85rem;">STATUS / CONTAGEM REGRESSIVA</strong>
          <div style="margin-top: 0.35rem; display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap;">
            <span class="badge ${status.class}">${status.icon} ${status.label}</span>
            <span style="font-size: 0.85rem; color: var(--text-primary);">
              ${status.days < 0 ? `🔴 Vencido há ${Math.abs(status.days)} ${Math.abs(status.days) === 1 ? 'dia' : 'dias'}` : 
                status.days === 0 ? `🟠 Vence hoje!` : 
                `⏳ Contagem regressiva: faltam exatamente <b>${status.days}</b> ${status.days === 1 ? 'dia' : 'dias'}`}
            </span>
          </div>
        </div>
        <div>
          <strong style="color: var(--text-secondary); font-size: 0.85rem;">FORNECEDOR</strong>
          <div style="color: var(--text-primary);">${product.supplier || '—'}</div>
        </div>
        ` : ''}
        <div style="grid-column: span 2;">
          <strong style="color: var(--text-secondary); font-size: 0.85rem;">LOCALIZAÇÃO DESTE LOTE</strong>
          <div style="color: var(--text-primary); font-size: 0.95rem; font-weight: 600; margin-top: 2px;">${window.BrigadaData.formatLocationFriendly(product)}</div>
        </div>

        <!-- Bloco de Relação deste Lote / Mesma Data de Validade (Câmara x Piso) -->
        ${(() => {
          const dist = window.BrigadaData.getProductStockDistribution(product);
          const hasSameDateSplit = dist.sameDate.length > 1;
          const totalSameDateQty = dist.sameDate.reduce((sum, d) => sum + (d.quantity || 0), 0);
          
          if (!hasSameDateSplit && dist.otherDates.length === 0) return '';

          return `
            <div style="grid-column: span 2; background: rgba(255,255,255,0.03); border: 1px solid var(--glass-border); border-radius: 12px; padding: 1.1rem; margin-top: 0.25rem;">
              
              ${hasSameDateSplit ? `
                <!-- Alerta de Mesma Data Dividida (Câmara e Piso) -->
                <div style="background: rgba(56, 189, 248, 0.08); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 10px; padding: 0.9rem; margin-bottom: ${dist.otherDates.length > 0 ? '1rem' : '0'};">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.65rem; flex-wrap: wrap; gap: 6px;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <span style="font-size: 1.3rem;">⚡</span>
                      <div>
                        <strong style="color: #38bdf8; font-size: 0.95rem;">Mesma Data de Validade (${window.BrigadaData.formatDate(product.endDate)})</strong>
                        <div style="font-size: 0.75rem; color: var(--text-secondary);">Este produto com esta MESMA data está presente em ${dist.sameDate.length} locais:</div>
                      </div>
                    </div>
                    <span style="font-size: 0.85rem; font-weight: 700; color: #38bdf8; background: rgba(56, 189, 248, 0.15); padding: 3px 10px; border-radius: 9999px;">
                      Total desta Data: ${totalSameDateQty.toFixed(totalSameDateQty % 1 === 0 ? 0 : 2)} ${product.unit || 'kg'}
                    </span>
                  </div>

                  <div style="display: flex; flex-direction: column; gap: 0.45rem;">
                    ${dist.sameDate.map(item => `
                      <div ${!item.isCurrent ? `onclick="window.BrigadaUI.showProductView('${item.id}')" role="button" tabindex="0" title="Clique para abrir os detalhes deste lote"` : ''} style="display: flex; justify-content: space-between; align-items: center; background: ${item.isCurrent ? 'rgba(16,185,129,0.12)' : 'rgba(255,255,255,0.04)'}; border: 1px solid ${item.isCurrent ? '#10b981' : 'rgba(255,255,255,0.1)'}; padding: 0.6rem 0.85rem; border-radius: 8px; ${!item.isCurrent ? 'cursor: pointer; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);' : ''}" ${!item.isCurrent ? `onmouseover="this.style.background='rgba(56,189,248,0.12)'; this.style.borderColor='#38bdf8'; this.style.transform='translateY(-1px)';" onmouseout="this.style.background='rgba(255,255,255,0.04)'; this.style.borderColor='rgba(255,255,255,0.1)'; this.style.transform='none';"` : ''}>
                        <div style="display: flex; align-items: center; gap: 8px;">
                          <span style="font-size: 1.1rem;">${item.isChamber ? '🥶' : item.isPiso ? '🏪' : '📍'}</span>
                          <div>
                            <div style="font-weight: 700; font-size: 0.9rem; color: var(--text-primary); display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                              ${item.locationDesc}
                              ${item.isCurrent ? `<span style="font-size: 0.68rem; background: #10b981; color: #fff; font-weight: 700; padding: 1px 6px; border-radius: 4px;">LOTE CONSULTADO</span>` : `<span style="font-size: 0.68rem; background: rgba(56,189,248,0.2); color: #38bdf8; font-weight: 700; padding: 1px 6px; border-radius: 4px; display: inline-flex; align-items: center; gap: 3px;">🔍 Ver Lote</span>`}
                            </div>
                            <div style="font-size: 0.72rem; color: var(--text-secondary);">Cadastrado em: ${window.BrigadaData.formatDate(item.startDate)}</div>
                          </div>
                        </div>
                        <div style="text-align: right;">
                          <strong style="font-size: 1.1rem; color: var(--text-primary);">${item.quantity} ${item.unit}</strong>
                        </div>
                      </div>
                    `).join('')}
                  </div>
                </div>
              ` : `
                <div style="display: flex; align-items: center; gap: 8px; color: var(--text-secondary); font-size: 0.85rem;">
                  <span>📍</span>
                  <span>Este lote com validade <b>${window.BrigadaData.formatDate(product.endDate)}</b> está apenas em: <b>${window.BrigadaData.formatLocationFriendly(product)}</b>.</span>
                </div>
              `}

              ${dist.otherDates.length > 0 ? `
                <!-- Outras Validades Cadastradas do Mesmo Produto -->
                <div style="margin-top: ${hasSameDateSplit ? '0.5rem' : '0.75rem'};">
                  <div style="font-size: 0.75rem; font-weight: 600; color: var(--text-tertiary); margin-bottom: 0.4rem; text-transform: uppercase; letter-spacing: 0.05em;">
                    📅 Outras Validades Cadastradas deste Produto (${dist.otherDates.length} outro${dist.otherDates.length > 1 ? 's' : ''}):
                  </div>
                  <div style="display: flex; flex-direction: column; gap: 0.45rem;">
                    ${dist.otherDates.map(item => `
                      <div onclick="window.BrigadaUI.showProductView('${item.id}')" role="button" tabindex="0" title="Clique para abrir e ver os detalhes deste lote (validade ${window.BrigadaData.formatDate(item.endDate)})" style="display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.03); border: 1px solid var(--glass-border); padding: 0.6rem 0.85rem; border-radius: 8px; cursor: pointer; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);" onmouseover="this.style.background='rgba(56,189,248,0.12)'; this.style.borderColor='#38bdf8'; this.style.transform='translateY(-1px)';" onmouseout="this.style.background='rgba(255,255,255,0.03)'; this.style.borderColor='var(--glass-border)'; this.style.transform='none';">
                        <div style="display: flex; align-items: center; gap: 8px;">
                          <span style="font-size: 1.1rem;">${item.isChamber ? '🥶' : item.isPiso ? '🏪' : '📍'}</span>
                          <div>
                            <div style="font-weight: 600; font-size: 0.85rem; color: var(--text-primary); display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                              <span>${item.locationDesc}</span>
                              <span style="font-size: 0.68rem; background: rgba(56,189,248,0.2); color: #38bdf8; font-weight: 700; padding: 1px 6px; border-radius: 4px; display: inline-flex; align-items: center; gap: 3px;">🔍 Ver Lote</span>
                            </div>
                            <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 2px;">
                              Validade: <b style="color: #38bdf8;">${window.BrigadaData.formatDate(item.endDate)}</b>
                              ${item.startDate ? `<span style="margin-left: 6px; font-size: 0.7rem; color: var(--text-tertiary);">| Cadastrado em: ${window.BrigadaData.formatDate(item.startDate)}</span>` : ''}
                            </div>
                          </div>
                        </div>
                        <div style="text-align: right; white-space: nowrap;">
                          <strong style="font-size: 1rem; color: var(--text-primary);">${item.quantity} ${item.unit}</strong>
                        </div>
                      </div>
                    `).join('')}
                  </div>
                </div>
              ` : ''}

            </div>
          `;
        })()}
      </div>
    `;

    modal.style.display = 'flex';
    requestAnimationFrame(() => modal.classList.add('modal-overlay--visible'));

    const closeBtn = document.getElementById('close-product-view-btn');
    const closeBtn2 = document.getElementById('btn-close-product-view');
    const crachaBtn = document.getElementById('btn-cracha-product-view');
    const closeHandler = () => {
      modal.classList.remove('modal-overlay--visible');
      setTimeout(() => modal.style.display = 'none', 250);
    };
    if (closeBtn) closeBtn.onclick = closeHandler;
    if (closeBtn2) closeBtn2.onclick = closeHandler;
    if (crachaBtn) {
      crachaBtn.onclick = () => {
        this.generateCrachaFromProduct(product);
      };
    }
    modal.onclick = (e) => {
      if (e.target === modal) closeHandler();
    };
  }
};

// ── Router ────────────────────────────────────────────────────────────────────
window.BrigadaRouter = {
  currentPage: null,

  async init() {
    window.BrigadaAuth.init();
    
    await window.BrigadaData.load();
    
    // Iniciar intervalo para atualização em background a cada 15 segundos
    setInterval(async () => {
      if (window.BrigadaAuth.isLoggedIn() && this.currentPage && this.currentPage !== 'login') {
        try {
          await window.BrigadaData.load();
          const pageContainer = document.getElementById('page-container');
          if (pageContainer) {
            if (this.currentPage === 'products' && window.BrigadaProducts) {
              window.BrigadaProducts.renderTable(pageContainer);
            } else if (this.currentPage === 'pereciveis' && window.BrigadaPereciveis) {
              window.BrigadaPereciveis.renderTable(pageContainer);
            }
          }
        } catch (e) {
          console.error("Erro na sincronização em background:", e);
        }
      }
    }, 15000);

    if (window.BrigadaAuth.isLoggedIn()) {
      if (window.BrigadaAuth.isKiosk()) {
        this.navigate('catalog');
      } else {
        this.navigate('dashboard');
        // Exibir versículo do dia após o login (apenas 1x por dia)
        if (window.BrigadaVerseOfTheDay) {
          window.BrigadaVerseOfTheDay.init();
        }
      }
    } else {
      this.navigate('login');
    }
  },

  async navigate(page) {
    this.currentPage = page;
    const root = document.getElementById('app-root');
    if (!root) return;

    // Clear
    root.innerHTML = '';

    if (page === 'login') {
      this.renderLogin(root);
    } else {
      // Require auth for all other pages
      if (!window.BrigadaAuth.requireAuth()) return;
      
      // Carrega os dados mais recentes do servidor ao navegar
      try {
        await window.BrigadaData.load();
      } catch (err) {
        console.error("Erro ao carregar dados atualizados:", err);
      }
      
      this.renderShell(root, page);
    }
  },

  // ── Login Screen ─────────────────────────────────────────────────────────
  renderLogin(root) {
    root.innerHTML = `
      <div class="login-screen">
        <div class="login-bg"></div>
        <div class="login-card">
          <div class="login-logo">
            <img src="/static/icon.svg" alt="Logo" style="width: 72px; height: 72px; border-radius: 16px; object-fit: cover; margin-bottom: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.3); border: 2px solid rgba(255,255,255,0.08);">
            <h1 class="login-logo__title">BRIGADA-IA</h1>
            <p class="login-logo__sub">Sistema de Validade · Açougue Varejo</p>
          </div>
          <form id="login-form" class="login-form">
            <div class="form-group">
              <label class="form-label">E-mail</label>
              <input type="email" id="login-email" class="form-input" placeholder="seu@email.com" autocomplete="email" required>
            </div>
            <div class="form-group">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <label class="form-label" style="margin-bottom: 0;">Senha</label>
                <a href="#" id="link-forgot-password" style="font-size: 0.75rem; color: var(--primary); text-decoration: none; font-weight: 500; transition: opacity 0.2s;" onmouseover="this.style.opacity=0.8" onmouseout="this.style.opacity=1">Esqueci minha senha</a>
              </div>
              <div class="password-wrapper">
                <input type="password" id="login-password" class="form-input" placeholder="••••••••" autocomplete="current-password" required>
                <button type="button" class="btn-eye" id="toggle-password">👁️</button>
              </div>
            </div>
            <div class="login-error" id="login-error" style="display:none;"></div>
            <button type="submit" class="btn btn--primary btn--full" id="btn-login">
              <span class="spinner" id="login-spinner" style="display:none;"></span>
              <span id="btn-login-text">Entrar no Sistema</span>
            </button>
            <div style="text-align: center; margin-top: 1rem;">
              <button type="button" class="btn btn--ghost" id="btn-toggle-pin" style="font-size: 0.85rem; padding: 0.5rem;">
                Acesso Rápido ao Catálogo
              </button>
            </div>
          </form>

          <form id="login-pin-form" class="login-form" style="display:none;">
            <p style="text-align: center; color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 1rem;">
              Modo Quiosque (Somente Leitura)
            </p>
            <div class="form-group" style="text-align: center;">
              <label class="form-label">PIN de 4 dígitos</label>
              <input type="password" id="login-pin" class="form-input" placeholder="••••" maxlength="4" style="text-align: center; font-size: 2rem; letter-spacing: 0.5rem; width: 150px; margin: 0 auto;" readonly>
            </div>
            
            <div class="virtual-keypad">
              <button type="button" class="keypad-btn" data-key="1">1</button>
              <button type="button" class="keypad-btn" data-key="2">2<span class="keypad-sub">ABC</span></button>
              <button type="button" class="keypad-btn" data-key="3">3<span class="keypad-sub">DEF</span></button>
              <button type="button" class="keypad-btn" data-key="4">4<span class="keypad-sub">GHI</span></button>
              <button type="button" class="keypad-btn" data-key="5">5<span class="keypad-sub">JKL</span></button>
              <button type="button" class="keypad-btn" data-key="6">6<span class="keypad-sub">MNO</span></button>
              <button type="button" class="keypad-btn" data-key="7">7<span class="keypad-sub">PQRS</span></button>
              <button type="button" class="keypad-btn" data-key="8">8<span class="keypad-sub">TUV</span></button>
              <button type="button" class="keypad-btn" data-key="9">9<span class="keypad-sub">WXYZ</span></button>
              <button type="button" class="keypad-btn keypad-action" data-key="back">⌫</button>
              <button type="button" class="keypad-btn" data-key="0">0</button>
              <button type="button" class="keypad-btn keypad-action" data-key="ok">OK</button>
            </div>

            <div class="login-error" id="login-pin-error" style="display:none;"></div>
            <button type="submit" class="btn btn--primary btn--full" id="btn-login-pin" style="display: none;">
              <span id="btn-login-pin-text">Acessar Catálogo</span>
            </button>
            <div style="text-align: center; margin-top: 1rem;">
              <button type="button" class="btn btn--ghost" id="btn-toggle-email" style="font-size: 0.85rem; padding: 0.5rem;">
                Voltar para Login Admin
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Modal Esqueci Minha Senha -->
      <div class="modal-overlay" id="forgot-password-modal" style="display:none; z-index: 2000;">
        <div class="modal modal--sm">
          <div class="modal-header">
            <h3 class="modal-title">🔑 Redefinir Senha</h3>
            <button class="modal-close" id="forgot-modal-close">✕</button>
          </div>
          <div class="modal-body" style="padding: 1.5rem 0;">
            <p style="color: var(--text-secondary); font-size: 0.85rem; line-height: 1.5; margin-bottom: 1rem;">
              Para redefinir sua senha, solicite ao **Super Administrador** para alterá-la na aba de gerenciamento de usuários do sistema.
            </p>
            <p style="color: var(--text-secondary); font-size: 0.85rem; line-height: 1.5;">
              Ou entre em contato via e-mail: <strong style="color: var(--primary);">admin@brigada.com</strong>
            </p>
          </div>
          <div class="modal-footer" style="padding-top: 0;">
            <button class="btn btn--primary btn--full" id="forgot-btn-ok">Entendi</button>
          </div>
        </div>
      </div>
    `;

    // Toggle password
    document.getElementById('toggle-password')?.addEventListener('click', () => {
      const input = document.getElementById('login-password');
      input.type = input.type === 'password' ? 'text' : 'password';
    });

    // Forgot password modal events
    const forgotModal = document.getElementById('forgot-password-modal');
    const closeForgotModal = () => {
      if (forgotModal) {
        forgotModal.classList.remove('modal-overlay--visible');
        setTimeout(() => forgotModal.style.display = 'none', 250);
      }
    };

    document.getElementById('link-forgot-password')?.addEventListener('click', (e) => {
      e.preventDefault();
      if (forgotModal) {
        forgotModal.style.display = 'flex';
        requestAnimationFrame(() => forgotModal.classList.add('modal-overlay--visible'));
      }
    });

    document.getElementById('forgot-modal-close')?.addEventListener('click', closeForgotModal);
    document.getElementById('forgot-btn-ok')?.addEventListener('click', closeForgotModal);
    forgotModal?.addEventListener('click', (e) => {
      if (e.target.id === 'forgot-password-modal') closeForgotModal();
    });

    // Toggle Forms
    const formEmail = document.getElementById('login-form');
    const formPin = document.getElementById('login-pin-form');
    document.getElementById('btn-toggle-pin')?.addEventListener('click', () => {
      formEmail.style.display = 'none';
      formPin.style.display = 'block';
    });
    document.getElementById('btn-toggle-email')?.addEventListener('click', () => {
      formPin.style.display = 'none';
      formEmail.style.display = 'block';
    });

    // Form submit
    document.getElementById('login-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value;
      const password = document.getElementById('login-password').value;
      const errorEl = document.getElementById('login-error');
      const spinner = document.getElementById('login-spinner');
      const btnText = document.getElementById('btn-login-text');

      spinner.style.display = 'inline-block';
      btnText.textContent = 'Autenticando...';
      errorEl.style.display = 'none';

      // Simula latência e aguarda login assíncrono
      setTimeout(async () => {
        try {
          const result = await window.BrigadaAuth.login(email, password);
          spinner.style.display = 'none';
          btnText.textContent = 'Entrar no Sistema';
          if (result.success) {
            window.BrigadaUI.showToast(`Bem-vindo, ${result.user.name}! 👋`, 'success');
            this.navigate('dashboard');
          } else {
            errorEl.style.display = 'block';
            errorEl.textContent = result.message;
          }
        } catch (err) {
          spinner.style.display = 'none';
          btnText.textContent = 'Entrar no Sistema';
          errorEl.style.display = 'block';
          errorEl.textContent = 'Erro ao tentar autenticar. Tente novamente.';
        }
      }, 700);
    });

    // PIN Form submit
    document.getElementById('login-pin-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const pin = document.getElementById('login-pin').value;
      const errorEl = document.getElementById('login-pin-error');
      
      errorEl.style.display = 'none';

      const result = window.BrigadaAuth.loginPin(pin);
      if (result.success) {
        window.BrigadaUI.showToast(`Acesso rápido autorizado!`, 'success');
        this.navigate('catalog');
      } else {
        errorEl.style.display = 'block';
        errorEl.textContent = result.message;
      }
    });

    // Virtual Keypad logic
    const pinInput = document.getElementById('login-pin');
    const pinForm = document.getElementById('login-pin-form');
    document.querySelectorAll('.keypad-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.key;
        if (!pinInput) return;

        if (key === 'ok') {
          if (pinInput.value.length > 0) {
            pinForm.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
          }
        } else if (key === 'back') {
          pinInput.value = pinInput.value.slice(0, -1);
        } else {
          if (pinInput.value.length < 4) {
            pinInput.value += key;
          }
        }
        
        // Trigger visual feedback or input events if necessary
        pinInput.dispatchEvent(new Event('input'));
      });
    });
  },

  // ── App Shell (sidebar layout) ────────────────────────────────────────────
  renderShell(root, activePage) {
    const user = window.BrigadaAuth.currentUser;
    const isSuperAdmin = window.BrigadaAuth.isSuperAdmin();
    const isKiosk = window.BrigadaAuth.isKiosk();
    const avatarColor = this.avatarColor(user.name);
    const hasImageAvatar = user.avatar && (user.avatar.startsWith('data:image/') || user.avatar.startsWith('http'));
    const avatarHTML = hasImageAvatar ? `<img src="${user.avatar}" alt="${user.name}" style="width:100%; height:100%; object-fit:cover; border-radius:50%;">` : user.avatar;

    const isCollapsed = localStorage.getItem('sidebar-collapsed') === 'true';
    const collapsedClass = isCollapsed ? 'sidebar-collapsed' : '';
    const toggleIcon = '☰';
    const toggleTitle = isCollapsed ? 'Expandir menu' : 'Recolher menu';

    root.innerHTML = `
      <div class="app-shell ${collapsedClass} ${isKiosk ? 'is-kiosk' : ''}">
        <!-- Sidebar Overlay -->
        <div class="sidebar-overlay" id="sidebar-overlay"></div>
        <!-- Sidebar -->
        ${!isKiosk ? `
        <aside class="sidebar" id="sidebar">
          <button class="sidebar__toggle" id="sidebar-toggle" title="${toggleTitle}">
            <span class="sidebar__toggle-icon" id="sidebar-toggle-icon">${toggleIcon}</span>
          </button>
          <div class="sidebar__brand">
            <img src="/static/icon.svg" alt="Logo" style="width: 32px; height: 32px; border-radius: 8px; object-fit: cover; margin-right: 8px; border: 1px solid rgba(255,255,255,0.08);">
            <div>
              <h1 class="sidebar__title">BRIGADA-IA</h1>
              <p class="sidebar__sub">Varejo · Açougue</p>
            </div>
          </div>

          <div class="sidebar__user-box">
            <div class="sidebar__user" title="Clique para editar seu perfil">
              <div class="sidebar__avatar" id="sidebar-user-avatar" style="${hasImageAvatar ? '' : `background:${avatarColor}`}">${avatarHTML}</div>
              <div class="sidebar__user-info">
                <p class="sidebar__user-name" id="sidebar-user-name">${user.name}</p>
                <div class="sidebar__user-role-wrapper" style="display: flex; flex-direction: column; gap: 2px; margin-top: 2px;">
                  <span class="sidebar__user-role" style="font-size: 0.78rem; font-weight: 600;">
                    ${isSuperAdmin ? '🛡️ Super Admin' : window.BrigadaAuth.isGestao() ? '👥 Gestão' : window.BrigadaAuth.isPromotor() ? '📋 Promotor' : window.BrigadaAuth.currentUser?.role === 'lider' ? '👤 Usuário/Líder' : '👤 Usuário'}
                  </span>
                  <span class="sidebar__user-sector-badge" id="sidebar-user-sector" style="font-size: 0.7rem; font-weight: 700; color: #38bdf8; background: rgba(56,189,248,0.15); padding: 1px 6px; border-radius: 4px; width: fit-content;">
                    🏬 Setor: ${(user.sector || 'Açougue').toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <nav class="sidebar__nav">
            <div class="sidebar__section-label">Principal</div>
            ${window.BrigadaAuth.canAddProduct() ? `
            <div class="sidebar__action-wrap">
              <button class="sidebar__btn-add-product" id="sidebar-btn-add-product">
                <span class="sidebar-btn-add-icon">＋</span>
                <span class="sidebar-btn-add-text">Novo Produto</span>
              </button>
            </div>
            ` : ''}
            <a class="sidebar__link ${activePage === 'dashboard' ? 'sidebar__link--active' : ''}" data-page="dashboard" href="#">
              <span class="sidebar__link-icon">📊</span>
              <span>Dashboard</span>
            </a>
            ${!window.BrigadaAuth.isPromotor() && window.BrigadaAuth.hasSectorAccess('açougue') ? `
            <a class="sidebar__link ${activePage === 'products' ? 'sidebar__link--active' : ''}" data-page="products" href="#">
              <span class="sidebar__link-icon">🥩</span>
              <span>Açougue</span>
            </a>
            ` : ''}
            ${!window.BrigadaAuth.isPromotor() && window.BrigadaAuth.hasSectorAccess('pereciveis') ? `
            <a class="sidebar__link ${activePage === 'pereciveis' ? 'sidebar__link--active' : ''}" data-page="pereciveis" href="#">
              <span class="sidebar__link-icon">🍎</span>
              <span>Perecíveis</span>
            </a>
            ` : ''}
            ${!window.BrigadaAuth.isPromotor() ? `
            <a class="sidebar__link ${activePage === 'chambers' ? 'sidebar__link--active' : ''}" data-page="chambers" href="#">
              <span class="sidebar__link-icon">❄️</span>
              <span>Câmaras Frias</span>
            </a>
            ` : ''}
            ${!window.BrigadaAuth.isPromotor() ? `
            <a class="sidebar__link ${activePage === 'piso-loja' ? 'sidebar__link--active' : ''}" data-page="piso-loja" href="#">
              <span class="sidebar__link-icon">🏪</span>
              <span>Piso de Loja</span>
            </a>
            ` : ''}
            ${!window.BrigadaAuth.isPromotor() ? `
            <a class="sidebar__link ${activePage === 'catalog' ? 'sidebar__link--active' : ''}" data-page="catalog" href="#">
              <span class="sidebar__link-icon">📖</span>
              <span>Catálogo</span>
            </a>
            ` : ''}
            ${window.BrigadaAuth.isSuperAdmin() || window.BrigadaAuth.isGestao() || window.BrigadaAuth.currentUser?.role === 'lider' ? `
            <a class="sidebar__link ${activePage === 'resumo-mensal' ? 'sidebar__link--active' : ''}" data-page="resumo-mensal" href="#">
              <span class="sidebar__link-icon">📅</span>
              <span>Resumo Mensal</span>
            </a>
            ` : ''}
            <a class="sidebar__link ${activePage === 'conciliacao' ? 'sidebar__link--active' : ''}" data-page="conciliacao" href="#">
              <span class="sidebar__link-icon">⚖️</span>
              <span>Conciliação</span>
            </a>
            <a class="sidebar__link ${activePage === 'produtos-sem-nota' ? 'sidebar__link--active' : ''}" data-page="produtos-sem-nota" href="#">
              <span class="sidebar__link-icon">📄</span>
              <span>Sem Nota</span>
            </a>
            <a class="sidebar__link ${activePage === 'quebra' ? 'sidebar__link--active' : ''}" data-page="quebra" href="#">
              <span class="sidebar__link-icon">📋</span>
              <span>Formulário de Avaria</span>
            </a>
            <a class="sidebar__link ${activePage === 'cracha' ? 'sidebar__link--active' : ''}" data-page="cracha" href="#">
              <span class="sidebar__link-icon">🏷️</span>
              <span>Crachá</span>
            </a>

            ${!window.BrigadaAuth.isPromotor() ? `
            <div class="sidebar__section-label">Configurações</div>
            <a class="sidebar__link ${activePage === 'notifications' ? 'sidebar__link--active' : ''}" data-page="notifications" href="#">
              <span class="sidebar__link-icon">🔔</span>
              <span>Notificações</span>
            </a>
            ` : ''}

            ${isSuperAdmin ? `
            <div class="sidebar__section-label">Administração</div>
            <a class="sidebar__link ${activePage === 'users' ? 'sidebar__link--active' : ''}" data-page="users" href="#">
              <span class="sidebar__link-icon">👥</span>
              <span>Usuários</span>
            </a>
            <a class="sidebar__link ${activePage === 'admin' ? 'sidebar__link--active' : ''}" data-page="admin" href="#">
              <span class="sidebar__link-icon">🛡️</span>
              <span>Super Admin</span>
            </a>
            ` : ''}
          </nav>

          <div class="sidebar__footer">
            <div class="sidebar__actions" style="width: 100%;">
              <button class="btn-theme" id="btn-theme-toggle" title="Alternar Tema">
                <span id="theme-icon">${document.documentElement.classList.contains('light-theme') ? '🌙' : '☀️'}</span> <span class="logout-text" style="font-size: 0.8rem; margin-left: 4px;">Tema</span>
              </button>
              <button class="btn-logout" id="btn-logout" title="Sair do Sistema">
                <span>🚪</span> <span class="logout-text" style="font-size: 0.8rem; margin-left: 4px;">Sair</span>
              </button>
            </div>
          </div>
        </aside>
        ` : `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: var(--surface); border-bottom: 1px solid var(--border);">
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <img src="/static/icon.svg" alt="Logo" style="width: 32px; height: 32px; border-radius: 8px;">
            <h1 style="margin: 0; font-size: 1.25rem;">Catálogo Rápido</h1>
          </div>
          <button class="btn btn--outline" id="btn-logout-kiosk" style="padding: 0.5rem 1rem;">Sair</button>
        </div>
        `}

        <!-- Mobile menu toggle -->
        ${!isKiosk ? `<button class="mobile-menu-btn" id="mobile-menu-btn">☰</button>` : ''}

        <!-- Main content -->
        <main class="main-content" id="main-content">
          <div class="page-container fade-in" id="page-container">
            <!-- Conteúdo injetado aqui -->
          </div>
        </main>
      </div>

      <!-- Modal de perfil do usuário logado -->
      <div class="modal-overlay" id="profile-modal" style="display:none; z-index: 2000;">
        <div class="modal" style="max-width: 520px;">
          <div class="modal-header">
            <h3 class="modal-title">👤 Meu Perfil</h3>
            <button class="modal-close" id="profile-modal-close">✕</button>
          </div>
          <div class="modal-body" style="padding: 1.5rem;">
            <!-- Header Card do Usuário -->
            <div style="display: flex; align-items: center; gap: 14px; background: rgba(56,189,248,0.06); border: 1px solid rgba(56,189,248,0.25); border-radius: 10px; padding: 12px 16px; margin-bottom: 1.25rem;">
              <div class="user-avatar" id="profile-avatar-preview" style="width: 56px; height: 56px; border-radius: 50%; font-size: 1.4rem; font-weight: bold; display: flex; align-items: center; justify-content: center; background: var(--glass-bg); border: 2px solid #38bdf8; overflow: hidden; flex-shrink: 0;">US</div>
              <div style="flex: 1;">
                <div id="profile-card-name" style="font-weight: 700; font-size: 1.1rem; color: var(--text-primary);">Nome do Usuário</div>
                <div style="display: flex; gap: 6px; align-items: center; margin-top: 4px; flex-wrap: wrap;">
                  <span id="profile-card-role-badge" class="badge badge--primary" style="font-size: 0.72rem; padding: 2px 8px;">Função</span>
                  <span id="profile-card-sector-badge" style="font-size: 0.72rem; font-weight: 700; color: #38bdf8; background: rgba(56,189,248,0.15); border: 1px solid rgba(56,189,248,0.3); padding: 2px 8px; border-radius: 6px;">🏬 Setor</span>
                </div>
              </div>
            </div>

            <form id="profile-form">
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
                <div class="form-group">
                  <label class="form-label">Nome Completo *</label>
                  <input type="text" id="profile-field-name" class="form-input" placeholder="Seu nome" required style="width: 100%;">
                </div>
                <div class="form-group">
                  <label class="form-label">E-mail</label>
                  <input type="email" id="profile-field-email" class="form-input" disabled style="width: 100%; opacity: 0.6; cursor: not-allowed; background: rgba(255,255,255,0.02); border-color: var(--glass-border);">
                </div>
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
                <div class="form-group">
                  <label class="form-label">Setor / Departamento *</label>
                  <select id="profile-field-sector" class="form-input" style="width: 100%; font-weight: 600;">
                    <option value="açougue">🥩 Açougue</option>
                    <option value="pereciveis">🥗 Perecíveis / Frios</option>
                    <option value="todos">👑 Todos os Setores (Geral)</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Função / Cargo</label>
                  <input type="text" id="profile-field-role-display" class="form-input" disabled style="width: 100%; opacity: 0.7; cursor: not-allowed; background: rgba(255,255,255,0.02); font-weight: 600;">
                </div>
              </div>

              <div class="form-group" style="margin-bottom: 12px;">
                <label class="form-label">Nova Senha (deixe em branco para manter)</label>
                <input type="password" id="profile-field-password" class="form-input" placeholder="Mínimo 6 caracteres" style="width: 100%;">
              </div>

              <input type="hidden" id="profile-field-avatar-base64">
              <div class="form-group">
                <label class="form-label">Alterar Foto de Perfil</label>
                <div style="display: flex; align-items: center; gap: 10px;">
                  <input type="file" id="profile-field-avatar-file" class="form-input" accept="image/*" style="flex: 1; padding: 6px; background: transparent; border: 1px solid var(--glass-border);">
                  <button type="button" class="btn btn--ghost btn--sm" id="profile-btn-remove-avatar" style="padding: 6px 10px; font-size: 0.78rem; display: none;">Remover Foto</button>
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer" style="padding: 1rem 1.5rem; display: flex; justify-content: flex-end; gap: 8px;">
            <button class="btn btn--ghost" id="profile-btn-cancel">Cancelar</button>
            <button class="btn btn--primary" id="profile-btn-save" style="font-weight: 700;">✓ Salvar Alterações</button>
          </div>
        </div>
      </div>
    `;

    // Navigation events
    if (!isKiosk) {
      const sidebar = document.getElementById('sidebar');
      const overlay = document.getElementById('sidebar-overlay');
      const closeSidebar = () => {
        sidebar?.classList.remove('sidebar--open');
        overlay?.classList.remove('sidebar-overlay--visible');
      };

      root.querySelectorAll('.sidebar__link').forEach(link => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          const page = e.currentTarget.dataset.page;
          if (page !== activePage) {
            this.navigate(page);
          }
          if (window.innerWidth <= 768) {
            closeSidebar();
          }
        });
      });

      // Sidebar Add Product Button
      document.getElementById('sidebar-btn-add-product')?.addEventListener('click', async (e) => {
        e.preventDefault();
        const user = window.BrigadaAuth.currentUser;
        const sector = (user?.sector || 'açougue').toLowerCase();

        let targetPage = 'products';
        if (sector === 'pereciveis') targetPage = 'pereciveis';

        await this.navigate(targetPage);
        if (window.innerWidth <= 768) {
          closeSidebar();
        }

        setTimeout(() => {
          const pageContainer = document.getElementById('page-container');
          if (!pageContainer) return;
          if (targetPage === 'products' && window.BrigadaProducts) {
            window.BrigadaProducts.openAddModal(pageContainer);
          } else if (targetPage === 'pereciveis' && window.BrigadaPereciveis) {
            window.BrigadaPereciveis.openAddModal(pageContainer);
          }
        }, 50);
      });

      // Toggle Sidebar events
      document.getElementById('sidebar-toggle')?.addEventListener('click', () => {
        const appSidebar = document.getElementById('app-sidebar');
        const icon = document.getElementById('sidebar-toggle-icon');
        appSidebar.classList.toggle('sidebar-collapsed');
        const collapsed = appSidebar.classList.contains('sidebar-collapsed');
        icon.textContent = collapsed ? '☰' : '☰';
        localStorage.setItem('sidebar-collapsed', collapsed);
        document.getElementById('sidebar-toggle').title = collapsed ? 'Expandir menu' : 'Recolher menu';
      });

      // Mobile Menu
      document.getElementById('mobile-menu-btn')?.addEventListener('click', () => {
        sidebar?.classList.add('sidebar--open');
        overlay?.classList.add('sidebar-overlay--visible');
      });
      overlay?.addEventListener('click', () => {
        closeSidebar();
      });
    }

    // Logout
    const logoutHandler = () => {
      if (!isKiosk) {
        document.getElementById('sidebar')?.classList.remove('sidebar--open');
        document.getElementById('sidebar-overlay')?.classList.remove('sidebar-overlay--visible');
      }
      window.BrigadaAuth.logout();
      window.BrigadaUI.showToast(isKiosk ? 'Sessão encerrada.' : 'Até logo! 👋', 'success');
      this.navigate('login');
    };
    
    document.getElementById('btn-logout')?.addEventListener('click', logoutHandler);
    document.getElementById('btn-logout-kiosk')?.addEventListener('click', logoutHandler);

    // Theme Toggle
    document.getElementById('btn-theme-toggle')?.addEventListener('click', () => {
      const isLight = document.documentElement.classList.toggle('light-theme');
      localStorage.setItem('brigada-theme', isLight ? 'light' : 'dark');
      const themeIcon = document.getElementById('theme-icon');
      if (themeIcon) {
        themeIcon.textContent = isLight ? '🌙' : '☀️';
      }
    });

    // Mobile menu toggle is handled inside the !isKiosk block
    // Sidebar toggle (desktop collapse/expand)
    const toggleBtn = document.getElementById('sidebar-toggle');
    const appShell = root.querySelector('.app-shell');
    const toggleIconEl = document.getElementById('sidebar-toggle-icon');

    toggleBtn?.addEventListener('click', () => {
      if (appShell) {
        const isCurrentlyCollapsed = appShell.classList.toggle('sidebar-collapsed');
        localStorage.setItem('sidebar-collapsed', isCurrentlyCollapsed ? 'true' : 'false');
        if (toggleBtn) {
          toggleBtn.title = isCurrentlyCollapsed ? 'Expandir menu' : 'Recolher menu';
        }
      }
    });


    // Eventos do Modal de Perfil
    const profileModal = document.getElementById('profile-modal');
    const closeProfileModal = () => {
      if (profileModal) {
        profileModal.classList.remove('modal-overlay--visible');
        setTimeout(() => profileModal.style.display = 'none', 250);
      }
    };

    document.querySelector('.sidebar__user')?.addEventListener('click', () => {
      const currentUser = window.BrigadaAuth.currentUser;
      if (!currentUser) return;

      const nameInput = document.getElementById('profile-field-name');
      const emailInput = document.getElementById('profile-field-email');
      const sectorSelect = document.getElementById('profile-field-sector');
      const roleDisplay = document.getElementById('profile-field-role-display');
      const cardName = document.getElementById('profile-card-name');
      const cardRoleBadge = document.getElementById('profile-card-role-badge');
      const cardSectorBadge = document.getElementById('profile-card-sector-badge');
      const pwdInput = document.getElementById('profile-field-password');
      const base64Input = document.getElementById('profile-field-avatar-base64');
      const previewEl = document.getElementById('profile-avatar-preview');
      const removeBtn = document.getElementById('profile-btn-remove-avatar');
      const fileInput = document.getElementById('profile-field-avatar-file');

      nameInput.value = currentUser.name;
      emailInput.value = currentUser.email;
      if (sectorSelect) sectorSelect.value = (currentUser.sector || 'açougue').toLowerCase();

      const roleLabel = currentUser.role === 'superadmin' ? '🛡️ Super Admin' : 
                        currentUser.role === 'gestao' ? '👥 Gestão' : 
                        currentUser.role === 'promotor' ? '📋 Promotor' : 
                        currentUser.role === 'lider' ? '👤 Usuário / Líder' : '👤 Usuário / Operador';
      if (roleDisplay) roleDisplay.value = roleLabel;
      if (cardName) cardName.textContent = currentUser.name;
      if (cardRoleBadge) cardRoleBadge.textContent = roleLabel;
      if (cardSectorBadge) cardSectorBadge.textContent = `🏬 Setor: ${(currentUser.sector || 'Açougue').toUpperCase()}`;

      pwdInput.value = '';
      fileInput.value = '';

      if (currentUser.avatar && (currentUser.avatar.startsWith('data:image/') || currentUser.avatar.startsWith('http'))) {
        base64Input.value = currentUser.avatar;
        previewEl.innerHTML = `<img src="${currentUser.avatar}" style="width:100%; height:100%; object-fit:cover; border-radius:50%;">`;
        previewEl.style.background = 'none';
        removeBtn.style.display = 'inline-block';
      } else {
        base64Input.value = '';
        previewEl.textContent = currentUser.avatar || 'US';
        previewEl.style.background = 'var(--glass-bg)';
        removeBtn.style.display = 'none';
      }

      profileModal.style.display = 'flex';
      requestAnimationFrame(() => profileModal.classList.add('modal-overlay--visible'));
    });

    document.getElementById('profile-modal-close')?.addEventListener('click', closeProfileModal);
    document.getElementById('profile-btn-cancel')?.addEventListener('click', closeProfileModal);
    profileModal?.addEventListener('click', (e) => {
      if (e.target.id === 'profile-modal') closeProfileModal();
    });

    const profileFileInput = document.getElementById('profile-field-avatar-file');
    const profilePreviewEl = document.getElementById('profile-avatar-preview');
    const profileBase64Input = document.getElementById('profile-field-avatar-base64');
    const profileRemoveBtn = document.getElementById('profile-btn-remove-avatar');

    profileFileInput?.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const max_size = 128;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > max_size) {
              height *= max_size / width;
              width = max_size;
            }
          } else {
            if (height > max_size) {
              width *= max_size / height;
              height = max_size;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          const resizedBase64 = canvas.toDataURL('image/jpeg', 0.85);
          profileBase64Input.value = resizedBase64;
          profilePreviewEl.innerHTML = `<img src="${resizedBase64}" style="width:100%; height:100%; object-fit:cover; border-radius:50%;">`;
          profilePreviewEl.style.background = 'none';
          profileRemoveBtn.style.display = 'inline-block';
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    });

    profileRemoveBtn?.addEventListener('click', () => {
      profileFileInput.value = '';
      profileBase64Input.value = '';
      const name = document.getElementById('profile-field-name').value.trim() || 'US';
      const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
      profilePreviewEl.textContent = initials;
      profilePreviewEl.style.background = 'var(--glass-bg)';
      profileRemoveBtn.style.display = 'none';
    });

    document.getElementById('profile-btn-save')?.addEventListener('click', async () => {
      const currentUser = window.BrigadaAuth.currentUser;
      if (!currentUser) return;

      const name = document.getElementById('profile-field-name').value.trim();
      const password = document.getElementById('profile-field-password').value;
      const sector = document.getElementById('profile-field-sector')?.value || currentUser.sector || 'açougue';
      const base64Avatar = document.getElementById('profile-field-avatar-base64').value;
      
      if (!name) {
        window.BrigadaUI.showToast('O nome é obrigatório.', 'error');
        return;
      }

      if (password && password.length < 6) {
        window.BrigadaUI.showToast('A senha deve ter pelo menos 6 caracteres.', 'error');
        return;
      }

      const avatar = base64Avatar || name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
      const payload = {
        name,
        email: currentUser.email,
        role: currentUser.role,
        sector: sector,
        status: currentUser.status,
        avatar,
        ...(password ? { password } : {})
      };

      try {
        await window.BrigadaData.updateUser(currentUser.id, payload);
        
        currentUser.name = name;
        currentUser.avatar = avatar;
        currentUser.sector = sector;
        sessionStorage.setItem('brigada_user', JSON.stringify(currentUser));
        
        window.BrigadaRouter.updateUserInfo();

        window.BrigadaUI.showToast('Perfil e Setor atualizados com sucesso!', 'success');
        closeProfileModal();
      } catch (err) {
        window.BrigadaUI.showToast(err.message || 'Erro ao salvar alterações do perfil.', 'error');
      }
    });

    // Render page content
    const pageContainer = document.getElementById('page-container');
    this.renderPage(activePage, pageContainer);
  },

  renderPage(page, container) {
    const user = window.BrigadaAuth.currentUser;

    if (page === 'dashboard') {
      window.BrigadaDashboard.render(container, user.role);
      if (window.BrigadaVerseOfTheDay) {
        window.BrigadaVerseOfTheDay.init();
      }
    } else if (page === 'conciliacao') {
      if (window.BrigadaConciliacao) {
        window.BrigadaConciliacao.render(container);
      } else {
        container.innerHTML = `<div class="empty-state">Erro ao carregar conciliação</div>`;
      }
    } else if (page === 'catalog') {
      if (window.BrigadaCatalog) {
        window.BrigadaCatalog.render(container);
      } else {
        container.innerHTML = `
          <div class="empty-state" style="padding:4rem 2rem; text-align:center;">
            <div class="empty-state__icon" style="font-size: 3rem; margin-bottom: 1rem;">🔄</div>
            <h3 style="margin-bottom: 0.5rem; color: var(--text-primary);">Atualização Necessária</h3>
            <p style="color: var(--text-secondary); max-width: 400px; margin: 0 auto;">
              Uma nova versão do sistema está disponível. Por favor, faça uma <strong>atualização forçada (Ctrl + F5)</strong> ou feche e abra a aba novamente para carregar a nova tela de catálogo.
            </p>
          </div>
        `;
      }
    } else if (page === 'products') {
      if (!window.BrigadaAuth.hasSectorAccess('açougue')) {
        this.navigate('dashboard');
        return;
      }
      window.BrigadaProducts.render(container);
    } else if (page === 'product-list') {
      if (!window.BrigadaAuth.hasSectorAccess('açougue')) {
        this.navigate('dashboard');
        return;
      }
      window.BrigadaProductList.render(container);
    } else if (page === 'chambers') {
      window.BrigadaChambers.render(container);
    } else if (page === 'piso-loja' || page === 'piso_loja') {
      if (window.BrigadaPisoLoja) {
        window.BrigadaPisoLoja.render(container);
      } else {
        container.innerHTML = `<div class="empty-state">Erro ao carregar Piso de Loja</div>`;
      }
    } else if (page === 'pereciveis') {
      if (!window.BrigadaAuth.hasSectorAccess('pereciveis')) {
        this.navigate('dashboard');
        return;
      }
      window.BrigadaPereciveis.render(container);
    } else if (page === 'users') {
      if (!window.BrigadaAuth.requireSuperAdmin()) return;
      window.BrigadaUsers.render(container);
    } else if (page === 'notifications') {
      window.BrigadaNotifications.render(container);
    } else if (page === 'produtos-sem-nota') {
      if (window.BrigadaProdutosSemNota) {
        window.BrigadaProdutosSemNota.render(container);
      } else {
        container.innerHTML = `<div class="empty-state">Erro ao carregar página de Produtos Sem Nota</div>`;
      }
    } else if (page === 'quebra') {
      if (window.BrigadaQuebra) {
        window.BrigadaQuebra.render(container);
      } else {
        container.innerHTML = `<div class="empty-state">Erro ao carregar página de Quebras</div>`;
      }
    } else if (page === 'cracha') {
      if (window.BrigadaCracha) {
        window.BrigadaCracha.render(container);
      } else {
        container.innerHTML = `<div class="empty-state">Erro ao carregar página de Crachá</div>`;
      }
    } else if (page === 'admin') {
      if (!window.BrigadaAuth.requireSuperAdmin()) return;
      this.renderAdminPanel(container);
    } else if (page === 'resumo-mensal') {
      if (!(window.BrigadaAuth.isSuperAdmin() || window.BrigadaAuth.isGestao() || window.BrigadaAuth.currentUser?.role === 'lider')) {
        this.navigate('dashboard');
        return;
      }
      if (window.BrigadaResumoMensal) {
        window.BrigadaResumoMensal.render(container);
      } else {
        container.innerHTML = `<div class="empty-state">Erro ao carregar resumo mensal</div>`;
      }
    }

    // Render active announcement banners for the user
    if (window.BrigadaBanners) {
      window.BrigadaBanners.renderUserBanners(container);
    }
  },

  renderAdminPanel(container) {
    const stats = window.BrigadaData.getStats();
    const products = window.BrigadaData.products;

    const byCategory = {
      aves: products.filter(p => p.category === 'aves').length,
      suino: products.filter(p => p.category === 'suino').length,
      bovino: products.filter(p => p.category === 'bovino').length,
      pescado: products.filter(p => p.category === 'pescado').length,
    };

    const criticalProducts = products
      .map(p => ({ ...p, _status: window.BrigadaData.getProductStatus(p) }))
      .filter(p => p._status.days < 0 || p._status.days === 0)
      .sort((a, b) => a._status.days - b._status.days);

    container.innerHTML = `
      <div class="panel-header">
        <div class="panel-header__left">
          <h2 class="panel-title">🛡️ Painel Super Admin</h2>
          <p class="panel-subtitle">Visão geral e controle total do sistema</p>
        </div>
        <span class="badge badge--superadmin" style="padding:0.4rem 0.8rem;font-size:0.8rem;">Super Admin</span>
      </div>

      <!-- Overview cards -->
      <div class="dashboard-grid dashboard-grid--3 stagger" style="margin-bottom:2rem;">
        <div class="metric-card">
          <div class="metric-card__icon">📦</div>
          <div class="metric-card__body">
            <p class="metric-card__label">Total de Produtos</p>
            <p class="metric-card__value">${stats.total}</p>
            <p class="metric-card__sub">Nos 3 setores</p>
          </div>
        </div>
        <div class="metric-card metric-card--danger">
          <div class="metric-card__icon">🚨</div>
          <div class="metric-card__body">
            <p class="metric-card__label">Críticos</p>
            <p class="metric-card__value">${stats.expired + stats.expiresToday}</p>
            <p class="metric-card__sub">${stats.expired} vencidos + ${stats.expiresToday} hoje</p>
          </div>
        </div>
        <div class="metric-card metric-card--success">
          <div class="metric-card__icon">👥</div>
          <div class="metric-card__body">
            <p class="metric-card__label">Usuários Ativos</p>
            <p class="metric-card__value">${stats.activeUsers} / ${stats.totalUsers}</p>
            <p class="metric-card__sub">No sistema</p>
          </div>
        </div>
      </div>

      <!-- Category breakdown -->
      <div class="dashboard-grid dashboard-grid--4 stagger" style="margin-bottom:2rem;">
        <div class="cat-overview-card cat-overview-card--aves">
          <div class="cat-overview-card__icon">🐔</div>
          <div class="cat-overview-card__body">
            <h3>Aves</h3>
            <p class="cat-count">${byCategory.aves} produtos</p>
            <div class="cat-status-row">
              <span class="badge badge--ok">${products.filter(p => p.category === 'aves' && window.BrigadaData.getProductStatus(p).days > 3).length} OK</span>
              <span class="badge badge--warning">${products.filter(p => p.category === 'aves' && window.BrigadaData.getProductStatus(p).days >= 0 && window.BrigadaData.getProductStatus(p).days <= 3).length} atenção</span>
              <span class="badge badge--expired">${products.filter(p => p.category === 'aves' && window.BrigadaData.getProductStatus(p).days < 0).length} vencido</span>
            </div>
          </div>
        </div>
        <div class="cat-overview-card cat-overview-card--suino">
          <div class="cat-overview-card__icon">🐷</div>
          <div class="cat-overview-card__body">
            <h3>Suíno</h3>
            <p class="cat-count">${byCategory.suino} produtos</p>
            <div class="cat-status-row">
              <span class="badge badge--ok">${products.filter(p => p.category === 'suino' && window.BrigadaData.getProductStatus(p).days > 3).length} OK</span>
              <span class="badge badge--warning">${products.filter(p => p.category === 'suino' && window.BrigadaData.getProductStatus(p).days >= 0 && window.BrigadaData.getProductStatus(p).days <= 3).length} atenção</span>
              <span class="badge badge--expired">${products.filter(p => p.category === 'suino' && window.BrigadaData.getProductStatus(p).days < 0).length} vencido</span>
            </div>
          </div>
        </div>
        <div class="cat-overview-card cat-overview-card--bovino">
          <div class="cat-overview-card__icon">🐮</div>
          <div class="cat-overview-card__body">
            <h3>Bovino</h3>
            <p class="cat-count">${byCategory.bovino} produtos</p>
            <div class="cat-status-row">
              <span class="badge badge--ok">${products.filter(p => p.category === 'bovino' && window.BrigadaData.getProductStatus(p).days > 3).length} OK</span>
              <span class="badge badge--warning">${products.filter(p => p.category === 'bovino' && window.BrigadaData.getProductStatus(p).days >= 0 && window.BrigadaData.getProductStatus(p).days <= 3).length} atenção</span>
              <span class="badge badge--expired">${products.filter(p => p.category === 'bovino' && window.BrigadaData.getProductStatus(p).days < 0).length} vencido</span>
            </div>
          </div>
        </div>
        <div class="cat-overview-card cat-overview-card--pescado">
          <div class="cat-overview-card__icon">🐟</div>
          <div class="cat-overview-card__body">
            <h3>Pescado</h3>
            <p class="cat-count">${byCategory.pescado} produtos</p>
            <div class="cat-status-row">
              <span class="badge badge--ok">${products.filter(p => p.category === 'pescado' && window.BrigadaData.getProductStatus(p).days > 3).length} OK</span>
              <span class="badge badge--warning">${products.filter(p => p.category === 'pescado' && window.BrigadaData.getProductStatus(p).days >= 0 && window.BrigadaData.getProductStatus(p).days <= 3).length} atenção</span>
              <span class="badge badge--expired">${products.filter(p => p.category === 'pescado' && window.BrigadaData.getProductStatus(p).days < 0).length} vencido</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Critical products -->
      <div class="glass-panel" style="margin-bottom:2rem;">
        <div class="glass-panel__header">
          <h3 class="glass-panel__title">🚨 Produtos Críticos</h3>
          <span class="badge badge--expired">${criticalProducts.length} produto${criticalProducts.length !== 1 ? 's' : ''}</span>
        </div>
        ${criticalProducts.length === 0 ? `
          <div class="empty-state" style="padding:2rem;"><div class="empty-state__icon">✅</div><p>Nenhum produto crítico!</p></div>
        ` : `
          <div class="table-scroll">
            <table class="data-table">
              <thead>
                <tr><th>PLU</th><th>Produto</th><th>Categoria</th><th>Validade</th><th>Status</th><th>Localização</th></tr>
              </thead>
              <tbody>
                ${criticalProducts.map(p => `
                  <tr>
                    <td data-label="PLU"><span class="plu-badge">${p.plu}</span></td>
                    <td data-label="Produto" class="product-name" onclick="window.BrigadaUI.showProductView('${p.id}')" style="cursor: pointer; text-decoration: underline; color: var(--primary);" title="Ver detalhes">${p.name}</td>
                    <td data-label="Categoria"><span class="cat-pill cat-pill--${p.category}">${p.category === 'aves' ? '🐔 Aves' : p.category === 'suino' ? '🐷 Suíno' : p.category === 'bovino' ? '🐮 Bovino' : '🐟 Pescado'}</span></td>
                    <td data-label="Validade">${window.BrigadaData.formatDate(p.endDate)}</td>
                    <td data-label="Status"><span class="badge ${p._status.class}">${p._status.icon} ${p._status.label}</span></td>
                    <td data-label="Localização">${p.location || '—'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `}
      </div>

      <!-- Quick actions -->
      <div class="glass-panel" style="margin-bottom:2rem;">
        <h3 class="glass-panel__title" style="margin-bottom:1rem;">⚡ Ações Rápidas</h3>
        <div class="quick-actions">
          <button class="quick-action-btn" id="qa-dashboard">
            <span class="quick-action-btn__icon">📊</span>
            <span>Ir ao Dashboard</span>
          </button>
          <button class="quick-action-btn" id="qa-products">
            <span class="quick-action-btn__icon">📦</span>
            <span>Gestão de Produtos</span>
          </button>
          <button class="quick-action-btn" id="qa-users">
            <span class="quick-action-btn__icon">👥</span>
            <span>Gestão de Usuários</span>
          </button>
          <button class="quick-action-btn" id="qa-notifications">
            <span class="quick-action-btn__icon">🔔</span>
            <span>Notificações</span>
          </button>
        </div>
      </div>

      <!-- Gestão de Usuários integrada -->
      <div class="glass-panel" style="margin-bottom:2rem;">
        <div id="admin-users-wrapper"></div>
      </div>
    `;

    container.querySelector('#qa-dashboard')?.addEventListener('click', () => this.navigate('dashboard'));
    container.querySelector('#qa-products')?.addEventListener('click', () => this.navigate('products'));
    container.querySelector('#qa-users')?.addEventListener('click', () => this.navigate('users'));
    container.querySelector('#qa-notifications')?.addEventListener('click', () => this.navigate('notifications'));

    // Renderiza a Gestão de Usuários diretamente no Painel do Administrador
    const adminUsersWrapper = container.querySelector('#admin-users-wrapper');
    if (adminUsersWrapper) {
      window.BrigadaUsers.render(adminUsersWrapper);
    }
  },

  updateUserInfo() {
    const user = window.BrigadaAuth.currentUser;
    if (!user) return;
    const elName = document.getElementById('sidebar-user-name');
    if (elName) elName.textContent = user.name;
    const elSector = document.getElementById('sidebar-user-sector');
    if (elSector) elSector.textContent = `🏬 Setor: ${(user.sector || 'Açougue').toUpperCase()}`;
    const elAvatar = document.getElementById('sidebar-user-avatar');
    if (elAvatar) {
      const hasImage = user.avatar && (user.avatar.startsWith('data:image/') || user.avatar.startsWith('http'));
      if (hasImage) {
        elAvatar.innerHTML = `<img src="${user.avatar}" alt="${user.name}" style="width:100%; height:100%; object-fit:cover; border-radius:50%;">`;
        elAvatar.style.background = 'none';
      } else {
        elAvatar.textContent = user.avatar;
        elAvatar.style.background = this.avatarColor(user.name);
      }
    }
  },

  avatarColor(name) {
    const colors = ['#6366f1', '#8b5cf6', '#a855f7', '#ec4899', '#14b8a6', '#f59e0b', '#ef4444'];
    let hash = 0;
    for (let c of name) hash = c.charCodeAt(0) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  },
};

// ── Banners & Recados Display Engine ───────────────────────────────────────
window.BrigadaBanners = {
  async renderUserBanners(container) {
    const user = window.BrigadaAuth.currentUser;
    if (!user || !container) return;

    try {
      const rawBanners = await window.BrigadaData.loadSettings('banners');
      const banners = Array.isArray(rawBanners) ? rawBanners : [];
      if (banners.length === 0) return;

      const activeBanners = banners.filter(b => {
        if (!b.active) return false;
        if (sessionStorage.getItem(`dismissed_banner_${b.id}`)) return false;

        // Target matching
        if (b.targetType === 'all') return true;
        if (b.targetType === 'sector') {
          if (!b.targetValue) return true;
          return user.sector === 'todos' || user.sector === b.targetValue;
        }
        if (b.targetType === 'user') {
          return String(user.id) === String(b.targetValue) || user.email === b.targetValue;
        }
        return false;
      });

      if (activeBanners.length === 0) return;

      let wrapper = container.querySelector('#app-announcement-banners');
      if (!wrapper) {
        wrapper = document.createElement('div');
        wrapper.id = 'app-announcement-banners';
        wrapper.style.cssText = 'margin-bottom: 1.5rem; display: flex; flex-direction: column; gap: 0.75rem; width: 100%;';
        container.insertBefore(wrapper, container.firstChild);
      } else {
        wrapper.innerHTML = '';
      }

      wrapper.innerHTML = activeBanners.map(b => this._renderBannerCard(b)).join('');

      wrapper.querySelectorAll('.btn-close-banner').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const card = e.currentTarget.closest('.announcement-banner');
          const bannerId = btn.dataset.id;
          sessionStorage.setItem(`dismissed_banner_${bannerId}`, 'true');
          if (card) {
            card.style.opacity = '0';
            card.style.transform = 'translateY(-10px)';
            setTimeout(() => card.remove(), 250);
          }
        });
      });
    } catch (err) {
      console.warn('Erro ao carregar banners de aviso:', err);
    }
  },

  _renderBannerCard(b) {
    const typeConfig = {
      info:    { icon: 'ℹ️', color: '#818cf8', bg: 'rgba(99,102,241,0.12)', border: 'rgba(99,102,241,0.3)' },
      warning: { icon: '⚠️', color: '#fbbf24', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)' },
      alert:   { icon: '🚨', color: '#f87171', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)' },
      success: { icon: '✅', color: '#4ade80', bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.3)' }
    }[b.type || 'info'] || { icon: '📌', color: '#818cf8', bg: 'rgba(99,102,241,0.12)', border: 'rgba(99,102,241,0.3)' };

    let targetLabel = '🌐 Todos os Usuários';
    if (b.targetType === 'sector') {
      const sectorNames = { açougue: '🥩 Açougue', pereciveis: '🧊 Perecíveis' };
      targetLabel = `🏢 Setor: ${sectorNames[b.targetValue] || b.targetValue}`;
    } else if (b.targetType === 'user') {
      targetLabel = `👤 Exclusivo para Você`;
    }

    return `
      <div class="announcement-banner" style="
        background: ${typeConfig.bg};
        border: 1px solid ${typeConfig.border};
        border-left: 4px solid ${typeConfig.color};
        border-radius: 12px; padding: 1.1rem 1.25rem;
        position: relative; transition: all 0.3s ease;
        box-shadow: 0 8px 24px rgba(0,0,0,0.15); backdrop-filter: blur(10px);
        animation: fadeInDown 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      ">
        <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem;">
          <div style="display: flex; gap: 0.85rem; align-items: flex-start; flex: 1;">
            <span style="font-size: 1.5rem; line-height: 1; flex-shrink: 0; margin-top: 2px;">${typeConfig.icon}</span>
            <div style="flex: 1;">
              <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.35rem; flex-wrap: wrap;">
                <h4 style="margin: 0; font-size: 0.95rem; font-weight: 700; color: var(--text-primary);">${b.title || 'Recado Importante'}</h4>
                <span class="badge" style="font-size: 0.68rem; padding: 0.15rem 0.5rem; background: ${typeConfig.color}25; color: ${typeConfig.color}; border: 1px solid ${typeConfig.color}40;">
                  ${targetLabel}
                </span>
              </div>
              <div style="font-size: 0.88rem; color: var(--text-secondary); line-height: 1.5; white-space: pre-line;">${b.message || ''}</div>
              ${b.createdAt ? `<div style="font-size: 0.72rem; color: var(--text-tertiary); margin-top: 0.5rem;">Publicado em ${new Date(b.createdAt).toLocaleDateString('pt-BR')} ${b.authorName ? 'por ' + b.authorName : ''}</div>` : ''}
            </div>
          </div>
          <button type="button" class="btn-close-banner" data-id="${b.id}" title="Fechar recado" style="
            background: transparent; border: none; color: var(--text-tertiary); font-size: 1.2rem;
            cursor: pointer; padding: 0.2rem 0.5rem; border-radius: 6px; line-height: 1;
            transition: all 0.2s ease;
          " onmouseover="this.style.color='var(--text-primary)'; this.style.background='rgba(255,255,255,0.1)';" onmouseout="this.style.color='var(--text-tertiary)'; this.style.background='transparent';">
            ✕
          </button>
        </div>
      </div>
    `;
  }
};

// ── Bootstrap ─────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  window.BrigadaRouter.init();
});
