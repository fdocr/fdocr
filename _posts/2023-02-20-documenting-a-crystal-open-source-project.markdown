---
title: "Documenting a Crystal open source project"
date: 2023-02-20 18:00:00 -0600
tags: ["Crystal", "crystal-lang", "crystal lang", "oss", "github", "open source", "documentation"]
permalink: /documenting-a-crystal-open-source-project/
---

This post is a quick overview of how Crystal lang built-in documentation features work and an easy setup to host them for free for Open Source projects.

On an unrelated note I was hoping to write this one and possibly another post last week but I caught a pretty nasty stomach bug. Better late than never 😅

## Documenting code

Crystal maintains a `crystal docs` command that processes your project's codebase and exports a website with the README & inline comments. IMO it's awesome to encourage documentation to live within the codebase itself.

There are lots of nice features that come with the website built this way, like class reference/linking (i.e. `Module::Class` mentions are automatically resolved and converted into links to the respective feature), Admonitions (i.e. support for `NOTE`, `TODO`, etc notes), Inheriting Documentation (based on class inheritance), amongst others.

Official reference for Crystal [documenting code guide](https://crystal-lang.org/reference/1.7/syntax_and_semantics/documenting_code.html).

## GitHub Actions ➡ GitHub Pages

Automating becomes possible when putting GitHub actions & pages together, something I jumped into as soon as I realized how cool it would be to always keep the docs of my projects up-to-date with the `main` branch. Here's what my `docs.yml` GitHub action looks like:

```yaml
name: Upload docs
on:
  push:
    branches: [main]
permissions:
  contents: write
jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout 🛎️
        uses: actions/checkout@v3

      - name: Install Crystal
        uses: crystal-lang/install-crystal@v1

      - name: Build docs
        run: shards && crystal docs

      - name: Deploy 🚀
        uses: JamesIves/github-pages-deploy-action@v4
        with:
          folder: docs # The folder the action should deploy.
```

The docs are generated and committed to `gh-pages` branch, so once enabled in the repo's settings (screenshot below) you'll get `https://<username>.github.io/<repo-name>` website hosted (for free). I didn't enable a custom domain, but that's pretty straightforward with some [DNS configuration](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site) if you rather have the site hosted on a subdomain of yours.

![GitHub repo pages configuration](/assets/crystal-docs-gh-pages-config.png)

## What it looks like

The landing pages will be the README, so you can go crazy with whatever structure you want there. This is what the [current README](https://github.com/fdocr/CrystalSnake#crystal-snake) of the battlesnake project looks like compared to [the hosted site](https://fdocr.github.io/CrystalSnake/).

IMO this is awesome because we can dive deeper into each model class (i.e. [BattleSnake::Context](https://fdocr.github.io/CrystalSnake/BattleSnake/Context.html)) or an existing Strategy (i.e. [Strategy::CautiousCarol](https://fdocr.github.io/CrystalSnake/Strategy/CautiousCarol.html)) from the README references or the navigation on the left side.

A small problem I noticed is that markdown tables (from README) aren't supported yet, but this is a pretty cool way to host docs for free despite of this. Incredibly useful either when the repo is a shard for others to reference or a project that you/your team work on alike.

Pura vida.