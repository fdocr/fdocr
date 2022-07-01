---
title: "Using Chart.js plugins with webpack"
date: 2022-07-01 17:00:00 -0600
tags: ["Chart.js", "webpack", "javascript", "rails"]
permalink: /using-chartjs-plugins-with-webpack/
---

This post shares the steps I took to include [Chart.js](https://www.chartjs.org/) with candlestick charts (using a plugin) on my _weekend/pet project_. I'm using [webpack](https://webpack.js.org/) to bundle its JavaScript code & dependencies.

I'm trying to write this in a framework agnostic way, but the fact is I'm using webpack in a [Ruby on Rails](https://rubyonrails.org/) app (via [`jsbundling-rails`](https://github.com/rails/jsbundling-rails)), so there will be some specifics that may differ from someone else's approach.

## Install

I'm using the [chartjs-chart-financial](https://www.npmjs.com/package/chartjs-chart-financial) plugin so, first step is to install Chart.js and all necessary dependencies.

```bash
yarn add chart.js luxon chartjs-adapter-luxon chartjs-chart-financial
```

**Note:** If you're using React or Vue there's a good chance you'll be better off installing and using a [React wrapper](https://github.com/reactchartjs/react-chartjs-2) or [Vue wrapper](https://github.com/apertureless/vue-chartjs).

## Initialize

Add this to `application.js` (or similar entrypoint to the app).

```js
import Chart from 'chart.js/auto'
import * as luxon from 'chartjs-adapter-luxon'
import * as finChart from 'chartjs-chart-financial'

// Register the plugin's custom controllers
Chart.register(finChart.CandlestickController, finChart.CandlestickElement)

// Ensure the Chart class is loaded in the global context
window.Chart = Chart
```

## Usage

I'm on Rails and using [Hotwire](https://hotwired.dev/), so my JavaScript code lives in Stimulus controllers. 

I can use the `Chart` class from a `connect()` method in my controller because it was loaded globally. Each page visit includes the controller and the chart's data it needs in the HTML itself.

```js
// `this.canvasTarget` references the Chart.js canvas HTML element
// this might differ depending on your framework (or lack thereof)
var ctx = this.canvasTarget.getContext('2d')

// `this.dataTarget` references the JSON data embedded in the HMTL
var data = JSON.parse(this.dataTarget.innerHTML)

// Traditional Chart.js usage but with a plugin's custom Chart type
var myChart = new Chart(ctx, {
  type: 'candlestick',
  data: {
    datasets: [ ... ] // <- data goes here
  },
  options: { ... }
})
```

[Official docs here for Chart.js specifics](https://www.chartjs.org/docs/latest/)
 
## That's it

With some data and options added to the chart you're all set. The example below has line charts overlayed with the Candlestick chart.

![Chart.js candlestick chart hodl](/assets/chartjs-financial.png "Chart.js candlestick chart hodl")

## Architectural choices & tradeoffs (RoR specific)

Embedding a _large-ish JSON dataset_ in the HTML, times the number of charts in each page makes the HTTP response sizes larger than with an alternative approach (i.e. async API request). This problem likely increases the perceived response times, more so in slower connections.

Concious of this performance penalty I decomposed the charts in separate endpoints using [lazy loaded frames](https://turbo.hotwired.dev/handbook/frames#lazy-loading-frames).

This is also nifty for caching purposes since the chart's dataset is cached with (inside) the HTML response itself. Chart.js is initialized only once in the app's lifetime and is ready to use as soon as the controller renders on screen, ideally via cached network request.

## Kudos

I found help and inspiration in [@wanderingsoul's Chart.js post](https://dev.to/wanderingsoul/rails-6-webpacker-and-chartjs-2kek), Chart.js/Hotwire's docs, the plugin's GitHub docs, and lots of trial & error 🙃

Pura vida.