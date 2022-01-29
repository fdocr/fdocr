---
title: "Lightning talk"
date: 2016-06-02 14:00:00 -0600
tags: ["Docker", "meetup", "lightning", "talk", "tests", "Jenkins", "dokku", "continuous", "integration", "CI"]
permalink: /lightning-talk/
---

Something big went down last Tuesday, at least for me. Not only [@mattfgl](https://twitter.com/mattfgl) gave an amazing talk on [kubernetes](https://kubernetes.io/) but I got to step in front of a room packed with fellow Docker enthusiasts to give my first lightning talk ever, on my [Dockerized tests in a dockerized Jenkins](/post/running-dockerized-tests-in-jenkins) blog post. Here are the **updated** slides

<style>.embed-container { position: relative; overflow: hidden; height: 470px; } .embed-container iframe, .embed-container object, .embed-container embed { position: absolute; top: 0; left: 0; }</style><div class='embed-container'><iframe src='https://www.slideshare.net/fernandovalverde88/slideshelf' width='490px' height='470px' frameborder='0' marginwidth='0' marginheight='0' scrolling='no' style='border:none;' allowfullscreen webkitallowfullscreen mozallowfullscreen></iframe></div>

`If browsing on a smartphone you might want to rotate your device to visualize the slides. Slideshare's embed is not very mobile friendly`

Now, that was quite an experience... A scary one for sure. Had little time to prepare since the Meetup was packed and apparently some last minute spots freed up like it tends to happen, so our confirmation came last minute. Anyways it didn't went too bad, although the guys on the back had some trouble hearing clearly. Apparently a mic would've helped since they struggled with all speakers, none of us knew it :(

I sort of screwed up my "demo" a little bit, wanted to SSH into [this](/) VPS and show `docker stats`, but didn't. That way as a new GitHub Pull Request triggered the Jenkins job everyone would get to see new containers created and destroyed in the process. The build was triggered succesfully and everything went smoothly in that sense, but I could've described the process a little better (and the docker commands that executed the tests too).

Oh well, hopefully there will be a next time for me to redeem myself and the **demo Gods** will be on my side next time. Overall I had a good time despite the nerves creeping up on me. Again, [here's the link](/post/running-dockerized-tests-in-jenkins) to the blog post with the detailed steps for the slides presentation. Pura Vida.
