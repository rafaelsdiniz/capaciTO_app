import { Tabs } from 'expo-router';

import { type IconName } from '@/components/ui/button';
import { TabBar } from '@/components/ui/tab-bar';
import { Brand } from '@/constants/theme';

const ICONS: Record<string, IconName> = {
  vagas: 'briefcase',
  editais: 'school',
  'plano-carreira': 'trending-up',
  perfil: 'person',
};

// Área do Trabalhador — 4 abas: Vagas (home), Editais & Cursos, Plano de carreira, Perfil.
export default function TrabalhadorLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <TabBar {...props} icons={ICONS} activeColor={Brand.azulRio} />}>
      <Tabs.Screen name="vagas" options={{ title: 'Vagas' }} />
      <Tabs.Screen name="editais" options={{ title: 'Editais' }} />
      <Tabs.Screen name="plano-carreira" options={{ title: 'Carreira' }} />
      <Tabs.Screen name="perfil" options={{ title: 'Perfil' }} />

      {/* Telas de detalhe (não viram aba) */}
      <Tabs.Screen name="perfil-editar" options={{ href: null }} />
      <Tabs.Screen name="minhas-candidaturas" options={{ href: null }} />
      <Tabs.Screen name="vaga/[id]" options={{ href: null }} />
    </Tabs>
  );
}
