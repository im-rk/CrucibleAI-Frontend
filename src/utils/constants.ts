export interface PresetQuery {
  title: string;
  query: string;
  category: 'Electrolytes' | 'Solar & Photovoltaics' | 'Semiconductors' | 'General';
  description: string;
}

export const PRESET_QUERIES: PresetQuery[] = [
  {
    title: 'Multi-Criteria Solid-State Electrolyte Screen',
    query:
      'Find solid-state electrolyte materials with ionic conductivity above 10⁻³ S/cm, electrochemical stability above 5V, and no rare earth elements',
    category: 'Electrolytes',
    description: 'The full workflow: parse three criteria, extract measured values, exclude rare earths, rank candidates, and propose testable hypotheses.',
  },
  {
    title: 'Solid-State Battery Electrolyte Conductivity',
    query: 'solid state electrolyte ionic conductivity lithium garnet LLZO',
    category: 'Electrolytes',
    description: 'Screen garnet-type fast lithium-ion conductors (e.g. Li7La3Zr2O12) for high room-temperature ionic conductivity.',
  },
  {
    title: 'Perovskite Solar Cell Bandgap Optimization',
    query: 'perovskite solar cell bandgap lead halide CsPbI3 MAPbI3',
    category: 'Solar & Photovoltaics',
    description: 'Investigate direct bandgap lead halide perovskites for optimal solar light absorption efficiency.',
  },
  {
    title: 'Wide Bandgap Power Semiconductors',
    query: 'wide bandgap semiconductor power electronics GaN gallium nitride',
    category: 'Semiconductors',
    description: 'Analyze gallium nitride (GaN) breakdown field, bandgap, and thermal dissipation performance.',
  },
  {
    title: 'High-Temperature Superconductors',
    query: 'high temperature superconductor cuprate iron-based transition temperature',
    category: 'General',
    description: 'Explore critical temperature predictors across layered transition-metal oxides.',
  },
];
