---
title: "AKS easy as ABC"
date: 2018-09-14 14:00:00 -0600
tags: ["Docker", "Kubernetes", "Helm", "Azure", "AKS", "containers"]
permalink: /aks-easy-as-abc/
---

This is a "walkthrough cheatsheet" from my initial experimenting with AKS (Azure Kubernetes Service). Everything here can be run using Azure's [Free Account trial](https://azure.microsoft.com/en-us/free/).

This article is written from the point of view of someone completely new to both Azure Cloud and [Kubernetes](https://kubernetes.io/). I do recommend at least basic Docker knowledge and some experience with other cloud service provider(s).

I haven't been an avid Kubernetes enthusiast mostly because I never had the need to learn it's ways, until now. If interested in a Docker Swarm proof of concept article feel free to [check my previous post](/post/tying-let-s-encrypt-and-docker-swarm-together/). However, I have to admit Kubernetes and most notably AKS have been lovely to work with so far.

If you're interested in learning Kubernetes "the right way" I recommend the [Kubernetes: Up and Running](https://www.amazon.com/Kubernetes-Running-Dive-Future-Infrastructure/dp/1491935677) book. This is just a "walkthrough guide" on how to deploy a Ruby on Rails project on AKS. Swapping the Rails specific steps for a different platform should be straightforward too.

## AKS setup

Basic commands to deploy & manage a cluster with the [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli?view=azure-cli-latest)

```bash
# Authenticate the CLI
$ az login

# Create resource group:
$ az group create -n <resource-group> -l eastus

# List available Kubernetes versions
$ az aks get-versions -l eastus -o table

# Create the cluster
$ az aks create -n k8s-dev -g <resource-group> -c 1 -k 1.11.2

# Get credentials for `kubectl`
$ az aks get-credentials -n k8s-dev -g <resource-group>

# Run `kubectl` commands on the cluster
$ kubectl get nodes
$ kubectl get pods --all-namespaces

# Proxy kubernetes dashboard
$ az aks browse -n k8s-dev -g <resource-group>

# Cleanup
$ az aks delete -n k8s-dev -g <resource-group>
$ az group delete -n <resource-group>
```

## Rails 5.2+ Secrets

More info about the new secrets management in [this Engine Yard article](https://www.engineyard.com/blog/rails-encrypted-credentials-on-rails-5.2)

```bash
# Edit rails secrets & make sure `config/master.key` is not in version control
# i.e. add to `.gitignore`
$ rails credentials:edit

# Add the master key as a secret to k8s
$ kubectl create secret generic rails-master-key --from-literal=rails-master-key=<secret>

# Add the ConfigMap that contains non sensitive variables
# (see the following sample ConfigMap YAML file)
$ kubectl create -f <configmap.yml>
```

#### Sample ConfigMap YAML definition

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: rails-app-config
  namespace: default
data:
  RAILS_ENV: production
```

## ACR (Azure Container Registry)

```bash
# Create a Container Registry
$ az acr -n <container-registry-name> -g <resource-group> --sku Basic

# List the URL prefix to tag the Docker images
$ az acr list -g <resource-group> --query "[].{acrLoginServer:loginServer}" --output table

# Login to the Container Registry
$ az acr login -n <container-registry-name>
```

## ACR access to AKS

Execute the following script (with valid variables) to give AKS the permission to pull images from ACR

```bash
#!/bin/bash

AKS_RESOURCE_GROUP=<aks-resource-group>
AKS_CLUSTER_NAME=<cluster-name>
ACR_RESOURCE_GROUP=<acr-resource-group>
ACR_NAME=<registry-name>

# Get the id of the service principal configured for AKS
CLIENT_ID=$(az aks show --resource-group $AKS_RESOURCE_GROUP --name $AKS_CLUSTER_NAME --query "servicePrincipalProfile.clientId" --output tsv)

# Get the ACR registry resource id
ACR_ID=$(az acr show --name $ACR_NAME --resource-group $ACR_RESOURCE_GROUP --query "id" --output tsv)

# Create role assignment
az role assignment create --assignee $CLIENT_ID --role Reader --scope $ACR_ID
```

## Deployment

Sample deployment YAML

```yaml
# deployment.yml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: rails-app
  labels:
    app: rails-app
spec:
  replicas: 2
  selector:
    matchLabels:
      app: rails-app
  strategy:
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 1
  template:
    metadata:
      labels:
        app: rails-app
    spec:
      containers:
      - image: <registry-url>/rails-app:v2
        imagePullPolicy: Always
        name: rails
        ports:
        - containerPort: 3000
        env:
          - name: RAILS_ENV
            valueFrom:
              configMapKeyRef:
                name: rails-app-config
                key: RAILS_ENV
      dnsPolicy: ClusterFirst
      restartPolicy: Always
      volumes:
      - name: secrets
        secret:
          secretName: rails-master-key
          items:
          - key: rails-master-key
            path: config/master.key

```

Then deploy to the AKS cluster

```bash
# Create the deployment
$ kubectl create -f deployment.yml

# Expose using a LoadBalancer
$ kubectl expose deployment rails-app --type=LoadBalancer --port=80 --target-port=3000

# Wait for the Load Balancer's public IP Address to be assigned
$ kubectl get svc -w
```

## Deploy supporting services using Helm

Local development with RabbitMQ made easy:

```bash
# This is the Bitnami Docker image
# We're using the default username `user` with a custom password
$ docker run -it --rm -e "RABBITMQ_PASSWORD=pass123" --name rabbitmq -p 15672:15672 -p 5672:5672 bitnami/rabbitmq:latest
```

The RabbitMQ UI website will be available on `localhost` with port `15672`. For Ruby development using the Bunny gem to connect to the running RabbitMQ container you can use the following conneciton string:

```
# Sample connection string when working locally.
# Production grade code should probably connect to ENV variable or encrypted secret.
connection = Bunny.new("amqp://user:pass123@localhost:5672?automatically_recover=false")
```

To install RabbitMQ on AKS

```bash
$ helm init
$ helm install stable/rabbitmq --name=rabbitmq-dev --set rabbitmq.username=guest --set rabbitmq.password=guest
```

# Conclusions

It's very worth noting a [kubectl Cheat Sheet](https://kubernetes.io/docs/reference/kubectl/cheatsheet/) on the official Kubernetes website, for bookmarking purposes.

This article hopefully exposed an easy way to get services running on AKS and have them available to the internet. However, there's plenty of configuration left to be setup before calling it a production grade cluster.

I'm now familiarizing myself with the ins and outs of ingress controllers and [RBAC](https://kubernetes.io/docs/reference/access-authn-authz/rbac/). Hopefully I'll write a future article about those too. Until then, Pura Vida.
