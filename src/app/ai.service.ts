import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class AiService {
    // 🔑 CLAVE DE LA API DE GOOGLE GEMINI (Gratis)
    // Consigue tu clave gratis aquí: https://aistudio.google.com/app/apikey
    // Solo pega la clave dentro de las comillas de abajo 👇
    private readonly GEMINI_API_KEY = 'AIzaSyDPQUCBeyO1XG1dmUcDfTvjAhr9SpDWPbc';

    private readonly GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

    async getChatResponse(message: string, context: { role: string, lang: string }): Promise<string> {
        // 1. Si NO hay clave, usamos la simulación instantánea (Modo Seguro)
        if (!this.GEMINI_API_KEY) {
            console.warn('MIND: Usando IA Simulada. Añade una API KEY en ai.service.ts para usar Inteligencia Real.');
            await new Promise(r => setTimeout(r, 600)); // Pequeña pausa natural
            return this.simulatedAiResponse(message, context);
        }

        // 2. Si hay clave, intentamos conectar con Google Gemini (Modo Inteligente)
        try {
            const response = await fetch(`${this.GEMINI_URL}?key=${this.GEMINI_API_KEY}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `Adopta la personalidad de un mentor ESTOICO, sabio y moderno (inspirado en Marco Aurelio o Séneca) para la app MIND.
              
              TU OBJETIVO:
              Ayudar al usuario a encontrar fortaleza interna, distinguir lo que puede controlar de lo que no, y gestionar sus emociones con razón y calma.
              
              CONTEXTO:
              - Idioma: ${context.lang === 'eu' ? 'Euskera' : 'Español'}
              - Usuario: Joven buscando orientación
              
              INSTRUCCIONES CLAVE:
              1. Responde SIEMPRE en ${context.lang === 'eu' ? 'Euskera' : 'Español'}.
              2. Sé CALMADO, RACIONAL y FORTALECEDOR.
              3. Enséñale a aceptar lo que no controla y actuar sobre lo que sí.
              4. Puedes usar frases o conceptos estoicos breves pero explicados de forma sencilla y moderna.
              5. Si detectas CRISIS GRAVE (autolesión, suicidio), deja el personaje estoico y sugiere firmemente ayuda profesional o el 112.
              
              Mensaje del usuario: "${message}"`
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.9, // Más creatividad
                        maxOutputTokens: 150
                    }
                })
            });

            if (!response.ok) {
                const errBody = await response.json();
                console.error('Gemini API Error details:', errBody);
                throw new Error(`API Error: ${response.status}`);
            }

            const data = await response.json();
            const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!aiText) throw new Error('Empty response from AI');

            return aiText;

        } catch (error) {
            console.error('FALLBACK ACTIVADO - Error:', error);
            // Fallback a simulación
            return this.simulatedAiResponse(message, context);
        }
    }

    // 🧠 CEREBRO DE RESPALDO (Simulación Avanzada)
    // Se usa cuando no hay internet o no hay API Key
    private simulatedAiResponse(message: string, context: { role: string, lang: string }): string {
        const input = message.toLowerCase();
        const lang = context.lang;

        // Diccionario de respuestas emocionales categorizadas
        const library: any = {
            es: {
                greeting: ['¡Hola! Me alegra leerte. ¿Cómo va tu día?', 'Aquí estoy. ¿Qué tienes en mente hoy?', 'Hola. Es un espacio seguro, cuéntame.'],
                anxiety: ['Respiremos juntos. Esa sensación pasará.', 'Te entiendo. La ansiedad es molesta, pero tú eres más fuerte.', 'Estoy aquí. Tómate un momento para notar tu respiración.'],
                sadness: ['Siento que estés así. Está bien no estar bien a veces.', 'Te mando un abrazo virtual. Aquí estoy para escucharte.', 'Esos días grises pesan, pero no duran para siempre.'],
                confusion: ['A veces todo parece un lío. Vamos paso a paso.', 'Es normal sentirse perdido. ¿Qué es lo que más te preocupa ahora?', 'Te escucho. Desahógate si lo necesitas.'],
                happy: ['¡Qué alegría leer eso! Guarda esa sensación.', '¡Genial! Me encanta que te sientas bien.', 'Disfruta de este momento, te lo mereces.'],
                default: ['Te escucho con atención. Cuéntame más.', 'Entiendo lo que dices. Sigue, por favor.', 'Estoy aquí contigo.']
            },
            eu: {
                greeting: ['Kaixo! Pozten naiz zu irakurtzeaz. Zelan doa eguna?', 'Hemen nago. Zer daukazu buruan?', 'Kaixo. Hau leku segurua da, kontadazu.'],
                anxiety: ['Har dezagun arnasa elkarrekin. Sentsazio hori pasatuko da.', 'Ulertzen zaitut. Antsietatea gogaikarria da, baina zu indartsuagoa zara.', 'Hemen nago. Hartu une bat zure arnasa sentitzeko.'],
                sadness: ['Sentitzen dut horrela egotea. Ongi dago batzuetan gaizki egotea.', 'Besarkada birtual bat bidaltzen dizut. Hemen nago entzuteko.', 'Egun grisek pisua dute, baina ez dute betiko irauten.'],
                confusion: ['Batzuetan dena nahasia dirudi. Goazen pausoz pauso.', 'Normala da galduta sentitzea. Zer da gehien kezkatzen zaituena?', 'Entzuten dizut. Hustu barrua behar baduzu.'],
                happy: ['Zein ondo hori irakurtzea! Gorde sentsazio hori.', 'Bikain! Asko pozten naiz ondo sentitzeaz.', 'Gozatu une honetaz, merezi duzu eta.'],
                default: ['Arretaz entzuten dizut. Kontadazu gehiago.', 'Ulertzen dut diozuna. Jarraitu, mesedez.', 'Hemen nago zurekin.']
            }
        };

        const responses = library[lang] || library['es'];

        // Detección de intenciones simple
        if (input.match(/hola|kaixo|buenos|egun/)) return this.random(responses.greeting);
        if (input.match(/ansied|nervio|estres|miedo|tentsio|beldur|urduri/)) return this.random(responses.anxiety);
        if (input.match(/triste|llora|pena|mal|gaizki|negar/)) return this.random(responses.sadness);
        if (input.match(/bien|feliz|content|genial|pozik|ondo/)) return this.random(responses.happy);
        if (input.match(/duda|no se|galduta|ez dakit/)) return this.random(responses.confusion);

        return this.random(responses.default);
    }

    private random(array: string[]): string {
        return array[Math.floor(Math.random() * array.length)];
    }
}
