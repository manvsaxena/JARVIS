from flask import Flask, request, jsonify
import speech_recognition as sr
import subprocess
import face_recognition as fr
import cv2
import numpy as np
import os
import datetime
import webbrowser
import spotipy
from spotipy.oauth2 import SpotifyOAuth
from fpdf import FPDF
import pyttsx3
import face_recognition as fr
import cv2
import numpy as np
import os
import datetime
import webbrowser
import spotipy
from spotipy.oauth2 import SpotifyOAuth
from fpdf import FPDF
import pyttsx3
from flask import Flask, request, jsonify

app = Flask(__name__)

# Function to perform object detection
def detect_objects():
    # Load pre-trained model for object detection
    net = cv2.dnn.readNet("yolov3.weights", "yolov3.cfg")
    classes = []
    with open("coco.names", "r") as f:
        classes = [line.strip() for line in f.readlines()]
    layer_names = net.getLayerNames()
    output_layers = [layer_names[i[0] - 1] for i in net.getUnconnectedOutLayers()]

    # Capture video from default camera
    cap = cv2.VideoCapture(0)

    while True:
        ret, frame = cap.read()
        height, width, channels = frame.shape

        # Perform object detection
        blob = cv2.dnn.blobFromImage(frame, 0.00392, (416, 416), (0, 0, 0), True, crop=False)
        net.setInput(blob)
        outs = net.forward(output_layers)

        class_ids = []
        confidences = []
        boxes = []

        for out in outs:
            for detection in out:
                scores = detection[5:]
                class_id = np.argmax(scores)
                confidence = scores[class_id]
                if confidence > 0.5:
                    # Object detected
                    center_x = int(detection[0] * width)
                    center_y = int(detection[1] * height)
                    w = int(detection[2] * width)
                    h = int(detection[3] * height)
                    x = int(center_x - w / 2)
                    y = int(center_y - h / 2)
                    boxes.append([x, y, w, h])
                    confidences.append(float(confidence))
                    class_ids.append(class_id)

        indexes = cv2.dnn.NMSBoxes(boxes, confidences, 0.5, 0.4)

        font = cv2.FONT_HERSHEY_PLAIN
        colors = np.random.uniform(0, 255, size=(len(classes), 3))

        if len(indexes) > 0:
            for i in indexes.flatten():
                x, y, w, h = boxes[i]
                label = str(classes[class_ids[i]])
                confidence = str(round(confidences[i],2))
                color = colors[i]
                cv2.rectangle(frame, (x, y), (x + w, y + h), color, 2)
                cv2.putText(frame, label + " " + confidence, (x, y + 30), font, 2, color, 2)

        cv2.imshow("Object Detection", frame)

        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()

# Function to take notes from voice input and save to PDF
def take_notes():
    recognizer = sr.Recognizer()

    with sr.Microphone() as source:
        engine.say("Listening for notes...")
        engine.runAndWait()
        recognizer.adjust_for_ambient_noise(source)
        audio = recognizer.listen(source)

    try:
        note_text = recognizer.recognize_google(audio)
        engine.say("Note: " + note_text)
        engine.runAndWait()
        # Save note to PDF
        pdf = FPDF()
        pdf.add_page()
        pdf.set_font("Arial", size=12)
        pdf.cell(200, 10, txt="Note:", ln=True, align="L")
        pdf.multi_cell(0, 10, note_text)
        pdf_file_path = "./Documents/note_" + datetime.datetime.now().strftime("%Y-%m-%d_%H-%M-%S") + ".pdf"
        pdf.output(pdf_file_path)
        engine.say("Note saved.")
        engine.runAndWait()
    except sr.UnknownValueError:
        engine.say("Could not understand audio.")
        engine.runAndWait()
    except sr.RequestError as e:
        engine.say("Could not request results from Google Speech Recognition service.")
        engine.runAndWait()

# Function to play music from Spotify
def play_music(song_name):
    sp = spotipy.Spotify(auth_manager=SpotifyOAuth(client_id="YOUR_CLIENT_ID",
                                                   client_secret="YOUR_CLIENT_SECRET",
                                                   redirect_uri="YOUR_REDIRECT_URI",
                                                   scope="user-read-playback-state"))

    results = sp.search(q=song_name, limit=1)
    if results and results['tracks']['items']:
        song_uri = results['tracks']['items'][0]['uri']
        sp.start_playback(uris=[song_uri])
        engine.say("Playing: " + song_name)
        engine.runAndWait()
    else:
        engine.say("Song not found.")
        engine.runAndWait()

# Function to open a website in a web browser
def open_website(url):
    webbrowser.open(url)
    engine.say("Opening website.")
    engine.runAndWait()

# Function to get current date and time
def get_current_datetime():
    current_datetime = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    engine.say("Current date and time: " + current_datetime)
    engine.runAndWait()
    return current_datetime

@app.route('/assistant', methods=['POST'])
def assistant():
    data = request.json
    command = data.get('command')

    if command == 'detect objects':
        detect_objects()
        return jsonify({'message': 'Object detection started'})
    elif command.startswith('take notes'):
        take_notes()
        return jsonify({'message': 'Notes taken and saved to PDF'})
    elif command.startswith('play'):
        song_name = command.split('play')[1].strip()
        play_music(song_name)
        return jsonify({'message': f'Playing {song_name} from Spotify'})
    elif command.startswith('open'):
        website = command.split('open')[1].strip()
        open_website(website)
        return jsonify({'message': f'Opening {website} in browser'})
    elif command == 'current datetime':
        current_datetime = get_current_datetime()
        return jsonify({'message': f'Current date and time: {current_datetime}'})
    else:
        return jsonify({'message': 'Invalid command'})

if __name__ == '__main__':
    engine = pyttsx3.init()
    app.run(debug=True)
