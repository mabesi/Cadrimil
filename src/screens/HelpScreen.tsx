import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    Image,
    Linking,
    LayoutAnimation,
    Alert,
    Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import {
    AdsConsent,
    AdsConsentPrivacyOptionsRequirementStatus,
    TestIds,
    useRewardedAd,
} from 'react-native-google-mobile-ads';
import { GlobalStyles } from '../constants/styles';
import { Colors } from '../constants/colors';
import type { RootStackParamList } from '../navigation/types';



export function HelpScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const insets = useSafeAreaInsets();
    const [expandedSection, setExpandedSection] = useState<string | null>(null);
    const [adsAllowed, setAdsAllowed] = useState<boolean | null>(__DEV__ ? true : null);
    const [privacyOptionsRequired, setPrivacyOptionsRequired] = useState(false);

    // Use the provided Ad Unit ID from config or Test ID for development.
    // The ID is managed in adConfig.js / ADMOB_* env vars via app.config.ts.
    const configuredAdUnitId = Platform.OS === 'ios'
        ? Constants.expoConfig?.extra?.adMob?.iosRewardedUnitId
        : Constants.expoConfig?.extra?.adMob?.androidRewardedUnitId;
    const adUnitId = __DEV__
        ? TestIds.REWARDED
        : (configuredAdUnitId || TestIds.REWARDED);

    const rewarded = useRewardedAd(
        adsAllowed ? adUnitId : null,
        { requestNonPersonalizedAdsOnly: true }
    );
    const { isLoaded, isShowing, isClosed, error, load, show, isEarnedReward } = rewarded;

    // In production, ask for UMP consent before loading any ad.
    React.useEffect(() => {
        if (__DEV__) return;

        let mounted = true;

        AdsConsent.gatherConsent()
            .then(consentInfo => {
                if (!mounted) return;

                setAdsAllowed(consentInfo.canRequestAds);
                setPrivacyOptionsRequired(
                    consentInfo.privacyOptionsRequirementStatus ===
                    AdsConsentPrivacyOptionsRequirementStatus.REQUIRED
                );
            })
            .catch(consentError => {
                console.warn('Unable to gather ads consent:', consentError);
                if (mounted) setAdsAllowed(false);
            });

        return () => {
            mounted = false;
        };
    }, []);

    React.useEffect(() => {
        if (adsAllowed) {
            load();
        }
    }, [adsAllowed, load]);

    React.useEffect(() => {
        if (isEarnedReward) {
            Alert.alert(
                'Obrigado!',
                'Obrigado por apoiar o desenvolvimento do Cadrimil!'
            );
        }
    }, [isEarnedReward]);

    // The rewarded ad is consumed after being shown. Load a new one so the
    // button remains useful the next time the user opens Help.
    React.useEffect(() => {
        if (isClosed && adsAllowed) {
            load();
        }
    }, [isClosed, adsAllowed, load]);

    const handleWatchAd = () => {
        if (!adsAllowed) {
            Alert.alert(
                'Anúncios indisponíveis',
                'Não foi possível carregar anúncios neste dispositivo ou o consentimento não foi concedido.'
            );
            return;
        }

        if (isLoaded) {
            show();
            return;
        }

        if (error) {
            load();
            return;
        }

        Alert.alert('Aguarde', 'Carregando anúncio...');
    };

    const handlePrivacyOptions = () => {
        AdsConsent.showPrivacyOptionsForm().catch(privacyError => {
            console.warn('Unable to show privacy options:', privacyError);
            Alert.alert('Erro', 'Não foi possível abrir as opções de privacidade.');
        });
    };

    const adButtonLabel = adsAllowed === false
        ? 'INDISPONÍVEL'
        : adsAllowed === null
            ? 'AGUARDE...'
            : isShowing
                ? 'EXIBINDO...'
                : isLoaded
                    ? 'VER ANÚNCIO'
                    : error
                        ? 'TENTAR NOVAMENTE'
                        : 'CARREGANDO...';

    const toggleSection = (title: string) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpandedSection(expandedSection === title ? null : title);
    };

    const handleDonation = () => {
        Linking.openURL('https://apps.mabesi.dev/donate');
    };

    const openDeveloperSite = () => {
        Linking.openURL('https://apps.mabesi.dev');
    };

    const AccordionItem = ({ title, children }: { title: string; children: React.ReactNode }) => (
        <View style={styles.accordionItem}>
            <TouchableOpacity
                style={styles.accordionHeader}
                onPress={() => toggleSection(title)}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityState={{ expanded: expandedSection === title }}
            >
                <Text style={styles.accordionTitle}>{title}</Text>
                <Text style={styles.accordionIcon}>
                    {expandedSection === title ? '−' : '+'}
                </Text>
            </TouchableOpacity>
            {expandedSection === title && (
                <View style={styles.accordionContent}>
                    {children}
                </View>
            )}
        </View>
    );

    return (
        <View style={GlobalStyles.container}>
            <ExpoStatusBar style="dark" />
            <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                    accessibilityRole="button"
                    accessibilityLabel="Voltar"
                >
                    <Text style={styles.backButtonText}>← Voltar</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Ajuda</Text>
                <View style={{ width: 60 }} />
            </View>

            <ScrollView
                style={styles.content}
                contentContainerStyle={[
                    styles.scrollContent,
                    { paddingBottom: insets.bottom + 24 },
                ]}
            >

                {/* Donation Section */}
                <View style={styles.donationContainer}>
                    <Text style={styles.donationText}>
                        Gostou do app?{'\n'}Apoie o desenvolvimento!
                    </Text>
                    <View style={styles.donationButtonsRow}>
                        <TouchableOpacity
                            style={styles.customDonationButton}
                            onPress={handleDonation}
                            activeOpacity={0.7}
                            accessibilityRole="button"
                            accessibilityLabel="Fazer doação"
                        >
                            <Text style={styles.heartIcon}>❤️</Text>
                            <Text style={styles.donationButtonText}>DOAR</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.customDonationButton,
                                styles.adButton,
                                !adsAllowed && styles.disabledButton
                            ]}
                            onPress={handleWatchAd}
                            activeOpacity={0.7}
                            disabled={!adsAllowed}
                            accessibilityRole="button"
                            accessibilityState={{ disabled: !adsAllowed }}
                        >
                            <Text style={styles.adIcon}>📺</Text>
                            <Text style={styles.adButtonText}>{adButtonLabel}</Text>
                        </TouchableOpacity>
                    </View>

                    {error && (
                        <Text style={styles.adErrorText} accessibilityLiveRegion="polite">
                            Não foi possível carregar o anúncio.
                        </Text>
                    )}

                    {privacyOptionsRequired && (
                        <TouchableOpacity
                            style={styles.privacyButton}
                            onPress={handlePrivacyOptions}
                            activeOpacity={0.7}
                            accessibilityRole="button"
                            accessibilityLabel="Opções de privacidade"
                        >
                            <Text style={styles.privacyText}>
                                Opções de privacidade
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Usage Information */}
                <Text style={styles.sectionHeader}>Como Usar</Text>

                <AccordionItem title="Calculadora de Diárias">
                    <Text style={styles.text}>
                        A aba "Cálculo" é a principal ferramenta para simular os valores a receber.
                        {'\n\n'}
                        <Text style={styles.bold}>Passo a passo:</Text>
                        {'\n'}
                        1. <Text style={styles.bold}>Localidade:</Text> escolha o destino da missão. A localidade influencia o valor da diária.
                        {'\n'}
                        2. <Text style={styles.bold}>Grupo:</Text> selecione o círculo hierárquico correspondente.
                        {'\n'}
                        3. <Text style={styles.bold}>QTD:</Text> informe a quantidade de militares do grupo naquele período.
                        {'\n'}
                        4. <Text style={styles.bold}>Período:</Text> selecione as datas de início e fim da missão.
                        {'\n'}
                        5. <Text style={styles.bold}>Adicionar:</Text> toque em "ADICIONAR". O app calcula a quantidade de diárias e o valor daquele trecho.
                        {'\n\n'}
                        <Text style={styles.bold}>Opções do período:</Text>
                        {'\n'}
                        • <Text style={styles.bold}>Último dia inteiro:</Text> marque "Contar
                        último dia como diária inteira (1.0)" quando o último dia também deve
                        ser pago integralmente. Sem a marcação, ele conta como meia diária.
                        {'\n'}
                        • <Text style={styles.bold}>AED:</Text> em "Opções Adicionais", marque
                        "Incluir Adicional de Embarque e Desembarque" para somar o AED ao total.
                        {'\n\n'}
                        <Text style={styles.bold}>Gerenciando períodos:</Text>
                        {'\n'}
                        • <Text style={styles.bold}>Editar (✏️):</Text> toque no lápis do cartão do período. O formulário é preenchido e a tela volta ao topo; altere os dados e toque em "ATUALIZAR".
                        {'\n'}
                        • <Text style={styles.bold}>Excluir (🗑️):</Text> toque na lixeira e confirme a exclusão para remover o período.
                        {'\n\n'}
                        <Text style={styles.note}>Nota: você pode adicionar vários períodos na mesma missão. O total geral aparece no final da tela.</Text>
                    </Text>
                </AccordionItem>

                <AccordionItem title="Minhas Missões">
                    <Text style={styles.paragraph}>
                        Use esta opção quando você faz parte de um dos grupos lançados e quer
                        acompanhar apenas os seus valores individuais.
                    </Text>

                    <Text style={styles.text}>
                        <Text style={styles.bold}>Como registrar:</Text>
                        {'\n'}
                        1. Selecione o grupo do trecho no formulário de cálculo.
                        {'\n'}
                        2. Marque a opção "Registrar em Minhas Missões", logo abaixo de
                        "Contar último dia como diária inteira".
                        {'\n'}
                        3. O app exibirá "Meu grupo: ...". A marcação vale para o trecho que
                        está sendo lançado.
                        {'\n'}
                        4. Adicione ou atualize o período e salve a missão normalmente.
                        {'\n\n'}
                        Ao alterar o Grupo, a marcação é desfeita automaticamente. Marque
                        novamente se o novo trecho também for seu. Ao editar um trecho, a
                        marcação é carregada junto com as demais informações.
                    </Text>

                    <Text style={styles.subtitle}>Visualização</Text>
                    <Text style={styles.paragraph}>
                        Na aba "Missões", a seção "Minhas Missões" fica aberta, mas os grupos
                        de ano começam recolhidos. Toque no ano para expandir e ver os cartões
                        com apenas os trechos marcados, as suas diárias, o AED (quando
                        incluído) e o total individual. Cada grupo de ano mostra no cabeçalho
                        o total recebido naquele ano.
                    </Text>
                    <Text style={styles.paragraph}>
                        Ao final da seção é exibido o total recebido por você, somando todos os
                        trechos marcados.
                    </Text>

                    <Text style={styles.note}>
                        Os valores são preservados no momento do lançamento. Uma atualização da
                        tabela de diárias não altera missões já salvas.
                    </Text>
                </AccordionItem>

                <AccordionItem title="Gerenciando Missões">
                    <Text style={styles.paragraph}>
                        A aba "Missões" possui duas seções: "Minhas Missões", com a visão
                        individual, e "Todas as Missões", com a visão completa dos gastos de
                        todos os grupos e militares. Em ambas, as missões são ordenadas pela
                        data de início do primeiro trecho e agrupadas por ano. As seções ficam
                        abertas; os grupos de ano começam recolhidos.
                    </Text>

                    <Text style={styles.subtitle}>Todas as Missões</Text>
                    <Text style={styles.paragraph}>
                        Os cartões mostram o nome da missão, a quantidade de períodos, se o AED
                        foi incluído e o valor total. Use os botões para editar, excluir ou
                        exportar.
                    </Text>

                    <Text style={styles.paragraph}>
                        <Text style={styles.bold}>✏️ Editar:</Text> carrega a missão na
                        calculadora. Para alterar um período, toque no lápis do cartão do
                        período; o formulário é preenchido e a tela volta ao topo.
                    </Text>

                    <Text style={styles.paragraph}>
                        <Text style={styles.bold}>🗑️ Excluir:</Text> remove a missão do
                        histórico após confirmação.
                    </Text>

                    <Text style={styles.paragraph}>
                        <Text style={styles.bold}>📤 Exportar:</Text> gera um arquivo `.cmil`
                        com os dados e os valores históricos da missão para backup ou
                        compartilhamento.
                    </Text>

                    <Text style={styles.subtitle}>Importando Missões</Text>
                    <Text style={styles.paragraph}>
                        <Text style={styles.bold}>📥 Importar:</Text> na aba "Cálculo", ao lado
                        do nome da missão, toque no botão de importação e selecione um arquivo
                        `.json`. Para arquivos `.cmil`, abra diretamente pelo WhatsApp ou
                        gerenciador de arquivos; o Cadrimil reconhece a extensão.
                    </Text>
                    <Text style={styles.paragraph}>
                        Missões importadas preservam os valores históricos e as marcações de
                        "Minhas Missões" gravadas no arquivo. Arquivos antigos sem esses dados
                        são congelados com a tabela disponível no momento da importação.
                    </Text>
                </AccordionItem>

                <AccordionItem title="Gerando Relatórios (PDF)">
                    <Text style={styles.text}>
                        Você pode gerar um relatório detalhado da simulação para imprimir ou
                        compartilhar.
                        {'\n\n'}
                        <Text style={styles.bold}>Como gerar:</Text>
                        {'\n'}
                        1. Adicione pelo menos um período na calculadora.
                        {'\n'}
                        2. Marque "Incluir Adicional de Embarque e Desembarque" se aplicável.
                        {'\n'}
                        3. Toque em "Relatório PDF" no final da tela.
                        {'\n\n'}
                        O PDF inclui os períodos, os cálculos detalhados, o AED, as referências
                        legais e o total. Ele usa os valores históricos da missão e indica a
                        vigência da tabela utilizada.
                    </Text>
                </AccordionItem>

                <AccordionItem title="Tabela de Valores">
                    <Text style={styles.text}>
                        A aba "Tabelas" serve para consulta rápida dos valores vigentes.
                        {'\n\n'}
                        • Visualize as diárias organizadas por Círculo Hierárquico e
                        Localidade.
                        {'\n'}
                        • Consulte o valor do Adicional de Embarque e Desembarque (AED).
                        {'\n'}
                        • As tabelas são atualizadas conforme a legislação vigente.
                        {'\n'}
                        • Missões já salvas mantêm os valores da época; a tabela atual vale
                        para novos cálculos.
                    </Text>
                </AccordionItem>

                <AccordionItem title="Funcionamento Offline">
                    <Text style={styles.text}>
                        O app tenta atualizar a tabela de valores pela API. Se não conseguir
                        acessar, usa a última tabela salva no dispositivo ou a tabela embutida
                        no aplicativo.
                        {'\n\n'}
                        • Um aviso na tela informa a fonte e a data da tabela em uso.
                        {'\n'}
                        • Toque em "Tentar atualizar" para buscar a versão mais recente.
                        {'\n'}
                        • Missões salvas continuam disponíveis e mantêm os valores históricos.
                    </Text>
                </AccordionItem>

                <AccordionItem title="Decretos e Legislação">
                    <Text style={styles.text}>
                        A aba "Decretos" contém a base legal utilizada para os cálculos.
                        {'\n\n'}
                        • Consulte os decretos que regulamentam as diárias militares.
                        {'\n'}
                        • Verifique as regras para pagamento de adicionais e indenizações.
                        {'\n'}
                        • Mantenha-se informado sobre seus direitos e deveres em missões.
                    </Text>
                </AccordionItem>

                {/* Developer Footer */}
                <View style={styles.footer}>
                    <View style={styles.devContainer}>
                        <Image
                            source={require('../../assets/mabesi_logo.png')}
                            style={styles.devLogo}
                            resizeMode="contain"
                        />
                        <View style={styles.devInfo}>
                            <Text style={styles.devName}>Mabesi Apps</Text>
                            <TouchableOpacity
                                onPress={openDeveloperSite}
                                accessibilityRole="link"
                                accessibilityLabel="Abrir site do desenvolvedor"
                            >
                                <Text style={styles.devLink}>apps.mabesi.dev</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12, // Reduced from 16
        paddingHorizontal: 16,
        backgroundColor: Colors.white,
        borderBottomWidth: 1,
        borderBottomColor: Colors.borderLight,
    },
    backButton: {
        padding: 8,
    },
    backButtonText: {
        fontSize: 16,
        color: Colors.primary,
        fontWeight: '600',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.text,
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
    },
    donationContainer: {
        backgroundColor: Colors.white,
        padding: 14, // Reduced from 18
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 14, // Reduced from 18
        borderWidth: 1,
        borderColor: Colors.borderLight,
        shadowColor: Colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    donationText: {
        fontSize: 16,
        color: Colors.text,
        marginBottom: 8, // Reduced from 12
        textAlign: 'center',
        fontWeight: '500',
    },
    customDonationButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8, // Reduced from 10
        paddingHorizontal: 16,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: Colors.danger,
        backgroundColor: 'transparent',
        flex: 1,
    },
    donationButtonsRow: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
    },
    adButton: {
        borderColor: Colors.secondaryLight,
    },
    disabledButton: {
        opacity: 0.5,
        borderColor: Colors.border,
    },
    adIcon: {
        fontSize: 18,
        marginRight: 8,
    },
    adButtonText: {
        color: Colors.secondary,
        fontSize: 14,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    adErrorText: {
        fontSize: 12,
        color: Colors.danger,
        textAlign: 'center',
        marginTop: 8,
    },
    privacyButton: {
        marginTop: 8,
        padding: 4,
    },
    privacyText: {
        fontSize: 12,
        color: Colors.primary,
        textDecorationLine: 'underline',
    },
    heartIcon: {
        fontSize: 18,
        marginRight: 8,
        color: Colors.danger,
    },
    donationButtonText: {
        color: Colors.danger,
        fontSize: 14,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    sectionHeader: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.text,
        marginBottom: 8, // Reduced from 10
        marginTop: 4, // Reduced from 6
    },
    accordionItem: {
        backgroundColor: Colors.white,
        borderRadius: 8,
        marginBottom: 6, // Reduced from 8
        borderWidth: 1,
        borderColor: Colors.borderLight,
        overflow: 'hidden',
    },
    accordionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10, // Reduced from 12
        backgroundColor: Colors.white,
    },
    accordionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text,
    },
    accordionIcon: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.primary,
    },
    accordionContent: {
        padding: 10, // Reduced from 12
        paddingTop: 0,
        backgroundColor: Colors.white,
    },
    text: {
        fontSize: 14,
        color: Colors.textSecondary,
        lineHeight: 18,
        textAlign: 'justify',
    },
    paragraph: {
        fontSize: 14,
        color: Colors.textSecondary,
        lineHeight: 18,
        marginBottom: 8, // Reduced from 12
        textAlign: 'justify',
    },
    subtitle: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text,
        marginTop: 12, // Reduced from 16
        marginBottom: 6, // Reduced from 8
    },
    bold: {
        fontWeight: '700',
        color: Colors.text,
    },
    note: {
        fontSize: 13,
        fontStyle: 'italic',
        color: Colors.textMuted,
        marginTop: 4, // Reduced from 6
        textAlign: 'justify',
    },
    footer: {
        marginTop: 20, // Reduced from 30
        marginBottom: 10, // Reduced from 16
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: Colors.borderLight,
        paddingTop: 12, // Reduced from 18
    },
    devContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    devLogo: {
        width: 40, // Reduced from 50
        height: 40, // Reduced from 50
        marginRight: 10, // Reduced from 12
    },
    devInfo: {
        justifyContent: 'center',
    },
    devName: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.text,
    },
    devLink: {
        color: Colors.primary,
        textDecorationLine: 'underline',
        fontSize: 14,
    },
});
