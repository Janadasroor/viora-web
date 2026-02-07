export  function getFirebaseUrl(objectPath: string) {
  // Remove any leading slash just in case
  const cleanPath = objectPath.replace(/^\/+/, '');
  // Encode the path for Firebase Storage URL
  const encodedPath = encodeURIComponent(cleanPath);

  return `http://localhost:9199/v0/b/${process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET}/o/${encodedPath}?alt=media`;
}
