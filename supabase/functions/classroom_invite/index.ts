
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { create, getNumericDate } from "https://deno.land/x/djwt@v2.8/mod.ts"

// Interface para as credenciais da Service Account do Google
interface ServiceAccount {
    type: string;
    project_id: string;
    private_key_id: string;
    private_key: string;
    client_email: string;
    client_id: string;
    auth_uri: string;
    token_uri: string;
    auth_provider_x509_cert_url: string;
    client_x509_cert_url: string;
}

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: CORS_HEADERS })
    }

    try {
        // 1. Validar e ler Credenciais do Ambiente
        const serviceAccountStr = Deno.env.get('GOOGLE_SERVICE_ACCOUNT')
        if (!serviceAccountStr) {
            throw new Error('Configuração ausente: GOOGLE_SERVICE_ACCOUNT não encontrada.')
        }
        const serviceAccount: ServiceAccount = JSON.parse(serviceAccountStr)

        // 2. Ler dados da requisição
        const { courseId, studentEmail } = await req.json()

        if (!courseId || !studentEmail) {
            return new Response(
                JSON.stringify({ error: 'courseId e studentEmail são obrigatórios' }),
                { status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
            )
        }

        // 3. Gerar JWT para autenticação com Google (Service Account)

        // Verificar se devemos usar Domain-Wide Delegation (para Workspace)
        const adminEmail = Deno.env.get('GOOGLE_ADMIN_EMAIL')

        // Escopos autorizados no Domain-Wide Delegation
        const scopes = ["https://www.googleapis.com/auth/classroom.rosters", "https://www.googleapis.com/auth/classroom.courses"]

        const iat = getNumericDate(new Date())
        const exp = getNumericDate(new Date(Date.now() + 3600 * 1000)) // 1 hora

        const jwtHeader = { alg: "RS256", typ: "JWT" }
        const jwtPayload = {
            iss: serviceAccount.client_email,
            sub: adminEmail || serviceAccount.client_email,
            aud: "https://oauth2.googleapis.com/token",
            iat,
            exp,
            scope: scopes.join(" "),
        }

        // A chave privada no JSON do Google vem com \n, precisamos formatar corretamente para o Deno Crypto se necessário
        // A lib djwt geralmente lida bem com strings PEM, mas vamos garantir.
        // Na verdade, djwt precisa de uma CryptoKey importada, não string direta.

        // Importar a chave privada
        // Formatar a chave: remover header/footer e quebras de linha para importar como PKCS8 é complicado em Deno puro sem libs extras se não for PEM.
        // Felizmente o djwt aceita PEM string na função create? Não, precisa de Key.
        // Vamos fazer uma abordagem mais nativa para obter o Token.

        const key = await importKey(serviceAccount.private_key)
        const jwt = await create({ alg: "RS256", typ: "JWT" }, jwtPayload, key)

        // 4. Trocar JWT por Access Token
        const tokenResp = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
                assertion: jwt,
            }),
        })

        const tokenData = await tokenResp.json()
        if (!tokenData.access_token) {
            console.error("Erro ao obter token:", tokenData)
            throw new Error("Falha ao autenticar com Google API")
        }

        const accessToken = tokenData.access_token

        // 5. Enviar convite para o Google Classroom
        // Docs: https://developers.google.com/classroom/reference/rest/v1/invitations/create
        const inviteResp = await fetch("https://classroom.googleapis.com/v1/invitations", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                courseId: courseId,
                userId: studentEmail,
                role: "STUDENT"
            }),
        })

        const inviteData = await inviteResp.json()

        if (!inviteResp.ok) {
            // Se erro for "já é membro" ou "convite já existe", podemos considerar sucesso ou tratar específico
            if (inviteData.error?.code === 409) {
                return new Response(
                    JSON.stringify({
                        success: true,
                        message: 'Usuário já convidado ou já é aluno.',
                        data: inviteData
                    }),
                    { headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
                )
            }

            console.error("Erro Classroom API:", inviteData)
            throw new Error(`Erro ao convidar: ${inviteData.error?.message || 'Erro desconhecido'}`)
        }

        return new Response(
            JSON.stringify({ success: true, data: inviteData }),
            { headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
        )

    } catch (error) {
        console.error(error)
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
        )
    }
})

// Função auxiliar para importar a chave PEM para CryptoKey do Web Crypto API
async function importKey(pem: string): Promise<CryptoKey> {
    // Remove headers e newlines
    const pemHeader = "-----BEGIN PRIVATE KEY-----";
    const pemFooter = "-----END PRIVATE KEY-----";

    // Limpeza básica
    let pemContents = pem;
    if (pem.includes(pemHeader)) {
        pemContents = pem.substring(
            pem.indexOf(pemHeader) + pemHeader.length,
            pem.indexOf(pemFooter)
        );
    }
    // Remove quebras de linha e espaços
    const binaryDerString = atob(pemContents.replace(/\s/g, ""));
    const binaryDer = new Uint8Array(binaryDerString.length);
    for (let i = 0; i < binaryDerString.length; i++) {
        binaryDer[i] = binaryDerString.charCodeAt(i);
    }

    return await crypto.subtle.importKey(
        "pkcs8",
        binaryDer,
        {
            name: "RSASSA-PKCS1-v1_5",
            hash: "SHA-256",
        },
        true,
        ["sign"]
    );
}
