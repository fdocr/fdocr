---
title: "Algorithms and standard library modules in my Battlesnake"
date: 2023-02-22 12:00:00 -0600
tags: ["Crystal", "crystal-lang", "crystal lang", "oss", "github", "open source", "algorithm", "search algorithm", "data structures"]
permalink: /algorithms-and-crystal-standard-library-modules-in-my-battlesnake/
---

The [first post](/learning-crystal-with-battlesnake/) in the series _walked through_ the code of my current strategy. This one will share a few of the learnings from writing the utility algorithms in the project (as examples for) where I used Crystal's standard library modules.

## Parsing JSON in Crystal

This is a common task that has to be dealt with on every language. Crystal provides the `JSON::Serializable` module for you to include in your class. That way you get `to_json` and `from_json` methods based on properties & annotations. The [module's usage instructions (docs)](https://crystal-lang.org/api/1.7.2/JSON/Serializable.html#usage) are great.

It might be cumbersome to work through a nested object hierarchy when first setting it up, but it's pretty neat to parse Battlesnake's context and then work with all objects (i.e. `@context.board.snakes.head`, `@context.board.width`, etc). Pretty neat to have instant feedback against typos when working with these thanks to the compiler thereafter too.

The classes in the [`/src/battle_snake` directory](https://github.com/fdocr/CrystalSnake/tree/main/src/battle_snake) are the representation of the game that comes in as JSON payload on each turn.

## A* Search Algorithm

`a_star.cr` is the utility method ([docs reference](https://fdocr.github.io/CrystalSnake/Strategy/Utils.html#a_star%28a%3ABattleSnake%3A%3APoint%2Cb%3ABattleSnake%3A%3APoint%2Ccontext%3ABattleSnake%3A%3AContext%29-class-method)) that will find the shortest path from a point A to a point B. In this context, a point is a `BattleSnake::Point` that represents a coordinate `(x, y)` on the board.

> The history and how it works is explained [in wikipedia](https://en.wikipedia.org/wiki/A*_search_algorithm). My implementation [is on GitHub (here)](https://github.com/fdocr/CrystalSnake/blob/main/src/strategy/utils/a_star.cr).

I'm sure there are potential optimizations, but I did my best to make it efficient with things like using the recommended priority queue data structure with [`spider-gazelle/priority-queue`](https://github.com/spider-gazelle/priority-queue). After all the server needs to respond quick (`<500ms`) for it to play the game and we need to trust we can call utility methods many times on a single turn to make a decision.

## Comparing points (distance)

In order to compare and sort custom classes on data structures Crystal provides the [`Comparable` module/mixin](https://crystal-lang.org/api/1.7.2/Comparable.html). The formula to know the distance between two `BattleSnake::Point` looks like this ([class code here](https://github.com/fdocr/CrystalSnake/blob/main/src/battle_snake/point.cr)):

```crystal
def <=>(other : Point)
  (x - other.x).abs + (y - other.y).abs
end
```

Known as Manhattan distance and by a few other names, this is the basis of how we can tell how far away two points are from each other. This is key in being able to implement A* on a board, which could be thought of as a graph with equal distance (1) from each node.

Now our class automatically gets the conventional comparison operators (`<`, `<=`, `==`, `>=`, and `>`) populated based off it and data structures like arrays [can sort them](https://crystal-lang.org/api/1.7.2/Array.html#sort%3AArray%28T%29-instance-method) too.

## Flood fill

This is an algorithm that determines all the possible area that can be reached, as oppossed to what all the empty points on the board because a section might be blocked off and unreachable ([docs reference](https://fdocr.github.io/CrystalSnake/Strategy/Utils.html#flood_fill%28a%3ABattleSnake%3A%3APoint%2Ccontext%3ABattleSnake%3A%3AContext%29-class-method)).

My own (summarized) way of explaining it would be _"an iterative processing of all valid nearby spaces"_.

> More about flood fill [on wikipedia](https://en.wikipedia.org/wiki/Flood_fill). My implementation is [on GitHub (here)](https://github.com/fdocr/CrystalSnake/blob/main/src/strategy/utils/flood_fill.cr).

This comes in handy when making a decision between different valid moves on a strategy. Consider if you had to choose bewteen _(a)_ move to the right and end up with a flood fill area of 3, or _(b)_ move to the left and end up with a flood fill area of 12. Option _(a)_ sounds like the best one.

That's how `CautiousCarol` decides to take a left instead of running into an enclosed area (dead end): By calculating what those flood fill results are and picking the largest one.

## Conclusions

I had flashbacks to university memories when working on these. Nostalgic and fun. The cool thing is that now every new strategy I can work on will be able to use any of these if need be.

Kudos to the BattleSnake team for the resources they upload, like the [Deep Learning: Useful Battlesnake Algorithms
](https://www.youtube.com/watch?v=XyptXbHxZ0w&t=2918s) YouTube video, where I learned a lot about how these and other algorithms can be applied in BattleSnake.

Pura vida.