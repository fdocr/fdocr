---
title: "Elastic Beanstalk Apps using Docker Containers"
date: 2019-12-25 14:00:00 -0600
tags: ["Elastic Beanstalk", "AWS", "Docker", "containers", "rails", "Ruby on Rails", "REST API", "CI/CD"]
permalink: /elastic-beanstalk-using-docker-containers/
---

This is a walkthrough of lessons learned from hosting a project on [Elastic Beanstalk](https://aws.amazon.com/elasticbeanstalk/) using [Docker Containers](https://www.docker.com/) as deployment strategy. I'll link to documentation as much as possible and avoid explaining Docker/AWS basic concepts to try keep things short.

The project was built using Ruby on Rails and consists of a REST API for mobile Apps to consume and doubles as an administrative panel. I'm **not deep diving the Ruby/Rails specifics**, but you'll find traces in the examples. **Important concepts should be applicable and transparent** for other framworks/languages.

## Tools

In my case the AWS account was managed by a client, so both AWS's CLI tools was all we had to work with: [AWS CLI](https://aws.amazon.com/cli/) & [Elastic Beanstalk CLI](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/eb-cli3.html). That's why the article will focus on these instead of the browser console interface. I'd recommend to [read about them](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/eb-cli3-configuration.html) if you've never used these before.

Ruby, Rails and NodeJS are my platform-specific tools which may differ for yours. You'll need [Docker](https://docs.docker.com/install/) too. I'll cover details about CI/CD nuances in a section later on.

## Single container vs Multi-container deployments

Like the name suggests, in [multi-container deployments](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/create_deploy_docker_ecs.html) you can run multiple containers. Think of mutliple processes running in Heroku dynos as an analogy, but each process can be defined as an independent container. You must provide a valid `Dockerrun.aws.json (v2)` to layout the containers, map their ports, volumes and other configuration: [Docs here](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/create_deploy_docker_v2config.html)

Single container deployments will only run one container, kind of like an "executable" inside your EB (Elastic Beanstalk) instances. You can also specify a `Dockerrun.aws.json (v1)` file or in this case you could avoid it because EB detects a Dockerfile in the root path of your project and EB will build and deploy a container on each deploy: [Docs here](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/single-container-docker-configuration.html)

## IAM

Your deployment will probably need access to resources which will strongly vary depending on your project. Since you're on AWS the following, to name a few, are at your disposal: S3, RDS, Elastic Cache, SQS, SNS, SES, etc.

An important mention is [ECR](https://aws.amazon.com/ecr/) (Elastic Container Registry) if you're using multi-container deployments. This is probably the easiest private registry available since you're on AWS. As long as your IAM role is configured properly you should have no issues referencing images directly to ECR repositories (declared in `Dockerrun.aws.json`)


## Containerize your Application

Do your research, that's **Tip #1**. Pretty vague I know, but I don't have the expertise required to write the *Hitchhiker's Guide to Containerizing your Application*. Here's the offical docs for [Dockerfile best practices](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/) and good luck!

Jokes aside, here's an excerpt of a sample Dockerfile:

```Dockerfile
FROM ruby:2.6.5

# Install NodeJS & Yarn
RUN apt-get update && \
    apt-get install apt-transport-https && \
    curl -sL https://deb.nodesource.com/setup_12.x | bash - && \
    apt-get purge nodejs && \
    apt-get update && \
    apt-get install nodejs -y && \
    npm install yarn -g  && \
    gem install bundler -v 2.0.2

# Workdir and add dependencies
WORKDIR /app/
ADD Gemfile Gemfile.lock /app/

# Throw errors if Gemfile has been modified since Gemfile.lock
RUN bundle config --global frozen 1

# Install dependencies
ARG RAILS_MASTER_KEY
ENV RAILS_ENV=production NODE_ENV=production RAILS_SERVE_STATIC_FILES=1
RUN bundle install --without development test

# Add the app code, precompile assets and use non-root user
ADD . /app/
RUN rake assets:precompile DISABLE_SPRING=1 && \
    chown -R nobody:nogroup /app
USER nobody
ENV HOME /app

# Make sure to explicitly bind to port & interface
CMD ["bundle", "exec", "rails s -p 3000 -b 0.0.0.0"]
```

### What's going on here?

1. Dependencies are installed in a single `RUN` command for improved layer caching
2. The container is not run using `root`
3. Dependencies (in my case specified with `Gemfile` & `Gemfile.lock`) are added first. This is known as [multi-stage builds](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/#use-multi-stage-builds)
6. Assets are precompiled (Rails specific) when building the image. If scaled horizontally this will allow all containers to have the same references to the (pre) processed assets
5. When precompiling the assets I'm doing a [workaround](https://stackoverflow.com/a/49530813/3462026) for a [pesky bug](https://github.com/harvard-lil/h2o/issues/744) related to Yarn (Rails specific again)
6. For some reason I found a problem when mapping the ports: *I wasn't hearing back from requests sent to the container*. Turns out I had to explicitly bind the port & interface. Still unsure why this happens but the binding fixed the issue

### Some other useful tips:

 - Keep in mind having a [.dockerignore](https://docs.docker.com/engine/reference/builder/#dockerignore-file) in place to avoid leaving traces of sensitive files/data in your Docker images
 - The previous example uses the `ruby 2.6.5` base image. For smaller image sizes you can go with an Alpine based starting point

## Cheat sheet

List image tags available in your ECR Repo

```bash
$ aws ecr list-images --repository-name [ECR_REPO_NAME]
```

Delete an ECR image tag

```bash
$ aws ecr batch-delete-image --repository-name [ECR_REPO_NAME] --image-ids imageTag=1
```

Configure env variables for your environment

```bash
$ eb setenv RAILS_ENV=production
```

List env variables available in your environment

```bash
$ eb printenv
```

Fetch your logs, they will be saved in `.elasticbeanstalk/logs`

```bash
$ eb logs -a
```

After setting up SSH access on your environment you'll be able to access the containers for a meticulous inspection, even in Production! I do something along the lines of:

```sh
$ eb ssh
* you are now inside an EB instance *

$ sudo docker ps
* prints out container names/IDs *

$ sudo docker stats
* prints out container stats *

$ sudo docker exec -it [CONTAINER_NAME/CONTAINER_ID] bash
* you are now inside your container *

$ rails console
* you are now inside your Production Environment *
```

## CI/CD

Your first deploy never goes smoothly, specially after adding all this Docker complexity. I can't stress this enough, **having CI/CD in place will keep you and your team sane**. 

For example, not everyone is a Docker expert to debug why/how is the `docker build` missing an argument that needs to be passed in. Also certainly no one wants to build and deploy the docker images manually everytime (beginner or expert). Make sure you have a strategy to automate these processes, **it will pay off in the long run!**

### A support image

The bloat of the test environment tools/dependencies in your production environment is unnecessary. Because of this, having a *support image* to use in your CI/CD is an option to consider. You'll need to make a concious effort to keep both images as similar as possible though.

The use of [chromedriver](https://chromedriver.chromium.org/), Selenium and test environment only dependencies (like Rspec, Capybara, etc) are the living example of this. I wrote about headless tests [in this other post](/headless-chrome-dual-mode-tests-for-ruby-on-rails/) using these same tools for Rails, and I'm using it on this exact project's CI/CD pipelines.


## Conclusions

It was fun to work on a project with this setup, despite the occasional Docker problem that feels like a [Dementor's kiss](https://www.youtube.com/watch?v=G1TEF1-i5iA&feature=youtu.be&t=70) to debug.

I understand Multi-container deployments are managed by [ECS](https://aws.amazon.com/ecs/) under the hood. In this case the `Dockerrun.aws.json (v2)` is similar/compatible with ECS task definitions. I haven't tried it yet, but this is a great opportunity to explore ECS Clusters or even [Fargate](https://aws.amazon.com/fargate/).

To finish off, **I'm not preaching for Docker deployments everywhere**. There's a lot of overhead here that might not be best suited for you or your project. Once everything's working properly though, you end up with a powerful setup backed up by Elastic Beanstalk's scalability + interoperability with other AWS services.

If you have suggestions or doubts reach out! I don't have the final word on any of this, but at least it's a starting point I wish I had when starting out. Hope this Christmas article is helpful, Happy Holidays and Pura Vida!