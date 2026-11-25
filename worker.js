export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)
    
    // Aceita tanto pelo Header quanto pelo parâmetro ?token= na URL
    const tokenHeader = request.headers.get('X-Script-Token')
    const tokenUrl = url.searchParams.get('token')
    const tokenRecebido = tokenHeader || tokenUrl

    if (!env.SECRET_TOKEN || tokenRecebido !== env.SECRET_TOKEN) {
      return new Response("Acesso negado.", { status: 403 })
    }

    const scriptName = url.searchParams.get('script')
    if (!scriptName) {
      return new Response("Nenhum script especificado.", { status: 400 })
    }

    const safeScriptName = scriptName.replace(/[^a-zA-Z0-9_-]/g, "")
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
