---
title: "Learning Rails in 2017"
date: 2017-06-14 14:00:00 -0600
tags: ["ruby", "rails", "RoR", "webapp", "beginner", "tutorial", "help", "introduction"]
permalink: /learning-rails-in-2017/
---

So far this year has been surreal & hectic to say the least, and we're basically halfway through. I started a new job late last year, which I expected to be challenging for plenty of reasons. Arguably the most important one: I was going to support a large codebase built in [Ruby](http://ruby-doc.org/) (on [Rails](http://rubyonrails.org/)).

In the past, I too have sinned from [trash talking programming languages](https://www.xkcd.com/1312/) which I knew nothing about (including Ruby). __A public apology__ is written in this blog post, with tips/notes/comments from my personal experience learning this amazing technology.

## Two steps forward, never step back

Ruby and Rails are not the shiny new toys out there, not today. Before this gig, I worked for about a year with NodeJS, which I fell in love with. To be honest I didn't expect to start off fresh with a new language & framework. Especially with the direction of recent tech tides, this didn't seem like the obvious direction to follow.

Why do people/companies choose Java or .NET? Broadly because they look for a battle tested, full featured platform with __enterprise support__. Why choose NodeJS, Go, Elixir, Clojure? (you get the idea) [Because I wanna go fast](https://www.youtube.com/watch?v=riBA-FsJJmY), amongst other reasons of course. But one might argue performance is what most adopters pursue when venturing down that path. Even though they might not need blazing speeds, and more often than not they __don't absolutely require__ that performance gain.

Why Ruby and Rails then? Because [why not](http://i1.kym-cdn.com/entries/icons/facebook/000/007/786/why-not-meme.jpg), but only partially. Platform maturity, developer happiness/productivity and _open sourceness_ (if such a term makes sense) make up a great cocktail. We all want to get things done, right? I'm happy and proud to have added Ruby and Rails to my Tool Belt, which already has and will hopefully continue to help me get things done.

## Getting started

If you're looking for a step by step guide on getting started with Ruby on Rails [this is where you should go](http://guides.rubyonrails.org/getting_started.html). My perception is that, if you read and __code along with__ the Getting Started tutorial from the official guides you will understand ~50% of what Rails is all about. Another ~30% lives in all the other guides from [guides.rubyonrails.org](http://guides.rubyonrails.org).

Yes, I believe ~80% of what you need to know about Rails is available in a single website! That last ~20% is what the [Pareto Principle](https://en.wikipedia.org/wiki/Pareto_principle) is all about, you are forced to pour some hard work in to get past that threshold.

For somebody who is just getting started or is planning to, here are some concepts that gave me an "__Aha! Moment__" (involving both Ruby and Rails):

- "Not everything is plain Ruby, but __everything is an object__". It might seem obvious for experienced Ruby devs, but it probably isn't for beginners or coders experienced in old-school static typed languages. For example `1.week.ago` is [an 'extension' packaged with Rails](https://rubygems.org/gems/activesupport/) that you need to explicitly import to use outside a Rails project. And [Integers are objects themselves](http://ruby-doc.org/docs/ruby-doc-bundle/Tutorial/part_01/objects.html), which is why you were able to call functions on what a Java programmer knows as a [primitive data type](https://stackoverflow.com/a/10430634/3462026).
- You will hear about __convention over configuration__ a lot on introductory tutorials and with a bit of practice you will later interiorize most of them. Some of the ones I struggled with at first were:
  - File names (controllers, models, views, helpers, etc) are commonly snake_cased, but their implementation (class name in the code) is CamelCased. Both of them in singular, since they will represent __one object__ when used (i.e. `User.new`).
  - Model association names are declared in plural form, for example in `user.rb` you would write `has_many :books` to associate with `book.rb`. __Unless__ they are a `belongs_to` or `references` association, which makes sense because they refer to a __single record__. The book model would read `belongs_to :user`.
  - Forms & routes might seem complex, especially when nesting, like `form_for [@article, @article.comments.build]`. Personally they are still tricky, especially when I want to instantiate a link to a custom route path outside the form. For this I still do a bit of trial and error, or the old trick of [copy & paste from StackOverflow](https://twitter.com/thepracticaldev/status/705825638851149824).
  - My suggestion again would be to experiment and trace along the [getting started guide](http://guides.rubyonrails.org/getting_started.html). You won't confront the convention quirks of Rails until you _derail yourself_ a bit (pun 100% intended).
- The `yield` command is analogous to "execute the block received". This took me a few minutes of re-reading different explanations out there. When declaring a function with 2 parameters, it can actually receive 3. That extra (optional) parameter is a "callback-like" block. For example, when you iterate an array with `array.each { |i| puts i }` the underlying implementation of the array iterates over its elements and "yields" that element to the callback function you sent in. Coming from a NodeJS background, that simplified explanation using the term '_callback_' makes sense to me. Also this [StackOverflow answer](https://stackoverflow.com/a/3066939/3462026) elaborates a bit more if you're curious.

## Bookmarks

The next step after the official guides for me was to start looking for in-depth takes on certain topics. That type of knowledge only comes from experienced coders. Who has that precious knowledge we seek? Glad you asked, some of my bookmarks are (in no particular order):
- [RubyTapas](https://www.rubytapas.com/): Short screencasts with awesome insight on many different subjects. I really like the [rake episodes](http://www.virtuouscode.com/2014/04/30/learn-advanced-rake-in-7-episodes/) (kind of outside RubyTapas, but same author and overlapping subjects).
- [tenderlovemaking.com](http://tenderlovemaking.com/): What you'll find in this website cannot be unseen - "The act of making love, tenderly" ( ͡° ͜ʖ ͡°)
- [Schneems's blog](https://schneems.com/): Performance is a recurring topic in here. Regardless of the platform you code in, who doesn't have a need for speed?
- [The official docs](http://api.rubyonrails.org/): Learning a new framework means you will google "how does X works", constantly. I'm sorry to say that sometimes [API dock](https://apidock.com/rails) didn't had the best up to date info I was looking for. Still helpful though, but I tend to check `api.rubyonrails.org` results first.
- [ConFreaks](https://www.youtube.com/user/Confreaks/playlists): Entire RailsConf talks are in there from 2017, 2016 and probably previous ones as well, awesome material. [Turbolinks 5: I Can’t Believe It’s Not Native! by Sam Stephenson](https://www.youtube.com/watch?v=SWEts0rlezA) is definitely the one that struck me the most, personal favorite so far (and this is coming from an iOS dev :wink:)
- [Any talk from the late Jim Weirich](https://www.youtube.com/watch?v=0D3KfnbTdWw): That video is amazing, and so are all the other ones that I've seen so far from him. His legacy touched my life too, years after he passed. [Thanks a lot Jim](https://github.com/jimweirich/wyriki/commit/d28fac7f18aeacb00d8ad3460a0a5a901617c2d4).
- Podcasts of course: I've listened a couple of [5by5](http://5by5.tv/rubyonrails) & [RubyRogues](https://devchat.tv/ruby-rogues) episodes, interesting indeed.

I would love to hear other interesting sources I'm missing, which I'm sure there are plenty. It's also imperative to mention: At least browsing through the Readme of the gems you commonly use will decrease your '_Rails does a lot of Magic under the hood_' perception, significantly.

It's open source people, take advantage of being able to read code from some of the best coders in the business.

## Everyday Cheatsheet

Short snippets I lookup quite often because they are useful (and I'm too lazy to memorize them):

- [Rollback N migrations](https://stackoverflow.com/questions/3647685/how-to-rollback-a-specific-migration/3647820#3647820):
```ruby
rake db:rollback STEP=1
```
- [Execute custom SQL statement on Rails console](https://stackoverflow.com/questions/22752777/how-do-you-manually-execute-sql-commands-in-ruby-on-rails-using-nuodb/30474027#30474027):
```ruby
results = ActiveRecord::Base.connection.execute("foo")
```
- [STDOUT logging to file using tee](https://stackoverflow.com/a/12350076/3462026) (UNIX only I guess):
```ruby
STDOUT.reopen IO.popen "tee stdout.log", "a"
STDERR.reopen IO.popen "tee stderr.log", "a"
```
- [Docker logs STDOUT fix (flush)](https://stackoverflow.com/a/29998780/3462026):
```ruby
# From what I hear this comes with a performance penalty due to costly I/O
STDOUT.sync = true
```

## Conclusions

Every language and framework has a learning curve, no exceptions. I did felt that both Ruby and Rails are gentle for newcomers, and if you know JS/Java/Python (as plenty of CS graduates or even high school students sometimes do) you can be up and running quickly.

In my opinion __using a framework__ is the only way to __learn a framework__. Have fun coding out there with whatever floats your boat these days, Pura Vida!
