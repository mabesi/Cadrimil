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
    Platform,
    UIManager,
    Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Constants from 'expo-constants';
import { RewardedAd, RewardedAdEventType, TestIds } from 'react-native-google-mobile-ads';
import { GlobalStyles } from '../constants/styles';
import { Colors } from '../constants/colors';
import { CustomButton } from '../components/CustomButton';



export function HelpScreen() {
    const navigation = useNavigation();
    const [expandedSection, setExpandedSection] = useState<string | null>(null);
    const [loaded, setLoaded] = useState(false);

    // Use the provided Ad Unit ID from config or Test ID for development
    // The ID is now managed in adConfig.js and exposed via app.config.ts
    const adUnitId = __DEV__ ? TestIds.REWARDED : (Constants.expoConfig?.extra?.adUnitId || TestIds.REWARDED);

    const rewarded = React.useMemo(() => {
        return RewardedAd.createForAdRequest(adUnitId, {
            requestNonPersonalizedAdsOnly: true,
        });
    }, [adUnitId]);

    React.useEffect(() => {
        const unsubscribeLoaded = rewarded.addAdEventListener(RewardedAdEventType.LOADED, () => {
            setLoaded(true);
        });
        const unsubscribeEarned = rewarded.addAdEventListener(
            RewardedAdEventType.EARNED_REWARD,
            reward => {
                Alert.alert('Obrigado!', 'Obrigado por apoiar o desenvolvimento do Cadrimil!');
            },
        );

        // Start loading the ad straight away
        rewarded.load();

        // Unsubscribe from events on unmount
        return () => {
            unsubscribeLoaded();
            unsubscribeEarned();
        };
    }, [rewarded]);

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
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={styles.backButtonText}>← Voltar</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Ajuda</Text>
                <View style={{ width: 60 }} />
            </View>

            <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>

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
                        >
                            <Text style={styles.heartIcon}>❤️</Text>
                            <Text style={styles.donationButtonText}>DOAR</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.customDonationButton,
                                styles.adButton,
                                !loaded && styles.disabledButton
                            ]}
                            onPress={() => {
                                if (loaded) {
                                    rewarded.show();
                                } else {
                                    Alert.alert('Aguarde', 'Carregando anúncio...');
                                }
                            }}
                            activeOpacity={0.7}
                            disabled={!loaded}
                        >
                            <Text style={styles.adIcon}>📺</Text>
                            <Text style={styles.adButtonText}>VER ANÚNCIO</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Usage Information */}
                <Text style={styles.sectionHeader}>Como Usar</Text>

                <AccordionItem title="Calculadora de Diárias">
                    <Text style={styles.text}>
                        A aba "Cálculo" é a principal ferramenta para simular os valores a receber.
                        {'\n\n'}
                        <Text style={styles.bold}>Passo a Passo:</Text>
                        {'\n'}
                        1. <Text style={styles.bold}>Grupo de Militares:</Text> Selecione o seu círculo hierárquico (ex: Oficiais Generais, Oficiais Superiores, Praças, etc).
                        {'\n'}
                        2. <Text style={styles.bold}>Localidade:</Text> Escolha o destino da missão. As localidades influenciam o valor da diária (ex: Capital Federal, Outras Capitais, Deslocamentos no Exterior).
                        {'\n'}
                        3. <Text style={styles.bold}>Período:</Text> Selecione a data de início e a data de fim da missão nos calendários.
                        {'\n'}
                        4. <Text style={styles.bold}>Adicionar:</Text> Clique no botão "ADICIONAR". O app calculará automaticamente a quantidade de dias e o valor total para aquele trecho.
                        {'\n\n'}
                        <Text style={styles.bold}>Gerenciando Períodos:</Text>
                        {'\n'}
                        • <Text style={styles.bold}>Editar (✏️):</Text> Toque no ícone de lápis no cartão do período para carregar os dados de volta no formulário. Faça as alterações e clique em "ATUALIZAR".
                        {'\n'}
                        • <Text style={styles.bold}>Excluir (🗑️):</Text> Toque no ícone de lixeira para remover um período. Uma confirmação será solicitada para evitar exclusões acidentais.
                        {'\n\n'}
                        <Text style={styles.note}>Nota: Você pode adicionar múltiplos períodos (trechos) na mesma simulação. O total geral será exibido no final da tela.</Text>
                    </Text>
                </AccordionItem>

                <AccordionItem title="Gerenciando Missões">
                    <Text style={styles.paragraph}>
                        Na aba "Missões", você pode ver todas as missões salvas. Use os botões nos cartões de missão para gerenciá-las.
                    </Text>

                    <Text style={styles.subtitle}>Minhas Missões</Text>
                    <Text style={styles.paragraph}>
                        Para acompanhar apenas os seus valores, selecione o seu grupo ao lançar
                        um período e marque a opção "Registrar em Minhas Missões". A seção
                        "Minhas Missões" exibirá somente os períodos e valores do seu grupo,
                        sem os demais militares ou grupos.
                    </Text>

                    <Text style={styles.subtitle}>Funcionalidades Principais</Text>

                    <Text style={styles.paragraph}>
                        <Text style={styles.bold}>✏️ Editar:</Text> Toque no ícone de lápis (botão azul) para carregar a missão de volta na calculadora. Você poderá alterar datas, localidades, grupos e salvar as modificações.
                    </Text>

                    <Text style={styles.paragraph}>
                        <Text style={styles.bold}>🗑️ Excluir:</Text> Toque no ícone de lixeira (botão vermelho) para remover a missão permanentemente do seu histórico.
                    </Text>

                    <Text style={styles.paragraph}>
                        <Text style={styles.bold}>📤 Exportar:</Text> Toque no ícone de compartilhamento (botão verde) para gerar um arquivo `.cmil`. Você pode enviar este arquivo via WhatsApp, E-mail ou salvar em seus arquivos para backup.
                    </Text>

                    <Text style={styles.subtitle}>Importando Missões</Text>
                    <Text style={styles.paragraph}>
                        <Text style={styles.bold}>📥 Importar:</Text> Na aba "Cálculo", ao lado do campo de nome da missão, existe um botão de importação.
                        {'\n'}
                        1. Toque no botão 📥.
                        {'\n'}
                        2. Selecione um arquivo `.cmil` ou `.json` que você recebeu ou salvou anteriormente.
                        {'\n'}
                        3. A missão será carregada automaticamente na calculadora.
                    </Text>

                    <Text style={styles.note}>
                        Dica: Se você receber um arquivo `.cmil` pelo WhatsApp, pode tentar abri-lo diretamente com o Cadrimil.
                    </Text>
                </AccordionItem>

                <AccordionItem title="Gerando Relatórios (PDF)">
                    <Text style={styles.text}>
                        Você pode gerar um relatório detalhado da sua simulação para imprimir ou compartilhar.
                        {'\n\n'}
                        <Text style={styles.bold}>Como Gerar:</Text>
                        {'\n'}
                        1. Adicione pelo menos um período na calculadora.
                        {'\n'}
                        2. (Opcional) Marque a opção "Incluir Adicional de Embarque e Desembarque" se aplicável.
                        {'\n'}
                        3. Clique no botão "Relatório PDF" no final da tela.
                        {'\n\n'}
                        O PDF incluirá todos os trechos, cálculos detalhados, referências legais e o valor total estimado. Você poderá salvar o arquivo ou compartilhá-lo via WhatsApp, E-mail, etc.
                    </Text>
                </AccordionItem>

                <AccordionItem title="Tabela de Valores">
                    <Text style={styles.text}>
                        A aba "Tabelas" serve para consulta rápida dos valores vigentes.
                        {'\n\n'}
                        • Visualize os valores de diárias organizados por Círculo Hierárquico (linhas) e Localidade (colunas).
                        {'\n'}
                        • Consulte o valor do Adicional de Embarque e Desembarque (AED).
                        {'\n'}
                        • As tabelas são atualizadas conforme a legislação vigente.
                        {'\n'}
                        • Sem conexão, o app usa a última tabela salva no dispositivo ou a tabela embutida e indica a data de vigência.
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
                            <TouchableOpacity onPress={openDeveloperSite}>
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
        padding: 16, // Reduced from 20
        paddingBottom: 10, // Reduced from 60
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
    },
    paragraph: {
        fontSize: 14,
        color: Colors.textSecondary,
        lineHeight: 18,
        marginBottom: 8, // Reduced from 12
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
