const { remote } = require('electron');
const {dialog,app} = remote;
var child_process = require('child_process');

//Elements
const sceneBtn = document.getElementById('sceneBtn');
const outputBtn = document.getElementById('outputBtn');
const startBtn = document.getElementById('startBtn');
const scenePathSpan = document.getElementById('scenePath');
const outputPathSpan = document.getElementById('outputPath');
let scenePath="",outputPath="";

//file
sceneBtn.onclick = e =>{
	dialog.showOpenDialog({
		title:"Select scene.pkg",
		filters: [
			{ name: 'Scene', extensions: ['pkg'] },
			{ name: 'All Files', extensions: ['*'] }
		],
		properties: ['openFile']
	}).then(result => {
		console.log(result.canceled)
		console.log(result.filePaths)
		if(result.canceled)
			return;

		scenePath=result.filePaths[0];
		scenePathSpan.innerText = result.filePaths[0];
		scenePathSpan.setAttribute('title', result.filePaths[0]);
		sceneBtn.classList.remove('is-warning');
		sceneBtn.classList.add('is-primary');
		
		if(outputPath!="")
			startBtn.removeAttribute('disabled');
	}).catch(err => {
		console.log(err)
	});
}
//folder
outputBtn.onclick = e => {
	dialog.showOpenDialog({
		title:"Select Output Folder",
		properties: ['openDirectory']
	}).then(result => {
		console.log(result.canceled)
		console.log(result.filePaths)
		if(result.canceled)
			return;

		outputPath=result.filePaths[0];
		outputPathSpan.innerText = result.filePaths[0];
		outputPathSpan.setAttribute('title', result.filePaths[0]);
		outputBtn.classList.remove('is-warning');
		outputBtn.classList.add('is-primary');
		if(scenePath!="")
			startBtn.removeAttribute('disabled');
	}).catch(err => {
		console.log(err)
	});
};

startBtn.onclick= e =>{
	var child = child_process.exec(`"${app.getAppPath()}\\repkg\\RePKG.exe" extract -e tex -s -o "${outputPath}" "${scenePath}"`); 
	console.log("hello");
	// use event hooks to provide a callback to execute when data are available: 
	child.stdout.on('data', function(data) {
		console.log(data.toString()); 
	});
	child.on('exit',e=>	{
		console.log("done");
	});
	child.on('error',e=>	{
		console.log("e");
	});
}