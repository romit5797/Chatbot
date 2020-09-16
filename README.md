# Dog Walker Service Chatbot

About

Dog Walker Chatbot is chatbot built using Diagflow,node js and html css frontend.It will save users booking details to database(Firebase) and provide an estimated price of the booking.

Setup

-Node.js 8.x or above
-Dialogflow: npm install @google-cloud/dialogflow
-Firebase: npm install -g firebase-tools
-Uuid,express,body-parser: npm install uuid express body-parser
-cors: npm i cors
-Nodemailer: npm install nodemailer
-Node scheduler: npm install node-schedule

Run instructions
1. Add all the dependencies
2. Replace the service account files and project ids of both firebase and diagflow with yours.
2. Run firebase init to setup functions
3. Run the node file - npm index.js
4. Run the index.html from dw-bot-ui folder on Chrome or any latest browser.
