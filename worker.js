export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)
    const customHeader = request.headers.get('X-Script-Token')

    // 1. Valida o Token usando a variável de ambiente segura do Cloudflare
    if (customHeader !== env.SECRET_TOKEN) {
      return new Response("Acesso negado.", { status: 403 })
    }

    // 2. Pega o nome do script solicitado na URL
    const scriptName = url.searchParams.get('script')
    if (!scriptName) {
      return new Response("Nenhum script especificado.", { status: 400 })
    }

    const safeScriptName = scriptName.replace(/[^a-zA-Z0-9_-]/g, "")

    // 3. Busca o arquivo no GitHub usando o Token seguro do GitHub
    const githubUrl = `https://raw.githubusercontent.com/SEU_USUARIO/SEU_REPO/main/scripts/${safeScriptName}.lua`
    
    const githubResponse = await fetch(githubUrl, {
      headers: {
        "Authorization": `token ${env.GITHUB_TOKEN}`,
        "User-Agent": "Cloudflare-Worker"
      }
    })

    if (!githubResponse.ok) {
      return new Response("Script não encontrado.", { status: 404 })
    }

    const scriptContent = await githubResponse.text()

    return new Response(scriptContent, {
      headers: { 'Content-Type': 'text/plain' }
    })
  }
}
