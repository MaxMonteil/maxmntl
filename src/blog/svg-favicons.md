---
title: 'SVG Favicons?!'
pubDate: 2026-01-18
description: 'TIL favicons can be SVGs and dynamically styled!'
---
# SVG Favicons?!

<section>

In the process of making this site I naturally needed a proper favicon.

So I first went to delete the default one from the Astro generated site and noticed that it was an SVG file. Up till this point I had only ever encountered good old `.ico` files (which I only saw elsewhere with windows desktop icons.)
<label for="favicon-tangent" class="margin-toggle">&#8853;</label>
<input type="checkbox" id="favicon-tangent" class="margin-toggle"/>
<span class="marginnote">
  As a tangent, favicons are one of these things I know about but rarely ever touch, and once you dig a bit, turns out <a href="http://johnsalvatier.org/blog/2017/reality-has-a-surprising-amount-of-detail">favicons have a surprising amount of detail</a> with different sizes, browser support, situational formats, and more.
</span>
</section>

<section>

## Astro's default favicon

I open up the file and find yet another surprise, you can [insert stylesheets directly into SVGs](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/style)!

In hindsight that seems obvious because SVGs already look so "HTML-like". In the case of the default Astro favicon (and now mine hehe) you can add some styling to dynamically change the favicon based on color scheme.

```html
<svg
  xmlns="http://www.w3.org/2000/svg"
  fill="none"
  viewBox="0 0 128 128"
>
  <rect width="128" height="128" rx="16"/>
  <path d="..."/>
  <path fill-opacity=".7" d="..."/>
  <style>
    rect { fill: #fffff8; }
    path { fill: #111; }
    @media (prefers-color-scheme: dark) {
      rect { fill: #151515; }
      path { fill: #ddd; }
    }
  </style>
</svg>
```

I didn't look much deeper but I wonder if you get full CSS access in there, you could animate it to start, but with how capable CSS has become, I'm sure there are some crazy things that could be done.

### Including your SVG favicon

To then include it, just make sure to have the correct `type` attribute in the link tag:

```html
<link
  rel="icon"
  type="image/svg+xml"
  href="/favicon.svg"
/>
```
</section>

<section>

## **Bonus**: Fonts can also be SVGs

Is there anything they can't do?
<label for="svg-power-tangent" class="margin-toggle">&#8853;</label>
<input type="checkbox" id="svg-power-tangent" class="margin-toggle"/>
<span class="marginnote">
  I read somewhere that SVGs can in fact do pretty much anything. You can include JS, fetch data and then animate some data visualization directly in there. You can propably run DOOM in an SVG.
</span>

Now if SVG is a good format for fonts, I can't say. There's likely the usual benefits of SVGs being vectors and thus looking sharp at any size, but maybe the file size is worse? Latest recommended font format (for web at least) is WOFF 2: The Reckoning.

Regardless, after finding out you can style SVGs, and being super happy with [Tufte CSS](https://edwardtufte.github.io/tufte-css/), I wanted to mimick that.

Classy favicon with "mm", so to Figma I go.

### Roadblock 1

I have the font I want ([ET Book](https://github.com/edwardtufte/tufte-css/tree/gh-pages/et-book)) but can't use it in Figma unless I install the app or use their font installer which I don't want to do.

Luckily, I can open the SVG font in my editor<label for="sn-nvim" class="margin-toggle sidenote-number"></label> <input type="checkbox" id="sn-nvim" class="margin-toggle"/><span class="sidenote">I use Neovim btw</span> and find what I'm looking for at `glyph unicode="m"`, perfect.

### Roadblock 2

I've got the glyph line but I can't paste that into Figma, so I try to jam it into an SVG:

```html
<!-- before -->
<glyph
  unicode="m"
  horiz-adv-x="1662"
  d="M35 8q-3 8"
/>

<!-- after -->
<svg xmlns="http://www.w3.org/2000/svg">
  <path fill="#000" d="M35 8q-3 8" />
</svg>
```

Is this valid? Probably not.

But I could now paste it into Figma, though it was upside down and flipped vertically, likely from the missing `viewBox`, but that's an easy fix.

So I make my Favicon, pass it through the eternally amazing [SVGOMG](https://svgomg.net/), slap it onto my site and badabing badaboom *SSStylish!*<label for="theme-toggle-tangent" class="margin-toggle">&#8853;</label>
<input type="checkbox" id="theme-toggle-tangent" class="margin-toggle"/>
<span class="marginnote">
  I should add a light/dark theme toggle...
  <br>
  *Edit: I added one! And it wiggles!!*
</span>
</section>
