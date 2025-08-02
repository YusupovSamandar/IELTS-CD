# Dynamic File Uploads

This project now uses dynamic file serving instead of storing files in the public folder.

## Structure

- `/uploads/audio/` - Contains audio files for listening assessments
- `/uploads/images/` - Contains image files for writing assessments

## API Routes

- `/api/files/audio/[...path]` - Serves audio files dynamically
- `/api/files/images/[...path]` - Serves image files dynamically

## Benefits

1. **No server restart required** - Files are served dynamically and are immediately accessible after upload
2. **Better security** - Files are not in the public folder and are served through controlled API routes
3. **Production ready** - Works the same in development and production environments
4. **Cache control** - Proper HTTP headers for caching and performance

## Migration from Public Folder

The system has been updated to move away from storing files in:

- `public/listening/` (old audio storage)
- `public/writing/` (old image storage)

To the new structure:

- `uploads/audio/` (new audio storage)
- `uploads/images/` (new image storage)

Files are now served via API routes instead of static file serving.
