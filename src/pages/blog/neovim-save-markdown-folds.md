---
layout: ../../layouts/PostLayout.astro
title: 'Neovim: Save folds in markdown files'
pubDate: 2026-02-06
description: 'How to save folds in markdown files in neovim using Lua and autocommands.'
---
<section>

  # Neovim: Save folds in markdown files

  <details>
    <summary><h3>TL;DR</h3></summary>

  > This is a short little TIL with Neovim
  >
  > I wanted to have the lines I collapse in markdown files stay collapsed after closing the file.
  >
  > Most of the solution was in this [StackExchange answer](https://vi.stackexchange.com/a/44114).
  >
  > I then make some tweaks for my personal use case:
  ```lua
  -- ~/.config/nvim/ftplugin/markdown.lua
  vim.opt_local.foldmethod = 'manual'

  local folds_augroup = vim.api.nvim_create_augroup('Folds', { clear = true })

  vim.api.nvim_create_autocmd(
    {'BufWritePost', 'QuitPre'},
    { group = folds_augroup, command = 'mkview' })

  vim.api.nvim_create_autocmd(
    'BufWinEnter',
    { group = folds_augroup, command = 'silent! loadview | normal! zM' })
  ```
  </details>

  I'm entering this new era of life where the stuff I like to use needs to be as open to tinkering as possible.

  I gush about having a blog so much because it brings into my life a little personal thing that I can tinker and play with exactly how *I* want.

  With each point of contact, I can encounter a new situation that isn't quite how I want it, then pop open the hood and tune it to my exact specification.

  No payment or subscription, no new contract to sign, no personal information sent to some ad service.

  That's also why [Neovim](https://neovim.io/) is so cool.

  I'll go into Neovim in more detail at some other time, today I wanted to write about yet another moment where I deepened my understanding of my tool and made it more perfect for me.
</section>

<section>

  ## About Neovim

  Neovim (and vim) is a modal editor.

  This means, unlike text editors like VSCode and Google docs, you can't just start typing away as soon as the page is open to you.

  With Neovim, you start off in "Normal" mode. How I understand it, here what you type serves to run commands on the editor itself.

  For example, typing `:vs` will split your window in 2 vertically. <label for="quitting" class="margin-toggle">&#8853;</label>
  <input type="checkbox" id="quitting" class="margin-toggle"/>
  <span class="marginnote">
    Obligatory
    <br>
    `:q!` will exit vim without saving.
    <br>
    `:xa` will save all and exit vim.
  </span>

  Pressing `i` will then enter `Insert` mode where you can type like normal. `Esc` will then bring you back to `Normal` mode where you could for example delete a whole paragraph and paste it at the top. <label for="arcane-spell" class="margin-toggle">&#8853;</label>
  <input type="checkbox" id="arcane-spell" class="margin-toggle"/>
  <span class="marginnote">
    Delete paragraph and paste it at the top: `dapggP`
    <br>
    - `dap`: `d`elete `a`around `p`aragraph
    <br>
    - `gg`: `g`o to `g`top (okay it doesn't always fit)
    <br>
    - `P`: `P`aste above (versus lowercase `p` for paste below)
  </span>

  It's pretty arcane and when I started out it was a pain, but the nerdy coolness hacker vibes kept me going. You may have noticed so far we haven't had to click anywhere. Well Neovim is pretty mouse free.

  Now is this actually more efficient?

  Personally it felt so, and it's fun solving these mini puzzles when you wanna do something in as few keystrokes as possible. The best vimmers are likely faster than someone doing the same thing with a mouse and multiple cursors. But even that depends.

  Whatever you use, if you take the time to know it, you'll likely end up as fast as anything else.

  One last command: `zf36j`
  - `z` fold (doesn't match but see how a "z" kinds looks like a fold? hehe)
  - `f` create (z is already fold so this could have been `ff` or `zz` for example)
  - `36j` 36 lines down

  This will collapse the next 36 lines (plus the one you're on) into one line. Folding it neatly away.

  I don't use it often, but it's practical in markdown files where I write notes.

  The problem is these folds aren't automatically saved so when you quit vim and come back, everything is expanded again.

  Lets change that.
</section>

<section>

  ## Feature Spec

  What I want is to automatically save and restore the folds I make but only in "markdown" files.

  This is all possible in Neovim's configuration which thankfully uses a full programming language instead of JSON or something worse like YAML. <label for="yaml-hater" class="margin-toggle">&#8853;</label>
<input type="checkbox" id="yaml-hater" class="margin-toggle"/>
<span class="marginnote">
  Yes, that's right. I have no love in me for [yaml](https://www.ohyaml.wtf/).
</span>

  With Neovim your config can be written in [Lua](https://www.lua.org/manual/5.1/).

  Which, despite having array indices that start at 1, is a very nice language I've grown to appreciate.

  [Neovim's API](https://neovim.io/doc/user/api.html) is fully accessible through Lua and so you can have it do almost whatever you want.

  ### Autocommands

  <div class="epigraph">
    <blockquote>
      <p>You can specify commands to be executed automatically when reading or writing a file, when entering or leaving a buffer or window, and when exiting Vim.</p>
      <footer><a href="https://neovim.io/doc/user/autocmd.html">Autocmd - Neovim Docs</a></footer>
    </blockquote>
  </div>

  This is what we want, when I'm in a markdown file, automatically save and restore folds.

  Now I didn't know how to do this exactly so big thanks to Vivian De Smedt for the [StackExchange answer](https://vi.stackexchange.com/a/44114) copied (as is tradition) below:

  ```lua
  -- First a group to keep related auto commands together
  local folds_augroup = vim.api.nvim_create_augroup("Folds", { clear=true })

  -- "BufWritePost": after saving the file
  vim.api.nvim_create_autocmd("BufWritePost", {
      -- include this auto command in the group
      group = folds_augroup,
      -- "mkview" save the folds
      -- "filetype detect" have vim detect the kind of file we're in
      -- "set foldmethod=manual" set the kind of folding used in this
      --    file as manual instead of auto on indent
      command = "mkview | filetype detect | set foldmethod=manual"
  })

  -- "QuitPre": just before quitting vim
  vim.api.nvim_create_autocmd("QuitPre", {
      group = folds_augroup,
      command = "mkview | filetype detect | set foldmethod=manual"
  })

  -- "BufWinEnter": when entering a window
  vim.api.nvim_create_autocmd("BufWinEnter", {
      group = folds_augroup,
      -- "silent! loadview" load the folds without announcing anything
      -- same as above
      -- "normal! zM" in Normal mode, execute `zM`
      --    which closes all the folds just loaded
      command = "silent! loadview | filetype detect | set foldmethod=manual | normal! zM"
  })
  ```

  Pasting this into my config and saving then worked as advertised!

  I can fold up my files just how I want and when I come back, so do they.

  But that isn't exactly what I want, and if I just copy paste, what would I learn?
</section>

<section>

  ## Into the wild

  First off I want this only in markdown files, and I want to use the Neovim API as much as possible.
  Another cool thing I discovered, if you're making some plugin exclusively for a particular filetype, Neovim has a special folder for them: [ftplugin](https://neovim.io/doc/user/usr_43.html#filetype-plugin)

  You can have it at either of
  * `.config/nvim/ftplugin/markdown.lua`
  * `.config/nvim/after/ftplugin/markdown.lua`
    * if you want your plugin to run last

  ```lua
  -- I only want manual folding, omit this if you prefer
  -- Being in the markdown ftplugin, I set it locally to the current window
  vim.opt_local.foldmethod = 'manual'

  local folds_augroup = vim.api.nvim_create_augroup('Folds', { clear = true })

  -- you can give an auto command multiple events
  vim.api.nvim_create_autocmd({'BufWritePost', 'QuitPre'}, {
    group = folds_augroup,
    command = 'mkview',
  })

  vim.api.nvim_create_autocmd('BufWinEnter', {
    group = folds_augroup,
    command = 'silent! loadview | normal! zM',
  })
  ```
</section>

<section>

  ## Conclusion

  And with that my editor is even more perfect. <label for="meta-curse" class="margin-toggle">&#8853;</label>
  <input type="checkbox" id="meta-curse" class="margin-toggle"/>
  <span class="marginnote">
    And the [Meta Blog Post Curse](/blog/maxmntl-the-making-of) is lifted!!!!
  </span>

  Tweaked to perfection. The fact that this is even possible to this degree is reason enough to love Neovim.

  If you wanted to try something similar I hope it helped you out and I hope you're a bit more interested in Neovim and other tools that give you back control.

  ### Resources

  * [`nvim_create_autocmd` - Neovim Docs](https://neovim.io/doc/user/api.html#nvim_create_autocmd())
  * [Fold - Neovim Docs](https://neovim.io/doc/user/fold.html)
  * [ftplugins - Neovim Docs](https://neovim.io/doc/user/usr_43.html#filetype-plugin)
  * [My Neovim config - Github](https://github.com/MaxMonteil/dotfiles/tree/master/nvim)
</section>
