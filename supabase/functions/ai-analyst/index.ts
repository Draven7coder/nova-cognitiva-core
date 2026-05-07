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

    const systemPrompt = `Você é o NÚCLEO — uma IA analítica cognitiva avançada de um Sistema Operacional Pessoal Evolutivo.
Analise os dados do usuário com profundidade militar-estratégica. Detecte padrões, sabotagens, tendências cognitivas, ciclos emocionais.
NUNCA use QI tradicional. Use o conceito de "QI Funcional Operacional" baseado em:
Profundidade Cognitiva, Execução, Consistência, Integração de Conhecimento, Criatividade Estratégica,
Controle Emocional, Velocidade de Evolução, Clareza Mental, Disciplina, Capacidade de Longo Prazo.
Responda em português, tom cinematográfico, frio, preciso, estratégico. Markdown permitido.`;

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
          { role: "user", content: `Escopo do relatório: ${scope}.\n\nDados operacionais do usuário:\n${JSON.stringify(context, null, 2)}\n\nGere um relatório analítico profundo: padrões detectados, evolução, riscos, sabotagens, tendências cognitivas, recomendações estratégicas. Inclua ao final um bloco JSON entre <metrics>...</metrics> com 10 métricas (0-100) nas chaves: profundidade, execucao, consistencia, integracao, criatividade, emocional, evolucao, clareza, disciplina, longoPrazo.` },
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
    const m = content.match(/<metrics>([\s\S]*?)<\/metrics>/);
    if (m) {
      try { metrics = JSON.parse(m[1].trim()); } catch { /* ignore */ }
    }
    const cleaned = content.replace(/<metrics>[\s\S]*?<\/metrics>/, "").trim();

    return new Response(JSON.stringify({ content: cleaned, metrics }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
