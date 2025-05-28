# Firebase CORS Setup Guide

## ✅ Firebase Storage CORS Configuration (For Vercel)

### Method 1: Using Firebase Console (Recommended)

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Select your project "inventoryxp"
3. In the left sidebar, click on "Storage"
4. Go to the "Rules" tab
5. Update your storage rules to include the following:

```
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
      
      // Allow CORS preflight requests
      allow options: if true;
    }
  }
}
```

6. Click "Publish" to apply the changes

### Method 2: Using Google Cloud Console

If you need more precise CORS configuration:

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Make sure you're in the same project as your Firebase project
3. Go to "Cloud Storage" > "Buckets"
4. Find your bucket (should be named "inventoryxp.appspot.com")
5. Click on the bucket name
6. Go to the "Permissions" tab
7. Click on "CORS configuration"
8. Add the following configuration:

```json
[
  {
    "origin": ["https://inventory-xp.vercel.app", "http://localhost:3000"],
    "method": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "maxAgeSeconds": 3600,
    "responseHeader": ["Content-Type", "Content-Disposition", "Content-Length"]
  }
]
```

9. Click "Save"

### Method 3: Using Command Line (If Needed)

If you prefer command line and have Google Cloud SDK installed:

1. Install Google Cloud SDK if not already installed:
   ```bash
   # macOS
   brew install --cask google-cloud-sdk
   
   # or download directly
   curl https://sdk.cloud.google.com | bash
   ```

2. Login with your Google account:
   ```bash
   gcloud auth login
   ```

3. Create a file named `cors.json` with the following content:
   ```json
   [
     {
       "origin": ["https://inventory-xp.vercel.app", "http://localhost:3000"],
       "method": ["GET", "PUT", "POST", "DELETE", "HEAD"],
       "maxAgeSeconds": 3600,
       "responseHeader": ["Content-Type", "Content-Disposition", "Content-Length"]
     }
   ]
   ```

4. Set the CORS configuration:
   ```bash
   gsutil cors set cors.json gs://inventoryxp.appspot.com
   ```

## 🔍 Troubleshooting

If you're still experiencing CORS issues after applying the configuration:

1. **Check Network Tab**: In browser DevTools, look at the Network tab for the specific request that's failing and its error details

2. **Verify Authentication**: CORS issues can sometimes be related to authentication problems

3. **Test with a Simple Rule**: Temporarily set more permissive rules to isolate the issue:
   ```
   service firebase.storage {
     match /b/{bucket}/o {
       match /{allPaths=**} {
         allow read, write: if true;
         allow options: if true;
       }
     }
   }
   ```
   (Remember to revert to more secure rules after testing)

4. **Wait for Propagation**: CORS changes can take up to 15 minutes to propagate through Google's infrastructure

## 📝 Additional Notes

- CORS issues typically occur when the browser blocks requests from your app to Firebase Storage due to security restrictions
- The configuration above allows your Vercel-hosted app (inventory-xp.vercel.app) to access Firebase Storage resources
- Firebase Storage uses Google Cloud Storage under the hood, which is why some solutions involve Google Cloud Console 