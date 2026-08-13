import { ResearchResponse } from '../types/api';

export function exportResearchMarkdown(result: ResearchResponse): void {
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `CrucibleAI_Research_${result.session_id.slice(0, 8)}_${timestamp}.md`;

  let md = `# CrucibleAI Research Summary Report\n\n`;
  md += `**Session ID**: \`${result.session_id}\`  \n`;
  md += `**Date**: ${new Date().toLocaleString()}  \n`;
  md += `**Research Query Target**: "${result.query}"  \n`;
  md += `**Pipeline Status**: ${result.status}  \n\n`;

  md += `---\n\n`;
  md += `## 💡 Synthesized Scientific Hypothesis\n\n`;
  md += `> "${result.hypothesis}"\n\n`;

  md += `---\n\n`;
  md += `## 🔬 Screened Material Candidates & Physical Properties\n\n`;
  md += `| Formula | MP Material ID | Known Bandgap | KRR Predicted BG | Formation Energy | Density |\n`;
  md += `|---|---|---|---|---|---|\n`;

  for (const formula of result.candidate_formulas) {
    const props = result.property_records[formula] || [];
    const krr = result.krr_predictions[formula];
    const bgProp = props.find((p) => p.property_name.toLowerCase().includes('band'));
    const formEnergyProp = props.find((p) => p.property_name.toLowerCase().includes('formation'));
    const densityProp = props.find((p) => p.property_name.toLowerCase().includes('density'));

    const knownBg = bgProp ? `${bgProp.value} ${bgProp.unit}` : 'N/A';
    const predBg = krr ? `${krr.predicted_value} ${krr.unit}` : 'N/A';
    const formEnergy = formEnergyProp ? `${formEnergyProp.value} ${formEnergyProp.unit}` : 'N/A';
    const density = densityProp ? `${densityProp.value} ${densityProp.unit}` : 'N/A';
    const mpId = bgProp?.material_id || 'N/A';

    md += `| **${formula}** | \`${mpId}\` | ${knownBg} | **${predBg}** | ${formEnergy} | ${density} |\n`;
  }

  md += `\n---\n\n`;
  md += `## 🤖 Machine Learning KRR Predictions\n\n`;
  for (const formula of Object.keys(result.krr_predictions)) {
    const pred = result.krr_predictions[formula];
    md += `### Candidate: ${formula}\n`;
    md += `- **Predicted Bandgap**: ${pred.predicted_value} ${pred.unit}\n`;
    md += `- **Method**: ${pred.method}\n`;
    md += `- **Confidence Rating**: ${pred.confidence}\n`;
    md += `- **Validation Note**: ${pred.note}\n\n`;
  }

  md += `---\n\n`;
  md += `## 📚 Retrieved Literature Evidence & Paper Citations\n\n`;
  for (let i = 0; i < result.search_results.length; i++) {
    const chunk = result.search_results[i];
    const meta = chunk.metadata;
    const authors = Array.isArray(meta.authors) ? meta.authors.join(', ') : meta.authors;
    md += `### [${i + 1}] ${meta.title || 'Untitled Paper'}\n`;
    md += `- **ArXiv ID**: [${meta.arxiv_id}](https://arxiv.org/abs/${meta.arxiv_id.replace(/^arxiv:/i, '')})\n`;
    md += `- **Authors**: ${authors}\n`;
    md += `- **Year**: ${meta.year || 2026} | **Section**: ${meta.section || 'General'}\n`;
    md += `- **Cosine Similarity Score**: ${(chunk.similarity * 100).toFixed(1)}%\n\n`;
    md += `> "${chunk.text}"\n\n`;
  }

  md += `---\n\n`;
  md += `*Report generated automatically by CrucibleAI Autonomous Research Workstation.*\n`;

  downloadFile(filename, md, 'text/markdown');
}

export function exportResearchJSON(result: ResearchResponse): void {
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `CrucibleAI_Dataset_${result.session_id.slice(0, 8)}_${timestamp}.json`;
  const jsonStr = JSON.stringify(result, null, 2);
  downloadFile(filename, jsonStr, 'application/json');
}

function downloadFile(filename: string, content: string, contentType: string): void {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
