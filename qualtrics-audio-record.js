Qualtrics.SurveyEngine.addOnReady(function () {
    // Get the file upload that will be replaced by the audio recorder
    const dropzones = document.getElementsByClassName("dropzone")
    
    if (dropzones.length != 1) {
        console.error("Expected to find only one drop zone, found " + dropzones.length + ", not recording")
        return
    }

    const dropzone = dropzones[0]

    const container = dropzone.parentNode;

    // hide the drop zone
    dropzone.style.display = "none";

    // add the record button
    const recbutton = document.createElement("button")
    recbutton.ariaLabel = recbutton.title = "Start recording"
    recbutton.classList.add("record-btn")

    const playback = document.createElement("span")

    container.append(recbutton)
    container.append(playback)

    let recording = false;
    let recorder = null;

    recbutton.addEventListener("click", function (e) {
        if (!recording) {
            recording = true;
            // start recording
            navigator.mediaDevices.getUserMedia({ audio: {
                echoCancellation: true,
                autoGainControl: true,
                noiseSuppression: true
            } }).then(function (stream) {
                recorder = new MediaRecorder(stream)
                recorder.addEventListener("dataavailable", function (e) {
                    chunks.push(e.data)
                })
                recorder.start()
                recbutton.classList.add("recording")
                recbutton.ariaLabel = recbutton.title = "Stop recording"

                let chunks = []

                recorder.addEventListener("stop", function (e) {
                    recbutton.classList.remove("recording")
                    recbutton.ariaLabel = recbutton.title = "Start recording"
                    recording = false;

                    // make it available to play
                    const blob = new Blob(chunks, { type: "audio/ogg; codecs=opus" })
                    const url = URL.createObjectURL(blob)
                    const audio = document.createElement("audio")
                    audio.controls = true;
                    audio.src = url;
                    playback.innerHTML = "";
                    playback.append(audio);

                    // and upload it
                    const file = new File(chunks, "recording.ogg", { type: "audio/ogg; codecs=opus", lastModified:new Date().getTime() })
                    const xfer = new DataTransfer()
                    xfer.items.add(file)
                    const fileInput = document.getElementsByClassName("dz-hidden-input")[0]
                    fileInput.files = xfer.files
                    fileInput.dispatchEvent(new Event("change", { bubbles: true }))
                })
            })

        } else {
            recorder.stop()
        }
    })
})