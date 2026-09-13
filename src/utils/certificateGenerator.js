const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const OUTPUT_DIR = path.join(__dirname, '..', '..', 'public', 'certificados');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

function gerarCodigoValidacao() {
  return crypto.randomBytes(6).toString('hex').toUpperCase();
}

/**
 * Gera um certificado em PDF para um aluno que concluiu um curso.
 * @param {Object} dados - { nomeAluno, tituloCurso, cargaHoraria, codigoValidacao, dataEmissao }
 * @returns {Promise<string>} caminho relativo do arquivo gerado
 */
function gerarCertificadoPDF(dados) {
  const { nomeAluno, tituloCurso, cargaHoraria, codigoValidacao, dataEmissao } = dados;
  const nomeArquivo = `certificado_${codigoValidacao}.pdf`;
  const caminhoCompleto = path.join(OUTPUT_DIR, nomeArquivo);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ layout: 'landscape', size: 'A4', margin: 50 });
    const stream = fs.createWriteStream(caminhoCompleto);
    doc.pipe(stream);

    doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40).stroke('#2c3e50');

    doc.fontSize(28).fillColor('#2c3e50').font('Helvetica-Bold')
      .text('CERTIFICADO DE CONCLUSÃO', 0, 90, { align: 'center' });

    doc.fontSize(14).fillColor('#555').font('Helvetica')
      .text('Programa de Ensino da BNCC Computação', { align: 'center' });

    doc.moveDown(2);
    doc.fontSize(16).fillColor('#333')
      .text('Certificamos que', { align: 'center' });

    doc.moveDown(0.5);
    doc.fontSize(24).fillColor('#2c3e50').font('Helvetica-Bold')
      .text(nomeAluno, { align: 'center' });

    doc.moveDown(0.5);
    doc.fontSize(16).fillColor('#333').font('Helvetica')
      .text(`concluiu com êxito o curso "${tituloCurso}"`, { align: 'center' });

    doc.fontSize(14).fillColor('#555')
      .text(`com carga horária de ${cargaHoraria} horas.`, { align: 'center' });

    doc.moveDown(2);
    doc.fontSize(11).fillColor('#777')
      .text(`Data de emissão: ${dataEmissao}`, { align: 'center' });
    doc.text(`Código de validação: ${codigoValidacao}`, { align: 'center' });

    doc.end();

    stream.on('finish', () => resolve(`/certificados/${nomeArquivo}`));
    stream.on('error', reject);
  });
}

module.exports = { gerarCertificadoPDF, gerarCodigoValidacao };
