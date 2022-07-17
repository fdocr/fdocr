---
title: "Browsing a localhost server from any device in your LAN"
date: 2020-03-02 9:00:00 -0600
tags: ["beginners", "webdev", "mobile"]
permalink: /browsing-a-localhost-server-from-any-device-on-your-lan/
---

For most of us, a local development server proves to be good enough to get our day to day coding done. Even mobile device displays can be tested quite well on Chrome (or other browsers) using built-in developer tools. There are times though, where using a real device is better or even necessary. 

This post shares an example on how to use any device on your LAN to access a local development server.

## Using a Local IP Address

The first thing you need is [your local IP address](http://letmegooglethat.com/?q=whats+my+local+ip+address). Access to  your local server should be transparent from any browser within your LAN by just using that IP address. 

There are certain circumstances that make this somewhat trickier:
 - Third party integrations (i.e. Social logins)
 - Certain environments don't play nice with plain IP addresses and prefer domain names
    - I've found the iOS ecosystem to be one of these "tricky ones" sometimes

[xip.io](http://xip.io/) is a service that I continue to reach out for when I can't make plain Local IP addresses work. For example if your laptop has `192.168.0.100` for its Local IP Address, you should be able to reach it from any device in your LAN by browsing `192.168.0.100.xip.io`.

## An example using [DEV](https://github.com/thepracticaldev/dev.to)

Assuming you've setup your local environment, the steps are pretty simple to start playing with it on your LAN or Wi-Fi network. *Note that the same concepts apply for other frameworks/languages.*

**1)** Add your URL as a valid callback on your OAuth integrations (i.e. Twitter sign-in)

![dev.twitter.com app details](https://dev-to-uploads.s3.amazonaws.com/i/j6z4s68f3lr2i1fhahqs.png)

**2)** `bin/startup` is how we typically start working locally. OAuth integrations require callbacks to be made and your server needs to be aware of the domain to use. 

On our example add the `APP_DOMAIN` ENV variable on startup: 
```bash
APP_DOMAIN="192.168.0.100.xip.io:3000" bin/startup
```

**3)** Browse for `http://192.168.0.100.xip.io:3000` on a mobile device in your LAN and start testing your site 🤩

## Troubleshooting

Is your server not responding to incoming requests? Is it "up and running" with local requests working as expected but requests from other devices on the network show a "This site can't be reached" or `ERR_CONNECTION_FAILED`?

Your server might be listening to the `127.0.0.1` interface, which is a common problem I've come across before. The solution here is to explicitly bind to the interface you need. Binding to `0.0.0.0` is an easy fix.

## Conclusions

This has proven helpful for me when working with mobile apps that connect to a local server. It's also neat to know you can try out your experiments on real devices without having to host your project somewhere.

Networking isn't always straightforward. [I had a great suggestion on dev.to comment section about ngrok](https://dev.to/fdocr/browsing-a-localhost-server-from-any-device-in-your-lan-14md/comments). Pura Vida!