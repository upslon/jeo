var streetviewBox;

(function($) {

	mappress.streetview = function(options) {
		$(document).ready(function() {
			options.canvas = $('#' + options.containerID);
			$('body').addClass('displaying-map');
			var panorama = enable(options);
			setTimeout(function() {
				panorama.setVisible(true);
			}, 500);
		});
	}

	function enable(options) {

		var settings = {
			canvas: false,
			lat: 0,
			lng: 0,
			heading: 0,
			pitch: 0,
			callback: false
		};

		$.extend(settings, options);

		var panOptions = {
			position: new google.maps.LatLng(settings.lat, settings.lng),
			pov: {
				heading: settings.heading,
				pitch: settings.pitch
			},
			visible: true
		};

		panorama = new google.maps.StreetViewPanorama(settings.canvas[0], panOptions);

		if(typeof settings.callback === 'function')
			settings.callback(panorama);

		return panorama;
	}

	/*
	 * Editor settings
	 */

	streetviewBox = function(options) {

		var settings = {
			geocoder: false,
			containerID: 'mappress_streetview',
			force: false
		};

		if(typeof options === 'undefined')
			options = {};

		settings = $.extend(settings, options);

		var box = {};

		$.extend(box, {

			_init: function() {

				if(!box.geocoder.isGoogleMaps)
					return false;

				$.extend(box, $('#' + settings.containerID));

				if(!box.length)
					return false;

				box.canvas = box.find('#streetview_canvas');
				box.toggler = box.find('#enable_streetview');

				box.disableAll();

				box.geocoder.mapReady(box._initPanorama);

				box.geocoder.closed(box.disableAll);
				box.geocoder.opened(function() {

					box.checkToggler();

					if(settings.force)
						box.enable();

				});

				return box;

			},

			_initPanorama: function() {

				box.loadPanorama();

				var loc = box.geocoder.location().get();
				box.updatePosition(loc[0], loc[1]);

				box.updatePov(box.pitch.get(), box.heading.get());

				box.checkToggler();

				if(settings.force)
					box.enable();

				box.geocoder.locationChanged(function() {
					var loc = box.geocoder.location().get();
					box.updatePosition(loc[0], loc[1]);
				});

				box.toggler.change(function() {
					box.checkToggler();
				});

				return box;

			},

			loadPanorama: function() {

				box.panorama = enable({
					canvas: box.canvas,
					heading: 0,
					pitch: 0,
					callback: function(pan) {

						google.maps.event.addListener(pan, 'pov_changed', function() {

							box.pitch.set(pan.getPov().pitch);
							box.heading.set(pan.getPov().heading);

						});

					}
				});

				box.disable();

				return box;

			},

			enable: function() {

				box.canvas.show();
				if(box.panorama) {
					box.panorama.setVisible(true);
				}

				return box;

			},

			enableToggler: function() {

				box.toggler.parent().show();

				return box;

			},

			enableAll: function() {

				box.enable().enableToggler();

				return box;

			},

			disable: function() {

				box.canvas.hide();

				return box;

			},

			disableToggler: function() {

				box.toggler.parent().hide();

				return box;

			},

			checkToggler: function() {

				if(box.toggler.is(':checked'))
					box.enable();
				else
					box.disable();

				return box;

			},

			disableAll: function() {

				box.disable().disableToggler();

				return box;

			},

			updatePosition: function(lat, lng) {

				box.panorama.setPosition(new google.maps.LatLng(lat, lng));

				return box;

			},

			updatePov: function(pitch, heading) {

				box.panorama.setPov({
					heading: heading,
					pitch: pitch,
					zoom: 1
				});

				return box;

			},

			geocoder: settings.geocoder,

			pitch: {

				set: function(pitch) {
					box.find('#streetview_pitch').val(pitch);
					return box;
				},

				get: function() {
					return parseFloat(box.find('#streetview_pitch').val());
				}
			},

			heading: {

				set: function(heading) {
					box.find('#streetview_heading').val(heading);
					return box;
				},

				get: function() {
					return parseFloat(box.find('#streetview_heading').val());
				}
			}

		});

		box.geocoder.ready(box._init);

		return box;

	}

})(jQuery);