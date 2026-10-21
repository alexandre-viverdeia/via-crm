# A IA do app roda só nas funções do servidor, com um modelo fixo

O Follow-up, o Copiloto e os Insights chamam o Lovable AI pelas funções do servidor (`ai-email`, `ai-copilot` e `ai-insights`), nunca pelo navegador, para que nenhuma chave de IA chegue ao usuário. O modelo é fixo no código (`google/gemini-3-flash-preview`), em vez de uma tela de Configurações: o dono não quer escolher modelo, e o custo fica previsível dentro do crédito de IA do Lovable.

## Opções consideradas

- **Escolha do modelo numa tela de Configurações:** descartada por agora. É mais uma decisão para o usuário e mais um jeito de a IA falhar sem ninguém entender por quê.
- **Chave própria de um provedor (OpenRouter, Anthropic):** descartada no núcleo, porque exigiria mais uma conta e uma chave para guardar. Fica como desafio de quem sair do Lovable.

## Consequências

Quando a IA falha ou o crédito acaba (o gateway devolve 402 ou 429), o resto do CRM continua funcionando: nenhuma tela depende da IA para salvar dados. Trocar o modelo é mudar uma linha em cada função e publicar as funções de novo.
