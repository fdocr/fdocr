---
title: "Everybody hates CSRF"
date: 2020-09-08 9:00:00 -0600
tags: ["csrf", "security", "Ruby on Rails", "OAuth"]
permalink: /everybody-hates-csrf/
---

The title of this post is a reference to the [Everybody hates Chris](https://www.imdb.com/title/tt0460637/) TV show, which felt punny and suitable as I ran into some interesting problems in the last few weeks having to do with CSRF.

What happens when everybody hates CSRF? __They put a safety check for it__.

When I say "everybody" I'm talking about the maintainers of frameworks/libraries. They don't want CSRF vulnerabilities in their software and none of us want our dependencies to have any either.

I believe this is the story of one odd exception to that default configuration though.

## Cross Site Request Forgery (CSRF)

There's a bunch of great resources out there that explain what CSRF is and the security measures required to mitigate it.

- [CORS, XSS and CSRF with examples in 10 minutes](https://dev.to/maleta/cors-xss-and-csrf-with-examples-in-10-minutes-35k3)
- [Defense Against the Dark Arts: CSRF Attacks](https://dev.to/rtfeldman/defense-against-the-dark-arts-csrf-attacks)

## OAuth Provider Authentication in Rails

The CSRF problem I'm going to talk about is for OAuth Provider Authentication. The specific references I'll explain and link to are Rails libraries/gems, but the concepts should apply similarly across different languages/frameworks.

The process is _mostly_ standardized. When implementing a 3rd party OAuth service you redirect your users to their website and they will make a callback request to your site with a success/failure result.

![OAuth request diagram](https://dev-to-uploads.s3.amazonaws.com/i/9hwzesych9c3abbk31c4.png)

The reason I'm using Twitter and Apple as the examples above is because Sign in with Apple (SIWA for short) does things a bit different, like performing the callback redirect with a POST instead of GET request.

A great article that goes in detail about the intricacies that make supporting SIWA tricky is the following (explains lots of the same concepts I'm covering in this post):

["Sign in with Apple" implementation hurdles](https://dev.to/adamcoster/sign-in-with-apple-implementation-hurdles-761)

For our particular case (Rails) we can say the problem with it is that [Rails goes the extra mile with CSRF on POST requests](https://guides.rubyonrails.org/security.html#csrf-countermeasures). But also a few gems in the stack include checks of their own for CSRF that need to be explicitly disabled.

## Rails CSRF countermeasures

Here's a simplified diagram of the stack in use:

![Forem OAuth dependency stack diagram](https://dev-to-uploads.s3.amazonaws.com/i/u6ioge5yenxvuy7za3nr.png)

Since __everybody hates CSRF__ almost all of them __add their own validations__:

1. Action Pack checks the ORIGIN header of POST requests so they are required to match the website's own domain, i.e. `request.base_url` ([source here](https://github.com/rails/rails/blob/master/actionpack/lib/action_controller/metal/request_forgery_protection.rb#L453-L463))
1. Omniauth-OAuth checks for a `state` value sent in with the request that _should_ be available within the session when the callback is performed ([source here](https://github.com/omniauth/omniauth-oauth2/blob/master/lib/omniauth/strategies/oauth2.rb#L88-L89))
1. omniauth-apple validates a `nonce` set in the session that needs to be available ([source here](https://github.com/nhosoya/omniauth-apple/blob/master/lib/omniauth/strategies/apple.rb#L83-L88))

## Making it work

When Apple makes their request back to our website we have to bypass `protect_from_forgery` on that specific callback, otherwise Action Pack will raise a CSRF exception because the HTTP ORIGIN header won't match (it will arrive as `https://appleid.apple.com`). 

A good way to do this would be to bypass this check only on the callback request path and also only for the `https://appleid.apple.com` ORIGIN. I've referred to this with the analogy: _Leaving your front door open for anyone vs only giving Apple the keys to unlock the door_.

The problem with the two other checks is that the validations are checked against values in the `session`. Sessions are managed by cookies and without the cookies those values won't be available. Why is this an issue?

## SameSite=None Cookies

We've run into some issues where the cookie that manages our session isn't available, therefore breaking checks __2__ & __3__ mentioned above. If interested, [this issue](https://github.com/nhosoya/omniauth-apple/issues/54) has the most in-detail conversation on that problem specific to our case.

We don't want to compromise our Cookies to have `SameSite=None` enabled, so we're currently testing to make sure that `SameSite=Lax` work good enough in production environments.

This is a great read on [SameSite cookies explained](https://web.dev/samesite-cookies-explained/#what-are-first-party-and-third-party-cookies) that dives deep in the topic. Here's one of the diagrams they use to explain the concept and how browsers are shifting away from defaulting to `SameSite=None`

![SameSite cookie diagram](https://dev-to-uploads.s3.amazonaws.com/i/85opzzm2vta01pw1ztvt.png)

## What does this mean for SIWA? Is it still safe after disabling all these security checks?

I believe so, because the payload arrives in a [JSON Web Token (JWT)](https://jwt.io/). This JWT is signed using a private key that needs to be setup in the Apple Developer Portal which is available only to your backend (source [here](https://github.com/nhosoya/omniauth-apple/blob/master/lib/omniauth/strategies/apple.rb#L125-L136) and [here](https://github.com/nhosoya/omniauth-apple/blob/master/lib/omniauth/strategies/apple.rb#L59-L75)). 

This payload comes in the POST request so it should be secure and trustworthy. In this case, the fact that there are multiple checks spread throughout the stack make it counterintuitive. I mean, all those checks are there for a reason, right? It's a good default to have but tricky to deal with in some cases.

What do you think? Is it safe to bypass all these checks? Has anyone had a similar problem using other frameworks?