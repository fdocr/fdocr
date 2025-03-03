---
title: "Customizing Jekyll Themes"
date: 2019-12-12 22:00:00 -0600
tags: ["Jekyll", "GitHub Pages", "CSS", "Blog", "Minima"]
permalink: /customizing-jekyll-themes/
---

After migrating my website/blog to [Jekyll on GitHub pages](/github-pages-and-jekyll/) I was left with this lingering feeling: The theme I was using felt too "stock/off-the-shelf" even after a few color tweaks. I gave customizing the theme a try instead of coding it from scratch and learned a thing or two along the way.

## Minima

[Minima](https://github.com/jekyll/minima) comes as the default theme for [GitHub pages](https://jekyllrb.com/docs/github-pages/). I like the clean look it has and it works pretty good on different devices, so I kept it despite trying out other popular themes out there.

Adapting the default colors was straightforward using CSS. Other more specific changes I wanted to implement required a little more research though.

## Jekyll Basic Components

I learned about some of the building blocks of static sites built with Jekyll (besides the obvious markdown and CSS files)

- **Pages** are declared in the root directory and represent a static page in the resulting site. Some examples are `index.md`, `about.md`, `404.html`, etc.
- **Layouts** represent the structure of your pages (or posts) and each page (or post) defines the layout to be used in [Front Matter](https://jekyllrb.com/docs/front-matter/). This allows you to have your posts with the same structure by using the `layout: post`, also static pages like `about.md` and others can use the `layout: page`, etc.
- **Includes** are just like reusable partials. For example a footer that's reused on every page, usually referenced from a **layout**.

## Where's everything? Probably GitHub

In short, *if it's not in your project's directory go check the theme and see if it's defined over there*. Some examples of this idea in practice:

- Let's say you go inside `about.md` and see it's set to render using the `layout: home`. How do I figure out the variables I have at my disposal?
    - [Go check the source](https://github.com/jekyll/minima/blob/master/_layouts/home.html) and you'll see the variables you can customize (add them in `_config.yml`).
- How do I go about changing, for example, the footer of my site?
    - Again, [check out the code](https://github.com/jekyll/minima/blob/master/_includes/footer.html) of the original footer on the theme's repo and redefine `_includes/footer.html` with it. You're now free to edit as much or as little as you need.

The repo's [README](https://github.com/jekyll/minima/blob/v2.5.0/README.md) has a thorough walkthrough on [customization](https://github.com/jekyll/minima/blob/v2.5.0/README.md#customization).

## Conclusions

While working on my site I was constantly browsing through the Minima GitHub repo, you can do the same regardless of your theme of choice.

Talented people worked on themes that are both aesthetically pleasing and functional (responsive). Why not just add a little spice on top of that great foundation instead of half writing something from scratch?

[blog.fdo.cr](https://blog.fdo.cr/) is the result of my attempt to switch it up a bit. It will forever be a work in progress, but I'll focus more on the content rather than the site itself for a while now. Pura vida!
