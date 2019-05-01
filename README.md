# Respectrable
*Bi-directional communication with Ableton Live via Max for Live*

## Description
The point is to create a system where any property of a Live set can be changed by sending an [OSC](http://opensoundcontrol.org/introduction-osc) message to the Ableton Live API and any change to that Live set sends out an OSC notification.

In this way a Live set can control -- or be controlled by -- any interface that uses OSC.

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

- The `examples` folder contains a [TouchDesigner](http://derivative.ca/) example. Download that program to test it.

## Functionality
### API
- Respectrable sends two types of messages: `channel` and `message`
	- `channel` type messages are sent from [live.observers](https://docs.cycling74.com/max6/dynamic/c74_docs.html#live.observer) in the patch. For better performance some commonly used live properties are monitored with `live.observers` - see the following table
	- `message` type messages  are sent in response to a direct API call (see below examples)
	- These message types are sent on different ports to the destination(s) specified in `hosts` section of the `settings.json` file


- After initialization the current value for each property that is observed will be sent to the `fromMaxChannel` port in the following format: `/canonical_path ['observe', property, value]`
	- `/canonical_path` is the OSC address and is the same as the [LOM](https://docs.cycling74.com/max7/vignettes/live_object_model) canonical path with spaces replaced by `/`
	- `'observe'` is the first OSC argument and is just the string `'observe'` (this keep message formats consistent)
	- `property` is the second OSC argument and is the name of the property that is being observed
	- `value` is the thrid OSC argument and is the current value of the property
	
    e.g. `/live_set/tracks/0 ['observe', 'output_meter_left', 0.5]`
    
    
  - Any time an observed property changes its current value will be sent to the `fromMaxChannel` port. The oberseved properties are listed in the following table


- To `set` or `get` a property or to `call` a function send an OSC message to the `toMaxMessage` port in a similar format: `/canonical_path [messageType, property, (value)]`
	- `canonical_path` is the OSC address, which is the same as the LOM Canonical path
	- `messageType` is the first OSC argument and is either `set` or `get` or `call` (if a function is being called) or `property`.
      - Some properties are considered "LiveAPI" properties (i.e. `id` and `path`). These are different than other properties (see LOM for details). These properties should use the `messageType` of `property`
	- `property` is the second OSC argument and is either the name of the property that is being set or queried or the name of the function to call (again do not confuse these with a LiveAPI property)
	- `value` is the third OSC argument and should only be included in a `set` message in which case it is the value to set


	Examples:
	- `/live_set/tracks/0 ['set', 'color', 0]` will return `/live_set/tracks/0 ["set" "color" 0]`
  - `/live_set/tracks/0 [get, 'color']` will return `/live_set/tracks/0 ["get" "color" 16149507]` (where `16149507` is a number depending on the color of the first track)
    
  - Responses to this message will be in the same format and will be sent to the `fromMaxMessage` port


- Messages that only `set` numerical values can do so quickly by sending the formatted message to the `toMaxChannel` port in a slighty different format: `/canonical_path/messageType/property [value]`
    - The OSC address is the LOM path appended with the `messageType` (which in the case  will always be `set`) and `property`. The only argument is the value to set
    
	Examples:
- `/live_set/tracks/0/mixer_device/volume/set/value .5`

##### Helper method

	Because of the complexity of creating an object on the client side from individual messages, the helper function `getState` can be called as `/live_set ['get_state', true]`
    
	This is the only message that performs logic on the Max side to return a JSON formatted string that is a fairly complete state representation of the state of the Live set

#### Properties observed with live.observers	
| live_set                     | tracks               | active_clip        | devices      | mixer_device              | clip    |
|------------------------------|----------------------|--------------------|--------------|---------------------------|---------|
| `tempo`                      | `output_meter_right` |  `length`          | `parameters` | `panning`                 | `color` |
| `clip_trigger_quantization`  | `output_meter_left`  | `playing_position` | `volume`     | `track_activator`         |         |
|                              | `color`              |                    |              |                           |         |
|                              | `playing_slot_index` |                    |              |                           |         |
|                              | `solo`               |                    |              |                           |         |

#### Minor Notes
The Live API returns values as a single element array. Respectrable does not change this so to get the value (what you probably want) access the first element in the array.


## Extra Notes
#### Required Software
- Ableton Live 9+
- Max for Live

#### settings.json
- Because of a [bug](https://cycling74.com/forums/udpreceive-not-really-working-binding-for-osc/) with max `tempToMaxChannel` and `tempToMaxMessage` are used to keep ports working.
- Because max [doesn't support multicasting](https://cycling74.com/forums/udp-multicast-messages-without-java) the `hosts` field is an array of the hosts to which you want to send messages.  Hostnames and IP addresses will both work.

#### References
- [Live Object Model](https://docs.cycling74.com/max7/vignettes/live_object_model) (essential to understand)

### License

:copyright: Willy Nolan 2017

[MIT License](https://en.wikipedia.org/wiki/MIT_License)

