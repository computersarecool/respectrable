# Respectrable
*Bi-directional communication with Ableton Live via Max for Live*

## Description
The first goal with this project is to create a system where any property of a Live set can be changed by sending an [Open Sound Control (OSC)](http://opensoundcontrol.org/introduction-osc) message to the Ableton Live API.
The second goal is to create a system where any change made to a Live set sends an OSC notification to notify external software.

In this way a Live set can control -- or be controlled by -- anything that uses OSC.

Respectrable is a Max for Live device that facilitates this. In the rest of this README "respectrable" refers to the Max for Live device.

[![Respectrable demo screen capture](https://i.imgur.com/IFKorea.jpg)](https://www.youtube.com/watch?time_continue=2&v=L1oF4Amrf9k "Respectrable demo screen capture")

## Tested On
- Windows (but should work on MacOS as well)
- Max for Live 7

## To Use
- Add the folder containing this repo to Max's [search path](https://docs.cycling74.com/max7/vignettes/search_path).

- Add `respectrable.amxd` (located in the `max` directory) to the master track on a Live set.

- Send OSC messages (formatted as described below) to the `toMaxChannel` and `toMaxMessage` ports specified in the `settings.json` file.

## Project Structure
- The `max` folder contains all of the Max for Live code and patches.

## Functionality
### Setting Property Values
- When added to a track respectrable creates Max objects representing the Live set. These can be seen in the respectrable Max object.
Some of the Live set is reachable through these Max objects but not every element in the Live Object Model can be reached. 

`Song.View`, `CuePoint`, `Chain` and `Drumpad` classes (as well as their children) can not currently be reached through Max Objects.

- To reach these classes messages should be sent via the Javascript API which [might perform worse](https://cycling74.com/forums/javascript-performance-vs-max-objects/) but can reach every element and property of a Live set
- The two different message types (Native Max Objects and Javascript) should be sent to the ports specified in the `hosts` section of the `settings.json` file

### Observed Property Values
For each of the following classes, certain properties or children are observed
- `Song`: `[tempo, clip_trigger_quantization, tracks]`
- `Track`: `[solo, color, playing_slot_index, fired_slot_index, devices, clip_slots]`
- `MixerDevice`: `[volume, activator, panning] (value for all)`
- `ClipSlot`: `[has_clip, is_playing]`
- `Clip`: `[is_playing, name, pitch_coarse, playing_position]`
- `Device`: `[name, is_active]`
- `DeviceParameter`: `[name, value]`
  
- After initialization the current value for each property that is observed will be sent to the `fromMaxChannel` port in the following format: `/canonical_path value`
    e.g. `/live_set/tracks/output_meter_left 0.5`

  - Any time an observed property changes its current value will be sent to the `fromMaxChannel` port.

### `get`, `set`, and `call`
- To `set` or `get` a property or to `call` a function send an OSC message to either the `toMaxChannel` port in the following format:
  `/canonical_path [messageType, property, (value)]`


- `canonical_path` is the OSC address (which is the same as the LOM Canonical path)
- `messageType` is the first OSC argument and is either `set`, `get`, `call` or `property`. (Some properties are considered "LiveAPI" properties (i.e. `id` and `path`). These are different than other properties (see LOM for details). These properties should use the messageType of `property`
- `property` is the second OSC argument and is either the name of the property that is being set or queried or the name of the function to call
- `value` is the third OSC argument and should only be included in a set message in which case it is the value to set

    Examples:
    - `/live_set/tracks/0 'get' 'color'`
    - `/live_set/tracks/0 'set' 'color' 3947580`
    - `/live_set/tracks/0 'call' 'stop_all_clips'`

### Using the Javascript API
Some parts of a Live project are not reachable from the GUI objects. To reach these use the Javascript messages.

Send to the `toMaxMessage` port a message formatted in the same format as above (`/canonical_path [messageType, property, (value)]`)

Responses will be sent to the `fromMaxMessage` port

### Extra Notes
- Because of a [port binding](https://cycling74.com/forums/udpreceive-not-really-working-binding-for-osc/) with Max `tempToMaxChannel` and `tempToMaxMessage` are used to keep ports working during editing.
- Because Max [doesn't support multicasting](https://cycling74.com/forums/udp-multicast-messages-without-java) the `hosts` field is an array of the hosts to which you want to send messages.  Hostnames and IP addresses will both work.

#### Required Software
- Ableton Live 9+
- Max for Live

#### References
- [Live Object Model](https://docs.cycling74.com/max7/vignettes/live_object_model) (essential to understand)

### License

:copyright: Willy Nolan 2020

[MIT License](https://en.wikipedia.org/wiki/MIT_License)
