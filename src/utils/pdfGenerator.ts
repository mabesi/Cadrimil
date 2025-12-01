// PDF Generator utility
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { Mission, CadrmilData, Period } from '../types';
import { DateHelpers } from './dateHelpers';
import { calcularDiarias, getValorDiaria } from './calculations';
import { formatCurrency } from './formatters';

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
        <td style="padding: 10px; max-width: 150px; word-wrap: break-word;">${period.grupo} - ${data.grupos[period.grupo]}</td>
        <td style="padding: 10px;">${data.localidades[period.localidade]}</td>
        <td style="padding: 10px;">${period.quantidadeMilitares}</td>
        <td style="padding: 10px;">
          ${DateHelpers.format(period.dataInicio, 'dd/MM/yy')}<br>
          ${DateHelpers.format(period.dataFim, 'dd/MM/yy')}
        </td>
        <td style="padding: 10px;">${numDiarias.toFixed(1)}</td>
        <td style="padding: 10px;">R$ ${formatCurrency(custoPeriodo)}</td>
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
            background-color: #203110;
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
            color: #203110;
            border-bottom: 2px solid #203110;
            padding-bottom: 5px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          th {
            background-color: #203110;
            color: white;
            padding: 10px;
            text-align: left;
            font-weight: bold;
            border-bottom: 2px solid #ccc;
          }
          .total-box {
            background-color: #e5e577;
            border: 2px solid #415527;
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
            color: #415527;
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
              <th style="max-width: 150px;">Grupo</th>
              <th>Localidade</th>
              <th>Qtd.</th>
              <th>Início/Fim</th>
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
            R$ ${formatCurrency(aedTotal)} 
            (${totalMilitares} militares × R$ ${formatCurrency(data.aed.value)})
          </div>
        ` : ''}
        
        <div class="total-box">
          <h3>VALOR TOTAL CALCULADO</h3>
          <div class="value">R$ ${formatCurrency(mission.valorTotal)}</div>
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
      // Sanitize mission name for filename (remove special characters)
      const sanitizedName = mission.nomeMissao
        .trim() // Trim whitespace first
        .replace(/[^a-zA-Z0-9\s]/g, '')
        .replace(/\s+/g, '_')
        .replace(/_+$/, '') // Remove trailing underscores again just in case
        .substring(0, 50) || 'Relatorio';

      // Copy file with custom name
      const newUri = `${FileSystem.cacheDirectory}${sanitizedName}.pdf`;
      await FileSystem.copyAsync({
        from: uri,
        to: newUri,
      });

      await Sharing.shareAsync(newUri, {
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
