# Respectrable
*Bi-directional communication with Ableton Live via Cycling '74's Max*

### Overview
The point is to create a bridge so that any change to a Live set sends out an OSC notification and any property of a Live set can be changed with an OSC message


### Setup
The  `ableton_demo.als` located in the root and `touch_demo.toe` file located in the `touch_designer` directory are meant to be used to demo the project

The `max_patch` folder contains all the necessary files for the Max implementation

### Instructions
- Make sure to add this folder to the Max search path
- Add `spectra_max.amxd` to the master track on a Live set
- Take note of the networking information in `settings.json`. This contains the ports on which to receive and the hosts and ports to which data is sent
 
### API
- Respectrable sends two types of messages: `channel` and `message`. 
	- The `channel` messages are messages for which there is a Max object in the patch (a limited number of live properties have [live.observers](https://docs.cycling74.com/max6/dynamic/c74_docs.html#live.observer) attached to them - see the following table). 
	- The `message` types are sent in response to an API call (see below examples). 
	- The messages are sent on different ports to the destination(s) specified in `settings.json`
- After initialization the current value for each observed property on each observed LOM object will be sent via OSC in the specified format (any changes will send an update in value in the same format):
	
    `/frommax/canonical_path property value`
	- `canonical_path` is the LOM canonical path with spaces replaced by `/`
	- `property` is the first argument and is the `Name` of the property that is being observed
	- `value` is the second argument. 
	
    e.g. `/frommax/live_set/tracks/0 ['output_meter_left', 0.5]`

- To `set` or `get` a property (or to `call` a function) an OSC message should be sent in the same format except prefixex with `/tomax`. That is:
`/tomax/canonical_path messageType property (value)`

	- `canonical_path` is the LOM Canonical path
	- `messageType` is either `set` or `get` or `call` (if a function is being called)
	- `property` is either the name of the property that is being set or gotten or the name of the function to call
	- `value` should only be included in a `set` message in which case it is the value to set

	e.g. `/tomax/live_set/tracks/0 ['set', 'color', 0] `

#### Properties Observered with live.observers	

| live_set                          | tracks             | active_clip      | devices    | mixer_device            | clip  |
|-----------------------------------|--------------------|------------------|------------|-------------------------|-------|
| 4 EQ Bands (from a custom object) | output_meter_right | length           | parameters | panning                 | color |
| tempo                             | output_meter_left  | playing_position |            | volume                  |       |
| clip_trigger_quantization         | color              |                  |            | track_activator (value) |       |
|                                   | playing_slot_index |                  |            |                         |       |
|                                   | solo               |                  |            |                         |       |

#### Required Software
- Ableton Live 9+
- Max for Live

#### References
- [Live Object Model](https://docs.cycling74.com/max7/vignettes/live_object_model) (Neccesary to understand)

### License
(c) 2017 Willy Nolan [MIT License](https://en.wikipedia.org/wiki/MIT_License)

