# Respectrable
*Bi-directional communication with Ableton Live via Cycling '74's Max*

### Overview
The point is to create a bridge so that any change to a Live set sends a notification over OSC and any property of a Live set can be changed by sending an OSC message to the Ableton Live API

`Respectrable` is essentially a Max patch (with a lot of Javascript) that facilitates this

### Setup
The  `ableton` folder has an example Live set with the respectrable patch loaded

The `max_patch` contains everything neccesary for the Max / Ableton side

The `front_ends` folder contains example front ends to demo the project

### Instructions
- Make sure to add this folder to the Max search path
- Take note of the networking information in `settings.json` - this contains the hosts and ports to send and receive data
- Add `spectra_max.amxd` to the master track on a Live set

### API
- Respectrable sends two types of messages: `channel` and `message`
	- The `channel` messages are messages are sent when there is a Max object in the patch monitoring a property (for better performance a limited number of live properties have [live.observers](https://docs.cycling74.com/max6/dynamic/c74_docs.html#live.observer) attached to them - see the following table)
	- The `message` types are sent in response to an API call (see below examples)
	- Both message types are sent on different ports to the destination(s) specified in `settings.json`
- After initialization the current value for each observed property on each observed LOM object will be sent in a `channel` message in the following format:
	
    `/canonical_path ['observe', property, value]`
    
	- `canonical_path` is the LOM canonical path with spaces replaced by `/`
	- `observe` is just the string `observe` (to keep message formats the same)
	- `property` is the first argument and is the `Name` of the property that is being observed
	- `value` is the second argument
	
    e.g. `/live_set/tracks/0 ['observe', 'output_meter_left', 0.5]`
    
    Any time an observed property changes the current value of that property will be sent in this format
 
- To `set` or `get` a property (or to `call` a function) an OSC message should be sent in a similar format

   `/canonical_path [messageType, property, (value)]`

	- `canonical_path` is the LOM Canonical path
	- `messageType` is either `set` or `get` or `call` (if a function is being called) or `property` to get a LiveAPI property (i.e. `id`, `path` etc. which are sligtly different than other properties - see the LOM for details)
	- `property` is either the name of the property that is being set or gotten or the name of the function to call (do not confuse with a LiveAPI `property`)
	- `value` should only be included in a `set` message in which case it is the value to set

	e.g. `/live_set/tracks/0 ['set', 'color', 0] `

- Helper methods

	Because of the complexity of filling out a client object with individual messages, the helper function `getState` can be called as `/live_set ['get_state', true]`
	This is the only message that will perform logic on the Max side to return JSON formatted string that is a fairly complete state representation of the LOM

#### Properties observed with live.observers	

| live_set                          | tracks             | active_clip      | devices    | mixer_device            | clip  |
|-----------------------------------|--------------------|------------------|------------|-------------------------|-------|
| 4 EQ Bands (from a custom object) | output_meter_right | length           | parameters | panning                 | color |
| tempo                             | output_meter_left  | playing_position |            | volume                  |       |
| clip_trigger_quantization         | color              |                  |            | track_activator (value) |       |
|                                   | playing_slot_index |                  |            |                         |       |
|                                   | solo               |                  |            |                         |       |

#### Notes
The Live API returns values as a single element array. Respectrable does not change this so to get the value look at the first element in the array

### Structure
Some folders in this repo are automatically generated by Live
The `assets` folder is for GUI objects in the `spectra_max` patch
The `max_path` folder contains the main `spectra_max` patcha and the specific Javascript and Max patches to create the live.observers. This works essentially creating a graphical representation of the Live set in a Max for Live patch

#### Required Software
- Ableton Live 9+
- Max for Live

#### References
- [Live Object Model](https://docs.cycling74.com/max7/vignettes/live_object_model) (Neccesary to understand)

### License
(c) 2017 Willy Nolan [MIT License](https://en.wikipedia.org/wiki/MIT_License)
