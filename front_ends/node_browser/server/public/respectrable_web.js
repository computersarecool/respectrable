// This code sends data to the node / UDP proxy via websockets

window.addEventListener('load', () => {
  // State holder
  let LOM

  // Websocket proxy
  const primus = Primus.connect('/')
  primus.on('open', getState)
  primus.on('fromMax', routePacket)

  function formatIDs (arr) {
    return arr.filter(elem => {
      return elem != 'id'
    })
  }

  // Set or get values in Max
  function getOrSet (address, args, isChannel = false) {
    primus.emit('toMax', {
      address,
      args,
      isChannel
    })
  }

  // This starts the state collection
  function getState () {
    getOrSet('live_set', ['get_state'])
  }

  // Route packet to correct function
  function routePacket (packet) {
    console.log(packet)
    
    // const messageType = packet.args.shift()
    // const property = packet.args.shift()
    // const value = packet.args
    // const address = packet.address.split(' ')

    // // Live set or child update
    // if (address[0] === 'live_set') {
    //   // live_set direct update
    //   if (address.length === 1) {
    //     liveSetUpdate(address, messageType, property, value)

    //   // Child of live set data
    //   } else {
    //     // Strip the live_set part and then route
    //     liveSetChildUpdate(address, messageType, property, value)
    //   }

    // // Live app or live app view data
    // } else if (address[0] === 'live_app'){
    //   if (address.length === 1) {
    //     liveAppUpdate(address, messageType, property, value)
      
    //   // Live app view update - remove the live_app part
    //   } else {
    //     // Strip the live_app part and then route
    //     address.shift()
    //     liveAppViewUpdate(address, messageType, property, value)
    //   }
    // // Unsupported path (control_surfaces)
    // } else {
    //   console.log('Not supported path', address, messageType, property, value)
    // }
  }

  // // There is information about the live app class
  // function liveAppUpdate (address, messageType, property, value) {
  //   console.log('Live app update', address, messageType, property, value)
  // }

  // // There is information about the live app view class
  // function liveAppViewUpdate (address, messageType, property, value) {
  //   console.log('Live app view update', address, messageType, property, value)
  // }

  // // There is information about the live set
  // function liveSetUpdate (address, messageType, property, value) {
  //   // Update Master track
  //   if (property === 'master_track') {
  //     LOM[address[0]][address[1]] = {
  //       unquoted_path: 'live_set master_track'
  //     }

  //     // Get properties and children
  //     masterTrackProp.forEach(prop => {
  //       getOrSet(LOM.live_set.master_track.unquoted_path, ['get', prop])
  //     })
  //     masterTrackChildren.forEach(child => {
  //       LOM.live_set.master_track[child] = {}
  //       getOrSet(LOM.live_set.master_track.unquoted_path, ['get', child])
  //     })

  //   // Update Tracks
  //   } else if (property === 'tracks') {
  //     // Reset the LOM tracks property
  //     LOM.live_set.tracks = {}
  //     // Create track objects
  //     formatIDs(value).forEach((id, index) => {
  //       const trackObject = {
  //         id: id,
  //         unquoted_path: 'live_set tracks ' + index
  //       }

  //       // Set track in LOM then get properties
  //       LOM.live_set.tracks[index] = trackObject
  //       trackProps.forEach(prop => {
  //         getOrSet(trackObject.unquoted_path, ['get', prop])
  //       })
  //       trackChildren.forEach(child => {
  //         LOM.live_set.tracks[index][child] = {}
  //         getOrSet(trackObject.unquoted_path, ['get', child])
  //       })        
  //     })

  //   // Non track live_set message
  //   } else {
  //     console.log('Unsupported live_set message', arguments)
  //   }
  // }

  // // There is information about some live set child
  // function liveSetChildUpdate (address, messageType, property, value) {
  //   if (address[1] === 'master_track') {
  //     // Information about master track
  //     if (address.length === 3) {
  //       console.log('master_track specific update', arguments)
      
  //     // Information about master track child
  //     } else {
  //       console.log('master track child update', arguments)
  //     }

  //   // Information about a track
  //   } else if (address[1] === 'tracks') {

  //     // Track or track property or track children list
  //     if (address.length == 3) {
  //       // Set a track property directly
  //       if (trackProps.indexOf(property) > -1) {
  //         LOM[address[0]][address[1]][address[2]][property] = value[0]
        
  //       // Track child information
  //       } else {
          
  //         // Mixer device
  //         if (property === 'mixer_device') {
  //           const mixerDeviceObj = {
  //             unquoted_path: `${address[0]} ${address[1]} ${address[2]} ${property}`
  //           }

  //           LOM[address[0]][address[1]][address[2]][property] = mixerDeviceObj
  //           mixerDeviceChildren.forEach(child => {
  //             mixerDeviceObj[child] = {}
  //             getOrSet(mixerDeviceObj.unquoted_path, ['get', child])
  //           })
          
  //         // Clip slots
  //         } else if (property === 'clip_slots') {
  //           formatIDs(value).forEach((id, index) => {
  //             const clipSlotObj = {
  //               id: id,
  //               unquoted_path: `${address[0]} ${address[1]} ${address[2]} ${property} ${index}`
  //             }
              
  //             LOM[address[0]][address[1]][address[2]][property][index] = clipSlotObj
  //             clipSlotsProps.forEach(prop => {
  //               getOrSet(clipSlotObj.unquoted_path, ['get', prop])
  //             })
  //           })

  //         // Devices
  //         } else if (property === 'devices') {
  //           formatIDs(value).forEach((id, index) => {
  //             const deviceObj = {
  //               id: id,
  //               unquoted_path: `${address[0]} ${address[1]} ${address[2]} ${property} ${index}`,
  //               parameters: {}
  //             }
              
  //             LOM[address[0]][address[1]][address[2]][property][index] = deviceObj
  //             deviceChildren.forEach(prop => {
  //               getOrSet(deviceObj.unquoted_path, ['get', prop])
  //             })
  //           })
  //         }          
  //       }

  //     // Track grandchild information
  //     } else if (address.length === 4) {
  //       // Mixer device parameter
  //       if (address[3] === 'mixer_device') {
  //         const mixerDeviceParamObj = {
  //           id: value[1],
  //           unquoted_path: `${address[0]} ${address[1]} ${address[2]} ${address[3]} ${property}`
  //         }

  //         LOM[address[0]][address[1]][address[2]][address[3]][property] = mixerDeviceParamObj
  //         deviceParameterProperties.forEach(prop => {
  //           getOrSet(mixerDeviceParamObj.unquoted_path, ['get', prop])
  //         })
  //       }

  //     // Track great grandchild information
  //     } else if (address.length === 5) {
  //       // Mixer device parameter
  //       if (address[3] === 'mixer_device') {
  //         LOM[address[0]][address[1]][address[2]][address[3]][address[4]][property] = value[0]
        
  //       // Clip slots
  //       } else if (address[3] === 'clip_slots') {
  //         LOM[address[0]][address[1]][address[2]][address[3]][address[4]][property] = value[0]
  //         const clipObj = {
  //           unquoted_path: `${address[0]} ${address[1]} ${address[2]} ${address[3]} ${address[4]} clip`
  //         }

  //         // Get clip property if there is a clip in the slot
  //         if (property === 'has_clip' && value[0]) {
  //           clipProps.forEach(prop => {
  //             getOrSet(clipObj.unquoted_path, ['get', prop])
  //           })
  //         }
  //         LOM[address[0]][address[1]][address[2]][address[3]][address[4]]['clip'] = clipObj
        
  //       // Device paramaters
  //       } else if (address[3] === 'devices') {
  //         formatIDs(value).forEach((id, index) => {
  //           const deviceParameterObj = {
  //             id: id,
  //             unquoted_path: `${address[0]} ${address[1]} ${address[2]} ${address[3]} ${address[4]} ${property} ${index}`
  //           }
            
  //           LOM[address[0]][address[1]][address[2]][address[3]][address[4]][property][index] = deviceParameterObj
  //           deviceParameterProperties.forEach(prop => {
  //             getOrSet(deviceParameterObj.unquoted_path, ['get', prop])
  //           })
  //         })
  //       }

  //     // Clip
  //     } else if (address.length === 6) {
  //       if (address[5] === 'clip') {
  //         LOM[address[0]][address[1]][address[2]][address[3]][address[4]][address[5]][property] = value[0]
  //       }

  //     // Device parameter values
  //     } else if (address.length === 7) {
  //       if (address[5] === 'parameters') {
  //         LOM[address[0]][address[1]][address[2]][address[3]][address[4]][address[5]][address[6]][property] = value[0]
  //       }
  //     } else {
  //       console.log('unrouted track descendant ', arguments)        
  //     }
  //   } else {
  //     console.log('not a master track or track descendant', arguments)
  //   }
  // }

  // Debug - click to display LOM
  document.addEventListener('click', () => {
    console.dir(LOM)
  })

}, false)
