---
title: "Clawshier OpenClaw Skill"
date: 2026-04-07 22:00:00 -0600
tags: ["OpenClaw", "Open Claw", "OpenAI", "clawhub", "skill", "ai", "image recognition", "OCR"]
permalink: /clawshier-openclaw-skill
---

I've been meaning to take a stab at this idea of automating a process to *take a picture of any receipt and log it to an expenses spreadsheet*. Clawshier is the OpenClaw skill that came as a result. It's [open source on GitHub](https://github.com/fdocr/clawshier) and [available in ClawHub](https://clawhub.ai/fdocr/clawshier).

## Is it any good?

Far from perfect but a fun project. Image recognition is currently the weakest link. It currently supports two providers: OpenAI (default) and Ollama.

OpenAI sometimes refuses to process the image but I simply retry after a minute and that's it. I'd say [60% of the time, it works every time](https://youtu.be/IKiSPUc2Jck?si=7satXBjhc5Bnbbut&t=81). Quality of extraction is quite good for establishment name, expense category recognition, totals and taxes. Thermal receipt pictures with poor lighting can be very tricky, on top of cryptic text/acronyms in them. I traced the image recognition step to take between 5 and 12 seconds which is good.

For Ollama I tried [llama3.2-vision:11b](https://ollama.com/library/llama3.2-vision) due to my available memory (fits in my 16GB RAM), but sadly was unusable. Infinite loops (extracting one line thousands of times), hallucinations and taking too long to process. 5 minute timeouts sometimes worked but essentially a coin toss whether it would extract "something" or simply hang/crash.

I ran benchmarks and I had to downsize the image to 512px to consistently avoid those timeouts, but that degraded the image too much for it to be usable. Perhaps the [llama3.2-vision:90b](https://ollama.com/library/llama3.2-vision) would perform better... Wish I had a Ryzen Strix Halo with that juicy RAM.

## What does it look like?

Send your bot a picture of any receipt. There's currently an issue with dates because receipts I deal with sometimes have DD-MM and MM-DD dates so image extraction sometimes mixes them up. The current workaround is to specify the date, but it's likely not an issue if you only deal with MM-DD-YYYY dates.

![Clawshier receipt photo](/assets/clawshier_receipt.png)

Then the spreadsheets are updated with the new expense record. A few different sheets are created/updated automatically with each pipeline execution:

- **Summary**
   - Aggregated totals and charts
- **Invoice Archive Breakdown**
   - Breakdown of each invoice
   - Currently very flaky data from image recognition since these are the individual line items that are tricky to read/decode even for humans
- **Monthly expense sheet**
   - Expenses aggregated in their corresponding MM-YY date sheet

![Clawshier summary screenshot](/assets/clawshier_summary.png)

## Conclusions

Now I'm the guy taking a picture of his receipts everywhere I go. Not a huge fan of sending these to OpenAI and would wish I could do more of this using local models, but it might help me track my "small expenses" which I struggle to keep a close eye on.

Also worth noting I'm not a huge fan of the DX for OpenClaw skills either, it was painful at times... I hope it's not a "skill issue" 🥁

In terms of usage I'm expecting a couple dollars worth of OpenAI credits per month, we'll see how it goes. Again local models would be able to reduce this substantially since image recognition takes up the bulk of the processing.

There's plenty of ways this could be improved (i.e. PaddleOCR/Tesserect which would also avoid sending my pics to Sam). If Clawshier sounds interesting to you take a peek at the [GitHub repo](https://github.com/fdocr/clawshier). Pura Vida!