var ctx, ctx2;
var width, width2;
var height, height2;
var horizontalStep;
var verticalStep;
var experimentSize;
var experimentLength;
var p;
var verticalOffset;

function start()
{
	ctx.clearRect(0, 0, width, height);

	var steps = new Array(experimentLength);
	var average = new Array(experimentLength);
	var lastStep = new Array(experimentSize);

	for (var i = 0; i <  experimentLength; i++) {
		steps[i] = 0;
		average[i] = 0;
	}

	ctx.strokeStyle = "#DDDDDDFF";
	drawPath(steps);
	
	if (experimentSize < 200) {
		ctx.strokeStyle = "#025A8390";
	} else if (experimentSize < 1000) {
		ctx.strokeStyle = "#025A8360";
	} else {
		ctx.strokeStyle = "#025A8330";
	}
	

	for (let experiment = 0; experiment < experimentSize; experiment++) {
		for (let i = 0; i < experimentLength; i++) {
			steps[i] = Math.random() > p ? -1 : 1;
			average[i] += steps[i];
		}
		
		lastStep[experiment] = steps.reduce((a, b) => a + b, 0);
		drawPath(steps);
	}

	ctx.strokeStyle = "#FF0000FF";
	for (let i = 0; i < experimentLength; i++) {
		average[i] = average[i] / experimentSize;
	}

	drawPath(average);
	statistics(lastStep);
}

function initialize()
{
	var cvs = document.getElementById("cvs");
	width = cvs.width;
	height = cvs.height

	if (cvs.getContext) {
		ctx = cvs.getContext("2d");
	} else {
		alert ("Canvas isn't supported");
	}

	cvs = document.getElementById("cvs2");
	width2 = cvs.width;
	height2 = cvs.height

	if (cvs.getContext) {
		ctx2 = cvs.getContext("2d");
	} else {
		alert ("Canvas isn't supported");
	}

	updateVariables();
}

function updateVariables()
{
	experimentSize = document.getElementById("expSize").value;
	if (experimentSize < 1) {
		document.getElementById("expSize").value = 1;
		experimentSize = 1;
	} else if (experimentSize > 10000) {
		document.getElementById("expSize").value = 10000;
		experimentSize = 10000;
	}

	experimentLength = document.getElementById("expLen").value;
	if (experimentLength < 10) {
		document.getElementById("expLen").value = 10;
		experimentSize = 10;
	} else if (experimentLength > 10000) {
		document.getElementById("expLen").value = 10000;
		experimentSize = 10000;
	}

	p = document.getElementById("prob").value;
	if (p < 0) {
		document.getElementById("prob").value = 0;
		p = 0;
	} else if (p > 100) {
		document.getElementById("prob").value = 100;
		p = 100;
	}

	p /= 100;

	var t = 2 * Math.abs(0.5 - p);
	horizontalStep = width / experimentLength;
	verticalStep = height / ((1 - t) * 10 * Math.sqrt(experimentLength) + t * experimentLength);
	verticalOffset = p * height;
}

function statistics(results)
{
	var max = Math.max(...results);
	var min = Math.min(...results);
	var eAvg = (results.reduce((a, b) => a + b, 0)) / experimentSize;
	var eSD = Math.sqrt(results.map(x => (x - eAvg) ** 2).reduce((a, b) => a + b, 0) / experimentSize);

	var mAvg = experimentLength * (2 * p - 1);
	var mSD = Math.sqrt(4 * experimentLength * p * (1 - p));

	document.getElementById("EE").innerHTML = eAvg.toFixed(2);
	document.getElementById("ESD").innerHTML = eSD.toFixed(2);
	document.getElementById("EMIN").innerHTML = min;
	document.getElementById("EMAX").innerHTML = max;
	document.getElementById("ME").innerHTML = mAvg.toFixed(2);
	document.getElementById("MSD").innerHTML = mSD.toFixed(2);

	var binsNo = (max - min) / 2 + 1;
	var bins = new Array(binsNo).fill(0);

	for (let i = 0; i < experimentSize; i++) {
		n = Math.ceil((results[i] - min) / 2);
		bins[n]++;
	}

	var verticalBinStep = (height2 - 10) / Math.max(...bins);
	var horizontalBinStep = width2 / binsNo;

	ctx2.clearRect(0, 0, width, height);

	ctx2.fillStyle = "#ddd";
	ctx2.beginPath();
	ctx2.rect((0 - min) * width2 / (max - min), 0, 2, height2);
	ctx2.fill();

	ctx2.fillStyle = "#0f2e3d";
	for (let i = 0; i < binsNo; i++) {
		ctx2.beginPath();
		ctx2.rect(i * horizontalBinStep - 1, height2 - bins[i] * verticalBinStep, horizontalBinStep + 1, bins[i] * verticalBinStep);
		ctx2.fill();
	}

	ctx2.fillStyle = "#f00";
	ctx2.beginPath();
	ctx2.rect((eAvg - min) * width2 / (max - min), 0, 2, height2);
	ctx2.fill();
}

function drawPath(steps)
{
	var x = 0;
	var y = verticalOffset;

	ctx.beginPath();
	ctx.moveTo(x, y);

	for (let i = 0; i < steps.length; i++) {
		x += horizontalStep;
		y -= steps[i] * verticalStep;
		ctx.lineTo(x, y);
	}

	ctx.stroke();
}
