# Using Firebase for Android Authentication & Notifications with Node.js
Firebase is a platform for mobile and web applications. It provides everything from databases and authentication to high level function like analytics and machine learning.

There are two elements to any Firebase application: the **admin sdk** element to be integrated with the frontend, and the **client sdk** to be integrated with the backend.

This tutorial will cover basic email authentication and notifications with Firebase.

This tutorial assumes you've already acquainted yourself with the tutorial at https://github.com/donn/mobile-apps-nodejs-skeleton.

Note that you're not intended to clone this tutorial and use it as a base, rather, you're supposed to incorporate elements of this tutorial into your own projects.

# Getting Started

Visit https://console.firebase.google.com.

Create a new project. Not a demo, just a plain new project. Call it whatever you want.

If you're worried about cost, Firebase has a free tier that should really be more than enough for anything in this tutorial.

## Enabling Authentication
1. Press on "Authentication" as shown. If you see some kind of Splash Screen with "Get Started", press it as well.
![EA0](./Images/EA0.png).
2. Under the "Sign-in method" tab, pick "Email/Password".
![EA1](./Images/EA1.png)

Note that you're free to enable other methods, but you're going to be mostly on your own.

## Backend Setup
Note: This section assumes you're 

1. Go into your Firebase project and click the cog ⚙️ button then "Project Settings".
	![BS0](./Images/BS0.png)
2. Under the "Service accounts" tab, press the "Generate new private key" button. Download the file, rename it `admin-services.json` and copy it to the root of your Node.js project.
	![BS1](./Images/BS1.png)

***NOTE: NEVER UPLOAD YOUR ADMIN-SERVICES.JSON FILE TO GITHUB. EVER.***

3. Go to your Node.js project in your favorite IDE then invoke `npm i firebase-admin`.
4. Copy the file in this repo's `Web/controllers/firebase.js` to your own project's controllers folder.
5. Add the following requires to your routes:
```js
const fb = require("../controllers/firebase.js");

const FirebaseApp = fb.FirebaseApp;
const FirebaseAuthentication = fb.FirebaseAuthentication;
```

You're basically done. To make a route authenticate, you only have to add this line before the .get and .post:

```js
router.use("/example_authenticated_api", FirebaseAuthentication); // <-- This one

router.post("/example_authenticated_api", function (req, res) {
// [...]
```

This use statement verifies that the token is valid before executing the GET/POST and adds the user information to `req.user`.

There are two more APIs that assist with notifications that you can find in `Web/routes/index.js`: `/register_notification_token` and `/send_test_notification`. You will probably also want to add them to your routes.

## Android Setup

For more in-depth instructions, check this guide: https://firebase.google.com/docs/auth/android/firebaseui

1. Register an Android application by pressing (+ Add app) and then the Android Logo.
	![Create Android Application](./Images/CAA0.png)
	![Create Android Application: Android Logo](./Images/CAA0b.png)
2. The package name HAS to match the one you picked in Android Studio. The nickname can be anything.
	![Register app](./Images/CAA1.png)
3. Download the google-services.json. 
	![Download google-services.json button](./Images/CAA2.png)
4. Open your app in Android Studio. Switch from Android View to Project View as follows:
	![Switch from Android View to Project View](./Images/CAA3.png)
5. Copy `google-services.json` to the `app/` folder.

***NOTE: NEVER UPLOAD YOUR GOOGLE-SERVICES.JSON FILE TO GITHUB EITHER. DON'T SAY I DIDN'T WARN YOU.***

6. Open your **project-wide gradle script** (i.e. `<root>/build.gradle`) and alter it as shown below. Ensure that you File > Sync Project with Gradle Files after you do so.
```java
buildscript {

  repositories {
    // Check that you have the following line (if not, add it):
    google()  // Google's Maven repository
  }

  dependencies {
    // [...]

    // ADD the following line:
    classpath 'com.google.gms:google-services:4.3.4'  // Google Services plugin
  }
}

allprojects {
  // [...]

  repositories {
    // Check that you have the following line (if not, add it):
    google()  // Google's Maven repository
    // [...]
  }
}
```
7. Open your **app-level gradle script** (i.e. `<root>/app/build.gradle`) and perform the following changes. Once again, ensure that you File > Sync Project with Gradle Files after you do so.
```java
// If you find "apply plugin: 'com.android.application'" then add this after:
apply plugin: 'com.google.gms.google-services' 

// If you find "plugins { id 'com.android.application' } then add the plugin like such:
plugins {
	id 'com.android.application'
	
	// ADD the following line:
	id 'com.google.gms.google-services'
	
	// [...]
}

dependencies {
	// [...]
	
	// ADD all of the following lines:
	implementation platform('com.google.firebase:firebase-bom:26.3.0')
	implementation 'com.google.firebase:firebase-auth'
	implementation 'com.google.firebase:firebase-messaging'
	
	implementation 'com.firebaseui:firebase-ui-auth:6.4.0'
}
```
8. Create the activity you want to use for sign-in and FCM setup. There is a lot of code to add, frankly, and you can reference a fairly minimal example in this repo at: `Android/src/main/java/website/donn/firebasesample/MainActivity.java`. The file is well-documented with everything I do.


9. Create the Firebase Messaging Service class. You can find my implementation at `Android/src/main/java/website/donn/firebasesample/MyFirebaseMessagingService.java`.
10. Add this code to your AndroidManifest.xml inside the `<application>` tag.
```xml
<service
	android:name=".MyFirebaseMessagingService"
	android:exported="false"
>
  <intent-filter>
  	<action android:name="com.google.firebase.MESSAGING_EVENT" />
  </intent-filter>
</service>
<meta-data
   android:name="com.google.firebase.messaging.default_notification_icon"
   android:resource="@drawable/ic_launcher"
/>
<meta-data 	
	android:name="com.google.firebase.messaging.default_notification_color"
	android:resource="@color/colorAccent"
/>
```
11. Ensure that you authenticate every request from now on. This is accomplished by adding an `Authentication` HTTP header with your request which has the value of `Token <the-token-here>`.

```java
FirebaseUser user = FirebaseAuth.getInstance().getCurrentUser();
user.getIdToken(true).addOnCompleteListener(task -> {
	if (!task.isSuccessful()) {
    // Failed to get token. Restart app or something
  }
  String idToken = task.getResult().getToken();
  
  // Add it to your request.
});

```
* An example of adding the header using Volley is available at `Android/src/main/java/website/donn/firebasesample/AuthenticatedAddition.java`. Ensure that you also add the `Content-Type` header with the value `application/json` or else the backend will not be able to interpret your data correctly.

At this point you can demo the most basic of APIs. There is the addition API from the node.js skeleton, but also a button that sends a test notification.

![Screenshot of Sample Android Application](./Images/SAMPLE_ANDROID.png)
