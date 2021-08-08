# Respectrable
*Bidirectional communication with Ableton Live via Max for Live*

## Description
The first goal with this project is to create a system where any property of a Live set can be changed by sending an [Open Sound Control (OSC)](http://opensoundcontrol.org/introduction-osc) message to the Ableton Live.

The second goal is to create a system where Live sends an OSC message when any property of a set changes.

In this way a Live set can control -- or be controlled by -- anything that supports OSC messaging.

Respectrable is a Max for Live device that facilitates this. 

In the rest of this README "respectrable" refers to the Max for Live device.

[![Respectrable demo screen capture](https://i.imgur.com/IFKorea.jpg)](https://www.youtube.com/watch?time_continue=2&v=L1oF4Amrf9k "Respectrable demo screen capture")

## Tested On
- Windows
- Ableton Live 9
- Max for Live 8

## To Use
- Add the folder containing this repo to Max's [search path](https://docs.cycling74.com/max8/vignettes/search_path).

- Add `respectrable.amxd` (located in the `max` directory) to the master track on a Live set.

- Send OSC messages (formatted as described below) to the ports specified in the `settings.json` file.

## Project Structure
- The `max` folder contains all of the Max for Live code and patches.
- The `test` folder contains a Live set and TouchDesigner project used for testing.

## Functionality
Max for Live can access properties in Ableton Live in two different ways.

There is [a Javascript API](https://docs.cycling74.com/max8/vignettes/jsliveapi) and there are also [native Max objects](https://docs.cycling74.com/max8/vignettes/live_api_overview) which can access properties of a Live set.

Using Max objects [might perform better](https://cycling74.com/forums/javascript-performance-vs-max-objects/) but an object would have to be created for every instance of every live object class.

Therefore respectrable creates objects for many but not every class of a Live set.

Similarly, many but not all live properties are observed with [live.observer](https://docs.cycling74.com/max8/refpages/live.observer) objects.

The two different message types should be sent to the ports corresponding to the following keys in the `networking` section of the `settings.json` file:

- respectrable listens for native object messages: `toMaxObject`
- respectrable listens for Javascript  messages: `toMaxJs`
- respectrable sends messages to: `fromMax`

### Accessing and Changing Live Set Properties and Functions

#### `get`, `set`, and `call`

- To `set` or `get` a property or to `call` a function send an OSC message in the following format: 
    
    `/canonical_path [messageType, property, (value)]`

`canonical_path` is the OSC address (which is the same as the LOM Canonical path with slashes instead of spaces).

`messageType` is the first OSC argument and is either `set`, `get` or `call`.

`property` is the second OSC argument and is either the name of the property that is being set or queried or the name of the function to call.

`value` is the third OSC argument and should only be included in a set message in which case it is the value to set.

Example Messages:

- `/live_set/tracks/0 ["get", "color"]`
- `/live_set/tracks/0 ["set", "color", 3947580]`
- `/live_set/tracks/0 ["call", "stop_all_clips"]`

Corresponding Responses:

- `/live_set/tracks/0 ["color", 3217580]`
- `/live_set/tracks/0 ["color", 3947580]`
- `/live_set/tracks/0 ["stop_all_clips", "id", "0"]`

**Note:** Certain properties are considered "LiveAPI" properties (i.e. `id` and `path`). 
These are different than other property (see the [LOM documentation](https://docs.cycling74.com/max8/vignettes/jsliveapi#LiveAPI_Properties) for details) and can only be reached by using Javascript messages. 

Additionally, responses to function calls may not always have useful output.

### Observed Property Values
The following properties or children are observed using [live.observer objects](https://docs.cycling74.com/max5/refpages/m4l-ref/live.observer.html).

This means that whenever values change (even if directly through the Live GUI) a message with the new property's value will be sent from respectrable with the new value.

- **Song**: `tempo, clip_trigger_quantization, tracks`
- **Track**: `solo, color, playing_slot_index, fired_slot_index, devices, clip_slots`
- **MixerDevice**: `volume, activator, panning`
- **ClipSlot**: `has_clip, is_playing`
- **Clip**: `is_playing, name, pitch_coarse, playing_position`
- **Device**: `name, is_active`
- **DeviceParameter**: `name, value`

# TODO: Check this
After initialization the current value for each property that is observed will be sent to the `fromMaxChannel` port in the following format: 
    
    /canonical_path [property, value]

Example: `/live_set/tracks ["output_meter_left", 0.5]`

#### Classes (and their children) not reachable by native Max objects
Javascript messages must be used to reach the following classes:
- `Song.View`
- `CuePoint`
- `Chain` 
- `Drumpad`
- `ControlSurface`

### Extra Notes
- Because of a [port binding issue](https://cycling74.com/forums/udpreceive-not-really-working-binding-for-osc/) `temp` ports are used to keep ports working in Max during editing.

- Because Max [doesn't support multicasting](https://cycling74.com/forums/udp-multicast-messages-without-java) the `hosts` field is an array of the hosts to which you want to send messages. Hostnames and IP addresses both work.

#### Required Software
- Ableton Live
- Max for Live

#### References
- [Live Object Model](https://docs.cycling74.com/max7/vignettes/live_object_model) (This is essential to understand)

### License

:copyright: Willy Nolan 2020

[MIT License](https://en.wikipedia.org/wiki/MIT_License)
