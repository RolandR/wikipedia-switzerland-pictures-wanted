

var coords = coordsString.split("---");

var cantons = [];

var features = [];

var totalCount = 0;

var emptyStyle = new ol.style.Style({ image: '' });

for(var i = 0; i < coords.length; i++){
	coords[i] = coords[i].split(";");

	var name = coords[i].shift();
	var places = [];

	var color = colorHash(name+"x");

	var style = new ol.style.Style({
		image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
			color: [color.r, color.g, color.b],
			src: "./marker.svg"
		}))
	});

	for(var p = 0; p < coords[i].length; p++){

		if(coords[i][p].trim() == ""){
			continue;
		}
		
		var lat = coords[i][p].split(", ")[0]*1;
		var lon = coords[i][p].split(", ")[1]*1;

		var feature = new ol.Feature({
			geometry: new ol.geom.Point(ol.proj.fromLonLat([lon, lat]))
		});

		feature.setStyle(style);

		places.push(feature);
		features.push(feature);
	}

	cantons.push({
		 name: name
		,places: places
		,style: style
		,hide: function(){
			for(var i = 0; i < this.places.length; i++){
				this.places[i].setStyle(emptyStyle);
			}
		}
		,show: function(){
			for(var i = 0; i < this.places.length; i++){
				this.places[i].setStyle(this.style);
			}
		}
	});
	
}

var vectorSource = new ol.source.Vector({
	features: features
});

var vectorLayer = new ol.layer.Vector({
	source: vectorSource
});

var attribution = new ol.control.Attribution({
	collapsible: false
});

var map = new ol.Map({
	layers: [
		new ol.layer.Tile({
			source: new ol.source.OSM()
		}),
		vectorLayer
	],
	controls: ol.control.defaults({attribution: true}).extend([attribution]),
	target: "osm",
	view: new ol.View({
		center: [0, 0],
		zoom: 2
	})
});

document.getElementById("totalCount").innerHTML = features.length;

cantons = cantons.sort(function(a, b){
	return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
});

var extent = ol.extent.createEmpty();
ol.extent.extend(extent, vectorSource.getExtent());
map.getView().fit(extent, map.getSize());

var cantonsEl = document.getElementById("cantons");

for(var i = 0; i < cantons.length; i++){
	var el = document.createElement("label");
	el.className = "canton";

	var checkbox = document.createElement("input");
	checkbox.value = i;
	checkbox.checked = true;
	checkbox.type = "checkbox";
	checkbox.className = "CantonCheckbox";

	checkbox.addEventListener("click", function(e){
		if(this.checked){
			cantons[this.value].show();
		} else {
			cantons[this.value].hide();
		}
	});

	el.appendChild(checkbox);

	var text = document.createElement("span");
	text.innerHTML = " "+cantons[i].name+" ("+cantons[i].places.length+")";

	el.appendChild(text);
	
	cantonsEl.appendChild(el);
}

document.getElementById("allButton").onclick = function(){
	var el = document.getElementsByClassName("CantonCheckbox");

	for(var i = 0; i < el.length; i++){
		if(!el[i].checked){
			el[i].checked = true;
			cantons[el[i].value].show();
		}
	}
}

document.getElementById("noneButton").onclick = function(){
	var el = document.getElementsByClassName("CantonCheckbox");

	for(var i = 0; i < el.length; i++){
		if(el[i].checked){
			el[i].checked = false;
			cantons[el[i].value].hide();
		}
	}
}
























