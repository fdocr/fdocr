---
title: "Database for Kemal server in Crystal lang"
date: 2023-02-28 15:00:00 -0600
tags: ["Crystal", "crystal-lang", "crystal lang", "oss", "github", "open source", "database", "jennifer.cr", "worker", "kemal"]
permalink: /database-for-kemal-server-in-crystal-lang
---

This is another post about the [Battlesnake project](/learning-crystal-with-battlesnake/) I've been working on while diving in [Crystal lang](https://crystal-lang.org/).

This time I'm looking into persisting the game data to a database for analysis. This will allow me to review games from each game played by the bot and hopefully improve my spot on the leaderboards by tweaking my strategy.

FYI the code is [on GitHub](https://github.com/fdocr/CrystalSnake).

## Jennifer.cr

[`imdrasil/jennifer.cr`](https://github.com/imdrasil/jennifer.cr) is my ORM of choice, but I'm no longer following the recommended `config` directory in the root of the project. I'm just stuffing initializers to be required from the main app files (i.e. `src/app.cr`).

This is what the database initializer can look like:

```crystal
# src/initializers/database.cr

require "kemal"
require "jennifer"
require "jennifer/adapter/postgres"

Jennifer::Config.configure do |conf|
  conf.from_uri(ENV["DATABASE_URL"]) if ENV.has_key?("DATABASE_URL")
  conf.logger.level = Log::Severity::Debug
  conf.adapter = "postgres"
  conf.pool_size = (ENV["DB_POOL"] ||= "5").to_i
end
```

[Jennifer docs](https://imdrasil.github.io/jennifer.cr/docs/) are great. I found a couple of difficulties along the way, mostly related to configuration details, but made it work with help from kind folks on GitHub.

## Migration & Model

It's not quite like ActiveRecord (maybe nothing is/will be 😅), but IMO it's great and has lots of incredibly valuable features (i.e. built in migration management, query dsl, etc). Here's what the migration and model look like:

```crystal
class CreateTurns < Jennifer::Migration::Base
  def up
    create_table :turns do |t|
      t.string :game_id, {:null => false}
      t.string :snake_id, {:null => false}
      t.text :context, {:null => false}
      t.string :path, {:null => false}
      t.bool :dead, {:null => false, :default => false}

      t.index :game_id
      t.index :path

      t.timestamps
    end
  end

  def down
    drop_table :turns if table_exists? :turns
  end
end
```

```crystal
# This is a DB record representation of a request from a game for either
# start/move/end request.
# 
# NOTE: https://imdrasil.github.io/jennifer.cr/docs/model_mapping
class Turn < Jennifer::Model::Base
  with_timestamps

  mapping(
    id: Primary64,
    game_id: String,
    snake_id: String,
    context: String,
    path: String,
    dead: Bool,
    created_at: Time?,
    updated_at: Time?,
  )
end
```

With all of this in place I added this macro to `src/app.cr` and called it from within `/start`, `/move`, `/end` endpoints so the turn data gets persisted in Postgres.

```crystal
macro persist_turn!
  dead = context.board.snakes.find { |s| s.id == context.you.id }.nil?
  Turn.create(
    game_id: context.game.id,
    snake_id: context.you.id,
    context: env.params.json.to_json,
    path: env.request.path,
    dead: dead
  )
end
```

I left this run through Monday's leaderboard matches and it worked. You can check out the most recent games persisted by my snake in [`https://snake.fdo.cr/games`](https://snake.fdo.cr/games)

## Performance impact

Now that we're storing (inserting) data to PostgreSQL, which is currently hosted in a low cost server, response times should've slowed down a noticeable amount.

[OpenTelemetry](https://opentelemetry.io/) data on [Honeycomb](https://www.honeycomb.io/) is able to tell me exactly how it performed (read [my post about this here](/deploy-crystal-app-with-docker-and-opentelemetry/)).

**BEFORE**

![Server times before DB persist implemented](/assets/without_db_server_times.png)

**AFTER**

![Server times with DB persist implemented](/assets/db_sync_server_times.png)

There's indeed a penalty in persisting data, likely coming from network latency and the low cost DB server performance being much lower than ideal... I'm saving $$ with that pet (as in ["not caddle"](https://traefik.io/blog/pets-vs-cattle-the-future-of-kubernetes-in-2022/)) server (droplet on [DO](https://www.digitalocean.com/)) hosting Redis+Postgres maintained by me. This hack saves me ~$25/month and could merit a post in and of itself 😆

Anyways, Battlesnake rules usually work with a `500ms` timeout, which means we have time to spare for now.

## How to recover/regain performance

I'm not going to start spending money on high performing tiers of hosted Postgres services anytime soon, so I could think of ways to avoid such a costly penatly. One option is to store the `Turn` data asynchronously.

Redis is better performing than Postgres, so queuing the data to be persisted to DB by a background job instead of synchronously when the request is made might help improve response times again.

I actually already have this implemented with the [mosquito shard](https://github.com/mosquito-cr/mosquito), but that will be covered in the next post of this series. I'm waiting for at least a day's worth of leaderboard match data to reliably compare with the results above, so stay tuned if interested I guess.

Pura vida.