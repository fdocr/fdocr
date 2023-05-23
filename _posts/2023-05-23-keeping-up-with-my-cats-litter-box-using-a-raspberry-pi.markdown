---
title: "Keeping up with my Cat's 💩 using a Raspberry Pi"
date: 2023-05-23 11:00:00 -0600
tags: ["Raspberry Pi", "python", "automation"]
permalink: /keeping-up-with-my-cats-litter-box-using-a-raspberry-pi
---

As a former dog owner and first time cat dad I was amazed at how cats are "potty trained" practically from birth. I was prepared to deal with the smell when having to clean the litter box. However, I didn't expect their bowel movements (💩) to carry a punch that would stink up half my apartment. 

This might not be the case for everyone, but certainly for me, with an indoor cat in a 2 bedroom apartment without a naturally ventilated place to keep her litter box.

## The hero/villain of the story

Her name is _Dua_ and she is a cuddly & playful rescue [tortie cat](https://www.thesprucepets.com/tortoiseshell-cat-profile-554703). Dua loves to play with her mouse toys and __adores__ wet food, the latter of which is likely the reason I'm writing this post 😵‍💫

![Dua sitting on a puff sofa](/assets/dua.png)

I have her litter box in my second bathroom's shower. The bathroom has an extractor fan that runs when the bathroom light is on, but she ~~refuses to~~ hasn't figured out how to turn it on and off each time she goes #2... Annoying, right?

## Automating the extractor fan

To mitigate the smell I wanted the lights to turn on when Dua goes in her litter box. To do this I put together a few things:

- [RaspberryPi Zero W](https://www.raspberrypi.com/products/raspberry-pi-zero-w/)
  - WiFi support was goal
- [PIR motion sensor](https://learn.adafruit.com/pir-passive-infrared-proximity-motion-sensor/how-pirs-work)
  - Placed on the bathroom wall with "velcro stickers"
- Smart switch for bathroom lights (any brand will do) paired with an Alexa
- [Voicemonkey](https://voicemonkey.io/) webhook to trigger an [Alexa routine](https://www.amazon.com/alexa-routines/b?ie=UTF8&node=21442922011&ref=hp_hub_rout)
   - `"Alexa, turn on the switch for 5 minutes"`

The software that calls the webhook (which in turn triggers the Alexa routine) [can be found here](https://github.com/fdocr/pir_trigger).

## It works!

Here's what the hardware looks like in action

![RPi and motion sensor](/assets/pir_trigger.png)

<center><small><i>RPi and motion sensor</i></small></center>

![Awful quality GIF of our hero/villain](/assets/dua_pir_trigger.gif)

<center><small><i>Awful quality GIF of our hero/villain</i></small></center>

## 💩 Stats

With all of this in place I went a step further and added Opentelemetry to track the stats of how often the routine was being triggered on [Honeycomb](https://honeycomb.io).

I wanted to know if I was turning on the bathroom lights over false positives from the motion sensor, but after some tests it simply serves to the purpose of telling how often she goes in her litter box.

![Last 7 days 💩 activity](/assets/7-days-activity.png)

<center><small><i>Last 7 days 💩 activity</i></small></center>

![Last 24 hours 💩 activity](/assets/24-hour-activity.png)

<center><small><i>Last 24 hours 💩 activity</i></small></center>

<center>&nbsp;</center>

Interestingly, I can tell she goes in her litter box (# of motion sensor triggers) on average ~8.5 times per day. I don't think many cat owners can say they know this about their feline friends. I do remember and took inspiration from [Aaron Patterson](https://twitter.com/tenderlove/status/823341842586419200) doing something similar a long time ago though.

Anyways, that's it. Pura vida!