"use client";
import { usePreferencia, gravarPreferencia } from '@/lib/utils/preferenciaLocal';

// Se o menu lateral está aberto ou escondido — no computador; no celular ele
// não existe e a navegação continua no seletor do topo.
//
// Guardado no aparelho (ver lib/utils/preferenciaLocal.js), e lido por quem
// precisa saber dele: o próprio menu, o botão ☰ da barra e a faixa de
// sub-abas de cada tela, que volta a aparecer no computador quando o menu é
// escondido — senão as sub-abas sumiriam junto com ele, sem caminho de volta.
const CHAVE = 'menu_lateral';

export function useMenuLateral() {
    const aberto = usePreferencia(CHAVE, 'aberto') !== 'fechado';
    const alternar = () => gravarPreferencia(CHAVE, aberto ? 'fechado' : 'aberto');
    return { aberto, alternar };
}
