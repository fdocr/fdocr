---
title: "Deploy a Crystal app with Docker and Opentelemetry"
date: 2023-02-14 12:00:00 -0600
tags: ["Crystal", "crystal-lang", "crystal lang", "oss", "github", "open source", "opentelemetry", "digitalocean", "docker"]
permalink: /deploy-crystal-app-with-docker-and-opentelemetry/
---

This is the continuation [of the previous post](/learning-crystal-with-battlesnake/) about a Battlesnake server. This one will talk about what the deploy process looks like and some Opentelemetry data collected from it.

## Digitalocean App Platform with Dockerfile

I've been a Digitalocean customer/user for a while now so I gave their [App Platform](https://www.digitalocean.com/products/app-platform) PaaS a try. They use buildpacks or detect a `Dockerfile` which will build and run your app, and I went with the latter (not sure if the Crystal buildpack is supported somewhow).

[Michael Nikitochkin's article](https://jtway.co/dockerfile-for-a-crystal-application-1e9db24efbc2) taught me ~95% of what I needed to come up with an efficient container deployment with a small footprint image (alpine).

```Dockerfile
# Build image
FROM crystallang/crystal:1.7.2-alpine as builder
WORKDIR /opt
# Cache dependencies
COPY ./shard.yml ./shard.lock /opt/
RUN shards install -v
# Build a binary
COPY . /opt/
RUN crystal build --static --release ./src/app.cr
# ===============
# Result image with one layer
FROM alpine:latest
WORKDIR /
COPY --from=builder /opt/app .
ENTRYPOINT ["./app", "-p", "8080"]
```

The app is deployed with every commit to `main` and cached layers are nice. The entire process takes ~2min40s on average when a docker image needs to be built (with cached dependencies) and when the deploy was triggered by a config update (i.e. ENV variable update) it takes under 2min on averge.

## Opentelemetry

To understand what's going on I added [Opentelemetry](https://github.com/jgaskins/opentelemetry) tracing with [Honeycomb.io](https://www.honeycomb.io/). Some cool stats from a few days of ranking on the leaderboards:

![honeycomb opentelemetry stats](/assets/crystal-opentelemetry-stats.png)

You can tell leaderboards run on specific hours and the server sits there without much activity about half the time. My favorite stat there is `P99` on ~3.1 milliseconds with all that logic running (from [previous post](/learning-crystal-with-battlesnake/)).

Lots of responses manage to respond in microseconds though, as seen in the runtime logs (below) and the `P50` stat on Honeycomb (above):

![microsecond response times](/assets/battlesnake-microsecond-response-times.png)

All in all pretty sweet ⚡️

More about other learnings from this project to come soon.

Pura vida.