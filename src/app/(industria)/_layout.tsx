import { Tabs } from 'expo-router';

import { type IconName } from '@/components/ui/button';
import { TabBar } from '@/components/ui/tab-bar';
import { Brand } from '@/constants/theme';

const ICONS: Record<string, IconName> = {
  inicio: 'home',
  estacoes: 'cube',
  vagas: 'briefcase',
  buscar: 'search',
};

// Área da Indústria — abas: Início, Estações, Vagas, Buscar.
export default function IndustriaLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <TabBar {...props} icons={ICONS} activeColor={Brand.teal} />}>
      <Tabs.Screen name="inicio" options={{ title: 'Início' }} />
      <Tabs.Screen name="estacoes" options={{ title: 'Estações' }} />
      <Tabs.Screen name="vagas" options={{ title: 'Vagas' }} />
      <Tabs.Screen name="buscar" options={{ title: 'Buscar' }} />

      {/* Telas de detalhe (não viram aba) */}
      <Tabs.Screen name="estacao-nova" options={{ href: null }} />
      <Tabs.Screen name="estacao/[id]" options={{ href: null }} />
      <Tabs.Screen name="vaga-nova" options={{ href: null }} />
    </Tabs>
  );
}
