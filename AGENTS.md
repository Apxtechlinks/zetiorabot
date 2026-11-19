<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Independent deployment
- Deploy the app with Nitro's node-server preset and run `.output/server/index.mjs`; keep the existing TanStack bootstrap so Railway runs the same application.
- Deploy `whatsapp-worker` as a separate persistent service with its own Dockerfile and session volume; WhatsApp needs an always-on connection independent of app restarts.
- Configure external hosting through environment variables pointing to an independently owned backend; generated clients remain unchanged and privileged keys stay server-only.
