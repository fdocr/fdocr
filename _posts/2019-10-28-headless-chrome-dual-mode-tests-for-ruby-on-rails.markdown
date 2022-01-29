---
title: "Headless Chrome - Dual mode tests for Ruby on Rails"
date: 2019-10-28 00:30:00 -0600
tags: ["Capybara", "Selenium", "Ruby on Rails", "RoR", "Chrome", "Headless Chrome", "RSpec"]
permalink: /headless-chrome-dual-mode-tests-for-ruby-on-rails/
---

Headless tests are necessary for CI environments and very useful for unobtrusive local development. No need to ditch the driver that directly controls the browser though, there's lots of debugging value in being able to switch between both modes.

You'll first need both drivers installed and configured, which will give you headless tests by default. Running your tests with a `HEADLESS=0` environment variable will give you visual feedback from the test suite as it executes.

This *visual mode* used in combination with [breakpoints](https://github.com/deivid-rodriguez/pry-byebug) has proved to be an excellent addition to my toolbelt when debugging. I've tested this to work on Rails `5.2.x` & `6.0.0`

## Installation

I'm an [RSpec](https://rspec.info/) type of guy, these are my `Gemfile` dependencies (don't forget to `bundle install`).

```ruby
group :development, :test do

  ...

  gem 'rspec-rails', '~> 3.8'
  gem 'capybara', '~> 3.16'
  gem 'selenium-webdriver', '~> 3.141'
end
```

Download chromedriver [from here](https://chromedriver.chromium.org/downloads), make it executable, and send it somewhere cozy. For example on macOS after the executable is downloaded & unzipped:

```sh
$ cd ~/Downloads
$ chmod +x chromedriver
$ mv chromedriver /usr/local/bin/
```

## Capybara setup

Uncomment or add the following line on `spec/rails_helper.rb`

```ruby
# spec/rails_helper.rb
Dir[Rails.root.join('spec', 'support', '**', '*.rb')].each { |f| require f }
```

Now the key config for this to work will live in `spec/support/capybara.rb` and will look something similar to:

```ruby
# spec/support/capybara.rb
RSpec.configure do |config|
  config.include FactoryBot::Syntax::Methods
  config.include Capybara::DSL

  Capybara.server = :puma, { Silent: true }

  # Chrome non-headless driver
  Capybara.register_driver :chrome do |app|
    Capybara::Selenium::Driver.new(app, browser: :chrome)
  end

  # Chrome headless driver
  Capybara.register_driver :headless_chrome do |app|
    caps = Selenium::WebDriver::Remote::Capabilities.chrome(loggingPrefs: { browser: 'ALL' })
    opts = Selenium::WebDriver::Chrome::Options.new

    chrome_args = %w[--headless --no-sandbox --disable-gpu --window-size=1920,1080 --remote-debugging-port=9222]
    chrome_args.each { |arg| opts.add_argument(arg) }
    Capybara::Selenium::Driver.new(app, browser: :chrome, options: opts, desired_capabilities: caps)
  end

  # Switch between :chrome / :headless_chrome to see tests run in chrome
  case ENV['HEADLESS']
  when 'true', 1, nil
    Capybara.javascript_driver = :headless_chrome
  else
    Capybara.javascript_driver = :chrome
  end
end
```

As you can see **two Selenium Drivers** were configured (`:chrome` & `:headless_chrome`). But only one of the Drivers is used at a time, based on the `HEADLESS` environment variable.

## Usage

The default behavior is Headless. The usual clean, quick, and simple.

```sh
$ bundle exec rspec
```

Add the environment variable and a Chrome window will be summoned and controlled remotely.

```sh
$ HEADLESS=0 bundle exec rspec
```

Like I said, debugging is the main motivation for this configuration. Breakpoints when tests aren't passing because an element is not visible is one the best examples I can think of. Being able to inspect on a Chrome window directly has saved me lots of time.

Hope it helps anyone, Pura Vida!
