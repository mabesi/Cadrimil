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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { GlobalStyles } from '../constants/styles';
import { Colors } from '../constants/colors';
import { CustomButton } from '../components/CustomButton';

if (
    Platform.OS === 'android' &&
    UIManager.setLayoutAnimationEnabledExperimental
) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

export function HelpScreen() {
    const navigation = useNavigation();
    const [expandedSection, setExpandedSection] = useState<string | null>(null);

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
                        Gostou do app? Apoie o desenvolvimento!
                    </Text>
                    <TouchableOpacity
                        style={styles.customDonationButton}
                        onPress={handleDonation}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.heartIcon}>❤️</Text>
                        <Text style={styles.donationButtonText}>FAZER UMA DOAÇÃO</Text>
                    </TouchableOpacity>
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
                        4. <Text style={styles.bold}>Adicionar:</Text> Clique no botão "ADICIONAR PERÍODO". O app calculará automaticamente a quantidade de dias e o valor total para aquele trecho.
                        {'\n\n'}
                        <Text style={styles.note}>Nota: Você pode adicionar múltiplos períodos (trechos) na mesma simulação. O total geral será exibido no final da tela.</Text>
                    </Text>
                </AccordionItem>

                <AccordionItem title="Gerenciando Missões">
                    <Text style={styles.text}>
                        Na aba "Missões", você tem acesso ao histórico de todos os seus cálculos salvos.
                        {'\n\n'}
                        <Text style={styles.bold}>Funcionalidades:</Text>
                        {'\n'}
                        • <Text style={styles.bold}>Salvar:</Text> Na tela de cálculo, após adicionar períodos, você pode dar um nome à missão e salvá-la para consulta futura.
                        {'\n'}
                        • <Text style={styles.bold}>Editar:</Text> Toque no botão "Editar" em um cartão de missão para carregar todos os dados de volta na calculadora e fazer ajustes.
                        {'\n'}
                        • <Text style={styles.bold}>Excluir:</Text> Use o botão "Excluir" para remover missões antigas ou incorretas do seu histórico.
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
        paddingBottom: 40, // Reduced from 60
    },
    donationContainer: {
        backgroundColor: Colors.white,
        padding: 18, // Reduced from 24
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 18, // Reduced from 24
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
        marginBottom: 12, // Reduced from 16
        textAlign: 'center',
        fontWeight: '500',
    },
    customDonationButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10, // Reduced from 12
        paddingHorizontal: 24,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: Colors.danger,
        backgroundColor: 'transparent',
        width: '100%',
    },
    heartIcon: {
        fontSize: 18,
        marginRight: 8,
        color: Colors.danger,
    },
    donationButtonText: {
        color: Colors.danger,
        fontSize: 16,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    sectionHeader: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.text,
        marginBottom: 10, // Reduced from 12
        marginTop: 6, // Reduced from 8
    },
    accordionItem: {
        backgroundColor: Colors.white,
        borderRadius: 8,
        marginBottom: 8, // Reduced from 10
        borderWidth: 1,
        borderColor: Colors.borderLight,
        overflow: 'hidden',
    },
    accordionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12, // Reduced from 16
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
        padding: 12, // Reduced from 16
        paddingTop: 0,
        backgroundColor: Colors.white,
    },
    text: {
        fontSize: 14,
        color: Colors.textSecondary,
        lineHeight: 20, // Reduced from 22
    },
    bold: {
        fontWeight: '700',
        color: Colors.text,
    },
    note: {
        fontSize: 13,
        fontStyle: 'italic',
        color: Colors.textMuted,
        marginTop: 6, // Reduced from 8
    },
    footer: {
        marginTop: 30, // Reduced from 40
        marginBottom: 16, // Reduced from 20
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: Colors.borderLight,
        paddingTop: 18, // Reduced from 24
    },
    devContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    devLogo: {
        width: 50,
        height: 50,
        marginRight: 12,
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
        fontSize: 14,
        color: Colors.primary,
        textDecorationLine: 'underline',
    },
});
