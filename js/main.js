
const lvideo = document.querySelector("#lvideo");
const rvideo = document.querySelector("#rvideo");

let local;
let remote;

function onIceCandidate(event, islocal) {
	const peer = islocal ? remote : local;
	peer.addIceCandidate(event.candidate);
	console.log(islocal ? "local" : "remote");
	console.log(event.candidate);
}

function build_peer(islocal) {
	let peer = new RTCPeerConnection();
	peer.onicecandidate = (e) => onIceCandidate(e, islocal);
	peer.oniceconnectionchange = (e) => onIceStateChange(e, islocal);
	return peer;
}

function gotRemoteStream(event) {
	if (rvideo.srcObject === event.streams[0])
		return;

	rvideo.srcObject = event.streams[0];
}

async function call(stream) {
	local = build_peer(true);
	stream.getTracks().forEach(track => local.addTrack(track, stream));

	remote = build_peer(false);
	remote.ontrack = gotRemoteStream; 

	const offer = await local.createOffer();
	await local.setLocalDescription(offer);
	await remote.setRemoteDescription(offer);

	const answer = await remote.createAnswer();
	await remote.setLocalDescription(answer);
	await local.setRemoteDescription(answer);
}

lvideo.oncanplay = () => {
	let stream = lvideo.captureStream();
	if (stream == null)
		return;

	call(stream);
};

lvideo.play();
