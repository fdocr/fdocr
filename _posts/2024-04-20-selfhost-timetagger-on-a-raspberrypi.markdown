---
title: "Selfhost Timetagger on a Raspberry Pi"
date: 2024-04-20 10:00:00 -0600
tags: ["timetagger", "raspberrypi", "raspberry pi", "selfhost", "github", "open source"]
permalink: /selfhost-timetagger-on-a-raspberrypi
---

A few weeks ago I started looking into options for time tracking software. The goal is to be more aware of how I spend my time throughout the day.

> I could selfhost something with the Raspberry Pi I have lying around the house

The intrusive thought prevailed, so here's a condensed/quick tutorial of how I made it work

## Timetagger

The `aarch64` architecture of the [Raspberry Pi 4](https://www.raspberrypi.com/) I wanted to use didn't make this straightforward. I looked for open source projects written in Python for better/easier compatibility.

I chose [timetagger.app](https://timetagger.app/) ([github repo](https://github.com/almarklein/timetagger)) and only a couple days after getting everything running I found the web app quite pleasant to use. I highly recommend it if interested in something like this.

## Requirements

1. Raspberry Pi
  - 4 CPU + 8GB RAM runs the project like it's nothing so lower-end versions should also work
  - I have a 64bit chip but installed 32bit OS (lite) because packages/tools on 64 bit OS were difficult to work with
2. A domain with DNS managed on Cloudflare
  - Tunnels will allow you access your server publicly with a subdomain

You'll want to have your Raspberry Pi running in your local network. I won't cover the basics here, so I'm assuming you can `ssh user@host.local` to your device at this point. Read [getting started guides](https://www.raspberrypi.com/documentation/computers/getting-started.html) if needed.

## Run the server

Timetagger has good docs and articules to help you get started with self hosting. Most of what I did I [learned it from this article](https://timetagger.app/articles/selfhost/). Rapid fire summary:

1. Ensure Python & pip are installed
2. `python -m pip install -U timetagger`
3. Create a dir to keep data `sudo mkdir /opt/timetagger`
4. Change ownership (to yourself) `sudo chown -R [user]: /opt/timetagger/`
5. You can now run the server using `python -m timetagger` and you'll want to use ENV vars:
  - `TIMETAGGER_CREDENTIALS=XXXX` for username/password hash ([generate here](https://timetagger.app/cred))
  - `TIMETAGGER_LOG_LEVEL=info`
  - `TIMETAGGER_BIND=0.0.0.0:8080`
  - `TIMETAGGER_DATADIR=/opt/timetagger`

The web app should now be reachable in your local network on `host.local:8080`

##  Cloudflare Tunnels

We want to access the app from anywhere in the world, not just from your WiFi at home.

Kudos to the [amazing tutorial from _pimylifeup.com_](https://pimylifeup.com/raspberry-pi-cloudflare-tunnel/) which was the source of all I know related to the use of [Cloudflare tunnels](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/) on a Raspberry Pi. Be sure to check that one out for more details on each step below:

1. `sudo apt update & sudo apt upgrade`
2. `sudo apt install curl lsb-release`
3. `curl -L https://pkg.cloudflare.com/cloudflare-main.gpg | sudo tee /usr/share/keyrings/cloudflare-archive-keyring.gpg >/dev/null`
4. `echo "deb [signed-by=/usr/share/keyrings/cloudflare-archive-keyring.gpg] https://pkg.cloudflare.com/cloudflared $(lsb_release -cs) main" | sudo tee  /etc/apt/sources.list.d/cloudflared.list`
5. `sudo apt update`
6. `sudo apt install cloudflared`
7. `cloudflared tunnel login`
8. `cloudflared tunnel create TUNNELNAME`
9. `cloudflared tunnel route dns TUNNELNAME DOMAINNAME`
10. `cloudflared tunnel run --url localhost:8080 TUNNELNAME`

I used a subdomain under the [`fdo.cr` domain](https://fdo.cr) that I own. You should now be able to reach the web app outside your local network!

## systemd services

We want the server + `cloudflared` to run in the background and start on boot. For this we'll use `systemd` and luckily `cloduflared` makes it simple:

1. Create a config file at `~/.cloudflared/config.yml` (example below)
2. `sudo cloudflared --config ~/.cloudflared/config.yml service install`
3. `sudo systemctl enable cloudflared`
4. `sudo systemctl start cloudflared`


```bash
tunnel: [TUNNELNAME]
credentials-file: /home/[USERNAME]/.cloudflared/[UUID].json

ingress:
    - hostname: [HOSTNAME]
      service: http://localhost:8080
    - service: http_status:404
```

We'll do the same for the timetagger server (manual `systemd` setup). Start by creating `/user/local/bin/timetagger_boot.sh` (example below). I used a sleep to delay boot and added ENV vars directly, a.k.a. the easiest/laziest solution.

```bash
#!/bin/bash

echo "Waiting 5s before startup..."
sleep 5
echo "Starting the server!"
TIMETAGGER_CREDENTIALS=XXXXXXXXXX \
	TIMETAGGER_LOG_LEVEL=info \
	TIMETAGGER_BIND=0.0.0.0:8080 \
	TIMETAGGER_DATADIR=/opt/timetagger \
	python -m timetagger
```

Now create `/etc/systemd/timetagger.service` (example below). Notice this example is using your user to run the service (not root).

```bash
[Unit]
Description=Timetagger service
After=network.target
StartLimitIntervalSec=0

[Service]
Type=simple
ExecStart=timetagger_boot.sh
Restart=always
RestartSec=30
User=[USERNAME]

[Install]
WantedBy=multi-user.target
```

Finally `systemctl daemon-reload` or `sudo reboot` to ensure the services are available on your public subdomain.

## Performance

Browsing the app (relatively _aggressively_) while looking in `htop` shows `0.12` on load average which is basically nothing. I ran a quick benchmark with `ab -n 10000 -c 10 https://[SUBDOMAIN].fdo.cr/timetagger/` and saw these results:

![Raspberry Pi htop](/assets/timetagger_htop.png "Raspberry Pi htop")

```bash
Document Path:          /timetagger/app/demo
Document Length:        11559 bytes

Concurrency Level:      10
Time taken for tests:   200.090 seconds
Complete requests:      10000
Failed requests:        7
   (Connect: 0, Receive: 0, Length: 7, Exceptions: 0)
Total transferred:      121439275 bytes
HTML transferred:       115516711 bytes
Requests per second:    49.98 [#/sec] (mean)
Time per request:       200.090 [ms] (mean)
Time per request:       20.009 [ms] (mean, across all concurrent requests)
Transfer rate:          592.70 [Kbytes/sec] received

Connection Times (ms)
              min  mean[+/-sd] median   max
Connect:        0  112  56.5     97    1169
Processing:    44   87  38.4     79    1228
Waiting:       41   82  35.8     74    1227
Total:        109  200  69.7    180    1459

Percentage of the requests served within a certain time (ms)
  50%    180
  66%    196
  75%    212
  80%    225
  90%    278
  95%    329
  98%    402
  99%    458
 100%   1459 (longest request)
```

There are lots of caveats to note, i.e. the fact 10 concurrent users is 10x what this server will ever face, it doesn't resemble real user behavior and follow up requests come in immediately one after the other.

Regardless of the caveats, a few of the noteworthy stats from the results:
- The test transferred a total of 115 MB of HTML in 200s (~0.57 MB per second)
- Requests had a mean time of 200ms and a `P95` of 329ms
- Load averge on `htop` barely went over 1 (out of 4 CPUs on the device)

Considering it's running SQLite and the Python server connected publicly with a Cloudflare Tunnel (CPU hungry process) I can say the Raspberry Pi is impressively powerful.

## Conclusion

> A $35-ish home server vs what a subscription service could cost per year

I find that ^ comparison an interesting one. Proprietary SaaS offerings have delightful UI/UX and lots of extra integrations/tools, but could cost $50 or $100+ per year. Timetagger itself notably sells a [lifetime plan for €144](https://timetagger.app/#pricing) which I would consider if I were to stop selfhosting.

I saw generous Free tiers but they wipe out your historic data or have some other way to hook you into subscribing. No hate intended, it's business strategy.

For my needs, the OSS project I can run on my server at home will be my preferred choice.

> A $35-ish home server vs $5-ish/month VPS

This ^ other comparison is easily won by the Raspberry Pi home server. $60/year will get you 1 CPU (shared), 1-2GB RAM and limited SSD on a cloud provider. A Raspberry Pi has 4x those specs with large SD card storage limits if needed (30GB are plenty and cheap though).

You would benefit from the uptime and high bandwith + low latency connection of a datacenter when compared to your house WiFi, but that's about it. For a hobby project this will be perfect.

Kudos to all the people working on OSS (and writing about it) that made this weird weekend project a reality. Also, hats off if you've made it this far reading and/or are willing to try this out for yourself. Pura Vida!