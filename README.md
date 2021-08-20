# Respectrable
*Bidirectional communication with Ableton Live via Max for Live*

## Description
The first goal with this project is to create a system where any property of a Live set can be changed by sending an 
[Open Sound Control (OSC)](http://opensoundcontrol.org/introduction-osc) message to the Ableton Live.

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
- The `test` folder contains an Ableton Live project and TouchDesigner project used for testing. 
To run tests open both projects and run the `text_tests` DAT operator in TouchDesigner.

## Functionality
Max for Live can access an Ableton Live set in two different ways.

There is a [Javascript API](https://docs.cycling74.com/max8/vignettes/jsliveapi) and there are also 
[Max objects](https://docs.cycling74.com/max8/vignettes/live_api_overview) which can access properties of a Live set.

Using Max objects [might perform better](https://cycling74.com/forums/javascript-performance-vs-max-objects/) 
but multiple objects would have to be created for every instance of every class in Live.

To avoid frustration, respectrable creates objects for many -- but not every -- class in a Live set.
Objects are created for many classes important for live performance.

Similarly, many (but not all) elements of a Live set are observed with [live.observer](https://docs.cycling74.com/max8/refpages/live.observer) objects.

The two different message types should be sent to the ports defined by the following keys in the `networking` section of the `settings.json` file.

- respectrable listens for native object messages: `toMaxObject`
- respectrable listens for Javascript  messages: `toMaxJs`
- respectrable sends messages on: `fromMax`

## Accessing and Controlling an Ableton Live Set
### `get`, `set`, and `call`

- To `set` or `get` a property or to `call` a function send an OSC message in the following format: 
    
    `/canonical_path [messageType, property, (value)]`

`canonical_path` is the OSC address (which is the same as the LOM Canonical path with spaces replaced by forward slashes.

`messageType` is the first OSC argument and is either `set`, `get` or `call`.

`property` is the second OSC argument and is either the name of the property that is being set or queried or the name 
of the function to call.

`value` is the third OSC argument and should only be included in a `set` message in which case it is the value to set.

Example Messages:

- `/live_set/tracks/0 ["get", "color"]`
- `/live_set/tracks/0 ["set", "color", 3947580]`
- `/live_set/tracks/0 ["call", "stop_all_clips"]`

Corresponding Responses:

- `/live_set/tracks/0 ["color", 3217580]`
- `/live_set/tracks/0 ["color", 3947580]`
- `/live_set/tracks/0 ["stop_all_clips", "id", "0"]`

**Note:** Certain properties are considered "LiveAPI" properties (i.e. `id` and `path`). 
These are different than other property (see the [LOM documentation](https://docs.cycling74.com/max8/vignettes/jsliveapi#LiveAPI_Properties) for details) 
and can only be reached by using Javascript messages with the format:

    `/canonical_path ['property', ${LiveAPI Property}]`
    
Where `${LiveAPI Property}]` is the name of the property (e.g. `id`).

**Note:** Some function calls may not have useful or any output.

### Observed Property Values
The following properties or children are observed using [live.observer](https://docs.cycling74.com/max5/refpages/m4l-ref/live.observer.html) objects.

This means that whenever values change (even if directly through the Live GUI) a message with the new property's value 
will be sent from respectrable with the new value.

- **Song**: `tempo, clip_trigger_quantization, tracks`
- **Track**: `solo, color, playing_slot_index, fired_slot_index, devices, clip_slots`
- **MixerDevice DeviceParameter Values**: `volume, track_activator, panning`
- **Clip**: `color, name, pitch_coarse, playing_position`
- **Device**: `name, is_active`
- **Device DeviceParameter Values**: `name, value`

After initialization the current value for each property that is observed will be sent.
    
### Classes (and their children) only reachable through Javascript
- `Song.View`
- `Track.View`
- `Clip.View`
- `RackDevice`
- `Drumpad`
- `Chain` 
- `DrumChain`
- `ChainMixerDevice`
- `SimplerDevice`
- `Sample`
- `PluginDevice`
- `MaxDevice`
- `Scene`
- `CuePoint`
- `ControlSurface`
- `ThisDevice`

### Extra Notes
- Although adding and deleting tracks and clips is supported, doing so causes the Max for Live device to reinitialize and, 
  becuase of a [bug](https://cycling74.com/forums/method-pushcontextframepopcontextframe-m4l/) this can cause 
  your set to perform poorly unless the device is deleted and re-added.

- Devices have only been thoroughly tested as part of Device Racks with parameters mapped to Macro knobs.

- Because of a [port binding issue](https://cycling74.com/forums/udpreceive-not-really-working-binding-for-osc/) `temp` 
  ports are used to keep ports working in Max during editing.

- Because Max [doesn't support multicasting](https://cycling74.com/forums/udp-multicast-messages-without-java) the 
  `hosts` field is an array of the hosts to which messages will be sent. Hostnames and IP addresses both work.

### Required Software
- Ableton Live
- Max for Live

### References
- [Live Object Model](https://docs.cycling74.com/max7/vignettes/live_object_model) (This is essential to understand)

### License

:copyright: Willy Nolan 2020

[MIT License](https://en.wikipedia.org/wiki/MIT_License)
