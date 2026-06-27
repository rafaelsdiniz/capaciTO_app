import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet } from 'react-native';

import { CompetenciaBadge } from '@/components/capacitacao/competencia-badge';
import { AppHeader } from '@/components/ui/app-header';
import { EmptyState } from '@/components/ui/empty-state';
import { Screen } from '@/components/ui/screen';
import { Brand, Spacing, TabBarSpace } from '@/constants/theme';
import { api } from '@/lib/api';
import type { Certificacao } from '@/lib/api/types';

/** Lista completa de certificações da carteira (RF06, RF22). */
export default function CertificadosScreen() {
  const [certs, setCerts] = useState<Certificacao[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let ativo = true;
    api.perfil
      .me()
      .then((p) => ativo && setCerts(p.certificacoes))
      .finally(() => ativo && setCarregando(false));
    return () => {
      ativo = false;
    };
  }, []);

  return (
    <Screen padded={false}>
      <AppHeader back title="Meus certificados" />
      {carregando ? (
        <ActivityIndicator color={Brand.azulRio} style={{ marginTop: Spacing.five }} />
      ) : (
        <FlatList
          data={certs}
          keyExtractor={(c) => c.id}
          contentContainerStyle={styles.lista}
          renderItem={({ item }) => <CompetenciaBadge certificacao={item} />}
          ListEmptyComponent={<EmptyState icon="ribbon-outline" title="Sem certificados" message="Conclua treinamentos para certificar competências." />}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  lista: { paddingHorizontal: Spacing.four, paddingBottom: TabBarSpace, gap: Spacing.two },
});
