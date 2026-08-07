# MH Incorporadora — Link in Bio

Página de links para a bio do Instagram da MH Incorporadora. Site estático (HTML/CSS puro, sem build), pronto para publicar no GitHub Pages.

## Estrutura

```
index.html    → a página em si
favicon.svg   → ícone da aba do navegador (monograma MH)
```

## Como publicar no GitHub Pages

1. **Criar o repositório**
   - No GitHub, crie um repositório novo (pode ser público), por exemplo `mh-linkbio`.

2. **Subir os arquivos**
   No terminal, dentro desta pasta:
   ```bash
   git init
   git add .
   git commit -m "Primeira versão da página de links"
   git branch -M main
   git remote add origin https://github.com/SEU-USUARIO/mh-linkbio.git
   git push -u origin main
   ```
   (Ou, se preferir, arraste `index.html` e `favicon.svg` direto pela interface web do GitHub, em "Add file → Upload files".)

3. **Ativar o GitHub Pages**
   - Vá em **Settings → Pages** no repositório.
   - Em "Build and deployment", selecione **Deploy from a branch**.
   - Branch: `main`, pasta: `/ (root)`.
   - Salve.

4. **Acessar o link**
   - Em alguns minutos o site estará no ar em:
     `https://SEU-USUARIO.github.io/mh-linkbio/`
   - Esse é o link que vai na bio do Instagram.

## Domínio próprio (opcional)

Se a MH tiver um domínio (ex: `links.mhincorporadora.com.br`), dá para apontar um CNAME para `SEU-USUARIO.github.io` e adicionar esse domínio em Settings → Pages → Custom domain. Posso ajudar com isso quando o domínio estiver definido.

## Atualizações

Qualquer alteração de texto ou link é só editar o `index.html` (os links do WhatsApp estão dentro das tags `<a href="...">`) e subir de novo (`git add . && git commit -m "update" && git push`).
