function get_defaultoptions() {
	var p = {
		ison : true,
		integrateWithPB : true,
		integrateWithIH : true
	};
	return p;
}

$(document).ready(function() {
	restore_options();

	$('#saveOptions').click(function() {
		save_options();
	});
});

function isChecked(id) {
	$(id).is(':checked');
}

function save_options() {

	opts = localStorage["opts"];
	if (!opts) {
		opts = JSON.stringify(get_defaultoptions());
	}
	opts2 = JSON.parse(opts);

	opts2.ison = isChecked('#isOnOff');
	opts2.integrateWithPB = isChecked('#isIntegratePBOnOff');
	opts2.integrateWithIH = isChecked('#isIntegrateIHOnOff');

	localStorage["opts"] = JSON.stringify(opts2);
}

function restore_options() {
	var opts = localStorage["opts"];
	if (!opts) {
		return;
	}
	opts2 = JSON.parse(opts);

	$('input[id=isOnOff]').attr('checked', opts2.ison);
	$('input[id=isIntegratePBOnOff]').attr('checked', opts2.integrateWithPB);
	$('input[id=isIntegrateIHOnOff]').attr('checked', opts2.integrateWithIH);

}