const btn = document.querySelector('.talk');
const content = document.querySelector('.content');

function speak(text) {
    const text_speak = new SpeechSynthesisUtterance(text);

    text_speak.rate = 1;
    text_speak.volume = 1;
    text_speak.pitch = 1;

    window.speechSynthesis.speak(text_speak);
}

function wishMe() {
    var day = new Date();
    var hour = day.getHours();

    if (hour >= 0 && hour < 12) {
        speak("Good Morning Boss...");
    } else if (hour >= 12 && hour < 17) {
        speak("Good Afternoon Master...");
    } else {
        speak("Good Evening Sir...");
    }
}

window.addEventListener('load', () => {
    speak("Initializing JARVIS...");
    wishMe();
});

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

recognition.onresult = (event) => {
    const currentIndex = event.resultIndex;
    const transcript = event.results[currentIndex][0].transcript;
    content.textContent = transcript;
    takeCommand(transcript.toLowerCase());
};

btn.addEventListener('click', () => {
    content.textContent = "Listening...";
    recognition.start();
});

function detectObjects() {
    speak("Starting object detection...");
    // Add your object detection code here using OpenCV and YOLO
        // Define the YOLO model configuration and weights paths
        const configPath = 'yolov3.cfg';
        const weightsPath = 'yolov3.weights';
        const classNamesPath = 'coco.names';
    
        // Load YOLO model configuration and weights
        const net = cv.readNetFromDarknet(configPath, weightsPath);
        const classNames = loadClassNames(classNamesPath);
    
        // Get the output layer names of the YOLO network
        const outputLayerNames = net.getUnconnectedOutLayersNames();
    
        // Start video capture from default camera
        const video = document.createElement('video');
        document.body.appendChild(video);
        video.style.display = 'none';
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(stream => {
                video.srcObject = stream;
                video.play();
            });
    
        // Perform object detection on each frame of the video
        video.addEventListener('play', () => {
            const canvas = document.createElement('canvas');
            document.body.appendChild(canvas);
            const ctx = canvas.getContext('2d');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
    
            const processVideo = () => {
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const blob = new cv.Mat(cv.matFromArray(canvas.height, canvas.width, cv.CV_8UC4, frame.data));
                net.setInput(blob);
                const detections = net.forward(outputLayerNames);
    
                // Process YOLO detections
                detections.forEach(detection => {
                    detection.forEach(obj => {
                        const confidence = obj.confidence;
                        if (confidence > 0.5) {
                            const classId = obj.classId;
                            const className = classNames[classId];
                            const box = obj.rect;
                            const x = box.x;
                            const y = box.y;
                            const width = box.width;
                            const height = box.height;
    
                            // Draw bounding box and label on the frame
                            ctx.strokeStyle = '#FF0000';
                            ctx.lineWidth = 2;
                            ctx.strokeRect(x, y, width, height);
                            ctx.fillStyle = '#FF0000';
                            ctx.font = '16px Arial';
                            ctx.fillText(className, x, y - 5);
                        }
                    });
                });
    
                // Request next frame
                requestAnimationFrame(processVideo);
            };
    
            processVideo();
        });
    }
    
    // Function to load class names from coco.names file
    function loadClassNames(classNamesPath) {
        const classNames = [];
        const xhr = new XMLHttpRequest();
        xhr.open('GET', classNamesPath, false);
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4 && xhr.status === 200) {
                const data = xhr.responseText.split('\n');
                data.forEach(name => {
                    if (name.trim() !== '') {
                        classNames.push(name.trim());
                    }
                });
            }
        };
        xhr.send();
        return classNames;
    }
    
    function playMusic(songName) {
        // Speak a message indicating that the song is being played
        speak(`Playing ${songName} from Spotify...`);
    
        // Add your code to play music from Spotify here
        // Ensure that you have the necessary authentication and permissions to access the Spotify API
        // You need to use your client ID, client secret, and redirect URI
        const spotifyApi = new SpotifyWebApi({
            clientId: 'd7ac4d12f4fe4933885bc07ab2227636',
            clientSecret: '3167ad57a1044718b7b83be4a3ad947f',
            redirectUri: 'markus'
        });
    
        // Search for the song using the Spotify API
        spotifyApi.searchTracks(songName)
            .then(data => {
                // Check if any tracks were found
                if (data.body.tracks.items.length > 0) {
                    // Get the URI of the first track found
                    const trackUri = data.body.tracks.items[0].uri;
                    
                    // Play the track using the Spotify API
                    spotifyApi.play({
                        uris: [trackUri]
                    })
                    .then(() => {
                        console.log(`Successfully started playing ${songName}`);
                    })
                    .catch(err => {
                        console.error('Failed to play track:', err);
                    });
                } else {
                    console.log('No tracks found for the given song name.');
                }
            })
            .catch(err => {
                console.error('Error searching for tracks:', err);
            });
    }
    
    
function takeCommand(message) {
    if (message.includes('detect objects')) {
        detectObjects();
    } else if (message.includes('play music')) {
        const songName = message.split('play music')[1].trim();
        playMusic(songName);
    }else if (message.includes('hey') || message.includes('hello')) {
        speak("Hello Sir, How May I Help You?");
    } else if (message.includes("open google")) {
        window.open("https://google.com", "_blank");
        speak("Opening Google...");
    } else if (message.includes("open youtube")) {
        window.open("https://youtube.com", "_blank");
        speak("Opening Youtube...");
    } else if (message.includes("open facebook")) {
        window.open("https://facebook.com", "_blank");
        speak("Opening Facebook...");
    } else if (message.includes('what is') || message.includes('who is') || message.includes('what are')) {
        window.open(`https://www.google.com/search?q=${message.replace(" ", "+")}`, "_blank");
        const finalText = "This is what I found on the internet regarding " + message;
        speak(finalText);
    } else if (message.includes('wikipedia')) {
        window.open(`https://en.wikipedia.org/wiki/${message.replace("wikipedia", "").trim()}`, "_blank");
        const finalText = "This is what I found on Wikipedia regarding " + message;
        speak(finalText);
    } else if (message.includes('time')) {
        const time = new Date().toLocaleString(undefined, { hour: "numeric", minute: "numeric" });
        const finalText = "The current time is " + time;
        speak(finalText);
    } else if (message.includes('date')) {
        const date = new Date().toLocaleString(undefined, { month: "short", day: "numeric" });
        const finalText = "Today's date is " + date;
        speak(finalText);
    } else if (message.includes('calculator')) {
        window.open('Calculator:///');
        const finalText = "Opening Calculator";
        speak(finalText);
    } else {
        window.open(`https://www.google.com/search?q=${message.replace(" ", "+")}`, "_blank");
        const finalText = "I found some information for " + message + " on Google";
        speak(finalText);
    }
}
