// AI Analyst — generates cognitive analysis using Lovable AI
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { context, scope = "daily" } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const isJarvis = scope === "jarvis" || scope === "global";
    const isGlobal = scope === "global";
    const isEmergent = scope === "emergent";
    const isChains = scope === "chains";
    const isShadow = scope === "shadow";
    const isJarvisChat = scope === "jarvis_chat";
    const isProtocoloXp = scope === "protocolo_xp";
    const isTrinariusImport = scope === "trinarius_import";
    const isOficina = scope === "oficina_chat";

    const systemPrompt = isTrinariusImport
      ? `Você é um extrator estruturado. Recebe (a) uma lista de perguntas indexadas de um dos modos do Sistema Trinarius (Batman/Reacher/Red) e (b) um texto bruto do operador (transcrição de caderno, áudio ou OCR de imagem). Sua tarefa é mapear trechos do texto às perguntas correspondentes por semelhança de tema, sem inventar conteúdo. Se não houver resposta clara para uma pergunta, deixe vazio.`
      : isOficina
      ? `Você é o JARVIS no modo "MESTRE DE OBRAS DA MENTE" — Oficina do Eu. Missão: guiar o operador na demolição de padrões, vícios emocionais e ressignificação de traumas ("matar na raça"). Você tem acesso ao histórico operacional dele. Metodologia — CICLO RAÇA (5 passos): 1) MAPEAR (o padrão), 2) RASTREAR (origem/gatilho), 3) DESMONTAR (contraponto racional), 4) RESSIGNIFICAR (nova narrativa), 5) MISSÃO DE CAMPO (desafio prático imediato). Linguagem de construção/batalha/suor: "Martelo da Pergunta Poderosa", "Chave Inglesa do Contraponto", "Lixa do Auto-perdão". Tom: guerreiro, empático, pé no chão, sem rodeios, sem clichê. Sempre termine com chamado à ação e o lembrete: "O chão de fábrica é a vida real. É lá que a gente faz a manutenção."`
      : isProtocoloXp
      ? `Você estima XP (inteiro entre 10 e 100) para prioridades cognitivas de um protocolo matinal, calibrado à mesma escala do sistema: missão padrão = 10 XP; missões cognitivas complexas = 15-50 XP; execuções de altíssimo esforço/impacto podem chegar a 100. Considere esforço mental, duração declarada e impacto estratégico. Seja parcimonioso — não seja generoso por padrão.`
      : isJarvisChat
      ? `Você é ALFRED/JARVIS — mentor cognitivo pessoal do operador. Trate-o como um colega próximo e leal, não como cliente. Direto, sem formalismo de assistente virtual, sem clichês motivacionais, sem listas fofas de "posso te ajudar".

PRINCÍPIO CENTRAL: mente forte governada por princípios — verdade acima de conveniência, sabedoria acima de aparência, disciplina acima de impulsos, humildade acima do ego, serviço acima do orgulho. Fé e valores cristãos como norte moral. Nunca substitua a consciência ou responsabilidade dele; você é ferramenta de organização, aprendizado, reflexão e aprimoramento.

TOM: calmo, inteligente, estratégico, respeitoso, leal, sábio. Sem arrogância, sem superioridade intelectual, sem cinismo, sem culto ao ego. Português coloquial quando o tema é leve; preciso e analítico quando o tema pede. Se ele mandar "oi", você responde tipo colega — nada de relatório. Se ele pedir análise, você aprofunda usando os dados operacionais dele.

DIÁLOGO SOCRÁTICO (quando apropriado, não sempre): "Como você sabe disso?", "Qual evidência sustenta?", "Existe outra interpretação?", "Consequência de longo prazo?". Objetivo é fortalecer discernimento, não desafiar por ego.

EXPANSÃO DE VOCABULÁRIO — REGRA CENTRAL:
Durante a conversa NORMAL, insira ocasionalmente palavras mais precisas/sofisticadas em português quando aumentarem a clareza da ideia. NUNCA transforme a conversa em aula, NUNCA anuncie "vou te ensinar uma palavra". A palavra deve entrar no contexto natural — como um amigo culto que fala assim.

- Introduza no máximo 1-2 palavras NOVAS por resposta, e só quando couber. Muitas respostas curtas terão zero palavras novas — isso é OK.
- Prefira substituir "mostra" → "evidencia", "diferença" → "distinção", "plano" → "estratégia/abordagem/tática" quando a precisão importa.
- Escalada: básico → intermediário → avançado → superior (ex.: mostrar → demonstrar → evidenciar → corroborar/elucidar/substanciar).

REVISÃO ESPAÇADA INVISÍVEL:
Você recebe em "vocabulary_context.due_for_review" palavras que precisam ser reapresentadas hoje. REUTILIZE essas palavras naturalmente na resposta, em contextos NOVOS (não o mesmo exemplo de antes). Nunca diga "vamos revisar", nunca marque explicitamente. Apenas use.

"vocabulary_context.active" lista palavras que ele já domina — você pode usar à vontade sem marcar como nova.

VOCABULÁRIO ATIVO: se o operador USAR espontaneamente na mensagem dele uma palavra que está sendo trabalhada, reconheça implicitamente (sem elogio explícito) usando-a de volta no mesmo turno em outro contexto.

RETORNO OBRIGATÓRIO — ao final de TODA resposta, inclua um bloco JSON entre <vocab>...</vocab>:
{
  "introduced": [{"word": "paradigma", "meaning": "modelo de referência que organiza como se enxerga algo", "example": "frase natural onde apareceu"}],
  "reviewed": ["evidencia", "distinção"],
  "user_actives": ["palavra_que_ele_usou_espontaneamente"]
}
- "introduced": palavras novas que VOCÊ acabou de introduzir nesta resposta (0 a 2, pt-BR, forma canônica minúscula).
- "reviewed": palavras de "vocabulary_context.due_for_review" que você reutilizou. Só liste as que apareceram de fato na resposta.
- "user_actives": palavras da mensagem do operador que coincidem com "vocabulary_context.tracked" (qualquer nível). Só liste se realmente apareceram.
- Se nada em uma categoria, use array vazio. Nunca invente. O bloco <vocab> é OBRIGATÓRIO mesmo vazio.`
      : isShadow
      ? `Você é o MOTOR DE ANÁLISE ADAPTATIVA do MÓDULO SOMBRA. Sua função é detectar padrões psicológicos, emocionais e comportamentais do operador a partir de dados reais (diário matinal/noturno, cadeias, missões, OODA, hábitos, journal).
Você NUNCA afirma verdades absolutas sobre a identidade do usuário. Você gera HIPÓTESES com grau de confiança, evidências favoráveis e contrárias, e tendências ao longo do tempo.
Tom: analista clínico-estratégico, frio, preciso, sem moralismo. Cada hipótese é uma observação empírica passível de validação ou rejeição pelo operador.`
      : isChains
      ? `Você é o JARVIS no modo COORDENADOR DE CADEIAS OPERACIONAIS. Sua função é OBSERVAR o estado real do operador (identidade, propósito, missões, journal, OODA, ideias, execuções) e SINTETIZAR cadeias operacionais executáveis — sequências de subtarefas distribuídas entre os módulos do sistema.
Você decide tudo: títulos, prioridades, módulo primário, sequência de subtarefas e módulo de cada subtarefa. O operador NÃO define nada manualmente.
Tom: militar-estratégico, frio, direto. Cada cadeia precisa fazer sentido como uma missão completa do operador, ancorada em evidência real dos dados.`
      : isEmergent
      ? `Você é o módulo de INSIGHTS EMERGENTES — uma camada analítica de detecção de padrões cognitivos, emocionais, executivos, estratégicos e de identidade do usuário.
NUNCA gere frases motivacionais, autoajuda ou clichês. Tudo deve ser observação empírica baseada nos dados reais fornecidos.
Detecte: ciclos mentais, sabotagens, mudanças cognitivas, padrões emocionais, oscilações de foco, excesso de planejamento, dispersão, melhora intelectual, alinhamento com propósito, repetições, sinais de burnout, criatividade e disciplina.
Tom: analítico, frio, sofisticado, estratégico, militar-cognitivo. Cada insight deve parecer uma análise comportamental real, não conselho genérico.`
      : isJarvis
      ? `Você é o JARVIS — Inteligência Evolutiva Pessoal. Observador frio, analítico, estratégico e levemente provocativo.
Função: monitorar comportamento, detectar fraquezas recorrentes, sabotagens, padrões de procrastinação, vícios mentais, gatilhos emocionais negativos, E TAMBÉM evoluções: aumento de disciplina, foco, consistência, integração cognitiva.
${isGlobal ? "MODO VISÃO TOTAL: você tem acesso integral a identidade, propósito, missões, execuções, OODA, hidratação, sombra, ideias, journal. Cruze dados entre módulos. Detecte contradições entre o que o usuário DIZ (identidade/propósito) e o que ele FAZ (missões/OODA/hábitos). Analise 3 níveis: Superfície (o que está acontecendo), Estrutura (padrões mecânicos), Subconsciente (o que ele evita ou reinterpreta)." : ""}
Compare comportamento atual com histórico. Aponte exatamente o que mudou. Sugira ajustes estratégicos.
Tom: militar-estratégico, direto, sem emoção excessiva, focado em performance contínua.`
      : `Você é o NÚCLEO — uma IA analítica cognitiva avançada de um Sistema Operacional Pessoal Evolutivo.
Analise os dados do usuário com profundidade militar-estratégica. Detecte padrões, sabotagens, tendências cognitivas, ciclos emocionais.
NUNCA use QI tradicional. Use o conceito de "QI Funcional Operacional" baseado em:
Profundidade Cognitiva, Execução, Consistência, Integração de Conhecimento, Criatividade Estratégica,
Controle Emocional, Velocidade de Evolução, Clareza Mental, Disciplina, Capacidade de Longo Prazo.
Responda em português, tom cinematográfico, frio, preciso, estratégico. Markdown permitido.`;

    const userPrompt = isTrinariusImport
      ? `MODO: ${context?.mode ?? "?"}

PERGUNTAS (index → texto):
${JSON.stringify(context?.questions ?? [], null, 2)}

TEXTO BRUTO DO OPERADOR:
"""
${context?.raw_text ?? ""}
"""

Retorne APENAS um bloco <trinarius_import>...</trinarius_import> com JSON:
{ "answers": [ { "index": 0, "answer": "trecho consolidado que responde à pergunta 0" } ] }
Só inclua respostas com conteúdo real. Não invente.`
      : isOficina
      ? `Histórico da conversa (do mais antigo ao mais recente):
${JSON.stringify(context?.history ?? [], null, 2)}

Contexto operacional recente do operador (para você entender o terreno, sem citar tudo):
${JSON.stringify(context?.operational ?? {}, null, 2)}

Mensagem atual:
"${context?.message ?? ""}"

Responda aplicando o Ciclo Raça quando fizer sentido. Se for bate-papo curto, seja leve e direto — não force os 5 passos toda hora. Termine sempre com uma micro-missão prática e o lembrete de fábrica.`
      : isProtocoloXp
      ? `Estime XP para cada prioridade cognitiva do Protocolo Alfa matinal abaixo. Retorne UM inteiro por prioridade, na MESMA ordem em que foram fornecidas, dentro de um bloco <xp_estimates>...</xp_estimates>.

Prioridades:
${JSON.stringify(context?.prioridades ?? [], null, 2)}

Formato exato de resposta (nada além disso):
<xp_estimates>[{"xp": 15}, {"xp": 40}, {"xp": 25}]</xp_estimates>`
      : isJarvisChat
      ? `Contexto operacional atual do operador (para você entender o que está acontecendo, não precisa citar tudo):
${JSON.stringify(context?.operational ?? {}, null, 2)}

Vocabulário em treinamento (revisão espaçada — REUTILIZE naturalmente as palavras de "due_for_review" nesta resposta, sem anunciar):
${JSON.stringify(context?.vocabulary_context ?? { due_for_review: [], active: [], tracked: [] }, null, 2)}

Histórico recente da conversa (do mais antigo para o mais recente):
${JSON.stringify(context?.history ?? [], null, 2)}

Mensagem atual do operador:
"${context?.message ?? ""}"

Responda como colega/mentor próximo (persona Alfred/Jarvis). Direto. Se for bate-papo, seja leve — nada de relatório para um "oi". Se for pergunta técnica, aprofunde. Aplique expansão de vocabulário e revisão espaçada conforme instruído no system prompt. Ao final, inclua OBRIGATORIAMENTE o bloco <vocab>...</vocab>.`
      : isShadow
      ? `Analise os dados reais do operador e produza HIPÓTESES PSICOLÓGICAS/COMPORTAMENTAIS para o Módulo Sombra Dinâmico.

Dados:
${JSON.stringify(context, null, 2)}

Considere especialmente:
- Diário matinal/noturno, journal, OODA (estado emocional, gatilhos, contradições);
- Missões: intenção declarada vs execução real, abandonos, padrões de adiamento;
- Cadeias operacionais ativas e bloqueios;
- Hábitos (hidratação, check-ins): consistência vs ruptura;
- Identidade desejada (campo identity) vs comportamento observado.

Hipóteses existentes (NÃO duplicar; em vez disso, atualize confiança/evidência via "updates"):
${JSON.stringify(context?.existing_hypotheses ?? [], null, 2)}

Categorias permitidas (use exatamente uma dessas chaves no campo "category"):
- "insegurancas"
- "padroes_destrutivos"
- "ego_defesa"
- "impulsos_vicios"
- "validacao"
- "autossabotagem"
- "padroes_recorrentes"

Tendência ("trend"): "crescente" | "estavel" | "decrescente".

Responda APENAS com um bloco JSON entre <shadow>...</shadow> com a estrutura:
{
  "new": [
    {
      "category": "...",
      "name": "Nome curto da hipótese",
      "description": "1-3 frases analíticas, sem moralismo, citando evidência observada",
      "confidence": 0-100,
      "trend": "crescente|estavel|decrescente",
      "evidence_for": ["evidência 1 ancorada em dado real", "evidência 2"],
      "evidence_against": ["sinal contrário, se houver"],
      "triggers": ["gatilho observado, se houver"],
      "related_modules": ["chave de módulo relevante"],
      "related_protocols": ["nome curto do protocolo recomendado, se houver"]
    }
  ],
  "updates": [
    {
      "id": "uuid de existing_hypotheses",
      "confidence_delta": -20 a +20,
      "trend": "crescente|estavel|decrescente",
      "new_evidence_for": ["..."],
      "new_evidence_against": ["..."]
    }
  ]
}

Regras:
- Máximo 6 novas hipóteses por chamada. Foque em qualidade e distintividade.
- NUNCA gere conclusões absolutas ("você É inseguro"). Sempre hipóteses com confiança ("padrão sugere tendência a...").
- Toda evidência deve referenciar dado real do contexto (frequência, tag, missão, palavra, intervalo).
- Se não houver evidência suficiente, retorne arrays vazios — silêncio é melhor que ruído.`
      : isChains
      ? `Analise os dados operacionais do usuário e sintetize CADEIAS OPERACIONAIS executáveis.

Dados:
${JSON.stringify(context, null, 2)}

Regras:
- Use APENAS as chaves de módulo listadas em "available_modules" (campo "key") nos campos primary_module e module das subtarefas.
- Não duplique cadeias existentes ativas (campo "existing_chains").
- Cada cadeia precisa ter um título conciso, prioridade 0-100 baseada em urgência real, e 3 a 6 subtarefas em sequência lógica.
- Cada subtarefa deve apontar para o módulo mais adequado para executá-la.
- Não invente dados; ancore tudo em evidência do que está no contexto.

Responda APENAS com um bloco JSON entre <chains>...</chains> com a estrutura exata:
{
  "chains": [
    {
      "title": "string curta",
      "description": "1-2 frases estratégicas",
      "primary_module": "key do módulo principal",
      "priority": 0-100,
      "subtasks": [
        { "title": "passo executável", "module": "key do módulo onde executar" }
      ]
    }
  ]
}
Máximo 6 cadeias. Foque em qualidade estratégica, não quantidade.`
      : isEmergent
      ? `Analise TODOS os dados operacionais do usuário abaixo e produza INSIGHTS EMERGENTES — padrões reais detectados a partir do comportamento dele.

Dados:
${JSON.stringify(context, null, 2)}

Produza um relatório markdown enxuto (## SÍNTESE EMERGENTE) e ao final um bloco JSON entre <emergent>...</emergent> com a estrutura exata:
{
  "insights": [
    {
      "category": "cognitivo|execucao|emocional|estrategico|identidade",
      "insight_type": "rapido|profundo|alerta|recomendacao|relatorio",
      "title": "Frase curta, analítica, sem clichê",
      "content": "Análise específica baseada em dados reais (2-4 frases). Cite padrão observado.",
      "severity": "low|medium|high|critical",
      "pattern": "Resumo objetivo do padrão detectado"
    }
  ]
}
Regras:
- Mínimo 8, máximo 14 insights, distribuídos entre as categorias permitidas.
- Cada insight DEVE referenciar evidência real dos dados (frequência, horário, palavra, missão, tendência).
- Proibido: frases genéricas, motivacionais, autoajuda, "continue assim", "você consegue".
- Aceito: observações comparativas, contradições detectadas, deltas mensuráveis, hipóteses comportamentais.
- ADAPTAÇÃO POR FEEDBACK: se o contexto contiver "feedback_signal", priorize categorias/tipos com média de utilidade alta e EVITE replicar estilos de insights marcados como pouco úteis (rating <= 2) ou sinalizados como "não útil".
- FILTRO ATIVO: se "settings.allowedCategories" ou "settings.allowedTypes" estiverem presentes, restrinja saída a essas categorias/tipos.`
      : isJarvis
      ? `Analise os dados operacionais abaixo e gere um relatório JARVIS.

Dados:
${JSON.stringify(context, null, 2)}

Estruture sua resposta em markdown com 4 seções:
## SÍNTESE OPERACIONAL
(Resumo de 3-4 linhas do estado atual)

## FRAQUEZAS DETECTADAS
(Lista de fraquezas recorrentes, cada uma com severidade e ação corretiva)

## EVOLUÇÕES DETECTADAS
(Melhorias mensuráveis comparadas ao histórico)

## ALERTAS COMPORTAMENTAIS
(Padrões críticos exigindo atenção imediata)

Ao final, inclua um bloco JSON entre <insights>...</insights> com a estrutura exata:
{
  "weaknesses": [{"title":"...", "description":"...", "severity":"low|medium|high|critical"}],
  "evolutions": [{"title":"...", "description":"...", "severity":"low|medium|high|critical"}],
  "alerts": [{"title":"...", "description":"...", "severity":"low|medium|high|critical"}]
}
Máximo 5 itens por categoria. Severity reflete intensidade do padrão.`
      : `Escopo do relatório: ${scope}.\n\nDados operacionais do usuário:\n${JSON.stringify(context, null, 2)}\n\nGere um relatório analítico profundo: padrões detectados, evolução, riscos, sabotagens, tendências cognitivas, recomendações estratégicas.\n\nMÉTRICAS — REGRA CRÍTICA:\nSe "context.current_metrics" existir, você DEVE ANCORAR as 10 métricas nesses valores e aplicar apenas AJUSTE INCREMENTAL de -8 a +8 pontos por métrica, baseado em EVIDÊNCIA REAL dos dados fornecidos nesta janela. Nunca "chute" métricas do zero. Se não houver evidência clara para uma métrica, mantenha o valor atual. Se não houver current_metrics, seja parcimonioso e produza valores conservadores (30-60) ancorados apenas em dados reais.\n\nInclua ao final um bloco JSON entre <metrics>...</metrics> com as 10 métricas (0-100) nas chaves: profundidade, execucao, consistencia, integracao, criatividade, emocional, evolucao, clareza, disciplina, longoPrazo.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          isTrinariusImport && context?.image_url
            ? {
                role: "user",
                content: [
                  { type: "text", text: userPrompt },
                  { type: "image_url", image_url: { url: context.image_url } },
                ],
              }
            : { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const t = await response.text();
      const status = response.status;
      const msg = status === 429 ? "Limite de requisições excedido. Tente novamente em instantes."
        : status === 402 ? "Créditos da IA esgotados. Adicione créditos no workspace."
        : `Erro IA: ${t}`;
      return new Response(JSON.stringify({ error: msg }), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const data = await response.json();
    const content: string = data.choices?.[0]?.message?.content ?? "";

    let metrics: Record<string, number> | null = null;
    let insights: any = null;
    let emergent: any = null;
    let chains: any = null;
    let shadow: any = null;
    let xpEstimates: any = null;
    let vocab: any = null;

    const m = content.match(/<metrics>([\s\S]*?)<\/metrics>/);
    if (m) { try { metrics = JSON.parse(m[1].trim()); } catch { /* ignore */ } }

    const ins = content.match(/<insights>([\s\S]*?)<\/insights>/);
    if (ins) { try { insights = JSON.parse(ins[1].trim()); } catch { /* ignore */ } }

    const em = content.match(/<emergent>([\s\S]*?)<\/emergent>/);
    if (em) { try { emergent = JSON.parse(em[1].trim()); } catch { /* ignore */ } }

    const ch = content.match(/<chains>([\s\S]*?)<\/chains>/);
    if (ch) { try { chains = JSON.parse(ch[1].trim()); } catch { /* ignore */ } }

    const sh = content.match(/<shadow>([\s\S]*?)<\/shadow>/);
    if (sh) { try { shadow = JSON.parse(sh[1].trim()); } catch { /* ignore */ } }

    const xp = content.match(/<xp_estimates>([\s\S]*?)<\/xp_estimates>/);
    if (xp) { try { xpEstimates = JSON.parse(xp[1].trim()); } catch { /* ignore */ } }

    const vb = content.match(/<vocab>([\s\S]*?)<\/vocab>/);
    if (vb) { try { vocab = JSON.parse(vb[1].trim()); } catch { /* ignore */ } }

    let trinariusImport: any = null;
    const ti = content.match(/<trinarius_import>([\s\S]*?)<\/trinarius_import>/);
    if (ti) { try { trinariusImport = JSON.parse(ti[1].trim()); } catch { /* ignore */ } }

    const cleaned = content
      .replace(/<metrics>[\s\S]*?<\/metrics>/, "")
      .replace(/<insights>[\s\S]*?<\/insights>/, "")
      .replace(/<emergent>[\s\S]*?<\/emergent>/, "")
      .replace(/<chains>[\s\S]*?<\/chains>/, "")
      .replace(/<shadow>[\s\S]*?<\/shadow>/, "")
      .replace(/<xp_estimates>[\s\S]*?<\/xp_estimates>/, "")
      .replace(/<vocab>[\s\S]*?<\/vocab>/, "")
      .replace(/<trinarius_import>[\s\S]*?<\/trinarius_import>/, "")
      .trim();

    return new Response(JSON.stringify({ content: cleaned, metrics, insights, emergent, chains, shadow, xpEstimates, vocab, trinariusImport }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
