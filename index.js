//////////// VISUALIZR STUFF ////////////////////

function visToggle() {
  //console.log("visToggle");
  var visView = document.getElementById('visualizr_view');
  //console.log(visView);
  if (visViewVisible) {
    visView.style.display = 'none';
    visViewVisible = false;
  } else {
    compileIntoView(visView);
    visView.style.display = 'block';
    visViewVisible = true;
  }
};

function timeSince(then, now) {
	if (!now) {
		return '---';
	}
	var diff = now - then;
	var secs = Math.round(diff / 1000);

	return secs;
}

function compileIntoView(visView) {
  visView = visView || document.getElementById('visualizr_view');	
  var html = '';



  var compileComps = function(components) {

    var s = Date.now();

    html += '<ul style="list-style: none; padding-left: 6px;">';

    components.forEach(function(c) {
      var timeAlive = s - c.created;
      var sinceLastUpdate = s - c.updated;
      html += '<li>';
      var color = (timeAlive < 2000 ? 'green' : (sinceLastUpdate < 2000 ? 'blue' : 'black'));
      var title = "Created: " + timeSince(c.created, s) + " ago, updated: " + timeSince(c.updated, s) + " ago";
      html += '<p title="' + title + '" style="color: ' + color + ';" id="vis_' + c.id + '">' + c.name + '</p>';

      if (c.children.length > 0) {
        compileComps(c.children);
      }

      html += '</li>';
    });

    html += '</ul>';
  } 

  compileComps(visViewTree);

  visView.innerHTML = html;

}

function receiveEvent(event) {

    function findComponent(id) {

      var found = null;

      var findFromChildren = function(components) {
        components.forEach(function(comp) {
          
          if (found) return; // Already found

          if (comp.id === id) {
            found = comp;
            return;
          }

          if (comp.children.length > 0) {
            return findFromChildren(comp.children);
          }
        });
      }

      findFromChildren(visViewTree);

      return found;



    }

	function findComponent(id) {
	  	var found = null;

	  	var privFind = function(components) {
		    components.forEach(function(comp) {

		      if (found) return;
		      	
		      if (comp.id === id) {
		      	found = comp;
		      } else if (comp.children.length > 0) {
		      	privFind(comp.children);
		      }  

		    });
	  	}

	  	privFind(visViewTree);

	  	return found;
	}

    function deleteComponent(id) {
      
      var deleted = false;

      var findAndDelete = function(components) {
      	var foundIndex = -1;
        var i = components.forEach(function(comp, i) {
          if (comp.id === id) {
          	foundIndex = i;
          }  
        });

        if (foundIndex !== -1) {
          components.splice(foundIndex, 1);
          deleted = true;
          return;
        }

        components.forEach(function(comp) {
          if (!deleted && comp.children.length > 0) {
            findAndDelete(comp.children);
          }
        })


      }

      findAndDelete(visViewTree);
    }

    //console.warn("Visualizr event");
    // Update tree.
    if (event.type === 'created') {
      var arrayToCreateInto = visViewTree;
      
      if (event.parent) {
        var parent = findComponent(event.parent);

        if (parent) {
          arrayToCreateInto = parent.children;
        }
      }
      
      arrayToCreateInto.push({
        created: Date.now(),
        updated: null,
        name: event.name,
        id: event.id,
        children: []
      });

    } else if (event.type === 'destroyed') {
      // Delete
      deleteComponent(event.id);

    } else if (event.type === 'data_updated') {
    	var comp = findComponent(event.id);

    	if (comp && event.updates) {
    		var updateOccurred = false;
			for (var property in event.updates) {
			    if (event.updates.hasOwnProperty(property)) {
			    	updateOccurred = true;
			        comp[property] = event.updates[property]; // Make update
			    }
			}

			if (updateOccurred) {
				comp.updated = Date.now();
			}
 
    	}
    } else if (event.type === 'updated') {
    	var comp = findComponent(event.id);

    	if (comp) {
			comp.updated = Date.now();
		}  	
    } else if (event.type === 'force_update') {
    	// Do nothing
    }

    lastUpdate = Date.now();
	var el = document.getElementById('visualizr_updated_text');
	el.innerHTML = 'Updating...';    

    // Only recompile if currently visible
    if (visViewVisible) {
      compileIntoView();
    }


}

// Private state variables
var runningId = 1;
var elLocation = 'left';
var visViewTree = [];
var visViewVisible = false;
var sinceUpdatedLooper = null;
var lastUpdate = null;

export default {

	install: function(Vue, options) {
		//////////////////////////////////////////////////////////////////
		/// STEP 1: Add elements to DOM for controlling visualization
		//////////////////////////////////////////////////////////////////
		
		// Template
		var t = '<div id="visualizr" style="position: fixed; top: 0; left: 0; z-index: 7000; background-color: #fff; padding: 2px; border: 1px solid #777; font-size: 11px;">';
		t += '<button style="width: 100%;" id="visualizr_toggle_view">Visualizr</button><br><button style="width: 100%;" id="visualizr_update_view">Update</button><br><button style="width: 100%;" id="visualizr_toggle_relocate">Relocate</button>';
		t += '<p id="visualizr_updated_text" style="color: crimson; font-size: 9px; font-style: italic;">---</p>';
		t += '<div id="visualizr_view" style="display: none; background-color: #fff; padding: 8px;">'
		t += '</div>'
		t += '</div>'
		// Add to DOM
		document.body.insertAdjacentHTML('afterbegin', t);
		// Event listener for added button
		document.body.addEventListener('click', function(e) {
		  if (e.target && e.target.id === 'visualizr_toggle_view') {
		    visToggle();
		  } else if (e.target && e.target.id === 'visualizr_toggle_relocate') {
		  	var el = document.getElementById('visualizr');
		  	if (elLocation === 'left') {
		  		elLocation = 'right';
		  		el.style.removeProperty('left');
		  		el.style.right = '0px';
		  	} else {
		  		elLocation = 'left';
		  		el.style.removeProperty('right');
		  		el.style.left = '0px';		  		
		  	}
		  }  else if (e.target && e.target.id === 'visualizr_update_view') {
		  	receiveEvent({type: 'force_update'})
		  }
		});


		//////////////////////////////////////////////////////////////////
		/// STEP 2: Register update counter setInterval
		//////////////////////////////////////////////////////////////////		
		
		if (sinceUpdatedLooper) {
			// this should never happen?
			clearInterval(sinceUpdatedLooper)
		}

		sinceUpdatedLooper = setInterval(function() {
			if (!lastUpdate) {
				return;
			}
			var el = document.getElementById('visualizr_updated_text');
			var timeSince = Math.round((Date.now() - lastUpdate) / 1000);
			el.innerHTML = 'Updated ' + timeSince + ' secs ago';
		}, 1000);
		//////////////////////////////////////////////////////////////////
		/// STEP 3: Register Vue mixin
		//////////////////////////////////////////////////////////////////

		Vue.mixin({
		  watch: {
		  	visualizr_name: function(val) {
		  		receiveEvent({
		  			type: 'data_updated',
		  			updates: {
		  				name: val,
		  			},
		  			id: this.visualizr_comp_id
		  		})
		  	}

		  },
		  data() {
		    return {
		      visualizr_comp_id: runningId++
		    }
		  },
		  updated() {
	  		receiveEvent({
	  			type: 'updated',
	  			id: this.visualizr_comp_id
	  		})		  	
		  },
		  created() {

		    if (this.$options.name === 'Visualizr' || this.$options.name === 'VisualizrLi') {
		      return;
		    }

		    var parentId = this.$parent ? this.$parent.visualizr_comp_id : null;
		    ////console.log("Created " + this.visualizr_comp_id + " under " + parentId);


		    var o = {
		      ts: performance.now(),
		      type: 'created',
		      name: this.visualizr_name || this.$options.name,
		      id: this.visualizr_comp_id,
		      parent: parentId
		    };
		    
		    //timeline.push(o);
		    //EventBus.$emit('visualizr-event', o);
		    receiveEvent(o);
		  },
		  beforeDestroy() {

		    if (this.$options.name === 'Visualizr' || this.$options.name === 'VisualizrLi') {
		      return;
		    }

		    ////console.log("Destroy " + this.visualizr_comp_id);

		    var o = {
		      ts: performance.now(),
		      type: 'destroyed',
		      id: this.visualizr_comp_id
		    };

		    //timeline.push(o);

		    //EventBus.$emit('visualizr-event', o);
		    receiveEvent(o);
		  }
		});
	}
}