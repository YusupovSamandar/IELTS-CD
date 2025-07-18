# Audio Files Directory

This directory stores audio files for the IELTS listening sections.

## Structure

- `/listening/` - Contains audio files for listening assessments
  - Files should be named with the assessment ID or a descriptive name
  - Supported formats: MP3 (audio/mpeg), WAV (audio/wav), OGG (audio/ogg), M4A (audio/mp4)
  - Maximum file size: 50MB
  - Validation: Both MIME type and file extension are checked for compatibility

## Usage

Audio files are uploaded through the admin interface in edit mode and stored in this directory. The audio player component references these files for playback during listening assessments.

## Note

In a production environment, consider using a cloud storage service (like AWS S3, Google Cloud Storage, or Azure Blob Storage) for better performance and scalability.
