---
title: "Learning Crystal with Battlesnake"
date: 2023-01-13 17:00:00 -0600
tags: ["Crystal", "crystal-lang", "crystal lang", "oss", "github", "open source", "battlesnake"]
permalink: /learning-crystal-with-battlesnake/
---

Recently I've been interested in [Crystal lang](https://crystal-lang.org/) so I worked on a Battlesnake implementation to get more practice under my belt.

[Battlesnake](https://play.battlesnake.com/) is a multiplayer game where a small server you write plays a _survival-style_ snake game paired with snakes implemented by others.

## About the app

I'm using [Kemal](https://github.com/fdocr/CrystalSnake) for framework. The simplicity (Ruby/Sinatra similarity) won me over when paired with Crystal performance. This is what the entire Battlenake API implementation looks like at the time of this writing:

```crystal
get "/" do
  {
    "apiversion": "1",
    "author": "fdocr",
    "color": ENV["SNAKE_COLOR"] ||= "#e3dada",
    "head": ENV["SNAKE_HEAD"] ||= "default",
    "tail": ENV["SNAKE_TAIL"] ||= "default",
    "version": \{\{ `shards version "#{__DIR__}"`.chomp.stringify \}\}
  }.to_json
end

post "/start" do |env|
  context = BattleSnake::Context.from_json(env.params.json.to_json)
end

post "/move" do |env|
  context = BattleSnake::Context.from_json(env.params.json.to_json)

  case ENV["STRATEGY"] ||= "RandomValid"
  when "RandomValid"
    move = Strategy::RandomValid.new(context).move
  when "ChaseClosestFood"
    move = Strategy::ChaseClosestFood.new(context).move
  when "ChaseRandomFood"
    move = Strategy::ChaseRandomFood.new(context).move
  when "CautiousCarol"
    move = Strategy::CautiousCarol.new(context).move
  else
    move = Strategy::RandomValid.new(context).move
  end

  res = { "move": move, "shout": "Moving #{move}!" }
  res.to_json
end

post "/end" do |env|
  context = BattleSnake::Context.from_json(env.params.json.to_json)
end
```

Quite Ruby-like so I hope it's easy to follow along whether used to it or not. `/start` + `/end` aren't actually doing anything other than parsing the payload provided and `/` responds with the snake's skin customizations. `/move` picks from the existing strategies to respond based on an ENV variable.

The devil is in the details since the bulk of the logic lives in the models (parse game context from request payload, house a few utility methods, etc), strategies to respond with a move and utility algorithms. They all feel easy to follow along though.

All IMO notes here: So far I haven't felt the need to work with macros so it's been very similar to a Ruby project. Reworking data structures on the fly (while working/re-working strategies) took some new time/energy to get right compared to Ruby. There's been close to 0 debugging time related to exceptions I would've likely had to catch when putting together a Ruby script because of the compiler (maybe? 🤓). So overall an interesting tradeoff of sorts.

## Strategies & Algorithms implemented

Since Crystal is object oriented I created a abstract/virtual class that all strategies inherit from.

- `RandomValid` checks all the valid moves for your snake on the current context
  - Takes into account walls and other snakes' current position
- `ChaseClosestFood` and `ChaseRandomFood` both aim towards food on the board and differ how they pick their target (Closest vs Random)
  - They re-use `RandomValid` in some scenarios (i.e. can't reach food)
  - They use [A* search algorithm](https://en.wikipedia.org/wiki/A*_search_algorithm) to find the best route towards a target (food).

The re-usability of strategies makes for a cool way to mix & match them, meaning I can build on top of each other or existing algorithms. The food chaser ones won all the challenges (not sure if challenges are still a thing after the recent UI revamp) so that started to show some potential.

`CautiousCarol` is a smarter strategy I implemented and looks like this:

```crystal
# Strategy that chases the closest available food from the board with caution
# against head-to-head collisions by chosing the move with the larger empty
# area available when it's dangerous to move towards the chosen target
class Strategy::CautiousCarol < Strategy::Base
  def move
    enemies = @context.board.snakes.reject { |s| s.id == @context.you.id }
    enemy_count = enemies.count { true }

    valid_moves = @context.valid_moves(@context.you.head)
    return RandomValid.new(@context).move if valid_moves[:moves].empty?

    # Check for head-to-head collision possibilities
    dangerous_moves = [] of BattleSnake::Point
    enemies.each do |snake|
      next if snake.head <=> @context.you.head > 2
      next if snake.body.size < @context.you.body.size

      # Check if we share valid moves (meeting point for collision)
      @context.valid_moves(snake.head)[:neighbors].values.each do |point|
        meeting_point = valid_moves[:neighbors].values.find do |p|
          (point <=> p).zero?
        end
        next if meeting_point.nil?
        dangerous_moves << point
      end
    end

    # Attempt to chase closest food unless dangerous move is detected
    closest_food = ChaseClosestFood.new(@context).move
    target_point = @context.you.head.move(closest_food)
    safe_move = dangerous_moves.find { |p| (p <=> target_point).zero? }.nil?
    return closest_food if safe_move

    # Leftover valid moves (not chasing closest food anymore) & fallback to
    # RandomValid if no other moves are available (likely run into own death)
    safe_moves = valid_moves[:moves].reject { |move| move == closest_food }
    return RandomValid.new(@context).move if safe_moves.size.zero?

    # Use flood fill to pick the valid move with more space to spare as an 
    # attempt to avoid small areas
    flood_fills = {} of Int32 => String
    contexts = [] of BattleSnake::Context
    safe_moves.size.times { contexts << @context.dup }
    safe_moves.each_with_index do |move, i|
      contexts[i].move(@context.you.id, move)
      area_size = Utils.flood_fill(@context.you.head, contexts[i]).size
      flood_fills[area_size] = move
    end

    # Pick the direction with the largest available area
    flood_fills[flood_fills.keys.sort.last]
  end
end
```

That's likely a lot to take in, but try if interested in comparing it to Ruby or other languages. 

There's model manipulation (i.e. using the `snakes` from the `board` of the current `context`), utility method usage on the models (i.e. calls to `@context.valid_moves`), reusing of `RandomValid` & `ChaseClosestFood` strategies, and `Utils.flood_fill` which is my implementation of [Flood Fill algorithm](https://en.wikipedia.org/wiki/Flood_fill).

My first version of this strategy was clunky at attempting a brute-force "look ahead" simulation of all possible scenarios. I scrapped that idea in favor of the above.

## Leaderboard results

That first version of `CautiosCarol` performed _"alright"_. I was surprised it earned points and ranked on the board overall since I knew it wasn't great. After a couple of days on the Standard leaderboard (4 players on 11x11 board) it ranked like this out of ~100 snakes.

![Standard leaderboard first run](/assets/standard-first-run.png)

After the fix with the code above on `CautiousCarol` and another couple of days on the same leaderboard I saw some improvement:

![Standard leaderboard first run](/assets/standard-second-run.png)

I also figured why not rank on the Duels leaderboard (1v1 on 11x11 board) and apparently worked even better there (in ranking spot but fewer points so not sure how much better 😅)

![Duels leaderboard run](/assets/duels-leaderboard.png)

## Conclusions

Crystal has felt easy to read and write for me, quite nice to use overall and very similar to Ruby in lots of ways (specially at this level without diving into macros). The project [is open source on GitHub](https://github.com/fdocr/CrystalSnake) if interested in checking it out.

I hope this is the first of a post series on other specific Crystal learnings I had while experimenting here. Also might update if I come up with new/better strategies.

Pura vida.