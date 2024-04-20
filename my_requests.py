import my_requests

# Example: Detect objects
response = my_requests.post('http://localhost:5000/assistant', json={'command': 'detect objects'})
print(response.json())

# Example: Take notes
response = my_requests.post('http://localhost:5000/assistant', json={'command': 'take notes'})
print(response.json())

# Example: Play music
response = my_requests.post('http://localhost:5000/assistant', json={'command': 'play haule haule from dunki'})
print(response.json())

# Example: Open website
response = my_requests.post('http://localhost:5000/assistant', json={'command': 'open www.example.com'})
print(response.json())

# Example: Get current date and time
response = my_requests.post('http://localhost:5000/assistant', json={'command': 'current datetime'})
print(response.json())
