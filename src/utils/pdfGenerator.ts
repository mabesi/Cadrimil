// PDF Generator utility
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Mission, CadrmilData, Period } from '../types';
import { DateHelpers } from './dateHelpers';
import { calcularDiarias, getValorDiaria } from './calculations';

/**
 * Generate HTML content for PDF
 */
function generateMissionHTML(mission: Mission, data: CadrmilData): string {
    let periodosHTML = '';

    mission.periodos.forEach((period, index) => {
        const numDiarias = calcularDiarias(
            period.dataInicio,
            period.dataFim,
            period.contarUltimoDiaInteiro
        );
        const valorUnitario = getValorDiaria(period.grupo, period.localidade, data);
        const custoPeriodo = numDiarias * valorUnitario * period.quantidadeMilitares;

        periodosHTML += `
      <tr style="border-bottom: 1px solid #e0e0e0;">
        <td style="padding: 10px;">${index + 1}</td>
        <td style="padding: 10px;">Grupo ${period.grupo}</td>
        <td style="padding: 10px;">${data.localidades[period.localidade]}</td>
        <td style="padding: 10px;">${period.quantidadeMilitares}</td>
        <td style="padding: 10px;">${DateHelpers.format(period.dataInicio, 'dd/MM/yyyy')}</td>
        <td style="padding: 10px;">${DateHelpers.format(period.dataFim, 'dd/MM/yyyy')}</td>
        <td style="padding: 10px;">${numDiarias.toFixed(1)}</td>
        <td style="padding: 10px;">R$ ${custoPeriodo.toFixed(2).replace('.', ',')}</td>
      </tr>
    `;
    });

    const totalMilitares = mission.periodos.reduce((sum, p) => sum + p.quantidadeMilitares, 0);
    const aedTotal = mission.incluirAED ? data.aed.value * totalMilitares : 0;

    return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
            color: #333;
          }
          .header {
            background-color: #003366;
            color: white;
            padding: 20px;
            text-align: center;
            margin-bottom: 20px;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
          }
          .header p {
            margin: 5px 0 0 0;
            font-size: 14px;
          }
          .mission-info {
            margin-bottom: 20px;
          }
          .mission-info h2 {
            color: #003366;
            border-bottom: 2px solid #003366;
            padding-bottom: 5px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          th {
            background-color: #e0e0e0;
            padding: 10px;
            text-align: left;
            font-weight: bold;
            border-bottom: 2px solid #ccc;
          }
          .total-box {
            background-color: #e6ffed;
            border: 2px solid #28a745;
            padding: 15px;
            text-align: center;
            margin-top: 20px;
          }
          .total-box h3 {
            margin: 0 0 10px 0;
            color: #333;
          }
          .total-box .value {
            font-size: 32px;
            font-weight: bold;
            color: #28a745;
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #ccc;
            font-size: 12px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Cadrimil</h1>
          <p>Calculadora de Diárias Militares</p>
        </div>
        
        <div class="mission-info">
          <h2>${mission.nomeMissao}</h2>
          <p><strong>Data de Criação:</strong> ${new Date(mission.dataCriacao).toLocaleDateString('pt-BR')}</p>
          <p><strong>Total de Períodos:</strong> ${mission.periodos.length}</p>
          <p><strong>AED Incluído:</strong> ${mission.incluirAED ? 'Sim' : 'Não'}</p>
        </div>
        
        <h3>Períodos</h3>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Grupo</th>
              <th>Localidade</th>
              <th>Qtd.</th>
              <th>Início</th>
              <th>Fim</th>
              <th>Diárias</th>
              <th>Custo</th>
            </tr>
          </thead>
          <tbody>
            ${periodosHTML}
          </tbody>
        </table>
        
        ${mission.incluirAED ? `
          <div style="background-color: #fff3cd; border: 1px solid #ffc107; padding: 10px; margin-bottom: 20px;">
            <strong>Adicional de Embarque e Desembarque (AED):</strong> 
            R$ ${aedTotal.toFixed(2).replace('.', ',')} 
            (${totalMilitares} militares × R$ ${data.aed.value.toFixed(2).replace('.', ',')})
          </div>
        ` : ''}
        
        <div class="total-box">
          <h3>VALOR TOTAL CALCULADO</h3>
          <div class="value">R$ ${mission.valorTotal.toFixed(2).replace('.', ',')}</div>
        </div>
        
        <div class="footer">
          <p><strong>Referências Legais:</strong></p>
          ${mission.decretosReferencia.map(d => `<p>• ${d.decree}, de ${d.date}</p>`).join('')}
          <p style="margin-top: 15px;">Relatório gerado pelo aplicativo Cadrimil</p>
        </div>
      </body>
    </html>
  `;
}

/**
 * Generate and export PDF
 */
export async function exportPDF(mission: Mission, data: CadrmilData): Promise<void> {
    try {
        const html = generateMissionHTML(mission, data);

        const { uri } = await Print.printToFileAsync({ html });

        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
            await Sharing.shareAsync(uri, {
                mimeType: 'application/pdf',
                dialogTitle: `Relatório - ${mission.nomeMissao}`,
                UTI: 'com.adobe.pdf',
            });
        } else {
            console.log('Sharing is not available on this device');
            // On some platforms, we might just want to print
            await Print.printAsync({ html });
        }
    } catch (error) {
        console.error('Error generating PDF:', error);
        throw new Error('Erro ao gerar PDF');
    }
}
