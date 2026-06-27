import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { Brand } from '@/constants/theme';

/** Foto de perfil padrão usada em todas as contas (placeholder único — RF05). */
const FOTO_PADRAO = require('@/assets/images/fotodeperfil.avif');

/** Avatar do usuário. Hoje mostra a foto de perfil padrão para qualquer conta. */
export function Avatar({ size = 56, tone = 'primary' }: { nome?: string; size?: number; tone?: 'primary' | 'teal' }) {
  const ring = tone === 'teal' ? Brand.teal : Brand.azulRio;
  return (
    <View style={[styles.box, { width: size, height: size, borderRadius: size / 2, borderColor: ring }]}>
      <Image source={FOTO_PADRAO} style={styles.img} contentFit="cover" transition={150} />
    </View>
  );
}

const styles = StyleSheet.create({
  box: { overflow: 'hidden', borderWidth: 1.5, backgroundColor: Brand.cinzaEscama },
  img: { width: '100%', height: '100%' },
});
