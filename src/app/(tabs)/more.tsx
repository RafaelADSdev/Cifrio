import { router } from 'expo-router';
import { Box, Button, Page } from '../../ui/components';
export default function More() {
 return <Page title="Mais" subtitle="Outros recursos do seu Cifrio." compact>
  <Box title="Organizar finanças">
   <Button title="Importar extrato" secondary icon="download" onPress={() => router.push('/imports')} />
   <Button title="Ver assinaturas" label="Assinaturas" secondary icon="tv" onPress={() => router.push('/subscriptions')} />
   <Button title="Ver estatísticas" label="Estatísticas" secondary icon="pie-chart" onPress={() => router.push('/statistics')} />
  </Box>
  <Box title="Seu perfil e ajuda">
   <Button title="Abrir perfil" label="Perfil" secondary icon="user" onPress={() => router.push('/profile')} />
   <Button title="Central de ajuda" secondary icon="help-circle" onPress={() => router.push('/help')} />
  </Box>
 </Page>;
}
