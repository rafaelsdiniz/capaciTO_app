import { Tabs } from 'expo-router';

import { type IconName } from '@/components/ui/button';
import { TabBar } from '@/components/ui/tab-bar';
import { Brand } from '@/constants/theme';

const ICONS: Record<string, IconName> = {
  carteira: 'wallet',
  aprender: 'school',
  vagas: 'briefcase',
  perfil: 'person',
};

// Área do Trabalhador — 4 abas: Carteira, Aprender, Vagas, Perfil.
export default function TrabalhadorLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <TabBar {...props} icons={ICONS} activeColor={Brand.azulRio} />}>
      <Tabs.Screen name="carteira" options={{ title: 'Carteira' }} />
      <Tabs.Screen name="aprender" options={{ title: 'Aprender' }} />
      <Tabs.Screen name="vagas" options={{ title: 'Vagas' }} />
      <Tabs.Screen name="perfil" options={{ title: 'Perfil' }} />

      {/* Telas de detalhe (não viram aba) */}
      <Tabs.Screen name="escanear" options={{ href: null }} />
      <Tabs.Screen name="certificados" options={{ href: null }} />
      <Tabs.Screen name="perfil-editar" options={{ href: null }} />
      <Tabs.Screen name="minhas-candidaturas" options={{ href: null }} />
      <Tabs.Screen name="curso/[id]" options={{ href: null }} />
      <Tabs.Screen name="vaga/[id]" options={{ href: null }} />
    </Tabs>
  );
}
