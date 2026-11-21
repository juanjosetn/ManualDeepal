# IAs disponibles en el manual — lista para aprobar

Las IAs son **opcionales**: el manual funciona completo sin ninguna (busca y responde con los tips).
Cuando una persona activa una IA, la usa **con su propia llave** (API key), que se guarda solo en su navegador. Tú, como administrador, decides cuáles se ofrecen: cambia `"aprobado"` en `config/ia.json` o usa el paso 6 del panel `#admin`.

**¿Qué se le envía a la IA?** Solo la pregunta de la persona y los 5 tips más parecidos del manual. En el panel de administrador, la conversación del chat **anonimizada**.

## Gratuitas (vienen aprobadas)

| IA | ¿Pide llave? | Dónde corre | Para qué sirve mejor | Ojo |
|---|---|---|---|---|
| **Google Gemini** | Sí, gratis en aistudio.google.com | Internet | Respuestas de buena calidad; la más recomendada | En el nivel gratuito Google puede usar lo enviado para mejorar sus productos |
| **Groq** | Sí, gratis | Internet | La más rápida | Cupo por minuto |
| **Mistral** (plan Experiment) | Sí, gratis (verifica el teléfono) | Internet | Buen español | En el plan gratuito puede entrenar con lo enviado |
| **OpenRouter** (modelos `:free`) | Sí, gratis | Internet | Respaldo | Pocas consultas diarias |
| **Hugging Face** | Sí (token `hf_`) | Internet | Respaldo con modelos abiertos | Créditos gratuitos pequeños al mes |
| **Cerebras** | Sí, gratis | Internet | Respaldo rápido | ⚠️ No se ha comprobado que acepte llamadas desde páginas web |
| **Pollinations** | Opcional (`pk_`) | Internet | Sin registro | Comunitaria, lenta y sin garantía; no enviar datos personales |
| **Gemini Nano** (Chrome) | No | Tu computador | Privacidad total, sin internet | Solo Chrome de escritorio con equipo potente (16 GB RAM); no en celulares |
| **Ollama** | No | Tu computador | **Ideal para el admin**: procesar el chat sin que salga del equipo | Hay que instalarlo y permitir el origen de la página |
| **LM Studio** | No | Tu computador | Igual que Ollama, con interfaz gráfica | Activar «Enable CORS» |

## De pago (vienen SIN aprobar: tú decides)

| IA | Costo aproximado | Ventaja | Ojo |
|---|---|---|---|
| **OpenAI** (modelos «mini») | Centavos de dólar por cientos de preguntas | Muy buena calidad y estable | Requiere tarjeta y saldo prepago |
| **Anthropic Claude** (Haiku) | Similar | Respuestas cuidadosas y en buen español | Requiere tarjeta y saldo |
| **DeepSeek** | Muy económico | Bajo costo | Servidores en China; CORS sin comprobar |
| **xAI Grok** | Por uso | — | CORS sin comprobar |
| **Together AI** | Por uso | Modelos abiertos grandes | — |

**Importante con las de pago:** la llave la pone cada persona y el cobro llega a la cuenta de quien la puso. Si el club quisiera pagar una IA para todos, hace falta un servidor intermedio (por ejemplo, una función de Cloudflare o de Google Apps Script) que guarde la llave en secreto. Una página de GitHub Pages **no puede esconder una llave**: cualquiera podría copiarla. Eso sería una versión futura.

## Recomendación
1. Deja aprobadas las gratuitas.
2. Para el grupo, recomienda **Gemini** (calidad) con **Groq** de respaldo.
3. Para procesar el chat, usa **Ollama** en tu computador (privacidad) o Gemini con el texto ya anonimizado.
4. Aprueba una de pago solo si alguien del grupo la va a usar con su propia llave.

> Los nombres de modelos cambian seguido. La app pregunta a cada proveedor qué modelos tiene vigentes, así que no hay que editar el código cuando retiran uno.
