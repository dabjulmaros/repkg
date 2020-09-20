const { remote,shell } = require('electron');
const {dialog,app} = remote;
const fs = remote.require('fs');

var child_process = require('child_process');

//Elements
const sceneBtn = document.getElementById('sceneBtn');
const outputBtn = document.getElementById('outputBtn');
const startBtn = document.getElementById('startBtn');

const outputFolder = document.getElementById('outputFolder');
const repkg = document.getElementById('RePKG');

const scenePathSpan = document.getElementById('scenePath');
const outputPathSpan = document.getElementById('outputPath');
let scenePath=app.getAppPath(),outputPath=app.getAppPath();

const regex = new RegExp('\(.+)\.tex|/(.+)\.tex', 'g');

//file
sceneBtn.onclick = e =>{
	dialog.showOpenDialog({
		title:"Select scene.pkg",
		defaultPath:scenePath,
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

		if(outputPath!=app.getAppPath())
			startBtn.removeAttribute('disabled');
	}).catch(err => {
		console.log(err)
	});
}
//folder
outputBtn.onclick = e => {
	dialog.showOpenDialog({
		title:"Select Output Folder",
		defaultPath:outputPath,
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
		if(scenePath!=app.getAppPath())
			startBtn.removeAttribute('disabled');
	}).catch(err => {
		console.log(err)
	});
};

startBtn.onclick= e =>{
	var child = child_process.exec(`"${app.getAppPath()}\\repkg\\RePKG.exe" extract -e tex -s -o "${outputPath}" "${scenePath}"`);
	cmdOutput.innerText="Starting Process";
	// use event hooks to provide a callback to execute when data are available:
	let fileNames=[];
	child.stdout.on('data', function(data) {
		const cmdout= data.toString();
		console.log("---"+cmdout+"---");
		cmdOutput.innerHTML+=`\n${cmdout}`;
		cmdOutput.scrollTop = cmdOutput.scrollHeight;
		if(cmdout.match(regex)!=null){
			files=cmdout.match(regex);
			for(var file of files){
				name=file.substr(0,file.length-4).substr(file.lastIndexOf('/')+1).substr(file.lastIndexOf('\\')+1);
				console.log(name);
				if(!fileNames.includes(name)){
					fileNames.push(name);
			}
			}
		}
		
	});
	child.on('exit',e=>	{
		console.log("done");
		console.log(fileNames);
		removeTex(fileNames);
	});
	child.on('error',e=>	{
		cmdOutput.innerHTML+=`\n ERROR! ${data.toString()}`
		cmdOutput.scrollTop = cmdOutput.scrollHeight;
		console.log("e");
	});
}

function removeTex(fileNames){
	cmdOutput.innerHTML+=`\n\nRemoving tex and tex-json files.`;
	cmdOutput.scrollTop = cmdOutput.scrollHeight;
	fs.readdirSync(outputPath).forEach(file => {
		for(var x of fileNames){
			if(file.includes(x+".tex")||file.includes(x+".tex-json")){
				console.log(file);
				fs.unlink(`${outputPath}\\${file}`,function(err){
					if(err){
						alert("An error ocurred removing the file"+ err.message);
						console.log(err);
						shell.beep();
						outputFolder.parentElement.style.visibility="visible";
						return;
					}
				});
				cmdOutput.innerHTML+=`\n${file} was removed.`;
				cmdOutput.scrollTop = cmdOutput.scrollHeight;
			}
		}
	});

	cmdOutput.innerHTML+=`\n\nCompleted!`;
	cmdOutput.scrollTop = cmdOutput.scrollHeight;
	shell.beep();
	outputFolder.parentElement.style.visibility="visible";
		
}


outputFolder.addEventListener('click',e=>{
	shell.openPath(outputPath);
})
repkg.addEventListener('click',e=>{
	shell.openExternal('https://github.com/notscuffed/repkg');
})
