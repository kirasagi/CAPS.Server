var codes = { 
    'FAILED' : '1',
    'OK' : '0'
};

var pChange = 0;
var sCount = 0;
var updateButtonChanged = false;

var updateButton = function() {
	if(pChange++ < sCount || updateButtonChanged) return;
	// button = document.getElementById('updateButton');
	// button.className = 'ui button';
	// updateButtonChanged = true;

	//form = $('#updateSensorForm');
	form = document.getElementById('updateSensorForm');
    // input.ui.fluid.button(type='submit' value='Update')
    button = document.createElement('input');
    button.className = 'ui button';
    button.setAttribute('type', 'submit');
    button.setAttribute('value', 'Update');
    button.setAttribute('id', 'updateButton');
    button.style.float = 'right'
    form.appendChild(button);
    updateButtonChanged = true;

}

$(document).ready(function() {
	console.log('inside manager.js');

	// $('#editName').modal('show');
	

	// Initialize tab menu
	$('.ui.top.attached.tabular.menu.three.item .item').tab({
		history: true,
		historyType: 'hash'
	});

	console.log(deviceData);

	// Check if data is activated.
	if(deviceData.isActivated) {
		createSensorList();		
	} else {
		// Inform that device not activated.
		var msg = createDiv('ui negative message');
		var hdr = createDiv('header');
		hdr.innerHTML = 'Device Not Activated'
		var content = document.createElement('p');
		content.innerHTML = 'Please press the reset button on the device and refresh the page.';

		msg.appendChild(hdr);
		msg.appendChild(content);
		document.getElementById('updateSensorForm').appendChild(msg);
	}

	// Initialize dropdown priorities for sensors
	$('.dropdown').dropdown({
	 transition: 'drop',
	 onChange: updateButton
	});

	$('#info')
	  .transition('hide')
	  .transition('fade up', '1s');

	// Click listeners for update infos
	// UPDATE NAME
	$('#editNameModal')
		.modal({
			closable: false,
			transition: 'fade up',
			onHide: function() {
				(function() {
					$('#editNameError').addClass('hidden');
					$('#editNameModal').find(':input').each(function() {
						jQuery(this).val('');
					})
				})();
			},
			onDeny: function() {
				console.log('denied!');
				return false;
			},
			onApprove: function() {
				// $.post('/changeinfo', {})
				// Get first name and last name
				var fname = document.querySelector('[name="firstName"]').value
				  , lname = document.querySelector('[name="lastName"]').value

				if(fname.length == 0 || lname.length == 0) {
					$('#editNameError').children('p').get(0).innerHTML = 'Please enter your name';
					$('#editNameError').removeClass('hidden');
					return false;
				}

				var toSend = fname + ' ' + lname;

				$.post('/changeinfo', { info: 'name', data: toSend } , function(data, stat, xhr) {
					console.log(data);
					console.log('approved!');
					console.log(data.status);
					console.log(data.msg);
					if(data.status == codes.FAILED) {
						$('#editNameError').children('p').get(0).innerHTML = data.msg;
						$('#editNameError').removeClass('hidden');
					} else {
						console.log('sucesss');
						$('#userName').html(toSend);
						$('#editNameError').addClass('hidden');
						$('#editNameModal').modal('hide');
					}				
				});
				return false
			}
	});
	document.getElementById('editName').addEventListener("click", function() {
		$('#editNameModal').modal('show');
	}); 

	console.log('inside end manager.js');

}); 

// Create semantic-ui segments for each sensor
function createSensorList() {
	console.log(userData);

	console.log(deviceData);

	var sensors = JSON.stringify(deviceData.sensors);
	var priorities = JSON.stringify(deviceData.priorities);
	var isSynced = deviceData.isSynced;

	console.log('the device is synced: ' + isSynced);

	sensorCount = Object.keys(deviceData.sensors).length;
	sCount = sensorCount;

	/// Create reusable dropdown module.
	var uiDropdown = createDropdown(sensorCount);

	var sensorForm = document.getElementById('updateSensorForm');

	/// Create warning message that device is not synced.
	if(!isSynced) {
        var error = document.createElement('div');
        error.className = 'ui negative message';
        var p = document.createElement('p');
        p.innerHTML = 'Please reset your device to complete priority update.';
        p.style.textAlign = 'left';
        error.appendChild(p);
        // document.body.appendChild(error);
        sensorForm.appendChild(error);
    }  

	/// Create each sensor segment and append.
	for(var i = 0; i < sensorCount; i += 1) {
		// Get sensor name from key.
		var sKey = 's' + i.toString()
		var sName = deviceData.sensors[sKey];
		var cPriority = deviceData.priorities[sName];
		// cPriority = cPriority == 0 ? 'off' : cPriority;

		console.log(sName + ' ' + cPriority);
		sensorForm.appendChild(createSensorSegment(sensorCount, sName, cPriority));
	}

	// Create update button
    // input.ui.fluid.button(type='submit' value='Update')
    // button = document.createElement('input');
    // button.className = 'ui disabled button';
    // button.setAttribute('type', 'submit');
    // button.setAttribute('value', 'Update');
    // button.setAttribute('id', 'updateButton');
    // button.style.float = 'right'
    // sensorForm.appendChild(button);

	console.log(deviceData.sensors['s0']);
	console.log(deviceData.priorities[deviceData.sensors['s0']]);

	var p = deviceData.priorities[deviceData.sensors['s0']];
	// if(p == 0) console.log('off');

	console.log(Object.keys(deviceData.sensors).length);
}

// div.ui.segment
//     span(style='align:left;') TEMPERATURE
//     div.ui.dropdown(style='float:right')
//         div.text Priority
//         i.dropdown.icon
//         div.menu
//             div.header Priorities
//             div.item off
//             div.item 1
//             div.item 2
//             div.item 3
function createSensorSegment(sensorCount, sensorName, curPriority) {
	var segment = createDiv('ui segment');

	var name = document.createElement('span');
	name.style.align = 'left';
	name.innerHTML = sensorName.toUpperCase();

	segment.appendChild(name);
	segment.appendChild(createDropdown(sensorCount, curPriority));
	return segment;

}

//     div.ui.dropdown(style='float:right')
//         div.text Priority
//         i.dropdown.icon
//         div.menu
//             div.header Priorities
//             div.item off
//             div.item 1
//             div.item 2
//             div.item 3
// Create reusable dropdown module.
function createDropdown(sensorCount, defaultPriority) {
	var uiDropdown = createDiv('ui dropdown');
	uiDropdown.style.float = 'right';

	// Create input element
	var input = document.createElement('input');
	input.setAttribute('name', 'priority');
	input.setAttribute('value', 'default');
	input.setAttribute('type', 'hidden');

	// Create text and menu elements
	var text = createDiv('text');
	text.innerHTML = 'Priority';

	// Create dropdown icon
	var icon = document.createElement('i');
	icon.className = 'dropdown icon';

	// Create menu
	var menu = createDiv('menu')
	var menuHeader = createDiv('header');
	menuHeader.innerHTML = 'Priorities';
	menu.appendChild(menuHeader);
	for(var i = 0; i < sensorCount+1; i += 1) {
		var pNum = createDiv('item');
		pNum.setAttribute("data-value", i == defaultPriority ? "default" : i);
		pNum.innerHTML = i == 0 ? 'OFF' : i.toString();
		menu.appendChild(pNum);
	}

	// Append everything to dropdown parent
	uiDropdown.appendChild(input);
	uiDropdown.appendChild(text);
	uiDropdown.appendChild(icon);
	uiDropdown.appendChild(menu);
	return uiDropdown;
}


// Create a div element with a className
function createDiv(className) {
	var div = document.createElement('div');
	div.className = className;
	return div;
}