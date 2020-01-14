# Directions

## Install dependencies
``npm install``

## Run client-side
``npm start``

## Run server-side
``npm run server``

## Connect on your phone
- Connect your server and your phone to the same router
- Identify the IP of your server using ``ifconfig`` or similar
- Navigate to http://YOUR\_IP:3000/ on Chrome on your phone

## Connect via REST
- Connect the HMD to the same network as the server
- Issue a GET request to http://YOUR\_IP:8080/photos
- This will return an array of photo URLs
