---
title: "Kubernetes integration with Rake tasks"
date: 2019-06-03 14:00:00 -0600
tags: ["Activek8s", "Docker", "Kubernetes", "cluster", "kubectl", "Ruby", "Rails", "Rake", "Tasks", "microservices"]
permalink: /kubernetes-integration-with-rake-tasks/
---

[Activek8s](https://github.com/fdoxyz/activek8s) is a gem that relies on certain conventions to provide a thorough [Kubernetes](https://kubernetes.io/) integration on a set of Rake tasks. The gem is a byproduct of a project that makes use of Kubernetes to orchestrate our services and other tools (Redis, CI/CD, logging, etc). This is not the absolute truth, it's only a solution that worked for our team and we [open sourced on GitHub](https://github.com/fdoxyz/activek8s).

## Motivation

There's a long list of reasons why Kubernetes might be the right tool for your project, and at the same time you can find a long list of reasons that argue you shouldn't jump down the rabbit hole. Depending on your project both points of view may be correct, which is why I don't intend to preach for either one.

__For all of us actively relying on Kubernetes__, we tried to find a way to integrate with it and __flatten the learning curve__ so our team can focus on solving the problems they already know how to solve, instead of diving deep in the "Kubernetes universe".

Our team works mostly on Rails, so my solution was to wrap the somewhat complex & low level [kubectl](https://kubernetes.io/docs/reference/kubectl/overview/) commands with Rake tasks. The tool is intended to rely on a few conventions while trying to maintain a high degree of customization.

## Objectives & capabilities

There are certain situations where being handy with kubectl can get you a long way, but even more critical than that, someone that isn't handy with kubectl will be absolutely helpless and unable to solve simple problems. These are the tasks Activek8s is able to perform:

  * __Deploy__ a new version of a service
  * __Rollback__ to a previous version of a service
  * __Port Forward__ a service deployed on the cluster on localhost for "direct interaction" (i.e. debugging or other reasons)
  * __Port Forward__ a set of services on localhost for an easy "direct interaction" with multiple services
  * __Port Forward__ other useful tools deployed in a cluster (i.e. a [Kibana](https://www.elastic.co/products/kibana) deployment)

__NOTE:__ In the previous feature list, the term "service" refers to any Dockerized project. The project can be coded in any language or framework, it doesn't apply only for Rails apps or even Ruby based projects, as long as you can build a working Docker image out of it you can manage them using these Rake tasks.

## How to deploy and rollback

The "in detail" documentation can be found in the [project's README](https://github.com/fdoxyz/activek8s). But a simple deploy will work with the following command

```ruby
# Will deploy using the 'production' namespace and will use the container IMAGE_TAG 'prod-50'
rake ak8s:deploy['production','prod-50']
```

Let's say this last deployment introduced a regression bug. You can manually rollback using the same `deploy` command as simple as:

```ruby
# Will deploy using the 'production' namespace and will use the container IMAGE_TAG 'prod-49'
rake ak8s:deploy['production','prod-49']
```

In our team we rely on these same Rake tasks within our CI and just like that we get __Continuous Deployments__ within our pipelines (we use [Drone CI](https://drone.io/) because of their amazing Docker support, kudos to them).

You can also delete a deployment from a cluster by running `rake k8s:delete['production','prod-49']`.

## Port Forward services

In my opinion this is the most interesting functionality in the gem. When working with SOA/microservices you have to deal with a higher complexity system, so what if you want to debug a problem within your staging or development environment?

I'll explain our most common use case with the following hypothetical diagram:

![Port Forwarding](/assets/activek8s.svg "Port Forwarding")

Imagine a `backend webapp` project that relies on two other services (`analytics` & an `elasticsearch` deployment). Communication is done via HTTP and both URLs for them are set using an `ENV` variable, nothing fancy or new here.

Inside the Kubernetes cluster, the URL might look something similar to `http://analytics.dev.svc.cluster.local:3000`. In this case, the developer can execute `rake ak8s:port_forward` and they will find a `services.env` file on their root dir with an ENV variable export file you can source with `. services.env`.

This allows their local `backend webapp` to communicate directly with the services in that development environment, just like if it were deployed alongside them in the cluster. This is done by using an `.ak8s.yml` configuration similar to the following snippet:

```yaml
dev:                      # The namespace where the serices live
  - name: webapp          # The name of all services to be port forwarded
  - name: backendwebapp
  - name: webapi
  - name: analytics
  - name: elasticsearch
```

We've found this to be a much easier way to get your toes dipped in Kubernetes land. Our team has learned about the dynamics of Pods, Services, Deployments, ConfigMaps, Secrets and lots of other more in-depth terminology at their pace.

The most important takeaway is that we haven't lost productivity along the way and they feel comfortable interacting with a Kubernetes cluster of interoperating services. All of this faster than they would've by starting out using low level tools directly.

## Activek8s Roadmap

There's plenty of important features we want to add in the project, but feedback from others is what we lack despite reaching this comfort zone. Some of them are:

  * Include a proper templating engine (like ERB or similar)
  * Improve port forward reliabilty on long lasting idle connections
  * An init task for easy setup on a new project
  * Direct rails console connection to a working pod in the cluster

Again all feedback is appreciated, feel free to browse around our [on our GitHub issues](https://github.com/fdoxyz/activek8s/issues).

## Conclusion

We might be falling into anti-pattern architecture, or even re-inventing the wheel in some way (\*cough\* Helm \*cough\*) but we've found this sweet spot that works for us.

By open sourcing it we can only hope to improve the project more than we can behind closed doors by ourselves. Hope it helps in any way possible, Pura Vida.
