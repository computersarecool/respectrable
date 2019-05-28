# Respectrable
*Bi-directional communication for Ableton Live via Max for Live*

## Description
Live doesn't natively support [OSC](http://opensoundcontrol.org/introduction-osc) so the point is to create a system where any property can be set or queried via Max for Live which does support OSC.

In this way a Live set can control -- or be controlled by -- any OSC compatible system.

Respectrable is a Max for Live device that facilitates this. In the rest of this README "respectrable" refers to the Max for Live device.

[![Respectrable demo screen capture](https://i.imgur.com/IFKorea.jpg)](https://www.youtube.com/watch?time_continue=2&v=L1oF4Amrf9k "Respectrable demo screen capture")

## Tested On
- Windows

## To Use
- Add the folder containing this repo to Max's [search path](https://docs.cycling74.com/max7/vignettes/search_path).

- Add `respectrable.amxd` (located in the `max` directory) to the master track on a Live set.

- Send OSC messages to the `toMaxChannel` and `toMaxMessage` ports indicated in the `settings.json` file.

## Project Structure
- The `max` folder contains all of the Max for Live code and patches.

- The `ableton` folder contains a demo Live set with respectrable already loaded.

- The `examples` folder contains a [TouchDesigner](http://derivative.ca/) example.

## Functionality
This assumes knowledge of the Live Object Model known as [the LOM](https://docs.cycling74.com/max7/vignettes/live_object_model)

There are two ways to reach Live objects.  One is to use a Max object like a [`live.object`](https://docs.cycling74.com/max7/maxobject/live.object) and the other is through the [Max Javascript API](https://docs.cycling74.com/max7/vignettes/jsliveapi).

Using Javascript is easier for most things but runs in a [low priority queue](https://cycling74.com/forums/javascript-performance-vs-max-objects/).

So respectrable supports both Javascript objects and native objects (for most things).

Any part of the LiveAPI can be reached with a Javascript message, but only `live_set`, `tracks` and some children of `tracks` can be reached from the GUI objects.
Only the following `mixer_device` children can be reached from the GUI objects:
- `volume`
- `panning`
- `track_activator`

Additionally, [`live.observers`](https://docs.cycling74.com/max7/maxobject/live.observer) are used to observe only the following properties that change often:
- `output_meter_left` 
- `output_meter_right` 
- `output_meter_level` 
- `playing_slot_index`

To `set` a property send a message in the following format:
- Javascript message: `/canonical_path [set, ${PROPERTY} ${VALUE}]`
- Native message: `/canonical_path/set/${PROPERTY} ${VALUE}`

To `get` a property send a message in the following format:
- Javascript message: `/canonical_path [get, ${PROPERTY}]`
- Native message: `/canonical_path/get/${PROPERTY} ${VALUE}`

To `call` a function send a message in the following format:
- Javascript message: `/canonical_path [call, ${FUNCTION}]`
- Native message: `/canonical_path/call ${FUNCTION}`

Any `set` message is automatically followed by a `get` message so the newly changed value will be returned.

Examples:
	- The Javascript message `/live_set/tracks/0 ['set', 'color', 0]` and the channel message `/live_set/tracks/0/set/color 0` will both return `/live_set/tracks/0/color 0`

##### Helper method
Because of the complexity of creating an object on the client side from individual messages, the helper function `getState` can be called as `/live_set ['get_state', true]`

This is the only message that performs logic on the Max side to return a JSON formatted string that is a fairly complete state representation of the state of the Live set.

#### Minor Notes
The Live API returns values as a single element array. Respectrable does not change this so to get the value (what you probably want) access the first element in the array.

## Extra Notes
#### Required Software
- Ableton Live 9+
- Max for Live

#### settings.json
- Because of a [bug](https://cycling74.com/forums/udpreceive-not-really-working-binding-for-osc/) with Max, `tempToMaxChannel` and `tempToMaxMessage` are used to keep ports working.
- Because Max [doesn't support multicasting](https://cycling74.com/forums/udp-multicast-messages-without-java) the `hosts` field is an array of the hosts to which you want to send messages.  Both hostnames and IP addresses will work.

#### References
- [Live Object Model](https://docs.cycling74.com/max7/vignettes/live_object_model) (essential to understand)

### License

:copyright: Willy Nolan 2017

[MIT License](https://en.wikipedia.org/wiki/MIT_License)
