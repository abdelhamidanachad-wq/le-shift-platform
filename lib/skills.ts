export type Skill = {
  id: string;
  databaseId?: string;
  title: string;
  description: string;
  category: string;
  price: number;
  priceLabel?: string;
  expected_roi: string;
  type: 'mcp' | 'prompt' | 'agent' | 'plugin' | 'workflow';
  timeSaved: string;
  tag: string;
  icon: string;
  websiteUrl?: string;
  documentationUrl?: string;
};

// Public GitHub projects used as a resilient fallback if Supabase is unavailable.
export const skills: Skill[] = [
  { id: 'anthropics-skills', title: 'Anthropic Skills', description: 'Exemples de skills et d’instructions réutilisables pour structurer des tâches avec Claude.', category: 'Claude Skills', price: 0, priceLabel: 'À vérifier', expected_roi: 'Selon usage', type: 'prompt', timeSaved: 'À évaluer', tag: 'GitHub officiel', icon: '✳', websiteUrl: 'https://github.com/anthropics/skills', documentationUrl: 'https://github.com/anthropics/skills#readme' },
  { id: 'mcp-servers', title: 'Model Context Protocol Servers', description: 'Répertoire de référence d’implémentations de serveurs MCP et de connecteurs.', category: 'Écosystème MCP', price: 0, priceLabel: 'À vérifier', expected_roi: 'Selon usage', type: 'mcp', timeSaved: 'À évaluer', tag: 'Référence MCP', icon: '⌁', websiteUrl: 'https://github.com/modelcontextprotocol/servers', documentationUrl: 'https://github.com/modelcontextprotocol/servers#readme' },
  { id: 'github-mcp-server', title: 'GitHub MCP Server', description: 'Expose les opérations GitHub comme outils pour les clients compatibles MCP.', category: 'Développement', price: 0, priceLabel: 'À vérifier', expected_roi: 'Selon usage', type: 'mcp', timeSaved: 'À évaluer', tag: 'Developer tools', icon: '⌘', websiteUrl: 'https://github.com/github/github-mcp-server', documentationUrl: 'https://github.com/github/github-mcp-server#readme' },
  { id: 'playwright-mcp', title: 'Playwright MCP', description: 'Connecteur de navigateur pour automatiser des parcours et inspecter des pages web.', category: 'Automatisation web', price: 0, priceLabel: 'À vérifier', expected_roi: 'Selon usage', type: 'mcp', timeSaved: 'À évaluer', tag: 'Browser automation', icon: '◈', websiteUrl: 'https://github.com/microsoft/playwright-mcp', documentationUrl: 'https://github.com/microsoft/playwright-mcp#readme' },
  { id: 'langgraph', title: 'LangGraph', description: 'Framework pour construire des agents et workflows IA avec état et orchestration.', category: 'Agents IA', price: 0, priceLabel: 'À vérifier', expected_roi: 'Selon usage', type: 'agent', timeSaved: 'À évaluer', tag: 'Agent framework', icon: '◉', websiteUrl: 'https://github.com/langchain-ai/langgraph', documentationUrl: 'https://github.com/langchain-ai/langgraph#readme' },
  { id: 'n8n', title: 'n8n', description: 'Plateforme d’automatisation de workflows avec un large écosystème d’intégrations.', category: 'Workflows', price: 0, priceLabel: 'À vérifier', expected_roi: 'Selon usage', type: 'workflow', timeSaved: 'À évaluer', tag: 'Automation', icon: '⟳', websiteUrl: 'https://github.com/n8n-io/n8n', documentationUrl: 'https://github.com/n8n-io/n8n#readme' },
];
