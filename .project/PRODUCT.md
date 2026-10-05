# Contrato do piloto

Produto de finanças pessoais; fundador como primeiro usuário. Bancos prioritários: BB, Mercado Pago, PicPay e Inter. Tipos PF/PJ e cartões continuam pendentes.

Primeira entrega executável: contas, receitas/despesas/Pix, transferências, compras parceladas e pagamento de fatura, dashboard e CSV/OFX revisável. Persistência local de demonstração separada da configuração Supabase. O modo local não é cofre para dados reais sensíveis. Dados demonstrativos só entram por ação explícita.

Fluxo de despesa: escolher conta → valor, descrição, categoria e data → confirmar → saldo/histórico atualizados.
Fluxo de cartão: cadastrar fechamento/vencimento → compra e parcelas → projeção por fatura → pagamento pela conta, sem duplicar despesa.
Fluxo de arquivo: escolher conta → ler CSV/OFX → revisar seleção → confirmar lote atomicamente. Não enviar arquivos a terceiros.

Open Finance, PDF bancário, notificações nativas, recuperação/exclusão de conta e teste em dispositivo são fases com critérios próprios. Não apresentar recursos pendentes como conectados.
