---
title: "Documenting a Crystal open source project"
date: 2023-02-20 18:00:00 -0600
tags: ["Crystal", "crystal-lang", "crystal lang", "oss", "github", "open source", "documentation"]
permalink: /documenting-a-crystal-open-source-project/
---

This post is a quick overview of how Crystal lang built-in documentation features work and an easy setup to host them for free for Open Source projects. A compilation of things I've seen across Crystal repos and applied on mine.

## Documenting code

Crystal maintains a `crystal docs` command that processes your project's codebase and exports a website with the README & inline comments. IMO it's awesome to encourage documentation to live within the codebase itself.

The generated site will reference/link files (i.e. `Module::Class` mentions are automatically resolved and converted into links to the respective feature), Admonitions (i.e. support for `NOTE`, `TODO`, etc notes), Inheriting Documentation (based on class inheritance), amongst others.

[Official Crystal documenting code guide](https://crystal-lang.org/reference/1.7/syntax_and_semantics/documenting_code.html)

## GitHub Actions ➡ GitHub Pages

Automating becomes possible when putting GitHub actions & pages together, something I jumped into as soon as I realized it would be cool to ensure the docs are always up-to-date with the `main` branch. Here's what my `docs.yml` GitHub action looks like:

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

The docs are generated and committed to `gh-pages` branch, so once enabled in the repo's settings (screenshot below) you'll get `https://<username>.github.io/<repo-name>` website hosted (for free).

I didn't enable a custom domain because I'm okay with GitHub's subdomain, but that should be able to work out with the proper [DNS configuration (tutorial)](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site) if you rather have the site hosted on a subdomain of yours.

![GitHub repo pages configuration](/assets/crystal-docs-gh-pages-config.png)

## What it looks like

The landing pages will be the README, and you can structure that however you prefer. This is what the [current README](https://github.com/fdocr/CrystalSnake#crystal-snake) of the battlesnake project looks like compared to [the hosted site](https://fdocr.github.io/CrystalSnake/).

It's great to be able to dive deeper into each model class (i.e. [BattleSnake::Context](https://fdocr.github.io/CrystalSnake/BattleSnake/Context.html)) or an existing Strategy (i.e. [Strategy::CautiousCarol](https://fdocr.github.io/CrystalSnake/Strategy/CautiousCarol.html)) from the README references or the navigation on the left side.

A small problem I noticed is that markdown tables (from README) aren't supported yet. I still find this documentation hosting awesome for either when the repo is a shard (for others to reference), or when you/team need to keep up docs (context) for reference on the project down the road.

Pura vida.