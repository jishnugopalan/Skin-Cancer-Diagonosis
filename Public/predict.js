let imageLoaded = false;
$("#image-selector").change(function () {
	imageLoaded = false;
	let reader = new FileReader();
	reader.onload = function () {
		let dataURL = reader.result;
		$("#selected-image").attr("src", dataURL);
		$("#prediction-list").empty();
		imageLoaded = true;
	}
	
	let file = $("#image-selector").prop('files')[0];
	reader.readAsDataURL(file);
});

let model;
let modelLoaded = false;
$( document ).ready(async function () {
	modelLoaded = false;
	// $('.progress-bar').show();
    console.log( "Loading model..." );
    model = await tf.loadLayersModel('js_model/model.json');
    console.log( "Model loaded." );
	// $('.progress-bar').hide();
	modelLoaded = true;
});

//function for sending post request to server
function post(path, params, method='post') {

	// The rest of this code assumes you are not using a library.
	// It can be made less verbose if you use one.
	const form = document.createElement('form');
	form.method = method;
	form.action = path;
  
	for (const key in params) {
	  if (params.hasOwnProperty(key)) {
		const hiddenField = document.createElement('input');
		hiddenField.type = 'hidden';
		hiddenField.name = key;
		hiddenField.value = params[key];
  
		form.appendChild(hiddenField);
	  }
	}
  
	document.body.appendChild(form);
	form.submit();
  }


$("#predict-button").click(async function () {
	if (!modelLoaded) { alert("The model must be loaded first"); return; }
	if (!imageLoaded) { alert("Please select an image first"); return; }
	
	let image = $('#selected-image').get(0);

	// Pre-process the image
	console.log( "Loading image..." );

	let tensor = tf.browser.fromPixels(image, 3)
		.resizeNearestNeighbor([75, 100]) // change the image size
		.expandDims()
		.toFloat()
		// .reverse(-1); // RGB -> BGR
	let tensorimg = await tensor.array();
	let tensormat = tensorimg[0];
	console.log(tensorimg);

	for(let i=0; i<75; i++){	
		for(let j=0; j<100; j++){
			for(let k=0; k<3; k++){
				tensormat[i][j][k] = (tensormat[i][j][k] - 159.88411714650246)/46.45448942251337;
			}
		}
	}
	console.log(tensormat);
	let tensor_new = tf.tensor(tensormat).expandDims();
	let predictions = await model.predict(tensor_new).data();
	console.log(predictions);
	prdict_obj = {
		'Actinic keratoses': predictions[0],
		'Basal cell carcinoma' : predictions[1],
		'Benign keratosis-like lesions': predictions[2],
		'Dermatofibroma': predictions[3],
		'Melanocytic nevi': predictions[4],
		'Melanoma': predictions[5],
		'Vascular lesions': predictions[6]
	}
	console.log(prdict_obj);
	
	
	// let top5 = Array.from(predictions)
	// 	.map(function (p, i) { // this is Array.map
	// 		return {
	// 			probability: p,
	// 			className: TARGET_CLASSES[i] // we are selecting the value from the obj
	// 		};
	// 	}).sort(function (a, b) {
	// 		return b.probability - a.probability;
	// 	}).slice(0, 2);

	// $("#prediction-list").empty();
	// top5.forEach(function (p) {
	// 	$("#prediction-list").append(`<li>${p.className}: ${p.probability.toFixed(6)}</li>`);
	// });

	post('/result', prdict_obj);
  
});