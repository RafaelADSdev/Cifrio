import { Page } from '../../ui/components';
import { RecurringAccounts } from '../../ui/RecurringAccounts';

export default function Subscriptions() {
  return <Page title="Assinaturas" subtitle="Tudo que renova todo mês, em um só lugar.">
    <RecurringAccounts plan="subscription" />
  </Page>;
}
