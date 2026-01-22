---
layout: ../../layouts/PostLayout.astro
title: 'Neovim from scratch 2026'
pubDate: 2026-01-xx
description: ''
---
# Neovim from scratch 2026
I didn't set out to update my Neovim config.

For the last 2-3 years I had been happily coding with Neovim 0.8, Conqueror of Completion, and a much older init.vim.
Things were fine, great even, it wasn't broke.

But then I nonchalantly updated all my plugins and that broke syntax highlighting.
I thought I could change it simply, that broke more things. My config at that point had crystalized into pure Legacium and I didn't know how anything worked.

On the other hand, I'd been keeping an eye on the recent Neovim advances and Lua seemed cool. Should be a quick project.
It took me 5 days.

It was the holidays and I barely had 1 hour in a row to work on this with family events going on but still. 5 days. Lots of pain.

## Structure
- Josean Martinez
    - [How I Setup Neovim to make it amazing in 2024](https://www.youtube.com/watch?v=6pAG3BHurdM)
    - I skipped around a lot in this video and didn't notice it was an older Neovim version
    - I'd expect a more up to date version at some point

## LSP
This was a huge pain to setup.

At first I went full plugin mode with nvim-lspconfig, mason & mason lsp-something. It worked enough for TreeSitter but that was more from Mason properly installing LSP servers.
Completion was so messed up, only accepted the buffer as a source, I had tried with `mini.completion` then a massive setup with `nvim-cmp` before scrapping the whole thing and restarting.

### nvim-lspconfig
The LSP docs seem to say that `neovim/nvim-lspconfig` is optional but a couple of my configs (eslint, tailwindcss) did depend on utilities from the plugin.
It was simple enough to copy them back in but I imagine this would become deprecated behavior.

### Resources that helped
- [lugh.ch - Switching to Neovim Native LSP](https://lugh.ch/switching-to-neovim-native-lsp.html)
    - [Gregory Anders - What's New in Neovim 0.11](https://gpanders.com/blog/whats-new-in-neovim-0-11)
- [Neovim Docs - LSP](https://neovim.io/doc/user/lsp.html)
- Programming in Lua 2nd Edition
    - I struggled so much with LSP that I had to take a genuine effort to actually learn some Lua
- Josean Martinez
    - Big shoutout, helped me with the folder structure and starting point for LSP
    - [How to Setup Neovim LSP](https://www.youtube.com/watch?v=oBiBEx7L000)

## Syntax Highlighting
I wanted to use the snazzy new built-in setup but couldn't find enough resources to help me out.
I set this up before LSP so at that point I still thought I could finish this without having to put in too much effort.

## Plugins
### mini.nvim
`mini.nvim` is pretty great, ended up using more plugins from it than I expected.

- [mini.nvim](https://nvim-mini.org/mini.nvim)
