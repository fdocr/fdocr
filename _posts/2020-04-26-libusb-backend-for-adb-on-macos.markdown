---
title: libusb backend for adb on macOS
date: 2020-04-26 9:00:00 -0600
tags: ["Android", "libusb", "macOS", "todayilearned"]
permalink: /libusb-backend-for-adb-on-macos/
---

For the past week I was stuck on what felt like a dead end. Although a bit more comfortable now than where I stood a few weeks ago I'm still learning the ropes of Android development, and this problem caught me outside my comfort zone.

## Error: device not found

At first it took me by surprise because the device was detected as usual.

![Alt Text](https://dev-to-uploads.s3.amazonaws.com/i/ky2se30rqw2c0vzt5mkp.png)

However, Android Studio failed to install when trying to run/debug because "the device was not found" (as shown in the article cover photo). The device was no longer detected after that.

"It was just right there 🤔" - Me

None of my ideas worked, ranging from updating/reinstalling everything to a factory reset for the phone (twice because one isn't enough to be sure).  I quickly found myself in the 'Google Failure' side here:

[![Google search tweet](/assets/google-links.png "Google search tweet")](https://twitter.com/molly_struve/status/1225203007442366464)

Just the week before I was able to debug flawlessly from within Android Studio. Using Gradle to install directly from the terminal was still working though, something wasn't right.

## Android Debug Bridge (adb) & libusb

I finally stumbled with [this SO answer](https://stackoverflow.com/a/58492367/3462026). Even if the error wasn't an exact match with mine it happened to fix the problem along with a clean build.

The solution was to uncheck the option that enabled the use of [libusb](https://github.com/libusb/libusb/wiki) as backend for [adb](https://www.developer.com/ws/android/using-android-debug-bridge.html).

![Alt Text](https://dev-to-uploads.s3.amazonaws.com/i/1bdjox2u28dvm4ki0j63.png)

I'm not sure if this option was enabled "silently" after an update, or if this was always enabled and something broke. At least I'm more aware now of lower level tools like libusb that work (or don't work) with adb on macOS.

I only hope this write-up gives this option a bit more visibility for anyone that may encounter the same problem in the future. Pura Vida!